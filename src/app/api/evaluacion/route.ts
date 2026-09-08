import { NextRequest, NextResponse } from 'next/server';
import { guardarEvaluacion } from '@/shared/data/repositorioEvaluacion';
import type { MenoTestProgram } from '@/shared/config/program';
import { registrarContactoMenotest } from '@/shared/integrations/mailchimp';

const PROGRAMAS_VALIDOS: MenoTestProgram[] = ['general', 'iztapalapa', 'reina_madre', 'femsa'];

export async function POST(peticion: NextRequest) {
  try {
    const cuerpo = await peticion.json();
    const { programa, paciente, valorMenstruacion, respuestas, respuestasHabitos, puntajeTotal, etapa, imc, imcClasificacion } = cuerpo;

    if (!PROGRAMAS_VALIDOS.includes(programa)) {
      return NextResponse.json({ error: 'Programa inválido' }, { status: 400 });
    }
    if (!paciente?.email || !paciente?.name || !paciente?.paternalLastName) {
      return NextResponse.json({ error: 'Faltan datos de la paciente' }, { status: 400 });
    }
    if (!Array.isArray(respuestas) || respuestas.length === 0) {
      return NextResponse.json({ error: 'Faltan respuestas del test' }, { status: 400 });
    }

    const resultado = await guardarEvaluacion({
      programa,
      paciente,
      valorMenstruacion,
      respuestas,
      respuestasHabitos: Array.isArray(respuestasHabitos) ? respuestasHabitos : [],
      puntajeTotal: Number(puntajeTotal),
      etapa: String(etapa),
      imc: Number(imc),
      imcClasificacion: String(imcClasificacion),
    });

    // Sincronización con Mailchimp — best-effort, no bloquea la respuesta al usuario
    const NOMBRES_PROGRAMA: Record<string, string> = {
      general: 'Sin Reglas',
      iztapalapa: 'Organon',
      reina_madre: 'Reina Madre',
      femsa: 'FEMSA',
    };

    registrarContactoMenotest({
      correo: paciente.email,
      nombre: paciente.name,
      apellidoPaterno: paciente.paternalLastName,
      telefono: paciente.phone,
      etiqueta: `Menotest - ${NOMBRES_PROGRAMA[program] ?? program}`,
    }).catch((error) => console.error('[evaluacion] Error en Mailchimp:', error));


    return NextResponse.json({ ok: true, evaluacionId: resultado.evaluacionId });
  } catch (error) {
    console.error('[POST /api/evaluacion]', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}