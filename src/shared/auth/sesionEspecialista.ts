import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { obtenerPool } from '@/shared/infrastructure/db/mysql';

const NOMBRE_COOKIE = 'menotest_especialista_sesion';
const DURACION_SESION_HORAS = 12;

export interface EspecialistaSesion {
  id: number;
  correo: string;
  nombre: string;
  especialidad: string;
}

export async function crearSesionEspecialista(especialistaId: number): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const pool = obtenerPool();

  await pool.execute(
    `INSERT INTO especialista_sesiones (token, especialista_id, expira_en)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))`,
    [token, especialistaId, DURACION_SESION_HORAS]
  );

  const store = await cookies();
  store.set(NOMBRE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: DURACION_SESION_HORAS * 3600,
    path: '/',
  });

  return token;
}

export async function obtenerSesionEspecialista(): Promise<EspecialistaSesion | null> {
  const store = await cookies();
  const token = store.get(NOMBRE_COOKIE)?.value;
  if (!token) return null;

  const pool = obtenerPool();
  const [filas] = await pool.execute(
    `SELECT e.id, e.correo, e.nombre, e.especialidad
     FROM especialista_sesiones s
     INNER JOIN especialistas e ON e.id = s.especialista_id
     WHERE s.token = ? AND s.expira_en > NOW() AND e.activo = 1
     LIMIT 1`,
    [token]
  );

  const fila = (filas as EspecialistaSesion[])[0];
  return fila ?? null;
}

export async function cerrarSesionEspecialista(): Promise<void> {
  const store = await cookies();
  const token = store.get(NOMBRE_COOKIE)?.value;

  if (token) {
    const pool = obtenerPool();
    await pool.execute(`DELETE FROM especialista_sesiones WHERE token = ?`, [token]);
  }

  store.delete(NOMBRE_COOKIE);
}