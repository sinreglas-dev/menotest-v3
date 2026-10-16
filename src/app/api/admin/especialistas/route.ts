import { NextResponse } from 'next/server';
import { obtenerSesionActual } from '@/shared/auth/sesionAdmin';
import { listarEspecialistasActivos } from '@/shared/data/repositorioEspecialistas';

export async function GET() {
   const sesion = await obtenerSesionActual();
   if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

   const datos = await listarEspecialistasActivos();
   return NextResponse.json({ datos });
}