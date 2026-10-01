'use client';

import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, ClipboardList, Clock3 } from 'lucide-react';
import KpiCard from '@/components/dashboard/KpiCard';
import MenoTestTable from '@/components/dashboard/MenoTestTable';

interface Kpis {
   total: number;
   promedioPuntaje: number;
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
}

export default function DashboardPage() {
   const [kpis, setKpis] = useState<Kpis | null>(null);
   const [recientes, setRecientes] = useState<Evaluacion[]>([]);
   const [cargando, setCargando] = useState(true);

   useEffect(() => {
      const cargar = async () => {
         try {
            const [resKpis, resLista] = await Promise.all([
               fetch('/api/admin/kpis').then(r => r.json()),
               fetch('/api/admin/evaluaciones?pagina=1&porPagina=5').then(r => r.json()),
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

   return (
      <div className="space-y-6">

         <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717] sm:text-3xl">Dashboard</h1>
            <p className="mt-2 text-sm text-[#6b7280]">Resumen general de las evaluaciones realizadas en MenoTest.</p>
         </div>

         <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
               title="Total MenoTest"
               value={cargando ? '—' : kpis?.total.toLocaleString('es-MX') ?? '0'}
               description="Evaluaciones registradas"
               icon={ClipboardList}
               variant="primary"
            />
            <KpiCard
               title="Completos"
               value={cargando ? '—' : kpis?.total.toLocaleString('es-MX') ?? '0'}
               description="Evaluaciones finalizadas"
               icon={CheckCircle2}
               variant="success"
            />
            <KpiCard
               title="Últimas 5"
               value={cargando ? '—' : recientes.length}
               description="Mostradas en la tabla"
               icon={Clock3}
               variant="warning"
            />
            <KpiCard
               title="Puntaje promedio"
               value={cargando ? '—' : String(kpis?.promedioPuntaje ?? 0)}
               description="Sobre un máximo de 75 puntos"
               icon={Activity}
               variant="neutral"
            />
         </section>

         <MenoTestTable datos={recientes} cargando={cargando} />

      </div>
   );
}