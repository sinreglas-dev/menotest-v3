import { NextRequest, NextResponse } from 'next/server';
import { obtenerSesionActual } from '@/shared/auth/sesionAdmin';
import { obtenerPool } from '@/shared/infrastructure/db/mysql';

const AES_KEY = process.env.AES_KEY as string;

// Mapeo de keys de síntomas a etiquetas legibles
const SINTOMAS_DESTACADOS: Array<{ key: string; label: string }> = [
   { key: 'bochorno', label: 'Bochornos' },
   { key: 'sudor', label: 'Sudoración nocturna' },
   { key: 'dormir', label: 'Problemas de sueño' },
   { key: 'irritabilidad', label: 'Cambios de humor' },
   { key: 'energia', label: 'Fatiga' },
   { key: 'ansiedad', label: 'Ansiedad' },
   { key: 'dolor_muscular', label: 'Dolor articular' },
   { key: 'concentracion', label: 'Falta de concentración' },
   { key: 'resequedad', label: 'Resequedad vaginal' },
   { key: 'sexo', label: 'Disminución de libido' },
];

const HABITOS_LABELS: Record<string, string> = {
   caffeine: 'Consumo de cafeína',
   alcohol: 'Consumo de alcohol',
   sleep: 'Sueño insuficiente',
   stress: 'Estrés frecuente',
   physical_activity: 'Actividad física baja',
   muscle_strength: 'Falta de fuerza muscular',
   sedentary: 'Tiempo sedentario',
   hydration: 'Hidratación insuficiente',
   fruit_vegetables: 'Baja ingesta de frutas y verduras',
   nutrition: 'Alimentación irregular',
   screens_posture: 'Pantallas antes de dormir',
   tobacco: 'Consumo de tabaco',
};

