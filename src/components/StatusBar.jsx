import './StatusBar.css';

const THEME_NAMES = {
  light: 'Light',
  dark: 'Dark',
  print: 'Print',
};

export default function StatusBar({ theme, stats }) {
  return (
    <div className="status-bar">
      <div className="status-bar__item">
        <span className="status-bar__dot" />
        <span>{THEME_NAMES[theme] || theme}</span>
      </div>
      <div className="status-bar__item">
        字数: <strong>{stats.words.toLocaleString()}</strong>
      </div>
      <div className="status-bar__item">
        行数: <strong>{stats.lines.toLocaleString()}</strong>
      </div>
      <div className="status-bar__item">
        字符: <strong>{stats.chars.toLocaleString()}</strong>
      </div>
    </div>
  );
}
