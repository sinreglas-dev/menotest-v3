import { NextResponse } from 'next/server';
import { obtenerSesionEspecialista } from '@/shared/auth/sesionEspecialista';
import { listarEvaluacionesDeEspecialista } from '@/shared/data/repositorioEspecialistas';

export async function GET() {
   try {
      const sesion = await obtenerSesionEspecialista();
      if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

      const datos = await listarEvaluacionesDeEspecialista(sesion.id);

      return NextResponse.json({
         datos,
         especialista: {
            id: sesion.id,
            nombre: sesion.nombre,
            especialidad: sesion.especialidad,
         },
      });
   } catch (error: any) {
      console.error('[GET /api/especialista/evaluaciones]', error);
      return NextResponse.json({ error: 'Error interno' }, { status: 500 });
   }
}