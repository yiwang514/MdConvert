import './ThemeSelector.css';

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'print', label: 'Print' },
];

export default function ThemeSelector({ value, onChange }) {
  return (
    <select
      className="theme-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {THEMES.map((t) => (
        <option key={t.value} value={t.value}>{t.label}</option>
      ))}
    </select>
  );
}
