const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production'
    ? '/ubike-map/'  // 這裡請填你的 GitHub repo 名稱
    : '/',
  transpileDependencies: true,
  pages: {
    index: {
      entry: 'src/main.js', // 或main.ts，視專案而定
      title: 'Ubike微笑單車地圖',
    }
  }
});
