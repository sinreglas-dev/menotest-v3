import { NextResponse } from 'next/server';
import { obtenerPool } from '@/shared/infrastructure/db/mysql';

export async function GET() {
  try {
    const pool = obtenerPool();
    const [filas] = await pool.query('SELECT 1 AS ok');

    if (!filas) {
      throw new Error('Consulta sin respuesta');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[GET /api/salud] Error de conexión a la base de datos:', error);
    return NextResponse.json(
      { ok: false, error: 'No se pudo conectar a la base de datos' },
      { status: 503 }
    );
  }
}