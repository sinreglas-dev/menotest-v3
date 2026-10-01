// src/app/api/admin/evaluaciones/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { obtenerSesionActual } from '@/shared/auth/sesionAdmin';
import { listarEvaluaciones } from '@/shared/data/repositorioReportes';

export async function GET(peticion: NextRequest) {
  const sesion = await obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const parametros = peticion.nextUrl.searchParams;
  const resultado = await listarEvaluaciones({
    programa: parametros.get('programa') ?? undefined,
    etapa: parametros.get('etapa') ?? undefined,
    desde: parametros.get('desde') ?? undefined,
    hasta: parametros.get('hasta') ?? undefined,
    busqueda: parametros.get('q') ?? undefined,
    pagina: Number(parametros.get('pagina') ?? 1),
    porPagina: Number(parametros.get('porPagina') ?? 25),
  });

  return NextResponse.json(resultado);
}