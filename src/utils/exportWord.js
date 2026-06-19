/**
 * 将 HTML 导出为 Word 文档
 * 使用 Word 兼容的 HTML 格式（MHTML），Word 可直接打开
 * @param {string} html - 渲染后的 HTML 字符串
 * @param {string} fileName
 */
export function exportWord(html, fileName) {
  const wordHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
          line-height: 1.8;
          color: #2C2C2C;
          padding: 20px;
        }
        h1 {
          font-size: 2em;
          border-bottom: 1px solid #ddd;
          padding-bottom: 8px;
          margin: 1.5em 0 0.8em;
        }
        h2 { font-size: 1.5em; margin: 1.2em 0 0.6em; }
        h3 { font-size: 1.25em; margin: 1em 0 0.5em; }
        p { margin: 0 0 1em; }
        code {
          font-family: 'Consolas', 'Courier New', monospace;
          background: #f5f5f5;
          padding: 2px 4px;
          font-size: 0.9em;
        }
        pre {
          background: #f5f5f5;
          padding: 16px;
          margin: 1em 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        pre code { background: none; padding: 0; }
        blockquote {
          border-left: 3px solid #C4654A;
          padding: 8px 16px;
          margin: 1em 0;
          color: #666;
          background: #faf8f5;
        }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
        th { background: #f5f5f5; font-weight: 600; }
        ul, ol { margin: 0 0 1em; padding-left: 2em; }
        li { margin-bottom: 4px; }
        hr { border: none; height: 1px; background: #ddd; margin: 2em 0; }
        a { color: #C4654A; }
        img { max-width: 100%; }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `;

  const blob = new Blob(['﻿', wordHtml], {
    type: 'application/msword',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
