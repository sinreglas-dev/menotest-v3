'use client';

import { useEffect, useMemo, useState } from 'react';
import {
   Activity,
   BarChart3,
   CalendarDays,
   ChartColumn,
   Globe2,
   HeartPulse,
   LoaderCircle,
   Scale,
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
   AreaChart,
   Area,
} from 'recharts';

// ==================== CONFIGURACIÓN ====================

const COLORS = {
   primary: '#6e0b6c',
   secondary: '#8d2a8a',
   blue: '#4478c7',
   cyan: '#56b4d3',
   green: '#48a98a',
   yellow: '#e8b44c',
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

// ==================== TIPOS ====================

interface Kpis {
   totalParticipantes: number;
   edadPromedio: number;
   puntajePromedio: number;
   paisPrincipal: string;
   porcentajePaisPrincipal: number;
}

interface Sintoma {
   sintoma: string;
   nada: number;
   poco: number;
   bastante: number;
   mucho: number;
}

interface Etapa {
   name: string;
   value: number;
}

interface PuntuacionEtapa {
   etapa: string;
   promedio: number;
}

interface RegistroMes {
   mes: string;
   registros: number;
}

interface Pais {
   pais: string;
   total: number;
}

interface RangoData {
   rango: string;
   total: number;
}

interface ImcData {
   categoria: string;
   total: number;
}

interface HabitoData {
   habito: string;
   total: number;
}

interface AnaliticaResponse {
   ok: boolean;
   kpis: Kpis;
   sintomas: Sintoma[];
   etapas: Etapa[];
   puntuacionEtapa: PuntuacionEtapa[];
   registrosMes: RegistroMes[];
   paises: Pais[];
   edades: RangoData[];
   puntuaciones: RangoData[];
   imc: ImcData[];
   habitos: HabitoData[];
}

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

function EmptyState({ mensaje }: { mensaje: string }) {
   return (
      <div className="flex h-[280px] items-center justify-center rounded-xl bg-[#fafafa] text-center">
         <p className="max-w-xs text-xs text-[#9ca3af]">{mensaje}</p>
      </div>
   );
}

// ==================== PÁGINA ====================

export default function AnaliticaPage() {
   const [datos, setDatos] = useState<AnaliticaResponse | null>(null);
   const [cargando, setCargando] = useState(true);
   const [error, setError] = useState('');
   const [tipoGraficaSintomas, setTipoGraficaSintomas] = useState<'conteo' | 'porcentaje'>('conteo');

   useEffect(() => {
      const cargar = async () => {
         setCargando(true);
         setError('');

         try {
            const res = await fetch('/api/admin/analitica', { cache: 'no-store' });
            if (!res.ok) throw new Error('No se pudieron cargar los datos de analítica');

            const data = (await res.json()) as AnaliticaResponse;
            setDatos(data);
         } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error de conexión');
         } finally {
            setCargando(false);
         }
      };

      cargar();
   }, []);

   // Transformar síntomas a porcentaje si aplica
   const datosGraficaSintomas = useMemo(() => {
      if (!datos) return [];
      if (tipoGraficaSintomas === 'conteo') return datos.sintomas;

      return datos.sintomas.map(item => {
         const total = item.nada + item.poco + item.bastante + item.mucho;
         const calc = (v: number) => (total > 0 ? Number(((v / total) * 100).toFixed(1)) : 0);
         return {
            sintoma: item.sintoma,
            nada: calc(item.nada),
            poco: calc(item.poco),
            bastante: calc(item.bastante),
            mucho: calc(item.mucho),
         };
      });
   }, [datos, tipoGraficaSintomas]);

   // Loading
   if (cargando) {
      return (
         <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
               <LoaderCircle size={32} className="mx-auto animate-spin text-[#6e0b6c]" />
               <p className="mt-3 text-sm text-[#6b7280]">Cargando analítica...</p>
            </div>
         </div>
      );
   }

   // Error
   if (error || !datos) {
      return (
         <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <p className="text-base font-bold text-[#171717]">No pudimos cargar la analítica</p>
            <p className="mt-2 text-sm text-[#6b7280]">{error || 'Error desconocido'}</p>
         </div>
      );
   }

   const { kpis, etapas, puntuacionEtapa, registrosMes, paises, edades, puntuaciones, imc, habitos } = datos;

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
               {kpis.totalParticipantes.toLocaleString('es-MX')} participantes
            </div>
         </div>

         {/* KPIs */}
         <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-[#eee7ee] bg-white p-5 shadow-sm">
               <p className="text-xs font-medium text-[#6b7280]">Participantes</p>
               <p className="mt-2 text-2xl font-bold tracking-tight text-[#171717]">
                  {kpis.totalParticipantes.toLocaleString('es-MX')}
               </p>
               <p className="mt-3 text-xs text-[#9ca3af]">Evaluaciones completadas</p>
            </article>

            <article className="rounded-2xl border border-[#eee7ee] bg-white p-5 shadow-sm">
               <p className="text-xs font-medium text-[#6b7280]">Edad promedio</p>
               <p className="mt-2 text-2xl font-bold tracking-tight text-[#171717]">
                  {kpis.edadPromedio > 0 ? `${kpis.edadPromedio} años` : 'Sin datos'}
               </p>
               <p className="mt-3 text-xs text-[#9ca3af]">Sobre las participantes registradas</p>
            </article>

            <article className="rounded-2xl border border-[#eee7ee] bg-white p-5 shadow-sm">
               <p className="text-xs font-medium text-[#6b7280]">Puntaje promedio</p>
               <p className="mt-2 text-2xl font-bold tracking-tight text-[#171717]">
                  {kpis.puntajePromedio > 0 ? `${kpis.puntajePromedio} / 75` : 'Sin datos'}
               </p>
               <p className="mt-3 text-xs text-[#9ca3af]">Sobre el máximo posible</p>
            </article>

            <article className="rounded-2xl border border-[#eee7ee] bg-white p-5 shadow-sm">
               <p className="text-xs font-medium text-[#6b7280]">País principal</p>
               <p className="mt-2 text-2xl font-bold tracking-tight text-[#171717]">{kpis.paisPrincipal}</p>
               <p className="mt-3 text-xs text-[#9ca3af]">
                  {kpis.porcentajePaisPrincipal > 0 ? `${kpis.porcentajePaisPrincipal}% de las participantes` : 'Sin datos'}
               </p>
            </article>
         </section>

         <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

            {/* 1. Síntomas */}
            <ChartCard
               title="Síntomas más reportados por severidad"
               description="Conteo de participantes según la intensidad de cada síntoma. Escala: Nada (0), Poco (1), Bastante (2), Mucho (3)."
               icon={HeartPulse}
               className="xl:col-span-2"
            >
               {datosGraficaSintomas.length === 0 ? (
                  <EmptyState mensaje="No hay respuestas de síntomas registradas todavía." />
               ) : (
                  <>
                     <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-[#9ca3af]">
                           Población de referencia: {kpis.totalParticipantes.toLocaleString('es-MX')} mujeres
                        </p>

                        <div className="inline-flex w-fit rounded-xl bg-[#f5eaf5] p-1">
                           <button type="button" onClick={() => setTipoGraficaSintomas('conteo')} className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${tipoGraficaSintomas === 'conteo' ? 'bg-[#6e0b6c] text-white' : 'text-[#6e0b6c]'}`}>Conteo</button>
                           <button type="button" onClick={() => setTipoGraficaSintomas('porcentaje')} className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${tipoGraficaSintomas === 'porcentaje' ? 'bg-[#6e0b6c] text-white' : 'text-[#6e0b6c]'}`}>Porcentaje</button>
                        </div>
                     </div>

                     <div className="h-[440px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={datosGraficaSintomas} margin={{ top: 10, right: 20, left: 0, bottom: 65 }}>
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
                  </>
               )}
            </ChartCard>

            {/* 2. Etapas */}
            <ChartCard title="Resultados por etapa" description="Distribución de participantes según su etapa orientativa." icon={Activity}>
               {etapas.length === 0 ? (
                  <EmptyState mensaje="No hay etapas registradas." />
               ) : (
                  <div className="h-[320px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie data={etapas} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={105} innerRadius={60} paddingAngle={3}>
                              {etapas.map((_, index) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                           </Pie>
                           <Tooltip content={<CustomTooltip />} />
                           <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
               )}
            </ChartCard>

            {/* 3. Puntuación por etapa */}
            <ChartCard title="Puntuación promedio por etapa" description="Promedio de puntuación MenoTest por etapa. Máximo: 75 puntos." icon={BarChart3}>
               {puntuacionEtapa.length === 0 ? (
                  <EmptyState mensaje="Sin puntuaciones registradas." />
               ) : (
                  <div className="h-[320px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={puntuacionEtapa} margin={{ top: 20, right: 10, left: -15, bottom: 30 }}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0eaf0" />
                           <XAxis dataKey="etapa" tick={{ fontSize: 11, fill: '#6b7280' }} angle={-15} textAnchor="end" height={55} />
                           <YAxis domain={[0, 75]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                           <Tooltip content={<CustomTooltip />} />
                           <Bar dataKey="promedio" name="Puntaje promedio" fill={COLORS.primary} radius={[6, 6, 0, 0]} maxBarSize={65} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               )}
            </ChartCard>

            {/* 4. Registros por mes */}
            <ChartCard title="Registros por mes" description="Evolución mensual de evaluaciones registradas." icon={CalendarDays}>
               {registrosMes.length === 0 ? (
                  <EmptyState mensaje="Sin registros mensuales." />
               ) : (
                  <div className="h-[320px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={registrosMes} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
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
               )}
            </ChartCard>

            {/* 5. Países */}
            <ChartCard title="Top 10 países" description="Países con mayor número de participantes." icon={Globe2}>
               {paises.length === 0 ? (
                  <EmptyState mensaje="Sin países registrados." />
               ) : (
                  <div className="h-[370px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={paises} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0eaf0" />
                           <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                           <YAxis type="category" dataKey="pais" width={105} tick={{ fontSize: 11, fill: '#6b7280' }} />
                           <Tooltip content={<CustomTooltip />} />
                           <Bar dataKey="total" name="Participantes" fill={COLORS.secondary} radius={[0, 5, 5, 0]} maxBarSize={22} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               )}
            </ChartCard>

            {/* 6. Edad */}
            <ChartCard title="Distribución por edad" description="Participantes agrupadas por rangos de edad." icon={Users}>
               {edades.every(e => e.total === 0) ? (
                  <EmptyState mensaje="Sin fechas de nacimiento registradas." />
               ) : (
                  <div className="h-[320px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={edades} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0eaf0" />
                           <XAxis dataKey="rango" tick={{ fontSize: 11, fill: '#6b7280' }} />
                           <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                           <Tooltip content={<CustomTooltip />} />
                           <Bar dataKey="total" name="Participantes" fill={COLORS.blue} radius={[6, 6, 0, 0]} maxBarSize={50} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               )}
            </ChartCard>

            {/* 7. Puntuación */}
            <ChartCard title="Distribución por puntuación" description="Frecuencia de participantes según su puntuación total (0 a 75)." icon={ChartColumn}>
               {puntuaciones.every(p => p.total === 0) ? (
                  <EmptyState mensaje="Sin puntuaciones registradas." />
               ) : (
                  <div className="h-[320px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={puntuaciones} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0eaf0" />
                           <XAxis dataKey="rango" tick={{ fontSize: 11, fill: '#6b7280' }} />
                           <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                           <Tooltip content={<CustomTooltip />} />
                           <Bar dataKey="total" name="Participantes" fill={COLORS.primary} radius={[6, 6, 0, 0]} maxBarSize={50} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               )}
            </ChartCard>

            {/* 8. IMC */}
            <ChartCard title="Distribución por IMC" description="Clasificación de participantes según su índice de masa corporal." icon={Scale}>
               {imc.length === 0 ? (
                  <EmptyState mensaje="Sin datos de IMC registrados." />
               ) : (
                  <div className="h-[320px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie data={imc} dataKey="total" nameKey="categoria" cx="50%" cy="50%" outerRadius={105} innerRadius={60} paddingAngle={3}>
                              {imc.map((_, index) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                           </Pie>
                           <Tooltip content={<CustomTooltip />} />
                           <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
               )}
            </ChartCard>

            {/* 9. Hábitos */}
            <ChartCard title="Hábitos más frecuentes" description="Hábitos de riesgo (moderado o relevante) más reportados por las participantes." icon={HeartPulse} className="xl:col-span-2">
               {habitos.length === 0 ? (
                  <EmptyState mensaje="Sin hábitos de riesgo registrados." />
               ) : (
                  <div className="h-[330px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={habitos} layout="vertical" margin={{ top: 0, right: 20, left: 70, bottom: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0eaf0" />
                           <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                           <YAxis type="category" dataKey="habito" width={200} tick={{ fontSize: 11, fill: '#6b7280' }} />
                           <Tooltip content={<CustomTooltip />} />
                           <Bar dataKey="total" name="Participantes" fill={COLORS.secondary} radius={[0, 6, 6, 0]} maxBarSize={28} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               )}
            </ChartCard>

         </div>
      </div>
   );
}