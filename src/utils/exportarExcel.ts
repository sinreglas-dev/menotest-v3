import * as XLSX from 'xlsx';

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

export function exportarEvaluacionesExcel(datos: EvaluacionExcel[], nombreArchivo = 'evaluaciones-menotest') {
   const registros = datos.map(item => ({
      'ID': item.id,
      'Paciente': `${item.nombre} ${item.apellido_paterno} ${item.apellido_materno ?? ''}`.trim(),
      'Correo electrónico': item.correo,
      'Etapa': item.etapa ?? 'En evaluación',
      'Puntaje': item.puntaje_total ?? '',
      'IMC': item.imc ?? '',
      'Fecha': new Date(item.creado_en).toLocaleDateString('es-MX'),
      'Campaña': item.programa ?? '',
      'Especialista': item.especialista_nombre ?? 'Sin asignar'
   }));

   const hoja = XLSX.utils.json_to_sheet(registros);

   hoja['!cols'] = [
      { wch: 10 },
      { wch: 35 },
      { wch: 38 },
      { wch: 22 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 24 },
      { wch: 32 }
   ];

   const libro = XLSX.utils.book_new();
   XLSX.utils.book_append_sheet(libro, hoja, 'Evaluaciones');

   XLSX.writeFile(libro, `${nombreArchivo}.xlsx`);
}