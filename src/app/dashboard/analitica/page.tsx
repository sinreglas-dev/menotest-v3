'use client';

import { useState } from 'react';
import {
   Activity,
   BarChart3,
   CalendarDays,
   ChartColumnIncreasing,
   Globe2,
   HeartPulse,
   Scale,
   SlidersHorizontal,
   Users,
} from 'lucide-react';

import {
   ResponsiveContainer,
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   Legend,
   PieChart,
   Pie,
   Cell,
   LineChart,
   Line,
   AreaChart,
   Area,
} from 'recharts';

// ==================== CONFIGURACIÓN ====================

const COLORS = {
   primary: '#6e0b6c',
   secondary: '#8d2a8a',
   purpleLight: '#c78cc5',
   blue: '#4478c7',
   cyan: '#56b4d3',
   green: '#48a98a',
   yellow: '#e8b44c',
   orange: '#ed8a52',
   red: '#dc6478',
   gray: '#d8dce3',
};

const PIE_COLORS = [
   COLORS.primary,
   COLORS.secondary,
   COLORS.blue,
   COLORS.cyan,
   COLORS.green,
   COLORS.yellow,
];

const POBLACION_TOTAL = 9494;

// ==================== DATOS DE DEMOSTRACIÓN ====================

// 1. Síntomas por severidad
const sintomasData = [
   { sintoma: 'Bochornos', nada: 1820, poco: 2420, bastante: 3120, mucho: 2134 },
   { sintoma: 'Sudoración nocturna', nada: 2340, poco: 2710, bastante: 2580, mucho: 1864 },
   { sintoma: 'Problemas de sueño', nada: 1120, poco: 2180, bastante: 3290, mucho: 2904 },
   { sintoma: 'Cambios de humor', nada: 1480, poco: 2640, bastante: 2980, mucho: 2394 },
   { sintoma: 'Fatiga', nada: 920, poco: 1930, bastante: 3460, mucho: 3184 },
   { sintoma: 'Ansiedad', nada: 2010, poco: 2780, bastante: 2670, mucho: 2034 },
   { sintoma: 'Dolor articular', nada: 2450, poco: 2690, bastante: 2480, mucho: 1874 },
   { sintoma: 'Falta de concentración', nada: 1650, poco: 2420, bastante: 2980, mucho: 2444 },
   { sintoma: 'Resequedad vaginal', nada: 3480, poco: 2490, bastante: 2080, mucho: 1444 },
   { sintoma: 'Disminución de libido', nada: 2860, poco: 2590, bastante: 2340, mucho: 1704 },
].map(item => ({
   ...item,
   reportaron: item.poco + item.bastante + item.mucho,
   porcentaje: Number((((item.poco + item.bastante + item.mucho) / POBLACION_TOTAL) * 100).toFixed(1)),
}));
const sintomasPorcentajeData = sintomasData.map(item => ({
   sintoma: item.sintoma,
   nada: Number(((item.nada / POBLACION_TOTAL) * 100).toFixed(1)),
   poco: Number(((item.poco / POBLACION_TOTAL) * 100).toFixed(1)),
   bastante: Number(((item.bastante / POBLACION_TOTAL) * 100).toFixed(1)),
   mucho: Number(((item.mucho / POBLACION_TOTAL) * 100).toFixed(1)),
}));

// 2. Resultados por etapa
const etapasData = [
   { name: 'Premenopausia', value: 1850 },
   { name: 'Perimenopausia', value: 3920 },
   { name: 'Menopausia', value: 2480 },
   { name: 'Postmenopausia', value: 1244 },
];

// 3. Puntuación promedio por etapa
const puntuacionEtapaData = [
   { etapa: 'Premenopausia', promedio: 18.5 },
   { etapa: 'Perimenopausia', promedio: 37.8 },
   { etapa: 'Menopausia', promedio: 46.2 },
   { etapa: 'Postmenopausia', promedio: 32.4 },
];

// 4. Registros por mes
const registrosMesData = [
   { mes: 'Ene', registros: 420 },
   { mes: 'Feb', registros: 510 },
   { mes: 'Mar', registros: 620 },
   { mes: 'Abr', registros: 690 },
   { mes: 'May', registros: 740 },
   { mes: 'Jun', registros: 810 },
   { mes: 'Jul', registros: 890 },
   { mes: 'Ago', registros: 950 },
   { mes: 'Sep', registros: 1020 },
   { mes: 'Oct', registros: 1110 },
   { mes: 'Nov', registros: 1280 },
   { mes: 'Dic', registros: 1454 },
];

