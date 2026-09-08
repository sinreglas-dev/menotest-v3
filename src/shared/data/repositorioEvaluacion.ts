import { obtenerPool } from '@/shared/infrastructure/db/mysql';
import type { PatientData } from '@/components/menotest/PatientForm';
import type { Answer, HabitAnswer } from '@/types/menotest';
import type { MenoTestProgram } from '@/shared/config/program';

export interface DatosGuardarEvaluacion {
  programa: MenoTestProgram;
  paciente: PatientData;
  valorMenstruacion: string;
  respuestas: Answer[];
  respuestasHabitos: HabitAnswer[];
  puntajeTotal: number;
  etapa: string;
  imc: number;
  imcClasificacion: string;
}

export interface ResultadoGuardado {
  evaluacionId: number;
}

const AES_KEY = process.env.AES_KEY as string;

export async function guardarEvaluacion(
  datos: DatosGuardarEvaluacion
): Promise<ResultadoGuardado> {
  const pool = obtenerPool();
  const conexion = await pool.getConnection();

  try {
    await conexion.beginTransaction();

    // 1) Resolver el id del programa a partir de su clave
    const [filasPrograma] = await conexion.execute(
      `SELECT id FROM programas WHERE clave = ? AND activo = 1 LIMIT 1`,
      [datos.programa]
    );
    const programaRow = (filasPrograma as Array<{ id: number }>)[0];

    if (!programaRow) {
      throw new Error(`Programa no encontrado o inactivo: ${datos.programa}`);
    }

    const fechaNacimiento = `${datos.paciente.birthYear}-${datos.paciente.birthMonth}-${datos.paciente.birthDay}`;

    // 2) Insertar la evaluación (paciente + resultado), ya completada
    const [resultadoInsert] = await conexion.execute(
      `INSERT INTO evaluaciones
         (programa_id, estado,
          correo, nombre, apellido_paterno, apellido_materno, telefono,
          fecha_nacimiento, estatura_cm, peso_kg, pais, acepto_terminos,
          valor_menstruacion, puntaje_total, etapa, imc, imc_clasificacion,
          completado_en)
       VALUES
         (?, 'completado',
          AES_ENCRYPT(?, ?), AES_ENCRYPT(?, ?), AES_ENCRYPT(?, ?), AES_ENCRYPT(?, ?), AES_ENCRYPT(?, ?),
          AES_ENCRYPT(?, ?), ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          NOW())`,
      [
        programaRow.id,
        datos.paciente.email, AES_KEY,
        datos.paciente.name, AES_KEY,
        datos.paciente.paternalLastName, AES_KEY,
        datos.paciente.maternalLastName || '', AES_KEY,
        datos.paciente.phone, AES_KEY,
        fechaNacimiento, AES_KEY,
        Number(datos.paciente.height),
        Number(datos.paciente.weight),
        datos.paciente.country,
        datos.paciente.termsAccepted ? 1 : 0,
        datos.valorMenstruacion,
        datos.puntajeTotal,
        datos.etapa,
        datos.imc,
        datos.imcClasificacion,
      ]
    );

    const evaluacionId = (resultadoInsert as { insertId: number }).insertId;

    // 3) Insertar cada respuesta de síntoma — una fila por pregunta
    for (const respuesta of datos.respuestas) {
      await conexion.execute(
        `INSERT INTO evaluacion_respuestas
           (evaluacion_id, pregunta_id, pregunta_clave, categoria, opcion_id, valor)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          evaluacionId,
          respuesta.questionId,
          respuesta.key,
          respuesta.category,
          respuesta.optionId,
          respuesta.value,
        ]
      );
    }

    // 4) Insertar cada respuesta de hábitos
    for (const habito of datos.respuestasHabitos) {
      await conexion.execute(
        `INSERT INTO evaluacion_habitos
           (evaluacion_id, habito_id, categoria, opcion_id, valor)
         VALUES (?, ?, ?, ?, ?)`,
        [evaluacionId, habito.habitId, habito.category, habito.optionId, habito.value]
      );
    }

    await conexion.commit();
    return { evaluacionId };
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}