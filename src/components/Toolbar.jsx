import './Toolbar.css';

const ACTIONS = [
  { key: 'bold', label: 'B', title: '加粗 (Ctrl+B)', before: '**', after: '**', placeholder: '粗体文本' },
  { key: 'italic', label: 'I', title: '斜体 (Ctrl+I)', before: '*', after: '*', placeholder: '斜体文本' },
  { key: 'strike', label: 'S', title: '删除线', before: '~~', after: '~~', placeholder: '删除线' },
  { key: 'sep1', type: 'separator' },
  { key: 'heading', label: 'H', title: '标题', before: '## ', after: '', placeholder: '标题', lineStart: true },
  { key: 'quote', label: '"', title: '引用', before: '> ', after: '', placeholder: '引用内容', lineStart: true },
  { key: 'code', label: '</>', title: '代码', before: '`', after: '`', placeholder: 'code' },
  { key: 'sep2', type: 'separator' },
  { key: 'link', label: '🔗', title: '链接 (Ctrl+K)', before: '[', after: '](url)', placeholder: '链接文本' },
  { key: 'image', label: '📷', title: '图片', before: '![', after: '](url)', placeholder: '图片描述' },
  { key: 'table', label: '⊞', title: '表格', before: '| 列A | 列B |\n|------|------|\n| 内容 | 内容 |', after: '', placeholder: '' },
  { key: 'sep3', type: 'separator' },
  { key: 'ul', label: '•', title: '无序列表', before: '- ', after: '', placeholder: '列表项', lineStart: true },
  { key: 'ol', label: '1.', title: '有序列表', before: '1. ', after: '', placeholder: '列表项', lineStart: true },
  { key: 'hr', label: '—', title: '分割线', before: '\n---\n', after: '', placeholder: '' },
];

export default function Toolbar({ onInsert }) {
  return (
    <div className="toolbar">
      {ACTIONS.map((action) => {
        if (action.type === 'separator') {
          return <div key={action.key} className="toolbar__sep" />;
        }
        return (
          <button
            key={action.key}
            className="toolbar__btn"
            title={action.title}
            onClick={() => onInsert(action)}
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
