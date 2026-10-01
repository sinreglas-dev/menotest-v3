// src/app/api/admin/evaluaciones/exportar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { obtenerSesionActual } from '@/shared/auth/sesionAdmin';
import { obtenerPool } from '@/shared/infrastructure/db/mysql';

const AES_KEY = process.env.AES_KEY as string;

export async function GET(peticion: NextRequest) {
  const sesion = await obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const programa = peticion.nextUrl.searchParams.get('programa');
  const pool = obtenerPool();

  const condicion = programa ? 'AND p.clave = ?' : '';
  const parametros = programa ? [AES_KEY, AES_KEY, AES_KEY, AES_KEY, programa] : [AES_KEY, AES_KEY, AES_KEY, AES_KEY];

  const [filas] = await pool.execute(
    `SELECT
       e.id, p.nombre AS programa,
       CONVERT(AES_DECRYPT(e.nombre, ?) USING utf8mb4) AS nombre,
       CONVERT(AES_DECRYPT(e.apellido_paterno, ?) USING utf8mb4) AS apellido_paterno,
       CONVERT(AES_DECRYPT(e.apellido_materno, ?) USING utf8mb4) AS apellido_materno,
       CONVERT(AES_DECRYPT(e.correo, ?) USING utf8mb4) AS correo,
       e.etapa, e.puntaje_total, e.imc, e.imc_clasificacion, e.creado_en
     FROM evaluaciones e
     INNER JOIN programas p ON p.id = e.programa_id
     WHERE e.estado = 'completado' ${condicion}
     ORDER BY e.creado_en DESC`,
    parametros
  );

  const encabezados = ['ID', 'Programa', 'Nombre', 'Apellido Paterno', 'Apellido Materno', 'Correo', 'Etapa', 'Puntaje', 'IMC', 'Clasificación IMC', 'Fecha'];
  const lineas = [encabezados.join(',')];

  for (const fila of filas as Array<Record<string, unknown>>) {
    lineas.push(
      [fila.id, fila.programa, fila.nombre, fila.apellido_paterno, fila.apellido_materno ?? '', fila.correo, fila.etapa, fila.puntaje_total, fila.imc, fila.imc_clasificacion, fila.creado_en]
        .map((valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
  }

  const csv = '\uFEFF' + lineas.join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="evaluaciones_menotest.csv"',
    },
  });
}