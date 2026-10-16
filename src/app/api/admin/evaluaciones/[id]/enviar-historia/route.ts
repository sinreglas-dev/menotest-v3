import { NextRequest, NextResponse } from 'next/server';
import { obtenerSesionActual } from '@/shared/auth/sesionAdmin';
import { obtenerEspecialistaPorId } from '@/shared/data/repositorioEspecialistas';
import { generarTokenHistoria } from '@/shared/data/repositorioHistoriaClinica';
import { enviarHistoriaClinicaPorCorreo } from '@/shared/integrations/correoHistoriaClinica';
import { obtenerPool } from '@/shared/infrastructure/db/mysql';

const AES_KEY = process.env.AES_KEY as string;

export async function POST(
   _peticion: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   const sesion = await obtenerSesionActual();
   if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

   const { id } = await params;
   const evaluacionId = Number(id);
   if (!Number.isInteger(evaluacionId) || evaluacionId <= 0) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
   }

   const pool = obtenerPool();

   const [filas] = await pool.execute(
      `SELECT
         e.especialista_id,
         e.historia_token,
         CONVERT(AES_DECRYPT(e.nombre, ?) USING utf8mb4) AS nombre,
         CONVERT(AES_DECRYPT(e.apellido_paterno, ?) USING utf8mb4) AS apellido_paterno,
         CONVERT(AES_DECRYPT(e.correo, ?) USING utf8mb4) AS correo
       FROM evaluaciones e
       WHERE e.id = ? LIMIT 1`,
      [AES_KEY, AES_KEY, AES_KEY, evaluacionId]
   );

   const fila = (filas as any[])[0];
   if (!fila) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
   if (!fila.especialista_id) {
      return NextResponse.json({ error: 'Asigna una especialista primero' }, { status: 400 });
   }

   // Regenerar token siempre (por si expiró)
   const nuevoToken = await generarTokenHistoria(evaluacionId);

   const especialista = await obtenerEspecialistaPorId(fila.especialista_id);
   if (!especialista) {
      return NextResponse.json({ error: 'Especialista no encontrada' }, { status: 404 });
   }

   const enviado = await enviarHistoriaClinicaPorCorreo({
      correo: fila.correo,
      nombre: fila.nombre,
      apellidoPaterno: fila.apellido_paterno,
      token: nuevoToken,
      especialistaNombre: especialista.nombre,
      especialistaEspecialidad: especialista.especialidad,
   });

   return NextResponse.json({ ok: enviado, historiaToken: nuevoToken });
}