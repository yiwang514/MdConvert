import CodeMirror from '@uiw/react-codemirror';
import { markdown as markdownLang } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import './Editor.css';

// 浅色主题（基于设计系统配色）
const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--parchment)',
    color: 'var(--ink)',
  },
  '.cm-content': {
    caretColor: 'var(--accent)',
    fontFamily: "var(--font-editor)",
    fontSize: 'var(--text-sm)',
    lineHeight: '1.7',
    padding: 'var(--space-4)',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--accent)',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'var(--accent-glow) !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'var(--accent-glow) !important',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--parchment)',
    borderRight: '1px solid var(--fog)',
    color: 'var(--stone)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--accent-ghost)',
    color: 'var(--accent)',
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--accent-ghost)',
  },
  '.cm-line': {
    padding: '0 var(--space-2)',
  },
}, { dark: false });

export default function Editor({ value, onChange, theme }) {
  const extensions = [
    markdownLang(),
    EditorView.lineWrapping,
  ];

  // 根据主题选择编辑器主题
  const editorTheme = theme === 'dark' ? oneDark : lightTheme;

  return (
    <div className="editor-pane">
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={extensions}
        theme={editorTheme}
        className="editor-cm"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          foldGutter: false,
          bracketMatching: true,
        }}
      />
    </div>
  );
}
