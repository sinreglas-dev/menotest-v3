import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { obtenerPool } from '@/shared/infrastructure/db/mysql';
import { crearSesion } from '@/shared/auth/sesionAdmin';

export async function POST(peticion: NextRequest) {
  const { correo, password } = await peticion.json();

  if (!correo || !password) {
    return NextResponse.json({ error: 'Correo y contraseña requeridos' }, { status: 400 });
  }

  const pool = obtenerPool();
  const [filas] = await pool.execute(
    `SELECT id, nombre, password_hash FROM administradores WHERE correo = ? LIMIT 1`,
    [correo]
  );
  const admin = (filas as Array<{ id: number; nombre: string; password_hash: string }>)[0];

  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
  }

  await crearSesion(admin.id);
  return NextResponse.json({ ok: true, nombre: admin.nombre });
}