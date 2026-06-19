# MdConvert — 技术设计文档

## 1. 架构概述

### 1.1 整体架构

纯前端单页应用（SPA），无后端依赖。所有文件读取、Markdown 解析、格式转换均在浏览器端完成。

```
┌─────────────────────────────────────────────────────┐
│                    浏览器                             │
│                                                     │
│  ┌─────────┐   ┌──────────┐   ┌─────────────────┐  │
│  │ 文件导入  │──→│ Markdown │──→│   HTML 渲染     │  │
│  │ (Reader) │   │  Parser  │   │   (Viewer)      │  │
│  └─────────┘   └──────────┘   └────────┬────────┘  │
│                                         │           │
│                              ┌──────────┼────────┐  │
│                              ▼          ▼        ▼  │
│                          [PDF导出]  [Word导出] [编辑] │
└─────────────────────────────────────────────────────┘
```

### 1.2 技术栈版本

| 依赖 | 版本 | 用途 |
|------|------|------|
| react | ^18.3 | UI 框架 |
| react-dom | ^18.3 | DOM 渲染 |
| vite | ^6.x | 构建工具 |
| marked | ^15.x | Markdown → HTML 解析 |
| highlight.js | ^11.x | 代码语法高亮 |
| @uiw/react-codemirror | ^4.x | CodeMirror React 封装 |
| @codemirror/lang-markdown | ^6.x | CodeMirror Markdown 语言支持 |
| @codemirror/theme-one-dark | ^6.x | CodeMirror 暗色主题 |
| html2pdf.js | ^0.10 | HTML → PDF |
| html-docx-js | ^0.3 | HTML → DOCX |

---

## 2. 数据流设计

### 2.1 核心数据流

```
                    ┌──────────────┐
                    │  App (State) │
                    │              │
                    │  markdown: ""│
                    │  fileName: ""│
                    │  theme: ""   │
                    │  mode: ""    │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌─────────────┐  ┌───────────┐   ┌───────────┐
   │  DropZone   │  │  Viewer   │   │  Editor   │
   │             │  │           │   │           │
   │ onFileLoad  │  │ html={..} │   │ value={..}│
   │ onPaste     │  │           │   │ onChange  │
   └──────┬──────┘  └───────────┘   └───────────┘
          │
          ▼
   ┌─────────────┐     ┌─────────────┐
   │ fileReader  │────→│ useMarkdown │
   │ .readFile() │     │  (hook)     │
   └─────────────┘     │             │
                       │ marked()    │
                       │ highlight() │
                       └─────────────┘
```

### 2.2 状态管理

使用 React `useState` + `useReducer` 管理全局状态，无需引入外部状态库。

```javascript
// App.jsx 状态结构
const initialState = {
  markdown: '',        // 原始 Markdown 文本
  fileName: '',        // 导入的文件名
  theme: 'light',      // 当前主题: 'light' | 'dark' | 'print'
  mode: 'viewer',      // 当前模式: 'empty' | 'viewer' | 'editor'
};
```

**状态转换：**

| 事件 | 前置状态 | 后置状态 | 说明 |
|------|---------|---------|------|
| 文件导入成功 | empty | viewer | 进入渲染模式 |
| 粘贴文本 | empty / viewer | viewer | 替换内容 |
| 新文件导入 | viewer | viewer | 替换内容 |
| 点击编辑 | viewer | editor | 进入编辑模式 |
| 点击预览 | editor | viewer | 返回渲染模式 |
| 主题切换 | any | any | 状态不变，仅 theme 更新 |

---

## 3. 模块设计

### 3.1 文件读取模块 — `fileReader.js`

**职责：** 读取用户导入的 .md 文件，返回 Markdown 文本。

```javascript
/**
 * 读取 .md 文件内容
 * @param {File} file - 用户选择的文件对象
 * @returns {Promise<{content: string, fileName: string}>}
 */
export async function readFile(file) {
  // 1. 校验文件类型
  // 2. 校验文件大小 (≤ 5MB)
  // 3. FileReader.readAsText(file, 'UTF-8')
  // 4. 处理 BOM 头
  // 5. 返回 { content, fileName }
}

/**
 * 处理粘贴事件，提取文本内容
 * @param {ClipboardEvent} event
 * @returns {string}
 */
export function handlePaste(event) {
  // 优先取 plain text，fallback 到 clipboardData
}
```

**错误处理：**

| 错误类型 | 触发条件 | 用户提示 |
|---------|---------|---------|
| INVALID_TYPE | 文件不是 .md/.markdown | "请导入 .md 或 .markdown 文件" |
| FILE_TOO_LARGE | 文件 > 5MB | "文件大小不能超过 5MB" |
| READ_ERROR | FileReader 读取失败 | "文件读取失败，请重试" |
| ENCODING_ERROR | 文件编码异常 | "文件编码异常，请确认为 UTF-8 格式" |

