<template>
  <div class="map-layer">
    <div class="ubike-map" id="ubike-map"></div>
    <div id="ubike-map-legend">
      <div class="ubike-map-legend-title">圖例</div>
      <div class="ubike-map-legend-items">
        <div
          class="ubike-map-legend-item cluster-icon"
          style="background-color: #ff8000"
        >
          <div class="cluster-title">區域裡站數</div>
          <div class="cluster-detail">可借車數 / 總格數</div>
        </div>
        <div
          class="ubike-map-legend-item marker-inner"
          style="border: 4px solid #50b550"
        >
          <div>該站點</div>
          <div>可借比例</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 使用Cluster群聚效果
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// 使用D3.js的顏色漸層
import * as d3 from "d3";

import { nextTick, onMounted, ref, watch } from "vue";
import { useUbikeStore } from "@/store/ubikeStore";

const ubikeStore = useUbikeStore();

const map = ref(null); // 地圖
let markersGroup = null; // 儲存目前加到地圖上的Marker
let popup = L.popup(); // 使用單一popup

onMounted(async () => {
  await nextTick();

  map.value = L.map("ubike-map", {
    center: [25.0463, 121.5179],
    zoom: 12,
    zoomAnimation: false,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '<a target="_blank" href="https://www.openstreetmap.org/">© OpenStreetMap貢獻者</a>',
    maxZoom: 18,
  }).addTo(map.value);

  markersGroup = new L.MarkerClusterGroup({
    // 客製化cluster icon的設定在這兒
    iconCreateFunction: (cluster) => {
      const markers = cluster.getAllChildMarkers();

      // 計算平均租借比率
      let totalRatio = 0;
      let validCount = 0; // 有效站點（總車位>0）
      let clusterAvailableRentBikes = 0; // cluster內的可借車數
      let clusterTotal = 0; // cluster內的總車格數

      markers.forEach((marker) => {
        const station = marker.options.station;
        if (station && station.total > 0) {
          totalRatio += station.available_rent_bikes / station.total;
          validCount++;
          clusterAvailableRentBikes += station.available_rent_bikes;
          clusterTotal += station.total;
        }
      });

      const rentRatio = validCount > 0 ? totalRatio / validCount : 0;

      // 使用 D3 顏色漸層
      const colorScale = d3
        .scaleSequential(d3.interpolateRdYlGn)
        .domain([0, 1.15]);
      const backgroundColor = colorScale(rentRatio);

      return L.divIcon({
        html: `
          <div class="cluster-icon" style="background-color: ${backgroundColor}">
            <div class="cluster-title">${markers.length}站</div>
            <div class="cluster-detail">${clusterAvailableRentBikes} / ${clusterTotal}</div>
          </div>
        `,
        className: "cluster-marker",
        iconSize: [48, 48],
      });
    },
  });
  markersGroup.addTo(map.value);
  map.value.addLayer(markersGroup);

  map.value.invalidateSize(); // 重新計算大小，以免剛顯示時格子不完整
});

// 當store.currDistrict被改變，就把地圖移動到「該區經緯度」並放大
watch(
  () => ubikeStore.currDistrict,
  (newDistrict) => {
    if (!newDistrict) return;
    if (!ubikeStore.currCity) return;

    const cityObj = ubikeStore.locationData.find(
      (c) => c.name === ubikeStore.currCity
    );
    if (!cityObj) return;
    const distObj = cityObj.districts.find((d) => d.name === newDistrict);
    if (!distObj) return;

    // 地圖飛到該區中間，再放大到14
    map.value.flyTo([distObj.latitude, distObj.longitude], 15, {
      duration: 0.6,
    });
  }
);

