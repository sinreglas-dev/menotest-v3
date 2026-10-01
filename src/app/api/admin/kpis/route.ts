import { NextRequest, NextResponse } from 'next/server';
import { obtenerSesionActual } from '@/shared/auth/sesionAdmin';
import { obtenerKpis } from '@/shared/data/repositorioReportes';

export async function GET(peticion: NextRequest) {
  const sesion = await obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const programa = peticion.nextUrl.searchParams.get('programa') ?? undefined;
  const kpis = await obtenerKpis(programa);
  return NextResponse.json(kpis);
}