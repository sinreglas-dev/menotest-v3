'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';

const DATA = [
   { id: 1, patient: 'María González López', email: 'maria.gonzalez@email.com', stage: 'Transición menopáusica', score: 38, imc: '24.6', status: 'Completo', date: '22 Sep 2026', program: 'Organon' },
   { id: 2, patient: 'Ana Martínez Ruiz', email: 'ana.martinez@email.com', stage: 'Posmenopausia', score: 44, imc: '27.2', status: 'Completo', date: '22 Sep 2026', program: 'Reina Madre' },
   { id: 3, patient: 'Laura Hernández', email: 'laura.h@email.com', stage: 'En evaluación', score: null, imc: '22.8', status: 'Incompleto', date: '21 Sep 2026', program: 'General' },
   { id: 4, patient: 'Patricia Ramírez', email: 'patricia.r@email.com', stage: 'Perimenopausia', score: 29, imc: '25.1', status: 'Completo', date: '21 Sep 2026', program: 'FEMSA' },
   { id: 5, patient: 'Sofía Torres', email: 'sofia.t@email.com', stage: 'En evaluación', score: null, imc: '23.4', status: 'Incompleto', date: '20 Sep 2026', program: 'Organon' }
];

export default function MenoTestTable() {
   return (
      <div className="overflow-hidden rounded-2xl border border-[#eee7ee] bg-white shadow-sm">

         {/* Header */}
         <div className="flex items-center justify-between border-b border-[#f0eaf0] px-5 py-5 sm:px-6">
            <div>
               <h2 className="text-base font-bold text-[#171717]">MenoTest recientes</h2>
               <p className="mt-1 text-xs text-[#9ca3af]">Últimas evaluaciones registradas.</p>
            </div>

            <Link href="/dashboard/menotest" className="text-xs font-semibold text-[#6e0b6c] transition hover:text-[#570956]">Ver todos</Link>
         </div>

         {/* Tabla */}
         <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">

               <thead>
                  <tr className="border-b border-[#f0eaf0] bg-[#fcfbfc]">
                     <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Paciente</th>
                     <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Etapa</th>
                     <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Puntaje</th>
                     <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">IMC</th>
                     <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Estado</th>
                     <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Fecha</th>
                     <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Campaña</th>
                     <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Acciones</th>
                  </tr>
               </thead>

               <tbody>
                  {DATA.map(item => (
                     <tr key={item.id} className="border-b border-[#f4f1f4] transition last:border-0 hover:bg-[#fcf9fc]">

                        <td className="px-6 py-4">
                           <p className="whitespace-nowrap text-sm font-semibold text-[#171717]">{item.patient}</p>
                           <p className="mt-1 text-xs text-[#9ca3af]">{item.email}</p>
                        </td>

                        <td className="px-4 py-4 text-sm text-[#6b7280]">{item.stage}</td>

                        <td className="px-4 py-4 text-center text-sm font-semibold text-[#374151]">{item.score ?? '—'}</td>

                        <td className="px-4 py-4 text-center text-sm text-[#6b7280]">{item.imc}</td>

                        <td className="px-4 py-4">
                           <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.status === 'Completo' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-[#6b7280]">{item.date}</td>

                        <td className="px-4 py-4">
                           <span className="inline-flex rounded-lg bg-[#f5eaf5] px-2.5 py-1 text-[11px] font-semibold text-[#6e0b6c]">{item.program}</span>
                        </td>

                        <td className="px-6 py-4 text-right">
                           <Link href={`/dashboard/menotest/${item.id}`} aria-label={`Ver ${item.patient}`} title="Ver detalle" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#6b7280] transition hover:border-[#d7bdd6] hover:bg-[#f5eaf5] hover:text-[#6e0b6c]">
                              <Eye size={17} />
                           </Link>
                        </td>

                     </tr>
                  ))}
               </tbody>

            </table>
         </div>

      </div>
   );
}