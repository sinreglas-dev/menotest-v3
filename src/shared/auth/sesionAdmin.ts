import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { obtenerPool } from '@/shared/infrastructure/db/mysql';

const NOMBRE_COOKIE = 'menotest_admin_sesion';
const DURACION_SESION_HORAS = 12;

export interface AdministradorSesion {
  id: number;
  correo: string;
  nombre: string;
}

export async function crearSesion(administradorId: number): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const pool = obtenerPool();

  await pool.execute(
    `INSERT INTO administrador_sesiones (token, administrador_id, expira_en)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))`,
    [token, administradorId, DURACION_SESION_HORAS]
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

export async function obtenerSesionActual(): Promise<AdministradorSesion | null> {
  const store = await cookies();
  const token = store.get(NOMBRE_COOKIE)?.value;
  if (!token) return null;

  const pool = obtenerPool();
  const [filas] = await pool.execute(
    `SELECT a.id, a.correo, a.nombre
     FROM administrador_sesiones s
     INNER JOIN administradores a ON a.id = s.administrador_id
     WHERE s.token = ? AND s.expira_en > NOW()
     LIMIT 1`,
    [token]
  );

  const fila = (filas as AdministradorSesion[])[0];
  return fila ?? null;
}

export async function cerrarSesion(): Promise<void> {
  const store = await cookies();
  const token = store.get(NOMBRE_COOKIE)?.value;

  if (token) {
    const pool = obtenerPool();
    await pool.execute(`DELETE FROM administrador_sesiones WHERE token = ?`, [token]);
  }

  store.delete(NOMBRE_COOKIE);
}