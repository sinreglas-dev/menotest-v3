'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, Stethoscope, UsersRound } from 'lucide-react';
import EspecialistaHeader from '@/components/especialista/EspecialistaHeader';
import EspecialistaTable, { type EvaluacionEspecialista } from '@/components/especialista/EspecialistaTable';

export default function EspecialistaPage() {
   const [datos, setDatos] = useState<EvaluacionEspecialista[]>([]);
   const [nombre, setNombre] = useState('Especialista');
   const [cargando, setCargando] = useState(true);
   const [error, setError] = useState('');

   useEffect(() => {
      const cargar = async () => {
         try {
            const respuesta = await fetch('/api/especialista/evaluaciones', { credentials: 'same-origin', cache: 'no-store' });

            if (respuesta.status === 401) {
               window.location.replace('/especialista/login');
               return;
            }

            if (!respuesta.ok) throw new Error('No se pudieron cargar las evaluaciones.');

            const resultado = await respuesta.json();
            setDatos(resultado.datos ?? []);
            if (resultado.especialista?.nombre) setNombre(resultado.especialista.nombre);
         } catch {
            setError('No fue posible cargar las evaluaciones. Inténtalo nuevamente.');
         } finally {
            setCargando(false);
         }
      };

      cargar();
   }, []);

   const total = datos.length;
   const conPuntaje = datos.filter(item => item.puntaje_total !== null).length;
   const pendientes = total - conPuntaje;

   return (
      <div>
         <EspecialistaHeader nombre={nombre} />

         <main className="mx-auto max-w-7xl space-y-7 px-5 py-8 sm:px-8">
            {/* Bienvenida */}
            <div>
               <div className="mb-2 flex items-center gap-2 text-[#6e0b6c]"><Stethoscope size={18} /><span className="text-xs font-bold uppercase tracking-[0.14em]">Mi dashboard</span></div>
               <h1 className="text-2xl font-bold text-[#171717] sm:text-3xl">Bienvenida, {nombre}</h1>
               <p className="mt-2 text-sm text-[#6b7280]">Consulta las evaluaciones asignadas y da seguimiento a tus pacientes.</p>
            </div>

            {/* Indicadores */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
               <div className="rounded-2xl border border-[#eee7ee] bg-white p-5 shadow-sm">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5eaf5] text-[#6e0b6c]"><UsersRound size={21} /></div>
                  <p className="text-xs font-medium text-[#6b7280]">Pacientes asignadas</p>
                  <p className="mt-2 text-3xl font-bold text-[#171717]">{cargando ? '—' : total}</p>
               </div>

               <div className="rounded-2xl border border-[#eee7ee] bg-white p-5 shadow-sm">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5eaf5] text-[#6e0b6c]"><ClipboardList size={21} /></div>
                  <p className="text-xs font-medium text-[#6b7280]">Evaluaciones con resultado</p>
                  <p className="mt-2 text-3xl font-bold text-[#171717]">{cargando ? '—' : conPuntaje}</p>
               </div>

               <div className="rounded-2xl border border-[#eee7ee] bg-white p-5 shadow-sm">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5eaf5] text-[#6e0b6c]"><Stethoscope size={21} /></div>
                  <p className="text-xs font-medium text-[#6b7280]">Evaluaciones pendientes</p>
                  <p className="mt-2 text-3xl font-bold text-[#171717]">{cargando ? '—' : pendientes}</p>
               </div>
            </div>

            {/* Error */}
            {error && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>}

            {/* Pacientes */}
            <EspecialistaTable datos={datos} cargando={cargando} />
         </main>
      </div>
   );
}