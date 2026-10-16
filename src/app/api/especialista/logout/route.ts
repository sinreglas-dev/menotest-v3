import { NextResponse } from 'next/server';
import { cerrarSesionEspecialista } from '@/shared/auth/sesionEspecialista';

export async function POST() {
   await cerrarSesionEspecialista();
   return NextResponse.json({ ok: true });
}