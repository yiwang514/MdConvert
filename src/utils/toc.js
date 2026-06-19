let headingCounter = 0;

/**
 * 为 HTML 中的标题添加 id 属性
 * @param {string} html
 * @returns {string}
 */
export function addHeadingIds(html) {
  headingCounter = 0;
  return html.replace(/<h([1-6])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, content) => {
    const id = `heading-${headingCounter++}`;
    // 避免重复添加 id
    if (attrs.includes('id=')) return match;
    return `<h${level} id="${id}"${attrs}>${content}</h${level}>`;
  });
}

/**
 * 从 HTML 提取目录结构
 * @param {string} html - 已添加 id 的 HTML
 * @returns {Array<{id: string, text: string, level: number}>}
 */
export function extractTOC(html) {
  const container = document.createElement('div');
  container.innerHTML = html;

  const headings = container.querySelectorAll('h1, h2, h3');
  return Array.from(headings).map((el) => ({
    id: el.id,
    text: el.textContent,
    level: parseInt(el.tagName.charAt(1), 10),
  }));
}
