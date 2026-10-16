import { randomBytes } from 'crypto';
import { obtenerPool } from '@/shared/infrastructure/db/mysql';

const AES_KEY = process.env.AES_KEY as string;

export interface HistoriaClinicaDatos {
   enfermedades: string[];
   otrasEnfermedades: string;
   medicamentos: string;
   alergias: string;
   cirugias: string;
   antecedentesFamiliares: string;
   observaciones: string;
}

export async function obtenerDatosPorToken(token: string) {
   const pool = obtenerPool();
   const [filas] = await pool.execute(
      `SELECT
         e.id AS evaluacion_id,
         CONVERT(AES_DECRYPT(e.nombre, ?) USING utf8mb4)           AS paciente_nombre,
         CONVERT(AES_DECRYPT(e.apellido_paterno, ?) USING utf8mb4) AS paciente_apellido,
         esp.nombre       AS especialista_nombre,
         esp.especialidad AS especialista_especialidad,
         hc.completada
       FROM evaluaciones e
       LEFT JOIN especialistas esp ON esp.id = e.especialista_id
       LEFT JOIN historias_clinicas hc ON hc.evaluacion_id = e.id
       WHERE e.historia_token = ?
         AND (e.historia_token_expira IS NULL OR e.historia_token_expira > NOW())
       LIMIT 1`,
      [AES_KEY, AES_KEY, token]
   );
   return (filas as any[])[0] ?? null;
}

export async function guardarHistoria(evaluacionId: number, datos: HistoriaClinicaDatos) {
   const pool = obtenerPool();
   await pool.execute(
      `INSERT INTO historias_clinicas
         (evaluacion_id, enfermedades, otras_enfermedades, medicamentos,
          alergias, cirugias, antecedentes_familiares, observaciones, completada)
       VALUES (?, CAST(? AS JSON), ?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         enfermedades           = VALUES(enfermedades),
         otras_enfermedades     = VALUES(otras_enfermedades),
         medicamentos           = VALUES(medicamentos),
         alergias               = VALUES(alergias),
         cirugias               = VALUES(cirugias),
         antecedentes_familiares = VALUES(antecedentes_familiares),
         observaciones          = VALUES(observaciones),
         completada             = 1`,
      [
         evaluacionId,
         JSON.stringify(datos.enfermedades ?? []),
         datos.otrasEnfermedades ?? null,
         datos.medicamentos ?? null,
         datos.alergias ?? null,
         datos.cirugias ?? null,
         datos.antecedentesFamiliares ?? null,
         datos.observaciones ?? null,
      ]
   );
}

export async function generarTokenHistoria(evaluacionId: number): Promise<string> {
   const pool = obtenerPool();
   const token = randomBytes(32).toString('hex');

   await pool.execute(
      `UPDATE evaluaciones
       SET historia_token = ?,
           historia_token_expira = DATE_ADD(NOW(), INTERVAL 30 DAY)
       WHERE id = ?`,
      [token, evaluacionId]
   );

   return token;
}

export async function obtenerHistoriaPorEvaluacion(evaluacionId: number) {
   const pool = obtenerPool();
   const [filas] = await pool.execute(
      `SELECT enfermedades, otras_enfermedades, medicamentos,
              alergias, cirugias, antecedentes_familiares,
              observaciones, completada
       FROM historias_clinicas
       WHERE evaluacion_id = ?
       LIMIT 1`,
      [evaluacionId]
   );
   return (filas as any[])[0] ?? null;
}