// 5. Top países
const paisesData = [
   { pais: 'México', total: 6250 },
   { pais: 'Colombia', total: 950 },
   { pais: 'Argentina', total: 610 },
   { pais: 'Chile', total: 480 },
   { pais: 'Perú', total: 360 },
   { pais: 'España', total: 280 },
   { pais: 'Ecuador', total: 210 },
   { pais: 'Guatemala', total: 150 },
   { pais: 'Costa Rica', total: 110 },
   { pais: 'Estados Unidos', total: 94 },
];

// 6. Distribución por edad
const edadData = [
   { rango: 'Menos de 35', total: 420 },
   { rango: '35-39', total: 910 },
   { rango: '40-44', total: 1720 },
   { rango: '45-49', total: 2680 },
   { rango: '50-54', total: 2240 },
   { rango: '55-59', total: 1050 },
   { rango: '60+', total: 474 },
];

// 7. Distribución por puntuación
const puntuacionData = [
   { rango: '0-10', total: 720 },
   { rango: '11-20', total: 1280 },
   { rango: '21-30', total: 1860 },
   { rango: '31-40', total: 2490 },
   { rango: '41-50', total: 1710 },
   { rango: '51-60', total: 980 },
   { rango: '61-75', total: 454 },
];

// 8. Distribución por IMC
const imcData = [
   { categoria: 'Bajo peso', total: 380 },
   { categoria: 'Normal', total: 3420 },
   { categoria: 'Sobrepeso', total: 3860 },
   { categoria: 'Obesidad', total: 1834 },
];

// 9. Hábitos más frecuentes
const habitosData = [
   { habito: 'Actividad física baja', total: 5820 },
   { habito: 'Sueño insuficiente', total: 5310 },
   { habito: 'Estrés frecuente', total: 4890 },
   { habito: 'Consumo de alcohol', total: 3480 },
   { habito: 'Consumo de tabaco', total: 2180 },
   { habito: 'Alimentación irregular', total: 4720 },
];

// ==================== COMPONENTES ====================

function ChartCard({
   title,
   description,
   icon: Icon,
   children,
   className = '',
}: {
   title: string;
   description: string;
   icon: typeof Activity;
   children: React.ReactNode;
   className?: string;
}) {
   return (
      <section className={`min-w-0 overflow-hidden rounded-2xl border border-[#eee7ee] bg-white shadow-sm ${className}`}>
         <div className="border-b border-[#f0eaf0] p-5 sm:p-6">
            <div className="flex items-start gap-3">
               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5eaf5] text-[#6e0b6c]">
                  <Icon size={20} />
               </div>

               <div>
                  <h2 className="text-sm font-bold text-[#171717] sm:text-base">{title}</h2>
                  <p className="mt-1 text-xs leading-5 text-[#9ca3af]">{description}</p>
               </div>
            </div>
         </div>

         <div className="p-4 sm:p-6">
            {children}
         </div>
      </section>
   );
}

interface TooltipPayload {
   name?: string;
   value?: number | string;
   color?: string;
   dataKey?: string | number;
   payload?: Record<string, unknown>;
}

interface CustomTooltipProps {
   active?: boolean;
   payload?: TooltipPayload[];
   label?: string | number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
   if (!active || !payload?.length) return null;

   return (
      <div className="rounded-xl border border-[#eee7ee] bg-white px-4 py-3 shadow-lg">
         {label !== undefined && (
            <p className="mb-2 text-xs font-bold text-[#171717]">{label}</p>
         )}

         {payload.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-5 text-xs">
               <span className="text-[#6b7280]">{item.name}</span>
               <span className="font-bold text-[#171717]">
                  {typeof item.value === 'number'
                     ? item.value.toLocaleString('es-MX')
                     : item.value ?? '—'}
               </span>
            </div>
         ))}
      </div>
   );
}

// ==================== PÁGINA ====================

