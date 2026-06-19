import { useRef, useEffect, useCallback } from 'react';
import './Viewer.css';

export default function Viewer({ html, toc, fileName }) {
  const contentRef = useRef(null);

  // TOC 点击跳转
  const handleTocClick = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Scroll spy: 滚动时高亮当前 TOC 项
  useEffect(() => {
    const container = contentRef.current;
    if (!container || !toc.length) return;

    const handleScroll = () => {
      const headings = container.querySelectorAll('h1, h2, h3');
      let currentId = '';

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 120) {
          currentId = heading.id;
        }
      });

      // 更新 TOC 高亮
      const tocItems = document.querySelectorAll('.toc-item');
      tocItems.forEach((item) => {
        item.classList.toggle('active', item.dataset.id === currentId);
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [toc]);

  return (
    <div className="viewer">
      {/* TOC 侧边栏 */}
      {toc.length > 1 && (
        <div className="toc-sidebar">
          <div className="toc-header">目录</div>
          <ul className="toc-list">
            {toc.map((item) => (
              <li key={item.id}>
                <a
                  className="toc-item"
                  data-level={item.level}
                  data-id={item.id}
                  onClick={() => handleTocClick(item.id)}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 渲染内容区 */}
      <div className="viewer-content" ref={contentRef}>
        <div className="viewer-content__inner">
          <div
            className="preview-html"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
