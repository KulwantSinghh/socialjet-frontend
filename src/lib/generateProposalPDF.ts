import type { SalesAnalysis } from '@/types/intelligence.types';
import { generateProposalHTML } from './generateProposalHTML';

export async function generateProposalPDFBlob(analysis: SalesAnalysis): Promise<Blob> {
  const html2pdf = (await import('html2pdf.js')).default;
  const html = generateProposalHTML(analysis);

  // Use an iframe so the full HTML document (with <head>/<style>) loads correctly.
  // innerHTML on a div strips <head> and <style>, producing a blank/unstyled PDF.
  const iframe = document.createElement('iframe');
  iframe.style.cssText =
    'position:fixed;left:-9999px;top:0;width:210mm;height:297mm;border:none;visibility:hidden;';
  document.body.appendChild(iframe);

  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve();
    iframe.contentDocument!.open();
    iframe.contentDocument!.write(html);
    iframe.contentDocument!.close();
  });

  const body = iframe.contentDocument!.body;

  try {
    const blob: Blob = await html2pdf()
      .set({
        margin: 0,
        filename: `proposal-${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.97 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(body)
      .outputPdf('blob');

    return blob;
  } finally {
    document.body.removeChild(iframe);
  }
}
