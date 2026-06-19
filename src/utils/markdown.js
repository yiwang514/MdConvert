import { marked } from 'marked';
import hljs from 'highlight.js';

// 配置 marked
marked.setOptions({
  gfm: true,
  breaks: true,
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (e) {
        // fallback
      }
    }
    try {
      return hljs.highlightAuto(code).value;
    } catch (e) {
      return code;
    }
  },
});

/**
 * 将 Markdown 解析为 HTML
 * @param {string} markdown
 * @returns {string}
 */
export function parseMarkdown(markdown) {
  if (!markdown) return '';
  return marked.parse(markdown);
}
