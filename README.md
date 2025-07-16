# Ubike 微笑單車地圖（臺北測試版）

> 基於 *YouBike2.0臺北市公共自行車即時資訊* API 的互動式地圖  
> 使用 **Vue 3 Composition API** + **Vue CLI** + **Leaflet.js** + **D3.js**

本專案串接「YouBike2.0臺北市公共自行車即時資訊」API，在地圖上即時顯示臺北市所有 YouBike 2.0 站點位置與借還車狀態。（原計劃支援全臺六都全站點顯示，然因跨域政策先行以 臺北市測試版 發布。）

網站部署於 GitHub Pages，可由 **[Ubike 微笑單車地圖](https://quanting56.github.io/ubike-map/#/)** 瀏覽效果。

## 專案特色

- **互動地圖**：
  - 使用 Leaflet.js 繪製可平移、縮放的底圖。
  - 以 D3.js 分級調色 API（`d3.interpolateRdYlGn`）根據剩餘車輛數量在地圖站點位置上色。
- **站點列表側欄**：
  - 縣市／行政區 下拉選單（目前暫時只先製作「臺北市」及其下行政區）。
  - 關鍵字搜尋（站名、地址）。
  - 點擊列表可在地圖上定位並開啟 Lightbox 查看站點詳情。
- **Lightbox 詳情**：
  - 顯示站點完整資訊：
    1. 場站中文名稱。
    2. 場站地點。
    3. 總車格。
    4. 可借／可還車數量。
    5. 資料更新時間。
    6. 其他資訊（場站名稱英文、站點代號、英文地址、經緯度）。
- **可調整側欄寬度**：
  - 拖曳 resizer 可自由設定「左側列表」與「右側地圖」所佔版面之比例。
- **未來規劃**：
  - RWD 響應式設計改善（目前手機版 AsideMenu 與 resizer 在按出來後的效果待調整）。
  - 多縣市支援（跨域問題解決後）。

## 技術使用

- **前端框架**：Vue 3 Composition API + Vue CLI
- **地圖繪製**：Leaflet.js
- **調色**：D3.js scaleSequential（序列比例尺） + interpolator（顏色插值）
- **狀態管理**：Pinia
- **路由**：<s>Vue Router</s>（已初始化但本專案暫未使用，未來預計）
- **打包**：Vue CLI (`vue.config.js`) 
- **部署**：GitHub Pages

## 安裝與本地開發

```bash
# Clone
git clone git@github.com:quanting56/ubike-map.git
cd ubike-map

# 安裝相依套件
npm install

# 啟動開發伺服器
npm run serve
```

## 部署

網站部署於 GitHub Pages（目前目標路徑為 `https://quanting56.github.io/ubike-map/`，對應 repo 為 `ubike-map`），下列為建置與部署流程摘要：

```js
// 請確保 vue.config.js 中的 publicPath 設定正確，讓路徑符合 GitHub Pages 的子目錄

// vue.config.js
module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/ubike-map/'
    : '/'
};
```

```bash
# 打包生產
npm run deploy

# 推送 dist 內容到 GitHub Pages
# 網站已部署於 gh-pages branch
```

## 專案結構

```cs
ubike-map/
├─ public/
│   ├─ favicon.ico             # 網站favicon
│   └─ index.html
├─ src/
│   ├─ assets/                 # 圖片
│   ├─ components/
│   │   ├─ UbikeAsideMenu.vue  # 站點列表側欄
│   │   ├─ UbikeMap.vue        # 地圖本體
│   │   └─ UbikeLightbox.vue   # 站點完整資訊 Lightbox
│   ├─ router/
│   │   └─ index.js            # 已初始化路由但暫未用到
│   ├─ store/
│   │   └─ ubikeStore.js       # Pinia store：API 撈取 & 濾站邏輯
│   ├─ views/                  # 已初始化但暫未用到
│   ├─ App.vue                 # 主框架（Nav + Aside + Map + Lightbox）
│   └─ main.js                 # 入口
├─ babel.config.js
├─ jsconfig.json
├─ package.json
├─ README.md
└─ vue.config.js               # publicPath / 多頁面設定
```

## API 說明

- 臺北市 Ubike 站點 JSON（from [臺北市資料大平臺 - YouBike2.0臺北市公共自行車即時資訊](https://data.taipei/dataset/detail?id=c6bc8aed-557d-41d5-bfb1-8da24f78f2fb)）
  
  ```bash
  https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json
  ```

- 縣市／行政區對照（開發用）

  ```bash
  https://raw.githubusercontent.com/kurotanshi/mask-map/master/raw/area-location.json
  ```

## 開發者

本案由 **[quanting56](https://github.com/quanting56)** 開發與維護。