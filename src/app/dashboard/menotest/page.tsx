'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ClipboardList, Eye } from 'lucide-react';
import MenoTestFilters from '@/components/dashboard/MenoTestFilters';

interface Evaluacion {
   id: number;
   programa: string;
   programa_clave: string;
   nombre: string;
   apellido_paterno: string;
   apellido_materno: string | null;
   correo: string;
   etapa: string | null;
   puntaje_total: number | null;
   imc: number | null;
   creado_en: string;
}

const ITEMS_PER_PAGE = 8;

export default function MenoTestPage() {
   const [datos, setDatos] = useState<Evaluacion[]>([]);
   const [total, setTotal] = useState(0);
   const [cargando, setCargando] = useState(true);

   const [search, setSearch] = useState('');
   const [program, setProgram] = useState('');
   const [stage, setStage] = useState('');
   const [page, setPage] = useState(1);

   useEffect(() => {
      const cargar = async () => {
         setCargando(true);
         try {
            const params = new URLSearchParams();
            params.set('pagina', '1');
            params.set('porPagina', '200');
            const res = await fetch(`/api/admin/evaluaciones?${params.toString()}`);
            const data = await res.json();
            setDatos(data.datos ?? []);
            setTotal(data.total ?? 0);
         } catch (error) {
            console.error('Error cargando evaluaciones:', error);
         } finally {
            setCargando(false);
         }
      };
      cargar();
   }, []);

   const filteredData = useMemo(() => {
      const term = search.toLowerCase().trim();
      return datos.filter(item => {
         const nombreCompleto = `${item.nombre} ${item.apellido_paterno} ${item.apellido_materno ?? ''}`.toLowerCase();
         const matchesSearch = !term || nombreCompleto.includes(term) || item.correo.toLowerCase().includes(term);
         const matchesProgram = !program || item.programa_clave === program;
         const matchesStage = !stage || item.etapa === stage;
         return matchesSearch && matchesProgram && matchesStage;
      });
   }, [datos, search, program, stage]);

   const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
   const currentPage = Math.min(page, totalPages);
   const start = (currentPage - 1) * ITEMS_PER_PAGE;
   const paginatedData = filteredData.slice(start, start + ITEMS_PER_PAGE);

   return (
      <div className="space-y-6">

         <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
               <div className="mb-2 flex items-center gap-2 text-[#6e0b6c]">
                  <ClipboardList size={18} />
                  <span className="text-xs font-bold uppercase tracking-[0.14em]">Evaluaciones</span>
               </div>
               <h1 className="text-2xl font-bold tracking-tight text-[#171717] sm:text-3xl">MenoTest</h1>
               <p className="mt-2 text-sm text-[#6b7280]">Consulta y administra las evaluaciones realizadas.</p>
            </div>
            <div className="rounded-xl border border-[#eee7ee] bg-white px-4 py-3 shadow-sm">
               <p className="text-xs text-[#9ca3af]">Total de registros</p>
               <p className="mt-1 text-xl font-bold text-[#171717]">{cargando ? '—' : total}</p>
            </div>
         </div>

         <MenoTestFilters
            search={search}
            program={program}
            stage={stage}
            onSearchChange={v => { setSearch(v); setPage(1); }}
            onProgramChange={v => { setProgram(v); setPage(1); }}
            onStageChange={v => { setStage(v); setPage(1); }}
            onClear={() => { setSearch(''); setProgram(''); setStage(''); setPage(1); }}
         />

         <section className="overflow-hidden rounded-2xl border border-[#eee7ee] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#f0eaf0] px-5 py-4 sm:px-6">
               <div>
                  <h2 className="text-sm font-bold text-[#171717]">Evaluaciones registradas</h2>
                  <p className="mt-1 text-xs text-[#9ca3af]">
                     {cargando ? 'Cargando...' : `${filteredData.length} ${filteredData.length === 1 ? 'resultado' : 'resultados'}`}
                  </p>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full min-w-[950px] text-left">
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
                           <td colSpan={7} className="px-6 py-16 text-center text-sm text-[#9ca3af]">Cargando evaluaciones...</td>
                        </tr>
                     )}

                     {!cargando && paginatedData.map(item => {
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
                                 <span className="inline-flex whitespace-nowrap rounded-lg bg-[#f5eaf5] px-2.5 py-1 text-[11px] font-semibold text-[#6e0b6c]">{item.programa}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <Link href={`/dashboard/menotest/${item.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#6b7280] transition hover:border-[#d7bdd6] hover:bg-[#f5eaf5] hover:text-[#6e0b6c]">
                                    <Eye size={17} />
                                 </Link>
                              </td>
                           </tr>
                        );
                     })}

                     {!cargando && paginatedData.length === 0 && (
                        <tr>
                           <td colSpan={7} className="px-6 py-16 text-center">
                              <div className="mx-auto max-w-sm">
                                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5eaf5] text-[#6e0b6c]">
                                    <ClipboardList size={21} />
                                 </div>
                                 <p className="mt-4 text-sm font-semibold text-[#171717]">No encontramos evaluaciones</p>
                                 <p className="mt-1 text-xs leading-5 text-[#9ca3af]">Prueba modificando la búsqueda o los filtros.</p>
                              </div>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>

            {!cargando && filteredData.length > 0 && (
               <div className="flex flex-col gap-3 border-t border-[#f0eaf0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="text-xs text-[#9ca3af]">
                     Mostrando {start + 1}–{Math.min(start + ITEMS_PER_PAGE, filteredData.length)} de {filteredData.length}
                  </p>

                  <div className="flex items-center gap-2">
                     <button type="button" disabled={currentPage === 1} onClick={() => setPage(c => Math.max(1, c - 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#6b7280] transition hover:bg-[#f5eaf5] hover:text-[#6e0b6c] disabled:cursor-not-allowed disabled:opacity-40">
                        <ChevronLeft size={17} />
                     </button>

                     {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                        <button key={n} type="button" onClick={() => setPage(n)} className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${currentPage === n ? 'bg-[#6e0b6c] text-white' : 'border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f5eaf5] hover:text-[#6e0b6c]'}`}>
                           {n}
                        </button>
                     ))}

                     <button type="button" disabled={currentPage === totalPages} onClick={() => setPage(c => Math.min(totalPages, c + 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#6b7280] transition hover:bg-[#f5eaf5] hover:text-[#6e0b6c] disabled:cursor-not-allowed disabled:opacity-40">
                        <ChevronRight size={17} />
                     </button>
                  </div>
               </div>
            )}

         </section>
      </div>
   );
}