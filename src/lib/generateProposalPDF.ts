import type { SalesAnalysis } from '@/types/intelligence.types';
import { generateProposalPageHTML } from './generateProposalHTML';

export async function generateProposalPDFBlob(analysis: SalesAnalysis): Promise<Blob> {
  const html2pdf = (await import('html2pdf.js')).default;

  // Inject page content as a div — all styles are inline so no <head> needed.
  // Using an iframe causes html2canvas to render blank because visibility:hidden
  // + off-screen positioning prevents the browser from painting iframe content.
  const container = document.createElement('div');
  container.style.cssText =
    'position:fixed;left:-9999px;top:0;width:210mm;background:#fff;' +
    "font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;";
  container.innerHTML = generateProposalPageHTML(analysis);
  document.body.appendChild(container);

  // Ensure fonts finish loading before html2canvas captures the frame.
  await document.fonts.ready;

  try {
    const blob: Blob = await html2pdf()
      .set({
        margin: 0,
        filename: `proposal-${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.97 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          letterRendering: true,
          scrollY: 0,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(container)
      .outputPdf('blob');

    return blob;
  } finally {
    document.body.removeChild(container);
  }
}
