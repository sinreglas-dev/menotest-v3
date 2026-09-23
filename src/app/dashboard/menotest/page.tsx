'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ClipboardList, Eye } from 'lucide-react';
import MenoTestFilters from '@/components/dashboard/MenoTestFilters';

const DATA = [
   { id: 1284, patient: 'María González López', email: 'maria.gonzalez@email.com', stage: 'Transición menopáusica', score: 38, imc: '24.6', status: 'Completo', date: '22 Sep 2026', program: 'Organon' },
   { id: 1283, patient: 'Ana Martínez Ruiz', email: 'ana.martinez@email.com', stage: 'Posmenopausia', score: 44, imc: '27.2', status: 'Completo', date: '22 Sep 2026', program: 'Reina Madre' },
   { id: 1282, patient: 'Laura Hernández', email: 'laura.h@email.com', stage: 'En evaluación', score: null, imc: '22.8', status: 'Incompleto', date: '21 Sep 2026', program: 'General' },
   { id: 1281, patient: 'Patricia Ramírez', email: 'patricia.r@email.com', stage: 'Perimenopausia', score: 29, imc: '25.1', status: 'Completo', date: '21 Sep 2026', program: 'FEMSA' },
   { id: 1280, patient: 'Sofía Torres', email: 'sofia.t@email.com', stage: 'En evaluación', score: null, imc: '23.4', status: 'Incompleto', date: '20 Sep 2026', program: 'Organon' },
   { id: 1279, patient: 'Claudia Mendoza', email: 'claudia.m@email.com', stage: 'Premenopausia', score: 18, imc: '21.9', status: 'Completo', date: '20 Sep 2026', program: 'General' },
   { id: 1278, patient: 'Gabriela Flores', email: 'gabriela.f@email.com', stage: 'Posmenopausia', score: 51, imc: '28.4', status: 'Completo', date: '19 Sep 2026', program: 'Organon' },
   { id: 1277, patient: 'Daniela Vargas', email: 'daniela.v@email.com', stage: 'Transición menopáusica', score: 34, imc: '24.2', status: 'Completo', date: '19 Sep 2026', program: 'FEMSA' },
   { id: 1276, patient: 'Alejandra Castillo', email: 'alejandra.c@email.com', stage: 'En evaluación', score: null, imc: '26.3', status: 'Incompleto', date: '18 Sep 2026', program: 'Reina Madre' },
   { id: 1275, patient: 'Fernanda Sánchez', email: 'fernanda.s@email.com', stage: 'Perimenopausia', score: 41, imc: '25.7', status: 'Completo', date: '18 Sep 2026', program: 'General' },
   { id: 1274, patient: 'Mónica Rodríguez', email: 'monica.r@email.com', stage: 'Posmenopausia', score: 47, imc: '23.8', status: 'Completo', date: '17 Sep 2026', program: 'Organon' },
   { id: 1273, patient: 'Carolina Reyes', email: 'carolina.r@email.com', stage: 'Premenopausia', score: 22, imc: '22.5', status: 'Completo', date: '17 Sep 2026', program: 'FEMSA' }
];

const ITEMS_PER_PAGE = 8;

