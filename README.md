# 产品展示小程序

一个基于 uni-app 和 Vue 的现代化产品展示小程序。

## 功能

- 产品分类展示
- 关键词搜索
- 商品收藏
- 联系方式页面

## 使用方法

1.  **安装依赖**
    ```bash
    npm install
    ```

3.  **配置联系信息**
    将 `src/config.example.js` 复制一份并重命名为 `src/config.js`，然后填入真实的联系方式。
    ```bash
    cp src/config.example.js src/config.js
    ```

4.  **运行到微信开发者工具**
    ```bash
    npm run dev:mp-weixin
    ```
    然后在微信开发者工具中导入 `app/dist/dev/mp-weixin` 目录。

5.  **打包发布**
    ```bash
    npm run build:mp-weixin
    ```
