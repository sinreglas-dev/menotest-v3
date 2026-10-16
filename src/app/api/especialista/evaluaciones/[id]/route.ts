import { NextRequest, NextResponse } from 'next/server';
import { obtenerSesionEspecialista } from '@/shared/auth/sesionEspecialista';
import { obtenerDetalleEvaluacionCompleto } from '@/shared/data/repositorioReportes';

export async function GET(
   _peticion: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const sesion = await obtenerSesionEspecialista();
      if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

      const { id } = await params;
      const evaluacionId = Number(id);
      if (!Number.isInteger(evaluacionId) || evaluacionId <= 0) {
         return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
      }

      const detalle = await obtenerDetalleEvaluacionCompleto(evaluacionId);
      if (!detalle) {
         return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
      }

      // Validar que la evaluación esté asignada a esta especialista
      if (detalle.especialista_id !== sesion.id) {
         return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
      }

      return NextResponse.json(detalle);
   } catch (error: any) {
      console.error('[GET /api/especialista/evaluaciones/[id]]', error);
      return NextResponse.json(
         { error: error?.message ?? 'Error interno' },
         { status: 500 }
      );
   }
}