export default function MenoTestPage() {

   // Filtros
   const [search, setSearch] = useState('');
   const [status, setStatus] = useState('');
   const [program, setProgram] = useState('');
   const [stage, setStage] = useState('');
   const [page, setPage] = useState(1);

   // Resultados filtrados
   const filteredData = useMemo(() => {
      const term = search.toLowerCase().trim();

      return DATA.filter(item => {
         const matchesSearch = !term || item.patient.toLowerCase().includes(term) || item.email.toLowerCase().includes(term);
         const matchesStatus = !status || item.status === status;
         const matchesProgram = !program || item.program === program;
         const matchesStage = !stage || item.stage === stage;

         return matchesSearch && matchesStatus && matchesProgram && matchesStage;
      });
   }, [search, status, program, stage]);

   // Paginación
   const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
   const currentPage = Math.min(page, totalPages);
   const start = (currentPage - 1) * ITEMS_PER_PAGE;
   const paginatedData = filteredData.slice(start, start + ITEMS_PER_PAGE);

   const changeSearch = (value: string) => {
      setSearch(value);
      setPage(1);
   };

   const changeStatus = (value: string) => {
      setStatus(value);
      setPage(1);
   };

   const changeProgram = (value: string) => {
      setProgram(value);
      setPage(1);
   };

   const changeStage = (value: string) => {
      setStage(value);
      setPage(1);
   };

   const clearFilters = () => {
      setSearch('');
      setStatus('');
      setProgram('');
      setStage('');
      setPage(1);
   };

   return (
      <div className="space-y-6">

         {/* Encabezado */}
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
               <p className="mt-1 text-xl font-bold text-[#171717]">{DATA.length}</p>
            </div>
         </div>

         {/* Filtros */}
         <MenoTestFilters search={search} status={status} program={program} stage={stage} onSearchChange={changeSearch} onStatusChange={changeStatus} onProgramChange={changeProgram} onStageChange={changeStage} onClear={clearFilters} />

         {/* Tabla */}
         <section className="overflow-hidden rounded-2xl border border-[#eee7ee] bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-[#f0eaf0] px-5 py-4 sm:px-6">
               <div>
                  <h2 className="text-sm font-bold text-[#171717]">Evaluaciones registradas</h2>
                  <p className="mt-1 text-xs text-[#9ca3af]">{filteredData.length} {filteredData.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}</p>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full min-w-[1050px] text-left">

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
                     {paginatedData.map(item => (
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
                              <span className="inline-flex whitespace-nowrap rounded-lg bg-[#f5eaf5] px-2.5 py-1 text-[11px] font-semibold text-[#6e0b6c]">{item.program}</span>
                           </td>

                           <td className="px-6 py-4 text-right">
                              <Link href={`/dashboard/menotest/${item.id}`} aria-label={`Ver evaluación de ${item.patient}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#6b7280] transition hover:border-[#d7bdd6] hover:bg-[#f5eaf5] hover:text-[#6e0b6c]">
                                 <Eye size={17} />
                              </Link>
                           </td>

                        </tr>
                     ))}

                     {paginatedData.length === 0 && (
                        <tr>
                           <td colSpan={8} className="px-6 py-16 text-center">
                              <SearchEmpty />
                           </td>
                        </tr>
                     )}
                  </tbody>

               </table>
            </div>

            {/* Paginación */}
            {filteredData.length > 0 && (
               <div className="flex flex-col gap-3 border-t border-[#f0eaf0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                  <p className="text-xs text-[#9ca3af]">Mostrando {start + 1}–{Math.min(start + ITEMS_PER_PAGE, filteredData.length)} de {filteredData.length}</p>

                  <div className="flex items-center gap-2">
                     <button type="button" disabled={currentPage === 1} onClick={() => setPage(current => Math.max(1, current - 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#6b7280] transition hover:bg-[#f5eaf5] hover:text-[#6e0b6c] disabled:cursor-not-allowed disabled:opacity-40">
                        <ChevronLeft size={17} />
                     </button>

                     {Array.from({ length: totalPages }, (_, index) => index + 1).map(number => (
                        <button key={number} type="button" onClick={() => setPage(number)} className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${currentPage === number ? 'bg-[#6e0b6c] text-white' : 'border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f5eaf5] hover:text-[#6e0b6c]'}`}>{number}</button>
                     ))}

                     <button type="button" disabled={currentPage === totalPages} onClick={() => setPage(current => Math.min(totalPages, current + 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#6b7280] transition hover:bg-[#f5eaf5] hover:text-[#6e0b6c] disabled:cursor-not-allowed disabled:opacity-40">
                        <ChevronRight size={17} />
                     </button>
                  </div>

               </div>
            )}

         </section>

      </div>
   );
}

function SearchEmpty() {
   return (
      <div className="mx-auto max-w-sm">
         <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5eaf5] text-[#6e0b6c]">
            <ClipboardList size={21} />
         </div>
         <p className="mt-4 text-sm font-semibold text-[#171717]">No encontramos evaluaciones</p>
         <p className="mt-1 text-xs leading-5 text-[#9ca3af]">Prueba modificando la búsqueda o los filtros seleccionados.</p>
      </div>
   );
}