// 當stationList改變，重畫所有marker
watch(
  () => ubikeStore.stationList,
  (newList) => {
    if (!map.value || !markersGroup) return;

    map.value.closePopup(); // 每次重繪markers之前先關掉現有的popup（避免還留在地圖上）
    markersGroup.clearLayers(); // 清除上一輪的所有markers

    // 如果newList是空陣列，就不畫
    if (!newList || newList.length === 0) return;

    newList.forEach((station) => {
      if (station.latitude != null && station.longitude != null) {
        const rentRatio =
          station.total > 0 ? station.available_rent_bikes / station.total : 0;

        const colorScale = d3
          .scaleSequential(d3.interpolateRdYlGn)
          .domain([0, 1.15]);
        const iconColor = colorScale(rentRatio);

        // 使用L.divIcon建立有顏色的小圓圈
        const icon = L.divIcon({
          className: "custom-marker",
          html: `<div class="marker-inner" style="
            border: 4px solid ${iconColor};
          ">${(rentRatio * 100).toFixed(0)}%</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([station.latitude, station.longitude], {
          icon,
          station, // 將station傳入options，供cluster取用
        });

        // 綁定click事件而不是綁定popup
        marker.on("click", () => {
          const content = `
            <strong>${station.sna}</strong><br />
            可借：${station.available_rent_bikes} 輛<br />
            可還：${station.available_return_bikes} 輛
          `;
          popup
            .setLatLng([station.latitude, station.longitude])
            .setContent(content)
            .openOn(map.value); // 單一popup在地圖上打開
        });

        markersGroup.addLayer(marker);
      }
    });
  },
  { immediate: true }
);

// 監聽store.selectedStation，當AsideMenu被點到的時候，飛到那個station
watch(
  () => ubikeStore.selectedStation,
  (station) => {
    if (!station) return;
    map.value.closePopup(); // 先關掉原本的 popup
    map.value.flyTo([station.latitude, station.longitude], 18, {
      duration: 0.8,
    });

    const content = `
      <strong>${station.sna}</strong><br />
      可借：${station.available_rent_bikes} 輛<br />
      可還：${station.available_return_bikes} 輛
    `;
    popup
      .setLatLng([station.latitude, station.longitude])
      .setContent(content)
      .openOn(map.value); // 單一popup在地圖上打開
  }
);
</script>

<style>
.map-layer {
  height: 100%;

  .ubike-map {
    height: 100%;
    min-height: 400px;
    background-color: #aaaaaa;
    z-index: 10;
    &.full {
      width: 100%;
    }
  }

  #ubike-map-legend {
    position: absolute;
    right: 40px;
    bottom: 50px;
    z-index: 1000;
    background-color: rgba(250, 250, 250, 0.5);
    padding: 12px 15px;
    border-radius: 10px;

    .ubike-map-legend-title {
      margin-bottom: 10px;
      font-size: 20px;
      font-weight: bold;
      color: #fafafa;
      text-shadow: 0.6px 0.6px 1.2px #0a0a0a;
    }

    .ubike-map-legend-items {
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      flex-direction: row;

      .ubike-map-legend-item {
        margin-left: 18px;
        margin-right: 18px;
        display: flex;
        flex-direction: column;
      }
    }
  }
}

.marker-inner {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  box-shadow: 0 0 3px #0a0a0a;
  transition: transform 0.2s ease;
  cursor: pointer;
  /* 文字部分 */
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fafafa;
  font-family: "Arial Black", "Segoe UI", sans-serif;
  font-size: 10px;
  font-weight: 800;
  text-shadow: 0 0 2px #0a0a0a;
  white-space: nowrap;

  &:hover {
    transform: scale(1.8);
    /* z-index: 9999; */
  }
}

.cluster-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column; /* 讓上下兩行文字直向排列 */
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
  box-shadow: 0 0 3px #0a0a0a;
  cursor: pointer;
  /* 文字部分 */
  color: #fafafa;
  font-family: "Arial Black", "Segoe UI", sans-serif;
  text-shadow: 0 0 2px #0a0a0a;
  text-align: center;

  .cluster-title {
    white-space: nowrap;
    font-size: 14px;
    font-weight: bold;
  }

  .cluster-detail {
    white-space: nowrap;
    font-size: 8px;
  }

  &:hover {
    transform: scale(1.5);
  }
}
</style>
