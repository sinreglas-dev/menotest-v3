// src/shared/pdf/generarPdf.ts
export async function crearDocumentoPdf() {
  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.jsPDF;

  return new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
}

interface OpcionesAgregarElemento {
  fondoColor?: string;
  iniciarEnNuevaPagina?: boolean;
}

export async function agregarElementoAPdf(
  pdf: any,
  elemento: HTMLElement,
  opciones: OpcionesAgregarElemento = {}
): Promise<void> {
  const html2canvasModule = await import('html2canvas');
  const html2canvas = html2canvasModule.default;

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;

  const canvas = await html2canvas(elemento, {
    scale: 2,
    useCORS: true,
    backgroundColor: opciones.fondoColor ?? '#ffffff',
    logging: false,
    windowWidth: elemento.scrollWidth,
  });

  const pxPerMm = canvas.width / printableWidth;
  const pageHeightPx = Math.floor(printableHeight * pxPerMm);

  let renderedHeight = 0;
  let localPageIndex = 0;
  let agregarPaginaAntes = opciones.iniciarEnNuevaPagina ?? false;

  while (renderedHeight < canvas.height) {
    if (localPageIndex > 0 || agregarPaginaAntes) {
      pdf.addPage();
    }
    agregarPaginaAntes = false;

    const currentPageHeight = Math.min(pageHeightPx, canvas.height - renderedHeight);
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = currentPageHeight;

    const context = pageCanvas.getContext('2d');
    if (!context) break;

    context.fillStyle = opciones.fondoColor ?? '#ffffff';
    context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    context.drawImage(
      canvas,
      0,
      renderedHeight,
      canvas.width,
      currentPageHeight,
      0,
      0,
      canvas.width,
      currentPageHeight
    );

    const imageData = pageCanvas.toDataURL('image/jpeg', 0.96);
    const imageHeightMm = currentPageHeight / pxPerMm;

    pdf.addImage(imageData, 'JPEG', margin, margin, printableWidth, imageHeightMm);

    renderedHeight += currentPageHeight;
    localPageIndex++;
  }
}

export function nombreArchivoSeguro(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}