import { useState, useRef, useEffect, useCallback } from 'react';
import { readFile, ERROR_MESSAGES } from '../utils/fileReader';
import './DropZone.css';

export default function DropZone({ onFileLoad, onPaste }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // 监听全局粘贴事件
  useEffect(() => {
    const handleGlobalPaste = (e) => {
      const text = e.clipboardData?.getData('text/plain');
      if (text) {
        e.preventDefault();
        onPaste(text);
      }
    };
    document.addEventListener('paste', handleGlobalPaste);
    return () => document.removeEventListener('paste', handleGlobalPaste);
  }, [onPaste]);

  const handleFile = useCallback(async (file) => {
    setError('');
    try {
      const result = await readFile(file);
      onFileLoad(result.content, result.fileName);
    } catch (err) {
      setError(ERROR_MESSAGES[err.message] || '未知错误');
    }
  }, [onFileLoad]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
    // 重置 input 以便重复选择同一文件
    e.target.value = '';
  }, [handleFile]);

  return (
    <div className="dropzone-wrapper">
      <div
        className={`dropzone ${isDragging ? 'dropzone--active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown"
          onChange={handleFileSelect}
          className="dropzone__input"
        />

        <div className="dropzone__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <polyline points="9 15 12 12 15 15" />
          </svg>
        </div>

        <p className="dropzone__title">
          {isDragging ? '松开即可导入' : '拖拽 .md 文件到此处'}
        </p>
        <p className="dropzone__subtitle">或点击选择文件</p>

        <div className="dropzone__actions">
          <button
            className="dropzone__btn"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            选择文件
          </button>
          <button
            className="dropzone__btn dropzone__btn--secondary"
            onClick={(e) => {
              e.stopPropagation();
              // 触发粘贴提示
              navigator.clipboard.readText().then((text) => {
                if (text) onPaste(text);
              }).catch(() => {
                // fallback: 提示用户 Ctrl+V
                setError('请使用 Ctrl+V 粘贴内容');
              });
            }}
          >
            粘贴内容
          </button>
        </div>

        <p className="dropzone__hint">支持 .md / .markdown 文件，最大 5MB</p>

        {error && <p className="dropzone__error">{error}</p>}
      </div>
    </div>
  );
}
