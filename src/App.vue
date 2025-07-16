<template>
  <div id="app">
    <nav>
      <div class="nav-container">
        <div class="nav-left">
          <!-- 可放 Logo 或按鈕 -->
          <button
            v-if="isMobile"
            class="mobile-aside-toggle"
            @click="showAside = !showAside"
            aria-label="切換側邊選單"
          >
            ☰
          </button>
        </div>
        <div class="nav-title">Ubike 微笑單車地圖（臺北測試版）</div>
        <div class="nav-right">
          <!-- 可放設定、語言選單等 -->
        </div>
      </div>
    </nav>

    <div class="main-content">
      <!-- aside-menu 左側欄 -->
      <!-- 手機版：只有 showAside = true 或 電腦版 才顯示 -->
      <template v-if="!isMobile || showAside">
        <div class="aside-wrapper" :style="{ width: asideWidth + 'px' }">
          <UbikeAsideMenu></UbikeAsideMenu>
        </div>
      </template>

      <!-- 拖曳條 -->
      <div class="resizer" @mousedown="startDragging"></div>

      <!-- 地圖區塊 -->
      <div class="map-wrapper" :style="{ flex: 1 }">
        <UbikeMap></UbikeMap>
      </div>
    </div>

    <!-- 燈箱區域 -->
    <UbikeLightbox></UbikeLightbox>
  </div>
</template>

<script setup>
import UbikeAsideMenu from "@/components/UbikeAsideMenu.vue";
import UbikeMap from "@/components/UbikeMap.vue";
import UbikeLightbox from "@/components/UbikeLightbox.vue";
import { onMounted, onBeforeUnmount, ref } from "vue";

// 設定asideMenu和Map的寬度
const asideWidth = ref(window.innerWidth * 0.25); // 初始寬度預設為25%
let isDragging = false;

const startDragging = () => {
  isDragging = true;
};
const stopDragging = () => {
  isDragging = false;
};

const handleMouseMove = (e) => {
  if (isDragging) {
    // 限制最小與最大寬度（此處設定asideMenu與Map最小寬度皆為200px）
    asideWidth.value = Math.min(
      Math.max(e.clientX, 200),
      window.innerWidth - 200
    );
  }
};

// 偵測是否為手機
const isMobile = ref(window.innerWidth <= 768);

// 控制側邊選單顯示
const showAside = ref(false);
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
  // 若從手機切回電腦，確保 asideMenu 一定顯示
  if (!isMobile.value) showAside.value = false;
};

onMounted(() => {
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", stopDragging);
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", stopDragging);
  window.removeEventListener("resize", handleResize);
});
</script>

<style>
body {
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #2c3e50;
}

nav {
  height: 6vh;
  top: 0; /* 這一行是為了讓'position: sticky;'知道要黏在哪裡 */
  position: sticky;
  display: flex;
  background-color: #333333;
  color: #fafafa;
  opacity: 0.9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.nav-container {
  width: 100%;
  padding: 0 1rem;
  display: flex;
  align-items: center;
}

.nav-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.nav-left,
.nav-right {
  width: 80px; /* 可根據需要調整或改為 auto */
}

.mobile-aside-toggle {
  display: inline-block;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #fafafa;
  cursor: pointer;
}

.main-content {
  display: flex;
  overflow: hidden;
  width: 100%;
  height: 94vh;

  .aside-wrapper {
    height: 100%;
  }

  .resizer {
    height: 100%;
    width: 5px;
    cursor: ew-resize;
    background-color: #cccccc;
  }

  .map-wrapper {
    height: 100%;
    overflow: hidden;
  }
}
</style>
