'use client';

import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, ClipboardList, HeartPulse, Stethoscope, UserRoundX } from 'lucide-react';
import KpiCard from '@/components/dashboard/KpiCard';
import MenoTestTable from '@/components/dashboard/MenoTestTable';

interface Kpis {
   total: number;
   promedioPuntaje: number;
   pacientesAsignadas?: number;
   pacientesSinAsignar?: number;
   etapaMayorIncidencia?: string | null;
   totalEtapaMayorIncidencia?: number;
}

interface Evaluacion {
   id: number;
   programa: string;
   nombre: string;
   apellido_paterno: string;
   apellido_materno: string | null;
   correo: string;
   etapa: string | null;
   puntaje_total: number | null;
   imc: number | null;
   creado_en: string;
   especialista_id?: number | null;
   especialista_nombre?: string | null;
}

export default function DashboardPage() {
   const [kpis, setKpis] = useState<Kpis | null>(null);
   const [recientes, setRecientes] = useState<Evaluacion[]>([]);
   const [cargando, setCargando] = useState(true);

   // Cargar información
   useEffect(() => {
      const cargar = async () => {
         try {
            const [resKpis, resLista] = await Promise.all([
               fetch('/api/admin/kpis', { cache: 'no-store' }).then(r => r.json()),
               fetch('/api/admin/evaluaciones?pagina=1&porPagina=15', { cache: 'no-store' }).then(r => r.json())
            ]);

            setKpis(resKpis);
            setRecientes(resLista.datos ?? []);
         } catch (error) {
            console.error('Error cargando dashboard:', error);
         } finally {
            setCargando(false);
         }
      };

      cargar();
   }, []);

   // KPIs de especialistas
   const pacientesAsignadas = kpis?.pacientesAsignadas;
   const pacientesSinAsignar = kpis?.pacientesSinAsignar;

   // Etapa con mayor incidencia
   const etapaMayorIncidencia = kpis?.etapaMayorIncidencia;
   const totalEtapaMayorIncidencia = kpis?.totalEtapaMayorIncidencia;

   return (
      <div className="space-y-6">

         {/* Encabezado */}
         <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717] sm:text-3xl">Dashboard</h1>
            <p className="mt-2 text-sm text-[#6b7280]">Resumen general de las evaluaciones realizadas en MenoTest.</p>
         </div>

         {/* KPIs */}
         <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

            <KpiCard
               title="Total MenoTest"
               value={cargando ? '—' : (kpis?.total ?? 0).toLocaleString('es-MX')}
               description="Evaluaciones registradas"
               icon={ClipboardList}
               variant="primary"
            />

            <KpiCard
               title="Completos"
               value={cargando ? '—' : (kpis?.total ?? 0).toLocaleString('es-MX')}
               description="Evaluaciones finalizadas"
               icon={CheckCircle2}
               variant="success"
            />

            <KpiCard
               title="Puntaje promedio"
               value={cargando ? '—' : String(kpis?.promedioPuntaje ?? 0)}
               description="Sobre un máximo de 75 puntos"
               icon={Activity}
               variant="neutral"
            />

            <KpiCard
               title="Pacientes asignadas"
               value={cargando || pacientesAsignadas === undefined ? '—' : pacientesAsignadas.toLocaleString('es-MX')}
               description="Con especialista asignada"
               icon={Stethoscope}
               variant="success"
            />

            <KpiCard
               title="Pacientes sin asignar"
               value={cargando || pacientesSinAsignar === undefined ? '—' : pacientesSinAsignar.toLocaleString('es-MX')}
               description="Pendientes de asignación"
               icon={UserRoundX}
               variant="warning"
            />

            <KpiCard
               title="Etapa con mayor incidencia"
               value={cargando ? '—' : etapaMayorIncidencia ?? 'Sin datos'}
               description={totalEtapaMayorIncidencia !== undefined ? `${totalEtapaMayorIncidencia.toLocaleString('es-MX')} evaluaciones registradas` : 'Etapa más frecuente'}
               icon={HeartPulse}
               variant="primary"
            />

         </section>

         {/* Últimas evaluaciones */}
         <div>
            <h2 className="text-lg font-bold text-[#171717]">Últimas 15 evaluaciones</h2>
            <p className="mt-1 text-sm text-[#6b7280]">Registros más recientes de las pacientes que realizaron MenoTest.</p>
         </div>

         <MenoTestTable datos={recientes} cargando={cargando} />

      </div>
   );
}