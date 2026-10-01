// src/app/api/admin/logout/route.ts
import { NextResponse } from 'next/server';
import { cerrarSesion } from '@/shared/auth/sesionAdmin';

export async function POST() {
  await cerrarSesion();
  return NextResponse.json({ ok: true });
}