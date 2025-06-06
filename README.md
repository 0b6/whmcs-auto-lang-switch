# WHMCS 自动切换中文

这是一个 Chrome 和 Firefox 浏览器扩展，用于识别 WHMCS 网站并自动切换到中文语言。

## 功能

- 自动检测 WHMCS 网站
- 自动将语言切换到中文（通过 URL 参数）
- 防止频繁重复跳转（10分钟内只跳转一次）
- 支持 F9 键清除跳转记录，方便调试
- 开启 Debug 模式，输出日志

## 安装方法

1. 下载本仓库源码
2. 打开 Chrome 或 Firefox 浏览器的扩展管理页面（chrome://extensions 或 about:addons）
3. 开启开发者模式
4. 选择“加载已解压的扩展程序”，选择本项目目录
5. 访问 WHMCS 网站，自动切换语言

## 开发

- `content.js` 为核心内容脚本
- `manifest.json` 定义扩展元信息和权限
- `icons/` 目录下存放扩展图标
- `background.js` 空文件，仅用于 MV3 兼容

---

如有问题欢迎反馈！
