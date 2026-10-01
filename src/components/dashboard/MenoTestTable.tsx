'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';

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

interface Props {
   datos: Evaluacion[];
   cargando?: boolean;
}

export default function MenoTestTable({ datos, cargando = false }: Props) {
   return (
      <div className="overflow-hidden rounded-2xl border border-[#eee7ee] bg-white shadow-sm">

         <div className="flex items-center justify-between border-b border-[#f0eaf0] px-5 py-5 sm:px-6">
            <div>
               <h2 className="text-base font-bold text-[#171717]">MenoTest recientes</h2>
               <p className="mt-1 text-xs text-[#9ca3af]">Últimas evaluaciones registradas.</p>
            </div>
            <Link href="/dashboard/menotest" className="text-xs font-semibold text-[#6e0b6c] transition hover:text-[#570956]">Ver todos</Link>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
               <thead>
                  <tr className="border-b border-[#f0eaf0] bg-[#fcfbfc]">
                     <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Paciente</th>
                     <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Etapa</th>
                     <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Puntaje</th>
                     <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">IMC</th>
                     <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Fecha</th>
                     <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Campaña</th>
                     <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Acciones</th>
                  </tr>
               </thead>
               <tbody>
                  {cargando && (
                     <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-[#9ca3af]">
                           Cargando evaluaciones...
                        </td>
                     </tr>
                  )}

                  {!cargando && datos.length === 0 && (
                     <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-[#9ca3af]">
                           No hay evaluaciones registradas todavía.
                        </td>
                     </tr>
                  )}

                  {!cargando && datos.map(item => {
                     const nombreCompleto = `${item.nombre} ${item.apellido_paterno} ${item.apellido_materno ?? ''}`.trim();
                     const fecha = new Date(item.creado_en).toLocaleDateString('es-MX', {
                        day: '2-digit', month: 'short', year: 'numeric',
                     });

                     return (
                        <tr key={item.id} className="border-b border-[#f4f1f4] transition last:border-0 hover:bg-[#fcf9fc]">
                           <td className="px-6 py-4">
                              <p className="whitespace-nowrap text-sm font-semibold text-[#171717]">{nombreCompleto}</p>
                              <p className="mt-1 text-xs text-[#9ca3af]">{item.correo}</p>
                           </td>
                           <td className="px-4 py-4 text-sm text-[#6b7280]">{item.etapa ?? 'En evaluación'}</td>
                           <td className="px-4 py-4 text-center text-sm font-semibold text-[#374151]">{item.puntaje_total ?? '—'}</td>
                           <td className="px-4 py-4 text-center text-sm text-[#6b7280]">{item.imc ?? '—'}</td>
                           <td className="whitespace-nowrap px-4 py-4 text-sm text-[#6b7280]">{fecha}</td>
                           <td className="px-4 py-4">
                              <span className="inline-flex rounded-lg bg-[#f5eaf5] px-2.5 py-1 text-[11px] font-semibold text-[#6e0b6c]">
                                 {item.programa}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <Link href={`/dashboard/menotest/${item.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#6b7280] transition hover:border-[#d7bdd6] hover:bg-[#f5eaf5] hover:text-[#6e0b6c]">
                                 <Eye size={17} />
                              </Link>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>

      </div>
   );
}