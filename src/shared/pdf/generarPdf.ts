// Genera PDFs con layout de escritorio y elimina espacio vacío antes de paginar.
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

  // Contenedor temporal
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

    const alturaCaptura = Math.ceil(clon.getBoundingClientRect().height);

    // Captura
    const canvasOriginal = await html2canvas(clon, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: fondoColor,
      logging: false,
      width: anchoCaptura,
      height: alturaCaptura,
      windowWidth: anchoCaptura,
      windowHeight: Math.max(alturaCaptura, 800),
      scrollX: 0,
      scrollY: 0
    });

    // Eliminar espacio vacío inferior
    const canvas = recortarEspacioInferior(canvasOriginal, fondoColor);

    if (canvas.height <= 0 || canvas.width <= 0) return;

    const pxPerMm = canvas.width / printableWidth;
    const pageHeightPx = Math.floor(printableHeight * pxPerMm);

    let renderedHeight = 0;
    let localPageIndex = 0;
    let agregarPaginaAntes = opciones.iniciarEnNuevaPagina ?? false;

    while (renderedHeight < canvas.height) {
      const remainingHeight = canvas.height - renderedHeight;

      // Evita generar una página por un sobrante insignificante
      if (remainingHeight <= 4) break;

      if (localPageIndex > 0 || agregarPaginaAntes) pdf.addPage();

      agregarPaginaAntes = false;

      const currentPageHeight = Math.min(pageHeightPx, remainingHeight);

      if (currentPageHeight <= 4) break;

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

      pdf.addImage(
        imageData,
        'JPEG',
        margin,
        margin,
        printableWidth,
        imageHeightMm
      );

      renderedHeight += currentPageHeight;
      localPageIndex++;
    }
  } finally {
    contenedor.remove();
  }
}

// Recorta únicamente el espacio vacío al final del canvas
function recortarEspacioInferior(canvas: HTMLCanvasElement, fondoColor: string): HTMLCanvasElement {
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) return canvas;

  const width = canvas.width;
  const height = canvas.height;

  const background = hexToRgb(fondoColor);

  if (!background) return canvas;

  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  const tolerancia = 8;
  const pasoX = Math.max(1, Math.floor(width / 300));

  let ultimaFilaConContenido = -1;

  for (let y = height - 1; y >= 0; y--) {
    let tieneContenido = false;

    for (let x = 0; x < width; x += pasoX) {
      const index = (y * width + x) * 4;

      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      if (a === 0) continue;

      const esFondo =
        Math.abs(r - background.r) <= tolerancia &&
        Math.abs(g - background.g) <= tolerancia &&
        Math.abs(b - background.b) <= tolerancia;

      if (!esFondo) {
        tieneContenido = true;
        break;
      }
    }

    if (tieneContenido) {
      ultimaFilaConContenido = y;
      break;
    }
  }

  if (ultimaFilaConContenido < 0) return canvas;

  // Pequeño margen inferior visual
  const paddingInferior = 40;
  const nuevaAltura = Math.min(height, ultimaFilaConContenido + paddingInferior);

  // No hacer trabajo si prácticamente no hay nada que recortar
  if (nuevaAltura >= height - 4) return canvas;

  const recortado = document.createElement('canvas');
  recortado.width = width;
  recortado.height = nuevaAltura;

  const recortadoContext = recortado.getContext('2d');

  if (!recortadoContext) return canvas;

  recortadoContext.fillStyle = fondoColor;
  recortadoContext.fillRect(0, 0, width, nuevaAltura);

  recortadoContext.drawImage(
    canvas,
    0,
    0,
    width,
    nuevaAltura,
    0,
    0,
    width,
    nuevaAltura
  );

  return recortado;
}

// Convierte HEX a RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '').trim();

  if (normalized.length === 3) {
    return {
      r: parseInt(normalized[0] + normalized[0], 16),
      g: parseInt(normalized[1] + normalized[1], 16),
      b: parseInt(normalized[2] + normalized[2], 16)
    };
  }

  if (normalized.length !== 6) return null;

  return {
    r: parseInt(normalized.substring(0, 2), 16),
    g: parseInt(normalized.substring(2, 4), 16),
    b: parseInt(normalized.substring(4, 6), 16)
  };
}

// Espera layout
function esperarRender(): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

// Espera imágenes
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