// Genera PDFs manteniendo un layout de escritorio independientemente del dispositivo.
export async function crearDocumentoPdf() {
  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.jsPDF;

  return new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
}

interface OpcionesAgregarElemento {
  fondoColor?: string;
  iniciarEnNuevaPagina?: boolean;
  anchoCaptura?: number;
}

// Agrega un elemento al PDF usando un clon con ancho fijo
export async function agregarElementoAPdf(pdf: any, elemento: HTMLElement, opciones: OpcionesAgregarElemento = {}): Promise<void> {
  const html2canvasModule = await import('html2canvas');
  const html2canvas = html2canvasModule.default;

  const fondoColor = opciones.fondoColor ?? '#ffffff';
  const anchoCaptura = opciones.anchoCaptura ?? 1152;

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;

  // Contenedor temporal fuera de pantalla
  const contenedor = document.createElement('div');
  contenedor.style.position = 'fixed';
  contenedor.style.left = `-${anchoCaptura + 200}px`;
  contenedor.style.top = '0';
  contenedor.style.width = `${anchoCaptura}px`;
  contenedor.style.minWidth = `${anchoCaptura}px`;
  contenedor.style.maxWidth = `${anchoCaptura}px`;
  contenedor.style.background = fondoColor;
  contenedor.style.zIndex = '-9999';
  contenedor.style.pointerEvents = 'none';
  contenedor.style.overflow = 'visible';

  // Clon del contenido
  const clon = elemento.cloneNode(true) as HTMLElement;
  clon.style.width = `${anchoCaptura}px`;
  clon.style.minWidth = `${anchoCaptura}px`;
  clon.style.maxWidth = `${anchoCaptura}px`;
  clon.style.margin = '0';
  clon.style.boxSizing = 'border-box';

  contenedor.appendChild(clon);
  document.body.appendChild(contenedor);

  try {
    // Esperar layout, fuentes e imágenes
    if (document.fonts?.ready) await document.fonts.ready;
    await esperarImagenes(clon);
    await esperarRender();

    const alturaCaptura = clon.scrollHeight;

    const canvas = await html2canvas(clon, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: fondoColor,
      logging: false,
      width: anchoCaptura,
      height: alturaCaptura,
      windowWidth: anchoCaptura,
      windowHeight: alturaCaptura,
      scrollX: 0,
      scrollY: 0
    });

    const pxPerMm = canvas.width / printableWidth;
    const pageHeightPx = Math.floor(printableHeight * pxPerMm);

    let renderedHeight = 0;
    let localPageIndex = 0;
    let agregarPaginaAntes = opciones.iniciarEnNuevaPagina ?? false;

    while (renderedHeight < canvas.height) {
      if (localPageIndex > 0 || agregarPaginaAntes) pdf.addPage();
      agregarPaginaAntes = false;

      const currentPageHeight = Math.min(pageHeightPx, canvas.height - renderedHeight);

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = currentPageHeight;

      const context = pageCanvas.getContext('2d');
      if (!context) break;

      context.fillStyle = fondoColor;
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
  } finally {
    contenedor.remove();
  }
}

// Espera a que el navegador termine de calcular el layout
function esperarRender(): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

// Espera imágenes antes de capturar
async function esperarImagenes(elemento: HTMLElement): Promise<void> {
  const imagenes = Array.from(elemento.querySelectorAll('img'));

  await Promise.all(
    imagenes.map(imagen => {
      if (imagen.complete) return Promise.resolve();

      return new Promise<void>(resolve => {
        imagen.addEventListener('load', () => resolve(), { once: true });
        imagen.addEventListener('error', () => resolve(), { once: true });
      });
    })
  );
}

// Nombre seguro
export function nombreArchivoSeguro(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}