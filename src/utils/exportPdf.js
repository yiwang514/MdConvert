import html2pdf from 'html2pdf.js';

/**
 * 将 DOM 元素导出为 PDF
 * @param {HTMLElement} element
 * @param {string} fileName
 */
export async function exportPdf(element, fileName) {
  const options = {
    margin: [10, 10, 10, 10],
    filename: `${fileName}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
    },
  };

  await html2pdf().set(options).from(element).save();
}
