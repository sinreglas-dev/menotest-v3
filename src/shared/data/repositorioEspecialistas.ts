import { obtenerPool } from '@/shared/infrastructure/db/mysql';

const AES_KEY = process.env.AES_KEY as string;

export interface Especialista {
   id: number;
   nombre: string;
   especialidad: string;
   correo: string;
   telefono: string | null;
}

export async function verificarCredencialesEspecialista(correo: string) {
   const pool = obtenerPool();
   const [filas] = await pool.execute(
      `SELECT id, nombre, especialidad, correo, telefono, password_hash
       FROM especialistas
       WHERE correo = ? AND activo = 1
       LIMIT 1`,
      [correo]
   );
   return (filas as Array<Especialista & { password_hash: string }>)[0] ?? null;
}

export async function obtenerEspecialistaPorId(id: number): Promise<Especialista | null> {
   const pool = obtenerPool();
   const [filas] = await pool.execute(
      `SELECT id, nombre, especialidad, correo, telefono
       FROM especialistas
       WHERE id = ? AND activo = 1
       LIMIT 1`,
      [id]
   );
   return (filas as Especialista[])[0] ?? null;
}

export async function listarEspecialistasActivos(): Promise<Especialista[]> {
   const pool = obtenerPool();
   const [filas] = await pool.execute(
      `SELECT id, nombre, especialidad, correo, telefono
       FROM especialistas
       WHERE activo = 1
       ORDER BY nombre ASC`
   );
   return filas as Especialista[];
}

export async function listarEvaluacionesDeEspecialista(especialistaId: number) {
   const pool = obtenerPool();
   const [filas] = await pool.execute(
      `SELECT
         e.id,
         p.nombre AS programa,
         CONVERT(AES_DECRYPT(e.nombre, ?) USING utf8mb4)           AS nombre,
         CONVERT(AES_DECRYPT(e.apellido_paterno, ?) USING utf8mb4) AS apellido_paterno,
         CONVERT(AES_DECRYPT(e.apellido_materno, ?) USING utf8mb4) AS apellido_materno,
         CONVERT(AES_DECRYPT(e.correo, ?) USING utf8mb4)           AS correo,
         e.etapa,
         e.puntaje_total,
         e.imc,
         e.creado_en,
         COALESCE(hc.completada, 0) AS historia_completada
       FROM evaluaciones e
       INNER JOIN programas p ON p.id = e.programa_id
       LEFT JOIN historias_clinicas hc ON hc.evaluacion_id = e.id
       WHERE e.especialista_id = ? AND e.estado = 'completado'
       ORDER BY e.creado_en DESC`,
      [AES_KEY, AES_KEY, AES_KEY, AES_KEY, especialistaId]
   );
   return filas;
}

export async function asignarEspecialista(evaluacionId: number, especialistaId: number | null) {
   const pool = obtenerPool();
   await pool.execute(
      `UPDATE evaluaciones SET especialista_id = ? WHERE id = ?`,
      [especialistaId, evaluacionId]
   );
}