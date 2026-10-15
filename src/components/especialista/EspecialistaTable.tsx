'use client';

import Link from 'next/link';
import { ClipboardList, Eye } from 'lucide-react';
import { Download } from 'lucide-react';
import { exportarEvaluacionesExcel } from '@/utils/exportarExcel';

export interface EvaluacionEspecialista {
   id: number;
   nombre: string;
   apellido_paterno: string;
   apellido_materno: string | null;
   correo: string;
   etapa: string | null;
   puntaje_total: number | null;
   imc: number | null;
   creado_en: string;
   programa?: string;
}

interface Props {
   datos: EvaluacionEspecialista[];
   cargando?: boolean;
}

export default function EspecialistaTable({ datos, cargando = false }: Props) {
   return (
      <section className="overflow-hidden rounded-2xl border border-[#eee7ee] bg-white shadow-sm">
         <div className="flex flex-col gap-4 border-b border-[#f0eaf0] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
               <h2 className="text-base font-bold text-[#171717]">Mis pacientes</h2>
               <p className="mt-1 text-xs text-[#9ca3af]">Evaluaciones asignadas para su seguimiento.</p>
            </div>

            <button type="button" onClick={() => exportarEvaluacionesExcel(datos, 'mis-pacientes-menotest')} disabled={cargando || datos.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6e0b6c] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#570956] disabled:cursor-not-allowed disabled:opacity-50">
               <Download size={16} />
               Exportar a Excel
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
               <thead>
                  <tr className="border-b border-[#f0eaf0] bg-[#fcfbfc]">
                     <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Paciente</th>
                     <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Etapa</th>
                     <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Puntaje</th>
                     <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">IMC</th>
                     <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Fecha</th>
                     <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Acciones</th>
                  </tr>
               </thead>

               <tbody>
                  {cargando && <tr><td colSpan={6} className="px-6 py-14 text-center text-sm text-[#9ca3af]">Cargando pacientes...</td></tr>}

                  {!cargando && datos.length === 0 && (
                     <tr>
                        <td colSpan={6} className="px-6 py-14 text-center">
                           <ClipboardList size={28} className="mx-auto text-[#b69ab5]" />
                           <p className="mt-3 text-sm font-semibold text-[#171717]">Todavía no tienes pacientes asignadas</p>
                           <p className="mt-1 text-xs text-[#9ca3af]">Las evaluaciones asignadas aparecerán aquí.</p>
                        </td>
                     </tr>
                  )}

                  {!cargando && datos.map(item => {
                     const nombre = `${item.nombre} ${item.apellido_paterno} ${item.apellido_materno ?? ''}`.trim();
                     const fecha = new Date(item.creado_en).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

                     return (
                        <tr key={item.id} className="border-b border-[#f4f1f4] transition last:border-0 hover:bg-[#fcf9fc]">
                           <td className="px-6 py-4">
                              <p className="whitespace-nowrap text-sm font-semibold text-[#171717]">{nombre}</p>
                              <p className="mt-1 text-xs text-[#9ca3af]">{item.correo}</p>
                           </td>
                           <td className="px-4 py-4 text-sm text-[#6b7280]">{item.etapa ?? 'En evaluación'}</td>
                           <td className="px-4 py-4 text-center text-sm font-semibold text-[#374151]">{item.puntaje_total ?? '—'}</td>
                           <td className="px-4 py-4 text-center text-sm text-[#6b7280]">{item.imc ?? '—'}</td>
                           <td className="whitespace-nowrap px-4 py-4 text-sm text-[#6b7280]">{fecha}</td>
                           <td className="px-6 py-4 text-right">
                              <Link href={`/especialista/menotest/${item.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#6b7280] transition hover:border-[#d7bdd6] hover:bg-[#f5eaf5] hover:text-[#6e0b6c]" aria-label={`Ver evaluación de ${nombre}`}><Eye size={17} /></Link>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </section>
   );
}