export async function GET(peticion: NextRequest) {
   try {
      const sesion = await obtenerSesionActual();
      if (!sesion) {
         return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }

      const programa = peticion.nextUrl.searchParams.get('programa');
      const pool = obtenerPool();

      const filtroPrograma = programa ? 'AND p.clave = ?' : '';
      const paramsPrograma: any[] = programa ? [programa] : [];

      // ==========================================================
      // Ejecutar todas las queries en paralelo
      // ==========================================================
      const [
         [totalFila],
         [puntajePromedioFila],
         [etapas],
         [puntuacionEtapa],
         [registrosMes],
         [paises],
         [imc],
         [habitos],
         [respuestasSintomas],
         [puntuaciones],
         [fechasNacimiento],
         [paisPrincipalFila],
      ] = await Promise.all([
         // Total
         pool.execute(
            `SELECT COUNT(*) AS total
             FROM evaluaciones e
             INNER JOIN programas p ON p.id = e.programa_id
             WHERE e.estado = 'completado' ${filtroPrograma}`,
            paramsPrograma
         ),

         // Puntaje promedio
         pool.execute(
            `SELECT AVG(e.puntaje_total) AS promedio
             FROM evaluaciones e
             INNER JOIN programas p ON p.id = e.programa_id
             WHERE e.estado = 'completado' AND e.puntaje_total IS NOT NULL ${filtroPrograma}`,
            paramsPrograma
         ),

         // Etapas
         pool.execute(
            `SELECT e.etapa AS name, COUNT(*) AS value
             FROM evaluaciones e
             INNER JOIN programas p ON p.id = e.programa_id
             WHERE e.estado = 'completado' AND e.etapa IS NOT NULL ${filtroPrograma}
             GROUP BY e.etapa`,
            paramsPrograma
         ),

         // Puntuación promedio por etapa
         pool.execute(
            `SELECT e.etapa, AVG(e.puntaje_total) AS promedio
             FROM evaluaciones e
             INNER JOIN programas p ON p.id = e.programa_id
             WHERE e.estado = 'completado' AND e.etapa IS NOT NULL AND e.puntaje_total IS NOT NULL ${filtroPrograma}
             GROUP BY e.etapa`,
            paramsPrograma
         ),

         // Registros por mes (últimos 12 meses con actividad)
         pool.execute(
            `SELECT
               DATE_FORMAT(e.creado_en, '%Y-%m') AS periodo,
               COUNT(*) AS registros
             FROM evaluaciones e
             INNER JOIN programas p ON p.id = e.programa_id
             WHERE e.estado = 'completado' ${filtroPrograma}
             GROUP BY periodo
             ORDER BY periodo ASC`,
            paramsPrograma
         ),

         // Top 10 países
         pool.execute(
            `SELECT e.pais, COUNT(*) AS total
             FROM evaluaciones e
             INNER JOIN programas p ON p.id = e.programa_id
             WHERE e.estado = 'completado' AND e.pais IS NOT NULL AND e.pais != '' ${filtroPrograma}
             GROUP BY e.pais
             ORDER BY total DESC
             LIMIT 10`,
            paramsPrograma
         ),

         // IMC
         pool.execute(
            `SELECT e.imc_clasificacion AS categoria, COUNT(*) AS total
             FROM evaluaciones e
             INNER JOIN programas p ON p.id = e.programa_id
             WHERE e.estado = 'completado' AND e.imc_clasificacion IS NOT NULL AND e.imc_clasificacion != '' ${filtroPrograma}
             GROUP BY e.imc_clasificacion`,
            paramsPrograma
         ),

         // Hábitos más frecuentes (valor >= 2 = moderado o relevante)
         pool.execute(
            `SELECT eh.habito_id, COUNT(*) AS total
             FROM evaluacion_habitos eh
             INNER JOIN evaluaciones e ON e.id = eh.evaluacion_id
             INNER JOIN programas p ON p.id = e.programa_id
             WHERE e.estado = 'completado' AND eh.valor >= 2 ${filtroPrograma}
             GROUP BY eh.habito_id
             ORDER BY total DESC
             LIMIT 6`,
            paramsPrograma
         ),

         // Síntomas: conteo por severidad
         pool.execute(
            `SELECT
               er.pregunta_clave,
               SUM(CASE WHEN er.valor = 0 THEN 1 ELSE 0 END) AS nada,
               SUM(CASE WHEN er.valor = 1 THEN 1 ELSE 0 END) AS poco,
               SUM(CASE WHEN er.valor = 2 THEN 1 ELSE 0 END) AS bastante,
               SUM(CASE WHEN er.valor = 3 THEN 1 ELSE 0 END) AS mucho
             FROM evaluacion_respuestas er
             INNER JOIN evaluaciones e ON e.id = er.evaluacion_id
             INNER JOIN programas p ON p.id = e.programa_id
             WHERE e.estado = 'completado' ${filtroPrograma}
               AND er.pregunta_clave IN (${SINTOMAS_DESTACADOS.map(() => '?').join(',')})
             GROUP BY er.pregunta_clave`,
            [...paramsPrograma, ...SINTOMAS_DESTACADOS.map(s => s.key)]
         ),

         // Distribución de puntuaciones
         pool.execute(
            `SELECT e.puntaje_total
             FROM evaluaciones e
             INNER JOIN programas p ON p.id = e.programa_id
             WHERE e.estado = 'completado' AND e.puntaje_total IS NOT NULL ${filtroPrograma}`,
            paramsPrograma
         ),

         // Fechas de nacimiento para calcular edades
         pool.execute(
            `SELECT CONVERT(AES_DECRYPT(e.fecha_nacimiento, ?) USING utf8mb4) AS fecha_nac
             FROM evaluaciones e
             INNER JOIN programas p ON p.id = e.programa_id
             WHERE e.estado = 'completado' AND e.fecha_nacimiento IS NOT NULL ${filtroPrograma}`,
            [AES_KEY, ...paramsPrograma]
         ),

         // País principal
         pool.execute(
            `SELECT e.pais, COUNT(*) AS total
             FROM evaluaciones e
             INNER JOIN programas p ON p.id = e.programa_id
             WHERE e.estado = 'completado' AND e.pais IS NOT NULL AND e.pais != '' ${filtroPrograma}
             GROUP BY e.pais
             ORDER BY total DESC
             LIMIT 1`,
            paramsPrograma
         ),
      ]);

      // ==========================================================
      // Procesar resultados
      // ==========================================================
      const total = Number((totalFila as any[])[0]?.total ?? 0);
      const puntajePromedio = (puntajePromedioFila as any[])[0]?.promedio
         ? Number(Number((puntajePromedioFila as any[])[0].promedio).toFixed(1))
         : 0;
      const paisPrincipal = (paisPrincipalFila as any[])[0]?.pais ?? 'Sin datos';

      // Síntomas: ordenar según el orden de SINTOMAS_DESTACADOS
      const sintomasMap = new Map<string, any>();
      (respuestasSintomas as any[]).forEach(row => {
         sintomasMap.set(row.pregunta_clave, row);
      });

      const sintomas = SINTOMAS_DESTACADOS.map(({ key, label }) => {
         const row = sintomasMap.get(key);
         return {
            sintoma: label,
            nada: Number(row?.nada ?? 0),
            poco: Number(row?.poco ?? 0),
            bastante: Number(row?.bastante ?? 0),
            mucho: Number(row?.mucho ?? 0),
         };
      });

      // Edad: calcular en JS
      const hoy = new Date();
      const calcularEdad = (fechaStr: string): number | null => {
         if (!fechaStr) return null;
         const nacimiento = new Date(fechaStr);
         if (isNaN(nacimiento.getTime())) return null;
         let edad = hoy.getFullYear() - nacimiento.getFullYear();
         const m = hoy.getMonth() - nacimiento.getMonth();
         if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
         return edad;
      };

      const edades = (fechasNacimiento as any[])
         .map(row => calcularEdad(row.fecha_nac))
         .filter((e): e is number => e !== null && e > 0 && e < 120);

      const edadPromedio = edades.length > 0
         ? Number((edades.reduce((a, b) => a + b, 0) / edades.length).toFixed(0))
         : 0;

      // Distribución por rango de edad
      const RANGOS_EDAD = [
         { rango: 'Menos de 35', min: 0, max: 34 },
         { rango: '35-39', min: 35, max: 39 },
         { rango: '40-44', min: 40, max: 44 },
         { rango: '45-49', min: 45, max: 49 },
         { rango: '50-54', min: 50, max: 54 },
         { rango: '55-59', min: 55, max: 59 },
         { rango: '60+', min: 60, max: 200 },
      ];

      const edadesData = RANGOS_EDAD.map(({ rango, min, max }) => ({
         rango,
         total: edades.filter(e => e >= min && e <= max).length,
      }));

      // Distribución por rango de puntuación
      const puntuacionesValores = (puntuaciones as any[]).map(p => Number(p.puntaje_total));
      const RANGOS_PUNTAJE = [
         { rango: '0-10', min: 0, max: 10 },
         { rango: '11-20', min: 11, max: 20 },
         { rango: '21-30', min: 21, max: 30 },
         { rango: '31-40', min: 31, max: 40 },
         { rango: '41-50', min: 41, max: 50 },
         { rango: '51-60', min: 51, max: 60 },
         { rango: '61-75', min: 61, max: 75 },
      ];

      const puntuacionesData = RANGOS_PUNTAJE.map(({ rango, min, max }) => ({
         rango,
         total: puntuacionesValores.filter(v => v >= min && v <= max).length,
      }));

      // Registros por mes: formatear etiqueta
      const MESES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const registrosMesData = (registrosMes as any[]).map(row => {
         const [anio, mes] = String(row.periodo).split('-');
         const mesIndex = Number(mes) - 1;
         return {
            mes: `${MESES_ES[mesIndex] ?? mes} ${anio?.slice(2) ?? ''}`,
            registros: Number(row.registros),
         };
      });

      // Etapas: ordenar por un orden lógico
      const ORDEN_ETAPAS = ['Premenopausia', 'Perimenopausia', 'Menopausia', 'Postmenopausia'];
      const etapasData = [...(etapas as any[])]
         .map(row => ({ name: row.name, value: Number(row.value) }))
         .sort((a, b) => {
            const ia = ORDEN_ETAPAS.indexOf(a.name);
            const ib = ORDEN_ETAPAS.indexOf(b.name);
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
         });

      // Puntuación por etapa
      const puntuacionEtapaData = (puntuacionEtapa as any[])
         .map(row => ({
            etapa: row.etapa,
            promedio: Number(Number(row.promedio ?? 0).toFixed(1)),
         }))
         .sort((a, b) => {
            const ia = ORDEN_ETAPAS.indexOf(a.etapa);
            const ib = ORDEN_ETAPAS.indexOf(b.etapa);
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
         });

      // Países
      const paisesData = (paises as any[]).map(row => ({
         pais: row.pais,
         total: Number(row.total),
      }));

      // IMC
      const imcData = (imc as any[]).map(row => ({
         categoria: row.categoria,
         total: Number(row.total),
      }));

      // Hábitos
      const habitosData = (habitos as any[]).map(row => ({
         habito: HABITOS_LABELS[row.habito_id] ?? row.habito_id,
         total: Number(row.total),
      }));

      // KPIs
      const kpis = {
         totalParticipantes: total,
         edadPromedio,
         puntajePromedio,
         paisPrincipal,
         porcentajePaisPrincipal: total > 0 && paisesData[0]
            ? Number(((paisesData[0].total / total) * 100).toFixed(1))
            : 0,
      };

      return NextResponse.json({
         ok: true,
         kpis,
         sintomas,
         etapas: etapasData,
         puntuacionEtapa: puntuacionEtapaData,
         registrosMes: registrosMesData,
         paises: paisesData,
         edades: edadesData,
         puntuaciones: puntuacionesData,
         imc: imcData,
         habitos: habitosData,
      });
   } catch (error: any) {
      console.error('[GET /api/admin/analitica]', error);
      return NextResponse.json(
         { error: error?.message ?? 'Error interno' },
         { status: 500 }
      );
   }
}