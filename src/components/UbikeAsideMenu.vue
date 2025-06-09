<template>
  <div class="aside-menu">
    <div class="wraps">
      <label>
        縣市：
        <select v-model="ubikeStore.currCity">
          <option disabled value="">請選擇</option>
          <!-- <option v-for="c in ubikeStore.cityList" :key="c">{{ c }}</option> -->
          <option>臺北市</option>
        </select>
      </label>
      <label>
        行政區：
        <select v-model="ubikeStore.currDistrict">
          <option disabled value="">請選擇</option>
          <option value="">全部行政區</option>
          <option v-for="d in ubikeStore.districtList" :key="d">{{ d }}</option>
        </select>
      </label>
    </div>

    <div class="wraps">
      <label>
        <i class="fas fa-search-location"></i> 關鍵字搜尋：
        <input
          type="text"
          placeholder="請輸入關鍵字"
          v-model="ubikeStore.keyword"
        />
      </label>
    </div>

    <ul class="station-lists">
      <li
        class="station-info wraps"
        v-for="s in ubikeStore.stationList"
        :key="s.stationCode"
        @click="focusOnStation(s)"
      >
        <div class="station-detail">
          <h1 v-html="highlightKeyword(s.sna)"></h1>
          <sup>站點代號：{{ s.sno }}</sup>

          <div class="station-detail-info">
            <i class="fas fa-head-side-mask"></i>
            <span v-html="'地點： ' + highlightKeyword(s.ar)"></span>
          </div>

          <div class="station-detail-info">
            <i class="fas fa-head-side-mask"></i>
            <span>可借車輛數量： {{ s.available_rent_bikes }} 輛</span>
          </div>

          <div class="station-detail-info">
            <i class="fas fa-head-side-mask"></i>
            <span>可還車輛數量： {{ s.available_return_bikes }} 輛</span>
          </div>

          <div class="station-detail-info">
            <i class="fas fa-baby"></i>
            <span>總停車格： {{ s.total }} 格</span>
          </div>

          <div class="station-detail-info">
            最後更新時間： {{ s.updateTime }}
          </div>
        </div>

        <button class="btn-station-detail" @click.stop="openStationDetail(s)">
          <i class="fas fa-info-circle"></i>
          看詳細資訊
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useUbikeStore } from "@/store/ubikeStore";
import { onMounted } from "vue";

const ubikeStore = useUbikeStore();

const highlightKeyword = (text) => {
  const k = ubikeStore.keyword.trim(); // 當使用者輸入關鍵字
  if (!k) {
    return text; // 如果沒輸入文字，則原樣顯示
  } else {
    return text.replace(k, `<span class="highlight">${k}</span>`); // 把符合的文字包進<mark>
  }
};

// 使用者點列表<li station-info>時，把這筆暫存到store.selectedStation
function focusOnStation(station) {
  ubikeStore.selectedStation = station;
}

// 看詳細資訊的btn狀態
function openStationDetail(station) {
  ubikeStore.lightboxVisible = !ubikeStore.lightboxVisible;
  ubikeStore.selectedStation = station; // 儲存被選到的站點資訊
}

// 當mount上的時候，fetch上API
onMounted(async () => {
  await ubikeStore.fetchLocation();
  await ubikeStore.fetchAllStation();
});
</script>

<style scoped>
.aside-menu {
  height: 100%;
  border-right: 1px solid #aaaaaa;
  background-color: #f1f1f1;
  overflow-y: scroll;
  label {
    position: relative;
    display: block;
    font-size: 1.2rem;
    line-height: 2;
  }
  select {
    position: absolute;
    margin-top: 0.3rem;
    left: 6rem;
    font-size: 1.2rem;
    min-width: 120px;
  }
  input {
    padding: 2px 8px;
    font-size: 1.2rem;
    line-height: 2;
    width: 100%;
  }
  ul {
    list-style-type: none;
    padding: 0;
    margin-top: 0;
  }
}

.wraps {
  padding: 1em;
  border-bottom: 1px solid #666666;
}

.station-info {
  display: flex;
  position: relative;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1.8;
  background-color: #ffffff;
  .station-detail {
    h1 {
      font-size: 1.5rem;
      font-weight: 500;
      color: #333333;
      margin-top: 0;
      margin-bottom: 0.3em;
      padding-top: 0;
    }
    .station-detail-info {
      position: relative;
      white-space: nowrap;
      > span {
        position: absolute;
        left: 1.8rem;
      }
    }
    &::v-deep .highlight {
      background-color: #f08d49;
      color: white;
      padding: 0 2px; /* 視覺設計上閱讀較舒服 */
      border-radius: 2px; /* 視覺設計上閱讀較舒服 */
    }
  }
  &:hover {
    background-color: #eeeeee;
  }
  .btn-station-detail {
    position: absolute;
    display: block;
    cursor: pointer;
    width: 80px;
    height: 80px;
    text-align: center;
    right: 1.2rem;
    font-size: 0.8rem;
    > i {
      display: block;
      font-size: 2rem;
      margin-bottom: 5px;
    }
  }
}
</style>
