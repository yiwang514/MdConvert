const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_EXTENSIONS = ['.md', '.markdown'];

/**
 * 读取 .md 文件内容
 * @param {File} file
 * @returns {Promise<{content: string, fileName: string}>}
 */
export function readFile(file) {
  return new Promise((resolve, reject) => {
    // 校验文件扩展名
    const name = file.name.toLowerCase();
    const isValid = VALID_EXTENSIONS.some((ext) => name.endsWith(ext));
    if (!isValid) {
      reject(new Error('INVALID_TYPE'));
      return;
    }

    // 校验文件大小
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error('FILE_TOO_LARGE'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      let content = e.target.result;

      // 去除 BOM 头
      if (content.charCodeAt(0) === 0xfeff) {
        content = content.slice(1);
      }

      resolve({
        content,
        fileName: file.name,
      });
    };

    reader.onerror = () => {
      reject(new Error('READ_ERROR'));
    };

    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * 从粘贴事件提取文本
 * @param {ClipboardEvent} event
 * @returns {string}
 */
export function handlePaste(event) {
  const text = event.clipboardData.getData('text/plain');
  return text || '';
}

/**
 * 错误码 → 用户提示文案
 */
export const ERROR_MESSAGES = {
  INVALID_TYPE: '请导入 .md 或 .markdown 文件',
  FILE_TOO_LARGE: '文件大小不能超过 5MB',
  READ_ERROR: '文件读取失败，请重试',
  ENCODING_ERROR: '文件编码异常，请确认为 UTF-8 格式',
};
