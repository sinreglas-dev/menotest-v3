import { obtenerPool } from '@/shared/infrastructure/db/mysql';
import testData from '@/data/menotest.json';
import type { TestData, Answer, HabitAnswer } from '@/types/menotest';
import { evaluateClinicalReferral } from '@/shared/data/clinicalReferral';
import { getRecommendations } from '@/shared/data/recommendations';

const menoTestData = testData as TestData;

const AES_KEY = process.env.AES_KEY as string;

export interface FiltrosReporte {
  programa?: string;
  etapa?: string;
  desde?: string;
  hasta?: string;
  busqueda?: string;
  pagina?: number;
  porPagina?: number;
}

export interface FilaEvaluacion {
  id: number;
  programa: string;
  programa_clave: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  correo: string;
  etapa: string;
  puntaje_total: number;
  imc: number;
  imc_clasificacion: string;
  creado_en: string;
}

export async function listarEvaluaciones(filtros: FiltrosReporte) {
  const pool = obtenerPool();
  const pagina = filtros.pagina && filtros.pagina > 0 ? filtros.pagina : 1;
  const porPagina = filtros.porPagina && filtros.porPagina > 0 ? filtros.porPagina : 25;
  const offset = (pagina - 1) * porPagina;

  const condiciones: string[] = ["e.estado = 'completado'"];
  const parametros: any[] = [];

  if (filtros.programa) {
    condiciones.push('p.clave = ?');
    parametros.push(filtros.programa);
  }
  if (filtros.etapa) {
    condiciones.push('e.etapa = ?');
    parametros.push(filtros.etapa);
  }
  if (filtros.desde) {
    condiciones.push('e.creado_en >= ?');
    parametros.push(`${filtros.desde} 00:00:00`);
  }
  if (filtros.hasta) {
    condiciones.push('e.creado_en <= ?');
    parametros.push(`${filtros.hasta} 23:59:59`);
  }

  let clausulaBusqueda = '';
  const parametrosBusqueda: any[] = [];
  if (filtros.busqueda) {
    clausulaBusqueda = `AND (
      CONCAT_WS(' ',
        CONVERT(AES_DECRYPT(e.nombre, ?) USING utf8mb4),
        CONVERT(AES_DECRYPT(e.apellido_paterno, ?) USING utf8mb4),
        CONVERT(AES_DECRYPT(e.apellido_materno, ?) USING utf8mb4)
      ) LIKE ?
      OR CONVERT(AES_DECRYPT(e.correo, ?) USING utf8mb4) LIKE ?
    )`;
    const like = `%${filtros.busqueda}%`;
    parametrosBusqueda.push(AES_KEY, AES_KEY, AES_KEY, like, AES_KEY, like);
  }

  const whereClause = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  const sql = `
    SELECT
      e.id,
      p.clave  AS programa_clave,
      p.nombre AS programa,
      CONVERT(AES_DECRYPT(e.nombre, ?) USING utf8mb4) AS nombre,
      CONVERT(AES_DECRYPT(e.apellido_paterno, ?) USING utf8mb4) AS apellido_paterno,
      CONVERT(AES_DECRYPT(e.apellido_materno, ?) USING utf8mb4) AS apellido_materno,
      CONVERT(AES_DECRYPT(e.correo, ?) USING utf8mb4) AS correo,
      e.etapa, e.puntaje_total, e.imc, e.imc_clasificacion, e.creado_en
    FROM evaluaciones e
    INNER JOIN programas p ON p.id = e.programa_id
    ${whereClause}
    ${clausulaBusqueda}
    ORDER BY e.creado_en DESC
    LIMIT ? OFFSET ?
  `;

  const [filas] = await pool.execute(sql, [
    AES_KEY, AES_KEY, AES_KEY, AES_KEY,
    ...parametros,
    ...parametrosBusqueda,
    porPagina, offset,
  ]);

  const [conteoFilas] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM evaluaciones e
     INNER JOIN programas p ON p.id = e.programa_id
     ${whereClause}
     ${clausulaBusqueda ? clausulaBusqueda.replace(/e\.nombre|e\.apellido_paterno|e\.apellido_materno|e\.correo/g, (m) => m) : ''}`,
    filtros.busqueda
      ? [...parametros, AES_KEY, AES_KEY, AES_KEY, `%${filtros.busqueda}%`, AES_KEY, `%${filtros.busqueda}%`]
      : parametros
  );

  const total = (conteoFilas as Array<{ total: number }>)[0]?.total ?? 0;

  return {
    datos: filas as FilaEvaluacion[],
    total,
    pagina,
    porPagina,
    totalPaginas: Math.max(1, Math.ceil(total / porPagina)),
  };
}

export async function obtenerDetalleEvaluacionCompleto(id: number) {
  const pool = obtenerPool();

  const [filasEvaluacion] = await pool.execute(
    `SELECT
       e.id, p.clave  AS programa_clave, p.nombre AS programa,
       CONVERT(AES_DECRYPT(e.nombre, ?) USING utf8mb4) AS nombre,
       CONVERT(AES_DECRYPT(e.apellido_paterno, ?) USING utf8mb4) AS apellido_paterno,
       CONVERT(AES_DECRYPT(e.apellido_materno, ?) USING utf8mb4) AS apellido_materno,
       CONVERT(AES_DECRYPT(e.correo, ?) USING utf8mb4) AS correo,
       CONVERT(AES_DECRYPT(e.telefono, ?) USING utf8mb4) AS telefono,
       CONVERT(AES_DECRYPT(e.fecha_nacimiento, ?) USING utf8mb4) AS fecha_nacimiento,
       e.estatura_cm, e.peso_kg, e.pais,
       e.valor_menstruacion, e.puntaje_total, e.etapa, e.imc, e.imc_clasificacion,
       e.creado_en, e.completado_en
     FROM evaluaciones e
     INNER JOIN programas p ON p.id = e.programa_id
     WHERE e.id = ?
     LIMIT 1`,
    [AES_KEY, AES_KEY, AES_KEY, AES_KEY, AES_KEY, AES_KEY, id]
  );

  const evaluacion = (filasEvaluacion as Array<Record<string, any>>)[0];
  if (!evaluacion) return null;

  const [filasRespuestas] = await pool.execute(
    `SELECT pregunta_id, categoria, opcion_id, valor
     FROM evaluacion_respuestas
     WHERE evaluacion_id = ?
     ORDER BY pregunta_id ASC`,
    [id]
  );

  const [filasHabitos] = await pool.execute(
    `SELECT habito_id, categoria, opcion_id, valor
     FROM evaluacion_habitos
     WHERE evaluacion_id = ?
     ORDER BY id ASC`,
    [id]
  );

  // Reconstruir Answer[] y HabitAnswer[] tal como los produce el quiz,
  // para poder reutilizar exactamente las mismas funciones de cálculo
  // (evaluateClinicalReferral, getRecommendations) que usa el frontend.
  const respuestasDb = filasRespuestas as Array<{ pregunta_id: number; categoria: string; opcion_id: string; valor: number }>;
  const habitosDb = filasHabitos as Array<{ habito_id: string; categoria: string; opcion_id: string; valor: number }>;

  const answers: Answer[] = respuestasDb.map((r) => {
    const pregunta = menoTestData.questions.find((q) => q.id === r.pregunta_id);
    return {
      questionId: r.pregunta_id,
      key: pregunta?.key ?? '',
      category: r.categoria,
      optionId: r.opcion_id,
      value: r.valor,
    };
  });

  const habitAnswers: HabitAnswer[] = habitosDb.map((h) => ({
    habitId: h.habito_id,
    category: h.categoria,
    optionId: h.opcion_id,
    value: h.valor,
  }));

  // Síntomas reportados — solo los que tuvieron intensidad mayor a "Nada"
  const symptoms = respuestasDb
    .filter((r) => r.valor > 0)
    .map((r) => {
      const pregunta = menoTestData.questions.find((q) => q.id === r.pregunta_id);
      const opcion = menoTestData.mainOptions.find((o) => o.id === r.opcion_id);
      return {
        name: pregunta?.question ?? '',
        category: r.categoria,
        intensity: opcion?.label ?? '',
        value: r.valor,
      };
    });

  // Hábitos — todos, con nivel bajo/medio/alto según el valor
  const habits = habitosDb.map((h) => {
    const preguntaHabito = menoTestData.habits.find((hb) => hb.id === h.habito_id);
    const opcion = preguntaHabito?.options.find((o) => o.id === h.opcion_id);
    return {
      name: preguntaHabito?.question ?? '',
      answer: opcion?.label ?? '',
      level: h.valor >= 2 ? 'high' : h.valor === 1 ? 'medium' : 'low',
    };
  });

  // Canalización clínica — solo aplica a Organon
  const isOrganon = evaluacion.programa === 'Organon';
  const clinicalReferral = isOrganon
    ? evaluateClinicalReferral(answers, Number(evaluacion.puntaje_total))
    : null;

  // Recomendaciones por especialista
  const recommendationsRaw = getRecommendations(answers, habitAnswers);
  const recommendations = recommendationsRaw.map((rec) => ({
    specialist: rec.specialty,
    text: rec.text,
  }));

  return {
    id: evaluacion.id,
    patient: {
      name: evaluacion.nombre,
      paternalLastName: evaluacion.apellido_paterno,
      maternalLastName: evaluacion.apellido_materno ?? '',
      email: evaluacion.correo,
      phone: evaluacion.telefono,
      birthDate: evaluacion.fecha_nacimiento,
      age: calcularEdad(evaluacion.fecha_nacimiento),
      country: evaluacion.pais,
      height: evaluacion.estatura_cm,
      weight: evaluacion.peso_kg,
    },
    stage: evaluacion.etapa,
    score: evaluacion.puntaje_total,
    imc: String(evaluacion.imc),
    status: 'Completo',
    date: new Date(evaluacion.creado_en).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
    }),
    program: evaluacion.programa,
    menstruation: evaluacion.valor_menstruacion,
    referrals: {
      medicine: {
        active: clinicalReferral?.generalMedicine.requiresAttention ?? false,
        priority: clinicalReferral?.generalMedicine.priority ?? false,
      },
      gynecology: {
        active: clinicalReferral?.gynecology.requiresAttention ?? false,
        priority: false,
      },
      psychology: {
        active: clinicalReferral?.psychology.requiresAttention ?? false,
        priority: false,
      },
    },
    symptoms,
    habits,
    recommendations,
  };
}

function calcularEdad(fechaNacimiento: string): number {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

export async function obtenerEstadisticas(programa?: string) {
  const pool = obtenerPool();
  const condicion = programa ? 'AND p.clave = ?' : '';
  const parametros = programa ? [programa] : [];

  const [porEtapa] = await pool.execute(
    `SELECT e.etapa, COUNT(*) AS total
     FROM evaluaciones e
     INNER JOIN programas p ON p.id = e.programa_id
     WHERE e.estado = 'completado' ${condicion}
     GROUP BY e.etapa`,
    parametros
  );

  const [porPrograma] = await pool.execute(
    `SELECT p.nombre AS programa, COUNT(*) AS total
     FROM evaluaciones e
     INNER JOIN programas p ON p.id = e.programa_id
     WHERE e.estado = 'completado'
     GROUP BY p.nombre`
  );

  const [resumen] = await pool.execute(
    `SELECT
       COUNT(*) AS total_evaluaciones,
       AVG(e.puntaje_total) AS promedio_puntaje,
       AVG(e.imc) AS promedio_imc
     FROM evaluaciones e
     INNER JOIN programas p ON p.id = e.programa_id
     WHERE e.estado = 'completado' ${condicion}`,
    parametros
  );

  const resumenData = (resumen as Array<Record<string, unknown>>)[0];

  return {
    porEtapa,
    porPrograma,
    resumen: resumenData
        ? {
            total_evaluaciones: Number(resumenData.total_evaluaciones ?? 0),
            promedio_puntaje: resumenData.promedio_puntaje != null
                ? Number(Number(resumenData.promedio_puntaje).toFixed(1))
                : 0,
            promedio_imc: resumenData.promedio_imc != null
                ? Number(Number(resumenData.promedio_imc).toFixed(1))
                : 0,
          }
        : null,
  };
}

export async function obtenerKpis(programa?: string) {
  const pool = obtenerPool();
  const condicion = programa ? 'AND p.clave = ?' : '';
  const parametros = programa ? [programa] : [];

  const [fila] = await pool.execute(
    `SELECT
       COUNT(*) AS total,
       AVG(e.puntaje_total) AS promedio_puntaje
     FROM evaluaciones e
     INNER JOIN programas p ON p.id = e.programa_id
     WHERE e.estado = 'completado' ${condicion}`,
    parametros
  );

  const datos = (fila as Array<{ total: number; promedio_puntaje: number | null }>)[0];

  return {
    total: datos?.total ?? 0,
    promedioPuntaje: datos?.promedio_puntaje != null
   ? Number(Number(datos.promedio_puntaje).toFixed(1))
   : 0,
  };
}