export default function AnaliticaPage() {
   const [tipoGraficaSintomas, setTipoGraficaSintomas] = useState<'conteo' | 'porcentaje'>('conteo');
   const datosGraficaSintomas = tipoGraficaSintomas === 'conteo'
      ? sintomasData
      : sintomasPorcentajeData;

   const totalRegistros = etapasData.reduce((total, etapa) => total + etapa.value, 0);

   return (
      <div className="space-y-6">

         {/* Encabezado */}
         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
               <h1 className="text-2xl font-bold tracking-tight text-[#171717] sm:text-3xl">Analítica MenoTest</h1>
               <p className="mt-2 text-sm text-[#6b7280]">Visualización de resultados, síntomas, hábitos y características de las participantes.</p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#eadfea] bg-white px-4 py-3 text-sm font-semibold text-[#6e0b6c]">
               <Users size={17} />
               {totalRegistros.toLocaleString('es-MX')} participantes
            </div>
         </div>

         {/* Aviso demo */}
         <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <SlidersHorizontal size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-xs leading-5 text-amber-800">
               MIKE SON DATOS FAKE CUANDO ESTEN CHIDOS BORRA ESTE DISCLAIMER
            </p>
         </div>

         <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

            {/* 1. Síntomas por severidad */}
            <ChartCard
               title="Síntomas más reportados por severidad"
               description="Conteo de participantes según la intensidad de cada síntoma. Escala: Nada (0), Poco (1), Bastante (2), Mucho (3)."
               icon={HeartPulse}
               className="xl:col-span-2"
            >
               <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-[#9ca3af]">Población de referencia: {POBLACION_TOTAL.toLocaleString('es-MX')} mujeres</p>

                  <div className="inline-flex w-fit rounded-xl bg-[#f5eaf5] p-1">
                     <button type="button" onClick={() => setTipoGraficaSintomas('conteo')} className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${tipoGraficaSintomas === 'conteo' ? 'bg-[#6e0b6c] text-white' : 'text-[#6e0b6c]'}`}>Conteo</button>
                     <button type="button" onClick={() => setTipoGraficaSintomas('porcentaje')} className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${tipoGraficaSintomas === 'porcentaje' ? 'bg-[#6e0b6c] text-white' : 'text-[#6e0b6c]'}`}>Porcentaje</button>
                  </div>
               </div>

               <div className="h-[440px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart
                        data={datosGraficaSintomas}
                        margin={{ top: 10, right: 20, left: 0, bottom: 65 }}
                     >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0eaf0" />

                        <XAxis
                           dataKey="sintoma"
                           angle={-35}
                           textAnchor="end"
                           height={95}
                           interval={0}
                           tick={{ fontSize: 11, fill: '#6b7280' }}
                        />

                        <YAxis
                           domain={tipoGraficaSintomas === 'porcentaje' ? [0, 100] : [0, 'auto']}
                           tickFormatter={value => tipoGraficaSintomas === 'porcentaje' ? `${value}%` : Number(value).toLocaleString('es-MX')}
                           tick={{ fontSize: 11, fill: '#9ca3af' }}
                        />

                        <Tooltip
                           formatter={(value, name) => [
                              tipoGraficaSintomas === 'porcentaje'
                                 ? `${Number(value ?? 0).toFixed(1)}%`
                                 : Number(value ?? 0).toLocaleString('es-MX'),
                              String(name),
                           ]}
                           contentStyle={{ borderRadius: 12, border: '1px solid #eee7ee' }}
                        />

                        <Legend verticalAlign="top" height={40} wrapperStyle={{ fontSize: 12 }} />

                        <Bar dataKey="nada" name="Nada (0)" stackId="severidad" fill={COLORS.gray} />
                        <Bar dataKey="poco" name="Poco (1)" stackId="severidad" fill={COLORS.yellow} />
                        <Bar dataKey="bastante" name="Bastante (2)" stackId="severidad" fill={COLORS.secondary} />
                        <Bar dataKey="mucho" name="Mucho (3)" stackId="severidad" fill={COLORS.primary} radius={[5, 5, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>

               {/* Tabla complementaria */}
               <div className="mt-5 overflow-x-auto rounded-xl border border-[#f0eaf0]">
                  <table className="w-full min-w-[600px] text-left">
                     <thead className="bg-[#fcfbfc]">
                        <tr>
                           <th className="px-4 py-3 text-xs font-bold text-[#6b7280]">Síntoma</th>
                           <th className="px-4 py-3 text-right text-xs font-bold text-[#6b7280]">Mujeres que lo reportan</th>
                           <th className="px-4 py-3 text-right text-xs font-bold text-[#6b7280]">% de participantes</th>
                        </tr>
                     </thead>

                     <tbody>
                        {sintomasData.map(item => (
                           <tr key={item.sintoma} className="border-t border-[#f0eaf0]">
                              <td className="px-4 py-3 text-xs font-semibold text-[#374151]">{item.sintoma}</td>
                              <td className="px-4 py-3 text-right text-xs text-[#6b7280]">{item.reportaron.toLocaleString('es-MX')}</td>
                              <td className="px-4 py-3 text-right text-xs font-bold text-[#6e0b6c]">{item.porcentaje}%</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </ChartCard>

            {/* 2. Resultados por etapa */}
            <ChartCard title="Resultados por etapa" description="Distribución de participantes según su etapa orientativa." icon={Activity}>
               <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie data={etapasData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={105} innerRadius={60} paddingAngle={3}>
                           {etapasData.map((_, index) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12 }} />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
            </ChartCard>

            {/* 3. Puntuación promedio por etapa */}
            <ChartCard title="Puntuación promedio por etapa" description="Promedio de puntuación MenoTest por etapa. Máximo: 75 puntos." icon={BarChart3}>
               <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={puntuacionEtapaData} margin={{ top: 20, right: 10, left: -15, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0eaf0" />
                        <XAxis dataKey="etapa" tick={{ fontSize: 11, fill: '#6b7280' }} angle={-15} textAnchor="end" height={55} />
                        <YAxis domain={[0, 75]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="promedio" name="Puntaje promedio" fill={COLORS.primary} radius={[6, 6, 0, 0]} maxBarSize={65} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </ChartCard>

            {/* 4. Registros por mes */}
            <ChartCard title="Registros por mes" description="Evolución mensual de evaluaciones registradas." icon={CalendarDays}>
               <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={registrosMesData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
                        <defs>
                           <linearGradient id="registrosGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.25} />
                              <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.02} />
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0eaf0" />
                        <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6b7280' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="registros" name="Registros" stroke={COLORS.primary} strokeWidth={3} fill="url(#registrosGradient)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </ChartCard>

            {/* 5. Top 10 países */}
            <ChartCard title="Top 10 países" description="Países con mayor número de participantes." icon={Globe2}>
               <div className="h-[370px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={paisesData} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0eaf0" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                        <YAxis type="category" dataKey="pais" width={105} tick={{ fontSize: 11, fill: '#6b7280' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="total" name="Participantes" fill={COLORS.secondary} radius={[0, 5, 5, 0]} maxBarSize={22} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </ChartCard>

            {/* 6. Distribución por edad */}
            <ChartCard title="Distribución por edad" description="Participantes agrupadas por rangos de edad." icon={Users}>
               <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={edadData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0eaf0" />
                        <XAxis dataKey="rango" tick={{ fontSize: 11, fill: '#6b7280' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="total" name="Participantes" fill={COLORS.blue} radius={[6, 6, 0, 0]} maxBarSize={50} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </ChartCard>

            {/* 7. Distribución por puntuación */}
            <ChartCard title="Distribución por puntuación" description="Frecuencia de participantes según su puntuación total (0 a 75)." icon={ChartColumnIncreasing}>
               <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={puntuacionData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0eaf0" />
                        <XAxis dataKey="rango" tick={{ fontSize: 11, fill: '#6b7280' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="total" name="Participantes" fill={COLORS.primary} radius={[6, 6, 0, 0]} maxBarSize={50} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </ChartCard>

            {/* 8. Distribución por IMC */}
            <ChartCard title="Distribución por IMC" description="Clasificación de participantes según su índice de masa corporal." icon={Scale}>
               <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie data={imcData} dataKey="total" nameKey="categoria" cx="50%" cy="50%" outerRadius={105} innerRadius={60} paddingAngle={3}>
                           {imcData.map((_, index) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12 }} />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
            </ChartCard>

            {/* 9. Hábitos más frecuentes */}
            <ChartCard title="Hábitos más frecuentes" description="Hábitos y factores de estilo de vida más reportados por las participantes." icon={HeartPulse} className="xl:col-span-2">
               <div className="h-[330px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={habitosData} layout="vertical" margin={{ top: 0, right: 20, left: 70, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0eaf0" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                        <YAxis type="category" dataKey="habito" width={160} tick={{ fontSize: 11, fill: '#6b7280' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="total" name="Participantes" fill={COLORS.secondary} radius={[0, 6, 6, 0]} maxBarSize={28} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </ChartCard>

         </div>
      </div>
   );
}