import { NextRequest, NextResponse } from 'next/server';
import { obtenerSesionActual } from '@/shared/auth/sesionAdmin';
import { asignarEspecialista, obtenerEspecialistaPorId } from '@/shared/data/repositorioEspecialistas';
import { generarTokenHistoria, obtenerDatosPorToken } from '@/shared/data/repositorioHistoriaClinica';
import { enviarHistoriaClinicaPorCorreo } from '@/shared/integrations/correoHistoriaClinica';
import { obtenerPool } from '@/shared/infrastructure/db/mysql';

const AES_KEY = process.env.AES_KEY as string;

export async function PATCH(
   peticion: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   const sesion = await obtenerSesionActual();
   if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

   const { id } = await params;
   const evaluacionId = Number(id);
   if (!Number.isInteger(evaluacionId) || evaluacionId <= 0) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
   }

   const { especialistaId, enviarCorreo } = await peticion.json();
   const espId = especialistaId === null ? null : Number(especialistaId);
   if (espId !== null && (!Number.isInteger(espId) || espId <= 0)) {
      return NextResponse.json({ error: 'Especialista inválido' }, { status: 400 });
   }

   const pool = obtenerPool();

   // Ver estado previo para saber si cambia de null → especialista
   const [previo] = await pool.execute(
      `SELECT especialista_id, historia_token FROM evaluaciones WHERE id = ? LIMIT 1`,
      [evaluacionId]
   );
   const filaPrevia = (previo as Array<{ especialista_id: number | null; historia_token: string | null }>)[0];
   if (!filaPrevia) {
      return NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 });
   }

   const eraNuevaAsignacion = filaPrevia.especialista_id === null && espId !== null;

   // Asignar
   await asignarEspecialista(evaluacionId, espId);

   // Generar token de historia si es nueva asignación o si no existe
   let historiaToken = filaPrevia.historia_token;
   if (espId && !historiaToken) {
      historiaToken = await generarTokenHistoria(evaluacionId);
   }

   // Enviar correo automáticamente en nueva asignación
   let correoEnviado = false;
   let correoError: string | null = null;

   if (eraNuevaAsignacion && espId && historiaToken && enviarCorreo !== false) {
      try {
         // Obtener datos de la paciente
         const [filasPaciente] = await pool.execute(
            `SELECT
               CONVERT(AES_DECRYPT(e.nombre, ?) USING utf8mb4) AS nombre,
               CONVERT(AES_DECRYPT(e.apellido_paterno, ?) USING utf8mb4) AS apellido_paterno,
               CONVERT(AES_DECRYPT(e.correo, ?) USING utf8mb4) AS correo
             FROM evaluaciones e WHERE e.id = ? LIMIT 1`,
            [AES_KEY, AES_KEY, AES_KEY, evaluacionId]
         );
         const paciente = (filasPaciente as Array<{ nombre: string; apellido_paterno: string; correo: string }>)[0];

         // Obtener datos de la especialista
         const especialista = await obtenerEspecialistaPorId(espId);

         if (paciente && especialista) {
            correoEnviado = await enviarHistoriaClinicaPorCorreo({
               correo: paciente.correo,
               nombre: paciente.nombre,
               apellidoPaterno: paciente.apellido_paterno,
               token: historiaToken,
               especialistaNombre: especialista.nombre,
               especialistaEspecialidad: especialista.especialidad,
            });

            if (!correoEnviado) correoError = 'Mandrill rechazó el envío';
         } else {
            correoError = 'Datos incompletos de paciente o especialista';
         }
      } catch (error: any) {
         correoError = error?.message ?? 'Error desconocido';
         console.error('[especialista] Error al enviar correo:', error);
      }
   }

   return NextResponse.json({
      ok: true,
      historiaToken,
      correoEnviado,
      correoError,
   });
}