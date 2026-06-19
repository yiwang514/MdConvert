<p align="center">
  <h1 align="center">MdConvert</h1>
  <p align="center">
    Markdown 文件查看与格式转换工具
  </p>
  <p align="center">
    <a href="https://github.com/yiwang514/MdConvert/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License">
    </a>
    <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React 18">
    <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" alt="Vite 6">
    <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg" alt="PRs Welcome">
  </p>
</p>

---

## 简介

MdConvert 是一个轻量的在线工具，帮助无法直接打开 `.md` 文件的用户（手机端、非技术用户等）查看和转换 Markdown 文档。

导入 `.md` 文件 → 渲染为精美 HTML → 一键导出 PDF / Word。

## 功能特性

- 📂 **文件导入** — 拖拽、点击选择、粘贴三种方式导入 `.md` 文件
- 📄 **HTML 渲染** — 完整支持 GFM 语法，表格、任务列表、代码块等
- 🎨 **代码高亮** — 集成 highlight.js，支持 190+ 编程语言
- 📑 **目录导航** — 自动提取标题生成 TOC，点击跳转，滚动高亮
- 🛠️ **快捷工具栏** — 加粗、斜体、链接、代码块等语法一键插入
- 🌗 **主题切换** — 3 套内置主题：Light / Dark / Print
- 📥 **导出 PDF** — 浏览器端直接生成，保留排版和代码高亮
- 📝 **导出 Word** — 兼容 Microsoft Word 的文档格式
- ✏️ **在线编辑** — CodeMirror 6 编辑器，实时预览（副功能）

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装运行

```bash
# 克隆仓库
git clone https://github.com/yiwang514/MdConvert.git
cd MdConvert

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器访问 `http://localhost:5173` 即可使用。

### 构建部署

```bash
npm run build
```

构建产物输出到 `dist/` 目录，可部署到任意静态服务器。

## 技术栈

| 技术 | 用途 |
|------|------|
| [React 18](https://react.dev/) | UI 框架 |
| [Vite](https://vite.dev/) | 构建工具 |
| [marked](https://marked.js.org/) | Markdown 解析 |
| [highlight.js](https://highlightjs.org/) | 代码语法高亮 |
| [CodeMirror 6](https://codemirror.net/) | 在线编辑器 |
| [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) | PDF 导出 |

## 项目结构

```
src/
├── components/          # UI 组件
│   ├── DropZone.jsx     # 文件导入区域
│   ├── Viewer.jsx       # 文档渲染 + TOC
│   ├── Editor.jsx       # CodeMirror 编辑器
│   ├── Toolbar.jsx      # 快捷工具栏
│   ├── ThemeSelector.jsx
│   └── StatusBar.jsx
├── hooks/
│   └── useMarkdown.js   # Markdown 解析 Hook
├── utils/
│   ├── fileReader.js    # 文件读取
│   ├── markdown.js      # marked 配置
│   ├── toc.js           # 目录提取
│   ├── exportPdf.js     # PDF 导出
│   └── exportWord.js    # Word 导出
└── styles/
    └── design-system.css # CSS 变量 + 主题
```

## 参与贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'feat: add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

## 文档

- [产品需求文档 (PRD)](./PRD.md)
- [技术设计文档](./TECHNICAL_DESIGN.md)

## 许可证

[MIT](./LICENSE) © [yiwang514](https://github.com/yiwang514)
