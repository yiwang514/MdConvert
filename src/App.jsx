import { useReducer, useCallback, useRef, useEffect } from 'react';
import { useMarkdown } from './hooks/useMarkdown';
import { exportPdf } from './utils/exportPdf';
import { exportWord } from './utils/exportWord';
import DropZone from './components/DropZone';
import Viewer from './components/Viewer';
import Editor from './components/Editor';
import Toolbar from './components/Toolbar';
import ThemeSelector from './components/ThemeSelector';
import StatusBar from './components/StatusBar';
import './App.css';

// ── State ──────────────────────────────────
const initialState = {
  markdown: '',
  fileName: '',
  theme: 'light',
  mode: 'empty', // 'empty' | 'viewer' | 'editor'
};

function appReducer(state, action) {
  switch (action.type) {
    case 'LOAD_FILE':
      return {
        ...state,
        markdown: action.payload.markdown,
        fileName: action.payload.fileName,
        mode: 'viewer',
      };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'UPDATE_MARKDOWN':
      return { ...state, markdown: action.payload };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const viewerRef = useRef(null);

  const { html, toc, stats } = useMarkdown(state.markdown);

  // 主题切换
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  // 文件导入
  const handleFileLoad = useCallback((content, fileName) => {
    dispatch({ type: 'LOAD_FILE', payload: { markdown: content, fileName } });
  }, []);

  // 粘贴导入
  const handlePaste = useCallback((text) => {
    dispatch({
      type: 'LOAD_FILE',
      payload: { markdown: text, fileName: 'pasted.md' },
    });
  }, []);

  // 编辑器内容变化
  const handleEditorChange = useCallback((value) => {
    dispatch({ type: 'UPDATE_MARKDOWN', payload: value });
  }, []);

  // 主题切换
  const handleThemeChange = useCallback((theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  // 模式切换
  const handleToggleMode = useCallback(() => {
    dispatch({
      type: 'SET_MODE',
      payload: state.mode === 'viewer' ? 'editor' : 'viewer',
    });
  }, [state.mode]);

  // 工具栏插入
  const handleToolbarInsert = useCallback((action) => {
    const md = state.markdown;
    const insert = action.before + (action.placeholder || '') + action.after;
    dispatch({ type: 'UPDATE_MARKDOWN', payload: md + insert });
  }, [state.markdown]);

  // 导出 PDF
  const handleExportPdf = useCallback(async () => {
    const el = viewerRef.current?.querySelector('.preview-html');
    if (!el) return;
    const name = state.fileName.replace(/\.(md|markdown)$/i, '') || 'document';
    try {
      await exportPdf(el, name);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  }, [state.fileName]);

  // 导出 Word
  const handleExportWord = useCallback(() => {
    const name = state.fileName.replace(/\.(md|markdown)$/i, '') || 'document';
    try {
      exportWord(html, name);
    } catch (err) {
      console.error('Word export failed:', err);
    }
  }, [html, state.fileName]);

  // 重新导入
  const handleReimport = useCallback(() => {
    dispatch({ type: 'SET_MODE', payload: 'empty' });
  }, []);

  return (
    <div className="app">
      {/* 签名渐变线 */}
      <div className="app__accent-line" />

      {/* Header */}
      {state.mode !== 'empty' && (
        <header className="header">
          <div className="header__left">
            <span className="header__logo">MdConvert</span>
            {state.fileName && (
              <span className="header__filename">{state.fileName}</span>
            )}
          </div>

          <div className="header__right">
            <button className="header__btn" onClick={handleReimport} title="导入新文件">
              导入
            </button>
            <button className="header__btn" onClick={handleToggleMode}>
              {state.mode === 'viewer' ? '编辑' : '预览'}
            </button>
            <ThemeSelector value={state.theme} onChange={handleThemeChange} />
            <div className="header__sep" />
            <button className="header__btn header__btn--accent" onClick={handleExportPdf}>
              PDF
            </button>
            <button className="header__btn header__btn--accent" onClick={handleExportWord}>
              Word
            </button>
          </div>
        </header>
      )}

      {/* Main */}
      <main className="main">
        {state.mode === 'empty' && (
          <DropZone onFileLoad={handleFileLoad} onPaste={handlePaste} />
        )}

        {state.mode === 'viewer' && (
          <div className="viewer-wrapper" ref={viewerRef}>
            <Viewer html={html} toc={toc} fileName={state.fileName} />
          </div>
        )}

        {state.mode === 'editor' && (
          <div className="editor-wrapper">
            <Toolbar onInsert={handleToolbarInsert} />
            <div className="editor-split">
              <Editor
                value={state.markdown}
                onChange={handleEditorChange}
                theme={state.theme}
              />
              <div className="editor-preview">
                <div
                  className="preview-html"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Status Bar */}
      {state.mode !== 'empty' && (
        <StatusBar theme={state.theme} stats={stats} />
      )}
    </div>
  );
}
