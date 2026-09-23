import { NextRequest, NextResponse } from 'next/server';
import { enviarReportesPorCorreo } from '@/shared/integrations/mailerReportes';

export async function POST(peticion: NextRequest) {
  try {
    const { correo, nombre, reporteUsuarioPdf, reporteMedicoPdf } = await peticion.json();

    if (!correo || !reporteUsuarioPdf) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const enviado = await enviarReportesPorCorreo({
      correo,
      nombre: nombre ?? '',
      reporteUsuarioPdf,
      reporteMedicoPdf: reporteMedicoPdf ?? null,
    });

    return NextResponse.json({ ok: enviado }, { status: enviado ? 200 : 502 });
  } catch (error) {
    console.error('[POST /api/evaluacion/enviar-reportes]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}