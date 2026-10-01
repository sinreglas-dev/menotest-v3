// src/app/api/admin/evaluaciones/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { obtenerSesionActual } from '@/shared/auth/sesionAdmin';
import { obtenerDetalleEvaluacionCompleto } from '@/shared/data/repositorioReportes';

export async function GET(
  peticion: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sesion = await obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const detalle = await obtenerDetalleEvaluacionCompleto(Number(id));

  if (!detalle) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(detalle);
}