import { useMemo } from 'react';
import { parseMarkdown } from '../utils/markdown';
import { addHeadingIds, extractTOC } from '../utils/toc';

/**
 * Markdown 解析 Hook
 * @param {string} markdownText
 * @returns {{ html: string, toc: Array, stats: { words: number, lines: number, chars: number } }}
 */
export function useMarkdown(markdownText) {
  const html = useMemo(() => {
    if (!markdownText) return '';
    const rawHtml = parseMarkdown(markdownText);
    return addHeadingIds(rawHtml);
  }, [markdownText]);

  const toc = useMemo(() => {
    if (!html) return [];
    return extractTOC(html);
  }, [html]);

  const stats = useMemo(() => {
    if (!markdownText) return { words: 0, lines: 0, chars: 0 };
    const trimmed = markdownText.trim();
    return {
      words: trimmed ? trimmed.split(/\s+/).length : 0,
      lines: markdownText.split('\n').length,
      chars: markdownText.length,
    };
  }, [markdownText]);

  return { html, toc, stats };
}
