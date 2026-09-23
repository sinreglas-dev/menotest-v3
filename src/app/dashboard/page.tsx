import { Activity, CheckCircle2, ClipboardList, Clock3 } from 'lucide-react';
import KpiCard from '@/components/dashboard/KpiCard';
import MenoTestTable from '@/components/dashboard/MenoTestTable';

export default function DashboardPage() {
   return (
      <div className="space-y-6">

         {/* Encabezado */}
         <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717] sm:text-3xl">Dashboard</h1>
            <p className="mt-2 text-sm text-[#6b7280]">Resumen general de las evaluaciones realizadas en MenoTest.</p>
         </div>

         {/* KPIs */}
         <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Total MenoTest" value="1,284" description="Evaluaciones registradas" icon={ClipboardList} variant="primary" />
            <KpiCard title="Completos" value="1,106" description="86.1% del total" icon={CheckCircle2} variant="success" />
            <KpiCard title="Incompletos" value="178" description="13.9% del total" icon={Clock3} variant="warning" />
            <KpiCard title="Puntaje promedio" value="32.8" description="Sobre un máximo de 75 puntos" icon={Activity} variant="neutral" />
         </section>

         {/* Tabla */}
         <MenoTestTable />

      </div>
   );
}