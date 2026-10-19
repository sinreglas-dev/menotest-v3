import ExcelJS from 'exceljs';

export interface EvaluacionExcel {
   id: number;
   programa?: string;
   nombre: string;
   apellido_paterno: string;
   apellido_materno: string | null;
   correo: string;
   etapa: string | null;
   puntaje_total: number | null;
   imc: number | null;
   creado_en: string;
   especialista_nombre?: string | null;
}

export async function exportarEvaluacionesExcel(
   datos: EvaluacionExcel[],
   nombreArchivo = 'evaluaciones-menotest'
): Promise<void> {
   const workbook = new ExcelJS.Workbook();
   const hoja = workbook.addWorksheet('Evaluaciones');

   hoja.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Paciente', key: 'paciente', width: 35 },
      { header: 'Correo electrónico', key: 'correo', width: 38 },
      { header: 'Etapa', key: 'etapa', width: 22 },
      { header: 'Puntaje', key: 'puntaje', width: 12 },
      { header: 'IMC', key: 'imc', width: 12 },
      { header: 'Fecha', key: 'fecha', width: 18 },
      { header: 'Campaña', key: 'campaña', width: 24 },
      { header: 'Especialista', key: 'especialista', width: 32 },
   ];

   hoja.getRow(1).font = { bold: true };

   datos.forEach(item => {
      hoja.addRow({
         id: item.id,
         paciente: `${item.nombre} ${item.apellido_paterno} ${item.apellido_materno ?? ''}`.trim(),
         correo: item.correo,
         etapa: item.etapa ?? 'En evaluación',
         puntaje: item.puntaje_total ?? '',
         imc: item.imc ?? '',
         fecha: new Date(item.creado_en).toLocaleDateString('es-MX'),
         campaña: item.programa ?? '',
         especialista: item.especialista_nombre ?? 'Sin asignar',
      });
   });

   const buffer = await workbook.xlsx.writeBuffer();
   const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
   });

   const url = URL.createObjectURL(blob);
   const link = document.createElement('a');
   link.href = url;
   link.download = `${nombreArchivo}.xlsx`;
   link.click();
   URL.revokeObjectURL(url);
}