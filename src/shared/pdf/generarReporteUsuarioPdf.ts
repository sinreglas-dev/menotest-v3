import type { jsPDF as JsPDFType } from 'jspdf';

export interface ReporteUsuarioSintoma {
   nombre: string;
   descripcion: string;
   intensidad: number;
}

export interface ReporteUsuarioRecomendacion {
   especialista: string;
   especialidad: string;
   texto: string;
   sintoma?: string;
   habitos?: string[];
}

export interface ReporteUsuarioReferencia {
   medicinaGeneral?: boolean;
   ginecologia?: boolean;
   psicologia?: boolean;
}

export interface ReporteUsuarioData {
   nombre: string;
   etapa: string;
   edad: number;
   imc: string;
   tituloEtapa: string;
   contenidoEtapa: string[];
   sintomas: ReporteUsuarioSintoma[];
   recomendaciones: ReporteUsuarioRecomendacion[];
   referencias?: ReporteUsuarioReferencia | null;
}

const COLOR_MORADO: [number, number, number] = [110, 11, 108];
const COLOR_TEXTO: [number, number, number] = [55, 65, 81];
const COLOR_SECUNDARIO: [number, number, number] = [107, 114, 128];
const COLOR_LINEA: [number, number, number] = [229, 231, 235];

// Genera el reporte de usuario directamente en A4, sin capturas HTML.
export async function generarReporteUsuarioPdf(data: ReporteUsuarioData) {
   const jsPDFModule = await import('jspdf');
   const jsPDF = jsPDFModule.jsPDF;

   const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
   });

   const pageWidth = pdf.internal.pageSize.getWidth();
   const marginX = 20;
   const contentWidth = pageWidth - marginX * 2;
   const pageTop = 22;
   const pageBottom = 277;

   let y = pageTop;

   // Paginación
   const nuevaPagina = () => {
      pdf.addPage();
      y = pageTop;
   };

   const asegurarEspacio = (alto: number) => {
      if (y + alto > pageBottom) nuevaPagina();
   };

   // Separador
   const linea = () => {
      asegurarEspacio(10);

      pdf.setDrawColor(...COLOR_LINEA);
      pdf.setLineWidth(0.3);
      pdf.line(marginX, y, pageWidth - marginX, y);

      y += 7;
   };

   // Título de sección
   const tituloSeccion = (titulo: string) => {
      asegurarEspacio(20);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(...COLOR_MORADO);
      pdf.text(titulo.toUpperCase(), marginX, y);

      y += 8;
   };

   // Texto general
   const texto = (contenido: string, opciones?: { bold?: boolean; color?: [number, number, number]; size?: number; espacio?: number }) => {
      if (!contenido.trim()) return;

      const size = opciones?.size ?? 10;
      const espacio = opciones?.espacio ?? 5;
      const color = opciones?.color ?? COLOR_TEXTO;

      pdf.setFont('helvetica', opciones?.bold ? 'bold' : 'normal');
      pdf.setFontSize(size);
      pdf.setTextColor(...color);

      const lines = pdf.splitTextToSize(contenido, contentWidth);
      const lineHeight = size * 0.45;
      const requiredHeight = lines.length * lineHeight + espacio;

      asegurarEspacio(requiredHeight);

      pdf.text(lines, marginX, y);
      y += requiredHeight;
   };

   // Texto largo con salto automático
   const textoConSaltos = (contenido: string) => {
      if (!contenido.trim()) return;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(...COLOR_TEXTO);

      const lines = pdf.splitTextToSize(contenido, contentWidth);
      const lineHeight = 4.7;

      for (const line of lines) {
         asegurarEspacio(lineHeight + 2);

         pdf.setFont('helvetica', 'normal');
         pdf.setFontSize(10);
         pdf.setTextColor(...COLOR_TEXTO);
         pdf.text(line, marginX, y);

         y += lineHeight;
      }

      y += 2;
   };

   // Encabezado
   pdf.setFont('helvetica', 'bold');
   pdf.setFontSize(18);
   pdf.setTextColor(...COLOR_MORADO);
   pdf.text('Tu MenoTest', marginX, y);

   y += 10;

   pdf.setFont('helvetica', 'bold');
   pdf.setFontSize(16);
   pdf.setTextColor(23, 23, 23);
   pdf.text(`Hola, ${data.nombre}`, marginX, y);

   y += 7;

   texto(
      'Este es un resumen de los síntomas y hábitos que reportaste, junto con recomendaciones orientativas de nuestro equipo de especialistas.',
      {
         color: COLOR_SECUNDARIO,
         size: 9,
         espacio: 7
      }
   );

   linea();

   // Resumen
   tituloSeccion('Resumen');

   texto(`Etapa orientativa: ${data.etapa}`, {
      bold: true,
      espacio: 3
   });

   texto(`Edad: ${data.edad > 0 ? `${data.edad} años` : '—'}`, {
      espacio: 3
   });

   texto(`IMC: ${data.imc || '—'}`, {
      espacio: 7
   });

   // Etapa
   tituloSeccion('Sobre tu etapa');

   texto(data.tituloEtapa, {
      bold: true,
      size: 12,
      espacio: 7
   });

   for (const parrafo of data.contenidoEtapa) {
      textoConSaltos(parrafo);
   }

   y += 2;

   texto(
      'La etapa mostrada es orientativa y se calcula con las respuestas del cuestionario. No sustituye una valoración médica.',
      {
         color: COLOR_SECUNDARIO,
         size: 8,
         espacio: 8
      }
   );

   linea();

   // Síntomas
   tituloSeccion('Síntomas principales');

   if (data.sintomas.length > 0) {
      for (const sintoma of data.sintomas) {
         asegurarEspacio(22);

         texto(sintoma.nombre, {
            bold: true,
            espacio: 2
         });

         texto(sintoma.descripcion, {
            color: COLOR_SECUNDARIO,
            size: 9,
            espacio: 2
         });

         const intensidad =
            sintoma.intensidad === 1
               ? 'Poco'
               : sintoma.intensidad === 2
                  ? 'Bastante'
                  : sintoma.intensidad >= 3
                     ? 'Mucho'
                     : 'Nada';

         texto(`Intensidad: ${intensidad}`, {
            color: COLOR_MORADO,
            size: 8,
            espacio: 6
         });
      }
   } else {
      texto('No reportaste síntomas relevantes.', {
         color: COLOR_SECUNDARIO,
         espacio: 7
      });
   }

   linea();

   // Recomendaciones
   tituloSeccion('Recomendaciones para ti');

   texto(
      'Estas recomendaciones se seleccionan según los síntomas y hábitos que reportaste.',
      {
         color: COLOR_SECUNDARIO,
         size: 9,
         espacio: 8
      }
   );

   if (data.recomendaciones.length > 0) {
      for (const recomendacion of data.recomendaciones) {
         asegurarEspacio(30);

         texto(recomendacion.especialista, {
            bold: true,
            size: 11,
            espacio: 2
         });

         texto(recomendacion.especialidad, {
            color: COLOR_MORADO,
            size: 9,
            espacio: 5
         });

         textoConSaltos(recomendacion.texto);

         if (recomendacion.habitos && recomendacion.habitos.length > 0) {
            texto(`Hábitos relacionados: ${recomendacion.habitos.join(', ')}`, {
               color: COLOR_SECUNDARIO,
               size: 8,
               espacio: 3
            });
         }

         if (recomendacion.sintoma) {
            texto(`Relacionado con: ${recomendacion.sintoma}`, {
               color: COLOR_SECUNDARIO,
               size: 8,
               espacio: 7
            });
         }

         y += 2;
      }
   } else {
      texto(
         'No encontramos recomendaciones específicas para esta combinación de síntomas y hábitos.',
         {
            color: COLOR_SECUNDARIO,
            espacio: 7
         }
      );
   }

   // Orientación Organon
   if (
      data.referencias &&
      (
         data.referencias.medicinaGeneral ||
         data.referencias.ginecologia ||
         data.referencias.psicologia
      )
   ) {
      linea();

      tituloSeccion('Orientación de atención');

      if (data.referencias.medicinaGeneral) {
         texto('Medicina general', {
            bold: true,
            espacio: 4
         });
      }

      if (data.referencias.ginecologia) {
         texto('Ginecología', {
            bold: true,
            espacio: 4
         });
      }

      if (data.referencias.psicologia) {
         texto('Psicología', {
            bold: true,
            espacio: 4
         });
      }

      y += 3;
   }

   // Aviso final
   asegurarEspacio(30);

   linea();

   texto(
      'Las recomendaciones son orientativas y buscan ayudarte a identificar áreas de bienestar que podrías revisar. No constituyen diagnóstico ni sustituyen una consulta con un profesional de salud.',
      {
         color: COLOR_SECUNDARIO,
         size: 8,
         espacio: 0
      }
   );

   agregarNumerosPagina(pdf);

   return pdf;
}

// Numeración
function agregarNumerosPagina(pdf: JsPDFType) {
   const totalPages = pdf.getNumberOfPages();

   for (let page = 1; page <= totalPages; page++) {
      pdf.setPage(page);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      pdf.text(`${page} / ${totalPages}`, pdf.internal.pageSize.getWidth() - 20, 289, { align: 'right' });
   }
}

// Nombre seguro
export function nombreArchivoReporteUsuario(texto: string): string {
   return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
}