### 3.2 Markdown 解析模块 — `markdown.js`

**职责：** 配置 marked 解析器，集成 highlight.js 代码高亮。

```javascript
import { marked } from 'marked';
import hljs from 'highlight.js';

// 配置 marked
marked.setOptions({
  gfm: true,         // GitHub Flavored Markdown
  breaks: true,      // 换行符转 <br>
  highlight: (code, lang) => {
    // 调用 highlight.js 进行语法高亮
    // fallback: 自动检测语言
  }
});

/**
 * 将 Markdown 文本解析为 HTML
 * @param {string} markdown
 * @returns {string} html
 */
export function parseMarkdown(markdown) {
  return marked.parse(markdown);
}
```

**GFM 支持清单：**

| 特性 | marked 配置 | 状态 |
|------|------------|------|
| 表格 | gfm: true | ✅ |
| 任务列表 | gfm: true | ✅ |
| 删除线 | gfm: true | ✅ |
| 自动链接 | gfm: true | ✅ |
| 围栏代码块 | 默认支持 | ✅ |
| 数学公式 | 需扩展插件 | ❌ v1 不支持 |

### 3.3 自定义 Hook — `useMarkdown.js`

**职责：** 封装 Markdown 解析逻辑，供 Viewer 和 Editor 复用。

```javascript
import { useMemo } from 'react';
import { parseMarkdown } from '../utils/markdown';
import { extractTOC } from '../utils/toc';

export function useMarkdown(markdownText) {
  // 解析 HTML（memo 化，markdownText 变化时重新计算）
  const html = useMemo(() => {
    if (!markdownText) return '';
    return parseMarkdown(markdownText);
  }, [markdownText]);

  // 提取目录
  const toc = useMemo(() => {
    if (!html) return [];
    return extractTOC(html);
  }, [html]);

  // 统计信息
  const stats = useMemo(() => ({
    words: markdownText.trim() ? markdownText.trim().split(/\s+/).length : 0,
    lines: markdownText ? markdownText.split('\n').length : 0,
    chars: markdownText ? markdownText.length : 0,
  }), [markdownText]);

  return { html, toc, stats };
}
```

### 3.4 TOC 提取模块 — `toc.js`

**职责：** 从渲染后的 HTML 中提取标题，生成目录树。

```javascript
/**
 * 从 HTML 字符串提取目录结构
 * @param {string} html - 渲染后的 HTML
 * @returns {Array<{id: string, text: string, level: number}>}
 */
export function extractTOC(html) {
  // 1. 创建临时 DOM 容器
  // 2. querySelectorAll('h1, h2, h3')
  // 3. 为每个标题生成唯一 id
  // 4. 返回 [{ id, text, level }] 数组
}

/**
 * 为 HTML 中的标题元素添加 id 属性
 * @param {string} html
 * @returns {string} - 带 id 的 HTML
 */
export function addHeadingIds(html) {
  // 正则匹配 <h1-h6> 标签，注入 id 属性
}
```

### 3.5 PDF 导出模块 — `exportPdf.js`

**职责：** 将渲染后的 HTML 导出为 PDF 文件。

```javascript
import html2pdf from 'html2pdf.js';

/**
 * 将 DOM 元素导出为 PDF
 * @param {HTMLElement} element - 要导出的 DOM 元素
 * @param {string} fileName - 文件名（不含扩展名）
 */
export async function exportPdf(element, fileName) {
  const options = {
    margin: [10, 10, 10, 10],
    filename: `${fileName}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
    },
  };

  await html2pdf().set(options).from(element).save();
}
```

**分页策略：**

- 使用 `pagebreak.mode: 'avoid-all'` 避免在代码块、表格内分页
- 预览区 DOM 直接作为导出源，确保样式一致
- 图片使用 `useCORS: true` 处理跨域

### 3.6 Word 导出模块 — `exportWord.js`

**职责：** 将 HTML 内容导出为 .docx 文件。

```javascript
import { asBlob } from 'html-docx-js';

/**
 * 将 HTML 导出为 Word 文档
 * @param {string} html - 渲染后的 HTML 字符串
 * @param {string} fileName - 文件名（不含扩展名）
 */
