// src/app/api/admin/estadisticas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { obtenerSesionActual } from '@/shared/auth/sesionAdmin';
import { obtenerEstadisticas } from '@/shared/data/repositorioReportes';

export async function GET(peticion: NextRequest) {
  const sesion = await obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const programa = peticion.nextUrl.searchParams.get('programa') ?? undefined;
  const estadisticas = await obtenerEstadisticas(programa);
  return NextResponse.json(estadisticas);
}