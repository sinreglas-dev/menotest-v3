import { obtenerPool } from '@/shared/infrastructure/db/mysql';
import testData from '@/data/menotest.json';
import type { TestData, Answer, HabitAnswer } from '@/types/menotest';
import { evaluateClinicalReferral } from '@/shared/data/clinicalReferral';
import { getRecommendations } from '@/shared/data/recommendations';
import { obtenerHistoriaPorEvaluacion } from '@/shared/data/repositorioHistoriaClinica';

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
  especialista_id: number | null;
  especialista_nombre: string | null;
}

// ==================== LISTAR EVALUACIONES ====================

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
      e.etapa, e.puntaje_total, e.imc, e.imc_clasificacion, e.creado_en,
      e.especialista_id,
      esp.nombre AS especialista_nombre
    FROM evaluaciones e
    INNER JOIN programas p ON p.id = e.programa_id
    LEFT JOIN especialistas esp ON esp.id = e.especialista_id
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

// ==================== DETALLE COMPLETO ====================

export async function obtenerDetalleEvaluacionCompleto(id: number) {
  const pool = obtenerPool();

  const [filasEvaluacion] = await pool.execute(
    `SELECT
       e.id, p.clave AS programa_clave, p.nombre AS programa,
       CONVERT(AES_DECRYPT(e.nombre, ?) USING utf8mb4) AS nombre,
       CONVERT(AES_DECRYPT(e.apellido_paterno, ?) USING utf8mb4) AS apellido_paterno,
       CONVERT(AES_DECRYPT(e.apellido_materno, ?) USING utf8mb4) AS apellido_materno,
       CONVERT(AES_DECRYPT(e.correo, ?) USING utf8mb4) AS correo,
       CONVERT(AES_DECRYPT(e.telefono, ?) USING utf8mb4) AS telefono,
       CONVERT(AES_DECRYPT(e.fecha_nacimiento, ?) USING utf8mb4) AS fecha_nacimiento,
       e.estatura_cm, e.peso_kg, e.pais,
       e.valor_menstruacion, e.puntaje_total, e.etapa, e.imc, e.imc_clasificacion,
       e.creado_en, e.completado_en,
       e.especialista_id,
       esp.nombre       AS especialista_nombre,
       esp.especialidad AS especialista_especialidad,
       esp.correo       AS especialista_correo,
       esp.telefono     AS especialista_telefono
     FROM evaluaciones e
     INNER JOIN programas p ON p.id = e.programa_id
     LEFT JOIN especialistas esp ON esp.id = e.especialista_id
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

  const habits = habitosDb.map((h) => {
    const preguntaHabito = menoTestData.habits.find((hb) => hb.id === h.habito_id);
    const opcion = preguntaHabito?.options.find((o) => o.id === h.opcion_id);
    return {
      name: preguntaHabito?.question ?? '',
      answer: opcion?.label ?? '',
      level: h.valor >= 2 ? 'high' : h.valor === 1 ? 'medium' : 'low',
    };
  });

  const isOrganon = evaluacion.programa === 'Organon';
  const clinicalReferral = isOrganon
    ? evaluateClinicalReferral(answers, Number(evaluacion.puntaje_total))
    : null;

  const recommendationsRaw = getRecommendations(answers, habitAnswers);
  const recommendations = recommendationsRaw.map((rec) => ({
    specialist: rec.specialty,
    text: rec.text,
  }));

  // Historia clínica
  const historiaRow = await obtenerHistoriaPorEvaluacion(id);

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

    // Especialista asignada
    especialista_id: evaluacion.especialista_id ?? null,
    especialista_nombre: evaluacion.especialista_nombre ?? null,
    especialista: evaluacion.especialista_id
      ? {
          id: evaluacion.especialista_id,
          nombre: evaluacion.especialista_nombre,
          especialidad: evaluacion.especialista_especialidad,
          correo: evaluacion.especialista_correo,
          telefono: evaluacion.especialista_telefono,
        }
      : null,

    // Historia clínica
    historia_clinica: historiaRow
      ? {
          completada: Boolean(historiaRow.completada),
          enfermedades: parseJSON(historiaRow.enfermedades) ?? [],
          otrasEnfermedades: historiaRow.otras_enfermedades,
          medicamentos: historiaRow.medicamentos,
          alergias: historiaRow.alergias,
          cirugias: historiaRow.cirugias,
          antecedentesFamiliares: historiaRow.antecedentes_familiares,
          observaciones: historiaRow.observaciones,
        }
      : null,
  };
}

// ==================== HELPERS ====================

function parseJSON(valor: any): string[] | null {
  if (!valor) return null;
  if (Array.isArray(valor)) return valor;
  try {
    const parsed = JSON.parse(valor);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function calcularEdad(fechaNacimiento: string): number {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

// ==================== ESTADÍSTICAS ====================

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

// ==================== KPIs ====================

export async function obtenerKpis(programa?: string) {
  const pool = obtenerPool();
  const condicion = programa ? 'AND p.clave = ?' : '';
  const parametros = programa ? [programa] : [];

  // KPIs base: total + promedio
  const [filaBase] = await pool.execute(
    `SELECT
       COUNT(*) AS total,
       AVG(e.puntaje_total) AS promedio_puntaje
     FROM evaluaciones e
     INNER JOIN programas p ON p.id = e.programa_id
     WHERE e.estado = 'completado' ${condicion}`,
    parametros
  );
  const base = (filaBase as Array<{ total: number; promedio_puntaje: number | null }>)[0];

  // KPIs de especialistas: asignadas / sin asignar
  const [filaEsp] = await pool.execute(
    `SELECT
       SUM(CASE WHEN e.especialista_id IS NOT NULL THEN 1 ELSE 0 END) AS asignadas,
       SUM(CASE WHEN e.especialista_id IS NULL     THEN 1 ELSE 0 END) AS sinAsignar
     FROM evaluaciones e
     INNER JOIN programas p ON p.id = e.programa_id
     WHERE e.estado = 'completado' ${condicion}`,
    parametros
  );
  const esp = (filaEsp as Array<{ asignadas: number; sinAsignar: number }>)[0];

  // Etapa con mayor incidencia
  const [filaEtapa] = await pool.execute(
    `SELECT e.etapa, COUNT(*) AS total
     FROM evaluaciones e
     INNER JOIN programas p ON p.id = e.programa_id
     WHERE e.estado = 'completado' ${condicion}
     GROUP BY e.etapa
     ORDER BY total DESC
     LIMIT 1`,
    parametros
  );
  const etapa = (filaEtapa as Array<{ etapa: string; total: number }>)[0];

  return {
    total: Number(base?.total ?? 0),
    promedioPuntaje: base?.promedio_puntaje != null
      ? Number(Number(base.promedio_puntaje).toFixed(1))
      : 0,
    pacientesAsignadas: Number(esp?.asignadas ?? 0),
    pacientesSinAsignar: Number(esp?.sinAsignar ?? 0),
    etapaMayorIncidencia: etapa?.etapa ?? null,
    totalEtapaMayorIncidencia: Number(etapa?.total ?? 0),
  };
}