import { NextRequest, NextResponse } from 'next/server';
import {
   obtenerDatosPorToken,
   guardarHistoria,
   obtenerHistoriaPorEvaluacion,
} from '@/shared/data/repositorioHistoriaClinica';
import { obtenerPool } from '@/shared/infrastructure/db/mysql';
import { enviarNotificacionHistoriaCompletada } from '@/shared/integrations/correoEspecialista';

const AES_KEY = process.env.AES_KEY as string;

export async function GET(peticion: NextRequest) {
   try {
      const token = peticion.nextUrl.searchParams.get('token');
      if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 400 });

      const datos = await obtenerDatosPorToken(token);
      if (!datos) {
         return NextResponse.json({ error: 'El enlace no es válido o ha expirado.' }, { status: 404 });
      }

      return NextResponse.json({
         paciente: {
            nombre: datos.paciente_nombre,
            apellido_paterno: datos.paciente_apellido,
         },
         especialista: datos.especialista_nombre
            ? {
                 nombre: datos.especialista_nombre,
                 especialidad: datos.especialista_especialidad,
              }
            : null,
         completada: Boolean(datos.completada),
      });
   } catch (error: any) {
      console.error('[GET /api/historia-clinica]', error);
      return NextResponse.json({ error: 'Error interno' }, { status: 500 });
   }
}

export async function POST(peticion: NextRequest) {
   try {
      const { token, respuestas } = await peticion.json();
      if (!token || !respuestas) {
         return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
      }

      // 1) Resolver la evaluación por token
      const datosToken = await obtenerDatosPorToken(token);
      if (!datosToken) {
         return NextResponse.json({ error: 'El enlace no es válido o ha expirado.' }, { status: 404 });
      }

      const evaluacionId = datosToken.evaluacion_id;

      // 2) Ver si ya estaba completada (para saber si es la primera vez)
      const historiaPrevia = await obtenerHistoriaPorEvaluacion(evaluacionId);
      const eraNueva = !historiaPrevia || !historiaPrevia.completada;

      // 3) Guardar la historia
      await guardarHistoria(evaluacionId, respuestas);

      // 4) Si es la primera vez, notificar al especialista asignado
      if (eraNueva) {
         notificarEspecialistaAsync(evaluacionId);
      }

      return NextResponse.json({ ok: true });
   } catch (error: any) {
      console.error('[POST /api/historia-clinica]', error);
      return NextResponse.json({ error: error?.message ?? 'Error interno' }, { status: 500 });
   }
}

/**
 * Envía la notificación al especialista en segundo plano.
 * No bloquea la respuesta al paciente ni propaga errores.
 */
async function notificarEspecialistaAsync(evaluacionId: number) {
   try {
      const pool = obtenerPool();

      // Trae todo lo necesario en un solo query
      const [filas] = await pool.execute(
         `SELECT
            e.id,
            e.etapa,
            e.puntaje_total,
            CONVERT(AES_DECRYPT(e.nombre, ?) USING utf8mb4) AS paciente_nombre,
            CONVERT(AES_DECRYPT(e.apellido_paterno, ?) USING utf8mb4) AS paciente_apellido,
            CONVERT(AES_DECRYPT(e.fecha_nacimiento, ?) USING utf8mb4) AS fecha_nacimiento,
            p.nombre AS programa,
            esp.correo AS especialista_correo,
            esp.nombre AS especialista_nombre,
            esp.especialidad AS especialista_especialidad,
            esp.activo AS especialista_activo
          FROM evaluaciones e
          INNER JOIN programas p ON p.id = e.programa_id
          INNER JOIN especialistas esp ON esp.id = e.especialista_id
          WHERE e.id = ?
          LIMIT 1`,
         [AES_KEY, AES_KEY, AES_KEY, evaluacionId]
      );

      const fila = (filas as any[])[0];
      if (!fila) return;
      if (!fila.especialista_activo) {
         console.warn('[historia-clinica] Especialista inactiva, no se notifica');
         return;
      }

      await enviarNotificacionHistoriaCompletada({
         correoEspecialista: fila.especialista_correo,
         nombreEspecialista: fila.especialista_nombre,
         especialidad: fila.especialista_especialidad,
         pacienteNombre: fila.paciente_nombre,
         pacienteApellido: fila.paciente_apellido,
         edad: calcularEdad(fila.fecha_nacimiento),
         etapa: fila.etapa ?? 'No determinada',
         puntaje: Number(fila.puntaje_total ?? 0),
         programa: fila.programa,
         evaluacionId,
      });
   } catch (error) {
      console.error('[historia-clinica] Error notificando a especialista:', error);
   }
}

function calcularEdad(fechaNacimiento: string): number {
   const nacimiento = new Date(fechaNacimiento);
   const hoy = new Date();
   let edad = hoy.getFullYear() - nacimiento.getFullYear();
   const m = hoy.getMonth() - nacimiento.getMonth();
   if (m === 0 && hoy.getDate() < nacimiento.getDate()) edad--;
   if (m < 0) edad--;
   return edad;
}