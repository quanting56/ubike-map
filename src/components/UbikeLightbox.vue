<template>
  <transition name="modal">
    <div class="modal-task" v-show="ubikeStore.lightboxVisible">
      <!-- 為了可以關閉燈箱，加上@click.self="close" -->
      <div class="modal-wrapper" @click.self="close">
        <div class="modal-container">
          <div class="modal-body">
            <div v-if="ubikeStore.selectedStation">
              <table class="info-table">
                <tbody>
                  <tr>
                    <th>場站中文名稱</th>
                    <td>{{ ubikeStore.selectedStation.sna }}</td>
                  </tr>
                  <tr>
                    <th>場站地點</th>
                    <td>
                      {{ ubikeStore.selectedStation.sarea }}
                      {{ ubikeStore.selectedStation.ar }}
                    </td>
                  </tr>
                  <tr>
                    <th>場站總停車格</th>
                    <td>{{ ubikeStore.selectedStation.total }}</td>
                  </tr>
                  <tr>
                    <th>場站目前車輛數量</th>
                    <td>
                      {{ ubikeStore.selectedStation.available_rent_bikes }}
                    </td>
                  </tr>
                  <tr>
                    <th>空位數量</th>
                    <td>
                      {{ ubikeStore.selectedStation.available_return_bikes }}
                    </td>
                  </tr>
                  <tr>
                    <th>全站禁用狀態</th>
                    <td>{{ ubikeStore.selectedStation.act }}</td>
                  </tr>
                  <tr>
                    <th>資料更新時間</th>
                    <td>{{ ubikeStore.selectedStation.mday }}</td>
                  </tr>
                </tbody>
              </table>
              <details class="extra-info">
                <summary>點我展開查看更多資訊 More Information</summary>
                <table class="info-table small">
                  <tbody>
                    <tr>
                      <th>場站名稱英文</th>
                      <td>{{ ubikeStore.selectedStation.snaen }}</td>
                    </tr>
                    <tr>
                      <th>站點代號</th>
                      <td>{{ ubikeStore.selectedStation.sno }}</td>
                    </tr>
                    <tr>
                      <th>地址英文</th>
                      <td>
                        {{ ubikeStore.selectedStation.aren }},
                        {{ ubikeStore.selectedStation.sareaen }}
                      </td>
                    </tr>
                    <tr>
                      <th>經度</th>
                      <td>{{ ubikeStore.selectedStation.longitude }}</td>
                    </tr>
                    <tr>
                      <th>緯度</th>
                      <td>{{ ubikeStore.selectedStation.latitude }}</td>
                    </tr>
                  </tbody>
                </table>
              </details>
            </div>
            <p v-else>尚未選擇站點</p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useUbikeStore } from "@/store/ubikeStore";
import { watch } from "vue";

const ubikeStore = useUbikeStore();

function close() {
  ubikeStore.lightboxVisible = false;
}

watch(
  () => ubikeStore.lightboxVisible,
  (val) => {
    if (val) {
      console.log("Lightbox 打開了！");
    } else {
      console.log("lightbox 關閉了！");
    }
  }
);
</script>

<style scoped>
/* Transition 動畫設定 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* 背景遮罩 */
.modal-task {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* 半透明遮罩 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* 包裹區域 */
.modal-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 內容容器 */
.modal-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

/* 表格 */
.info-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.info-table th,
.info-table td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: left;
}

.info-table th {
  background-color: #f8f9fa;
  color: #333;
  width: 40%;
}

.info-table.small th {
  font-size: 0.875rem;
  background-color: #f0f0f0;
}

.info-table.small td {
  font-size: 0.875rem;
}

.extra-info summary {
  cursor: pointer;
  margin-top: 1.5rem;
  font-weight: bold;
  color: #007acc;
}
</style>