export function exportWord(html, fileName) {
  // 1. 包装 HTML（添加基础样式）
  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; }
        code { font-family: 'Consolas', monospace; background: #f5f5f5; padding: 2px 4px; }
        pre { background: #f5f5f5; padding: 12px; border-radius: 4px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
        blockquote { border-left: 3px solid #ddd; padding-left: 12px; color: #666; }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `;

  // 2. 转为 Blob
  const blob = asBlob(fullHtml);

  // 3. 触发下载
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## 4. 组件设计

### 4.1 组件树

```
App
├── Header
│   ├── Logo + 文件名
│   ├── ThemeSelector
│   ├── 导出按钮 (PDF / Word)
│   └── 模式切换按钮 (编辑 / 预览)
│
├── DropZone              ← mode === 'empty'
│   ├── 拖拽区域
│   ├── 文件选择按钮
│   └── 粘贴按钮
│
├── Viewer                ← mode === 'viewer'
│   ├── TOC (侧边栏)
│   └── 渲染内容区
│
├── EditorPanel           ← mode === 'editor'
│   ├── Toolbar
│   ├── Editor (CodeMirror)
│   └── Preview (实时预览)
│
└── StatusBar
    ├── 主题指示
    └── 统计信息
```

### 4.2 组件接口定义

#### App.jsx

```javascript
// 状态容器，管理全局状态和模式切换
function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  // ...
}
```

#### DropZone.jsx

```javascript
/**
 * @param {Object} props
 * @param {(content: string, fileName: string) => void} props.onFileLoad - 文件导入回调
 * @param {(text: string) => void} props.onPaste - 粘贴回调
 */
function DropZone({ onFileLoad, onPaste }) {
  // 拖拽事件处理: onDragOver, onDragEnter, onDragLeave, onDrop
  // 文件选择: <input type="file" accept=".md,.markdown">
  // 粘贴监听: document paste 事件
}
```

#### Viewer.jsx

```javascript
/**
 * @param {Object} props
 * @param {string} props.html - 渲染后的 HTML 字符串
 * @param {Array} props.toc - 目录数据
 * @param {string} props.theme - 当前主题
 */
function Viewer({ html, toc, theme }) {
  // 渲染 HTML 内容 (dangerouslySetInnerHTML)
  // TOC 侧边栏
  // 点击 TOC 项跳转
  // 滚动监听 (scroll spy)
}
```

#### Editor.jsx

```javascript
/**
 * @param {Object} props
 * @param {string} props.value - Markdown 文本
 * @param {(value: string) => void} props.onChange - 内容变化回调
 * @param {string} props.theme - 当前主题
 */
function Editor({ value, onChange, theme }) {
  // CodeMirror 6 集成
  // Markdown 语言支持
  // 主题跟随
}
```

#### Toolbar.jsx

```javascript
/**
 * @param {Object} props
 * @param {(syntax: string) => void} props.onInsert - 插入语法回调
 */
function Toolbar({ onInsert }) {
  // 快捷按钮组
  // 每个按钮触发 onInsert(before, after, placeholder)
}
```

### 4.3 组件状态图

```
              ┌──────────┐
              │  empty   │  ← 初始状态
              └────┬─────┘
                   │ onFileLoad / onPaste
                   ▼
              ┌──────────┐
         ┌───→│  viewer  │ ←──┐
         │    └────┬─────┘    │
         │         │          │
    onFileLoad     │ onClick  │ onClick
    (替换内容)     │ "编辑"    │ "预览"
         │         ▼          │
         │    ┌──────────┐    │
         └───→│  editor  │────┘
              └──────────┘
```

---

## 5. 样式架构

### 5.1 CSS 变量体系

```css
:root {
  /* 颜色 */
  --ink:           #2C2C2C;    /* 主文字 */
  --ink-secondary: #5A5650;    /* 次文字 */
  --paper:         #FAF8F5;    /* 页面背景 */
  --parchment:     #F3F0EB;    /* 编辑器背景 */
  --fog:           #E8E4DF;    /* 边框、分割线 */
  --stone:         #9B9590;    /* 占位文字 */
  --accent:        #C4654A;    /* 强调色（陶土色） */
  --accent-hover:  #A8523B;    /* 强调色悬停 */

  /* 字体 */
  --font-ui:       'DM Sans', sans-serif;
  --font-editor:   'JetBrains Mono', monospace;
  --font-preview:  'Crimson Text', Georgia, serif;

  /* 间距 */
  --space-{1-12}:  0.25rem - 3rem;

  /* 圆角 */
  --radius-{sm,md,lg}: 4px / 6px / 8px;
}
```

### 5.2 主题切换机制

通过 `data-theme` 属性切换，覆盖 CSS 变量：

```javascript
// 切换主题
document.documentElement.dataset.theme = theme;
// <html data-theme="dark">
```

```css
[data-theme="dark"] {
  --ink:       #E8E4DF;
  --paper:     #1A1918;
  --parchment: #201F1E;
  --fog:       #2E2D2B;
  --accent:    #D4775E;
  /* ... */
}
```

### 5.3 响应式断点

| 断点 | 布局变化 |
|------|---------|
| ≥ 1024px | 正常布局：TOC + 内容区 |
| 768px - 1023px | 隐藏 TOC，内容区全宽 |
| < 768px | 上下布局，编辑/预览垂直堆叠 |

---

## 6. 文件读取流程

### 6.1 拖拽导入

```
用户拖拽文件到 DropZone
    │
    ▼
onDragOver (阻止默认行为)
    │
    ▼
onDrop
    │
    ├─→ dataTransfer.files[0]
    │
    ▼
fileReader.readFile(file)
    │
    ├─→ 校验类型 (.md / .markdown)
    ├─→ 校验大小 (≤ 5MB)
    ├─→ FileReader.readAsText(file, 'UTF-8')
    │
    ▼
onFileLoad(content, fileName)
    │
    ▼
App 状态更新: { markdown, fileName, mode: 'viewer' }
```

### 6.2 粘贴导入

```
用户按下 Ctrl+V / 点击粘贴按钮
    │
    ▼
document paste 事件 / navigator.clipboard.readText()
    │
    ▼
提取纯文本内容
    │
    ▼
onPaste(text)
    │
    ▼
App 状态更新: { markdown: text, fileName: 'pasted.md', mode: 'viewer' }
```

---

## 7. 导出流程

### 7.1 PDF 导出

```
用户点击 [导出 PDF]
    │
    ▼
获取 Viewer 渲染区域 DOM 引用 (ref)
    │
    ▼
exportPdf(element, fileName)
    │
    ├─→ html2pdf().set(options).from(element).save()
    │
    ▼
浏览器触发下载 document.pdf
```

**注意事项：**

- 导出前临时隐藏 TOC 侧边栏，仅导出内容区
- 代码块高亮样式需要内联到导出 DOM（highlight.js 的样式是外链的）
- 大文档可能需要较长处理时间，显示 loading 状态

### 7.2 Word 导出

```
用户点击 [导出 Word]
    │
    ▼
获取渲染后的 HTML 字符串
    │
    ▼
exportWord(html, fileName)
    │
    ├─→ 包装 HTML + 内联样式
    ├─→ html-docx-js 转为 Blob
    ├─→ 创建下载链接
    │
    ▼
浏览器触发下载 document.docx
```

---

## 8. 性能优化

### 8.1 解析性能

| 策略 | 实现方式 |
|------|---------|
| 防抖 | 编辑器输入防抖 300ms 后触发解析 |
| Memo 化 | `useMemo` 缓存 HTML / TOC / Stats，仅依赖变化时重算 |
| 懒加载 | highlight.js 按需加载语言包，不全量引入 |
| 虚拟滚动 | v1 不实现，超长文档后续版本考虑 |

### 8.2 导出性能

| 策略 | 实现方式 |
|------|---------|
| 异步处理 | PDF 导出使用 async/await，不阻塞 UI |
| Loading 状态 | 导出过程中显示加载指示器 |
| 内存释放 | Word 导出完成后及时 revokeObjectURL |

---

## 9. 错误处理

### 9.1 全局错误边界

```javascript
class ErrorBoundary extends React.Component {
  // 捕获渲染错误，显示降级 UI
}
```

### 9.2 错误场景

| 场景 | 处理方式 |
|------|---------|
| 文件读取失败 | Toast 提示 + 保持当前状态 |
| Markdown 解析异常 | 显示原始文本 + 错误提示 |
| PDF 导出失败 | Toast 提示 + 控制台记录错误 |
| Word 导出失败 | Toast 提示 + 控制台记录错误 |
| 图片加载失败 | 显示 alt 文本 + 占位图 |

---

## 10. 浏览器兼容性

| API | 兼容性 | Polyfill |
|-----|--------|----------|
| FileReader | Chrome 7+, FF 3.6+, Safari 6+ | 不需要 |
| Drag & Drop | Chrome 4+, FF 3.5+, Safari 6+ | 不需要 |
| Clipboard API | Chrome 66+, FF 63+, Safari 13.1+ | fallback 到 paste 事件 |
| Blob / URL.createObjectURL | 全平台支持 | 不需要 |
| CSS Variables | Chrome 49+, FF 31+, Safari 9.1+ | 不需要 |
| dataset | Chrome 8+, FF 6+, Safari 5.1+ | 不需要 |

**目标兼容：** Chrome 90+, Firefox 90+, Edge 90+, Safari 15+, iOS Safari 15+

---

## 11. 安全考虑

| 风险 | 措施 |
|------|------|
| XSS（HTML 注入） | marked 输出经过 DOMPurify 净化后再渲染 |
| 文件类型伪造 | 校验文件扩展名 + MIME type |
| 超大文件 | 文件大小限制 5MB |
| 跨域图片 | 导出 PDF 时使用 `useCORS: true` |
