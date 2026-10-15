'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronLeft, ChevronRight, ClipboardList, Eye, Mail, Phone, Stethoscope, UserRound, X } from 'lucide-react';
import MenoTestFilters from '@/components/dashboard/MenoTestFilters';
import { Download } from 'lucide-react';
import { exportarEvaluacionesExcel } from '@/utils/exportarExcel';

interface Especialista {
   id: number;
   nombre: string;
   especialidad: string;
   correo: string;
   telefono: string;
}

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
   especialista_id?: number | null;
   especialista_nombre?: string | null;
}

const ITEMS_PER_PAGE = 8;

// Especialistas de ejemplo
const ESPECIALISTAS: Especialista[] = [
   { id: 1, nombre: 'Dra. Ana Martínez', especialidad: 'Ginecología', correo: 'ana@example.com', telefono: '5512345678' },
   { id: 2, nombre: 'Dra. Laura Hernández', especialidad: 'Psicología', correo: 'laura@example.com', telefono: '5512345679' },
   { id: 3, nombre: 'Dra. Sofía Ramírez', especialidad: 'Medicina General', correo: 'sofia@example.com', telefono: '5512345680' }
];

export default function MenoTestPage() {
   // Datos
   const [datos, setDatos] = useState<Evaluacion[]>([]);
   const [total, setTotal] = useState(0);
   const [cargando, setCargando] = useState(true);

   // Filtros
   const [search, setSearch] = useState('');
   const [program, setProgram] = useState('');
   const [stage, setStage] = useState('');
   const [page, setPage] = useState(1);

   // Modal especialista
   const [modalOpen, setModalOpen] = useState(false);
   const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<Evaluacion | null>(null);
   const [especialistaId, setEspecialistaId] = useState<number | null>(null);

   // Cargar evaluaciones
   useEffect(() => {
      const cargar = async () => {
         setCargando(true);

         try {
            const params = new URLSearchParams();
            params.set('pagina', '1');
            params.set('porPagina', '200');

            const res = await fetch(`/api/admin/evaluaciones?${params.toString()}`);
            if (!res.ok) throw new Error('No se pudieron cargar las evaluaciones');

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

   // Especialista seleccionado
   const especialistaSeleccionada = ESPECIALISTAS.find(item => item.id === especialistaId) ?? null;

   // Abrir modal
   const abrirModal = (evaluacion: Evaluacion) => {
      setEvaluacionSeleccionada(evaluacion);
      setEspecialistaId(evaluacion.especialista_id ?? null);
      setModalOpen(true);
   };

   // Cerrar modal
   const cerrarModal = () => {
      setModalOpen(false);
      setEvaluacionSeleccionada(null);
      setEspecialistaId(null);
   };

   // Asignar especialista
   const asignarEspecialista = () => {
      if (!evaluacionSeleccionada || !especialistaSeleccionada) return;

      setDatos(prev => prev.map(item =>
         item.id === evaluacionSeleccionada.id
            ? { ...item, especialista_id: especialistaSeleccionada.id, especialista_nombre: especialistaSeleccionada.nombre }
            : item
      ));

      cerrarModal();
   };

   // Filtrar evaluaciones
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

   // Paginación
   const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
   const currentPage = Math.min(page, totalPages);
   const start = (currentPage - 1) * ITEMS_PER_PAGE;
   const paginatedData = filteredData.slice(start, start + ITEMS_PER_PAGE);

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
               <p className="mt-1 text-xl font-bold text-[#171717]">{cargando ? '—' : total}</p>
            </div>
         </div>

         {/* Filtros */}
         <MenoTestFilters
            search={search}
            program={program}
            stage={stage}
            onSearchChange={v => { setSearch(v); setPage(1); }}
            onProgramChange={v => { setProgram(v); setPage(1); }}
            onStageChange={v => { setStage(v); setPage(1); }}
            onClear={() => { setSearch(''); setProgram(''); setStage(''); setPage(1); }}
         />

         {/* Tabla */}
         <section className="overflow-hidden rounded-2xl border border-[#eee7ee] bg-white shadow-sm">

            <div className="flex flex-col gap-4 border-b border-[#f0eaf0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
               <div>
                  <h2 className="text-sm font-bold text-[#171717]">Evaluaciones registradas</h2>
                  <p className="mt-1 text-xs text-[#9ca3af]">{cargando ? 'Cargando...' : `${filteredData.length} ${filteredData.length === 1 ? 'resultado' : 'resultados'}`}</p>
               </div>

               <button type="button" onClick={() => exportarEvaluacionesExcel(filteredData)} disabled={cargando || filteredData.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6e0b6c] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#570956] disabled:cursor-not-allowed disabled:opacity-50">
                  <Download size={16} />
                  Exportar a Excel
               </button>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full min-w-[1150px] text-left">
                  <thead>
                     <tr className="border-b border-[#f0eaf0] bg-[#fcfbfc]">
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Paciente</th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Etapa</th>
                        <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Puntaje</th>
                        <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">IMC</th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Fecha</th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Campaña</th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Especialista</th>
                        <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Acciones</th>
                     </tr>
                  </thead>

                  <tbody>
                     {cargando && (
                        <tr>
                           <td colSpan={8} className="px-6 py-16 text-center text-sm text-[#9ca3af]">Cargando evaluaciones...</td>
                        </tr>
                     )}

                     {!cargando && paginatedData.map(item => {
                        const nombreCompleto = `${item.nombre} ${item.apellido_paterno} ${item.apellido_materno ?? ''}`.trim();
                        const fecha = new Date(item.creado_en).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

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

                              {/* Especialista */}
                              <td className="px-4 py-4">
                                 {item.especialista_nombre ? (
                                    <div className="flex flex-col items-start gap-1.5">
                                       <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-[#197821]">
                                          <Check size={14} />
                                          {item.especialista_nombre}
                                       </span>
                                       <button type="button" onClick={() => abrirModal(item)} className="text-[11px] font-semibold text-[#6e0b6c] transition hover:underline">Cambiar especialista</button>
                                    </div>
                                 ) : (
                                    <button type="button" onClick={() => abrirModal(item)} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#e4d5e3] bg-[#f8f1f8] px-3 py-2 text-xs font-semibold text-[#6e0b6c] transition hover:border-[#6e0b6c] hover:bg-[#f5eaf5]">
                                       <Stethoscope size={14} />
                                       Asignar especialista
                                    </button>
                                 )}
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
                           <td colSpan={8} className="px-6 py-16 text-center">
                              <div className="mx-auto max-w-sm">
                                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5eaf5] text-[#6e0b6c]"><ClipboardList size={21} /></div>
                                 <p className="mt-4 text-sm font-semibold text-[#171717]">No encontramos evaluaciones</p>
                                 <p className="mt-1 text-xs leading-5 text-[#9ca3af]">Prueba modificando la búsqueda o los filtros.</p>
                              </div>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>

            {/* Paginación */}
            {!cargando && filteredData.length > 0 && (
               <div className="flex flex-col gap-3 border-t border-[#f0eaf0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="text-xs text-[#9ca3af]">Mostrando {start + 1}–{Math.min(start + ITEMS_PER_PAGE, filteredData.length)} de {filteredData.length}</p>

                  <div className="flex items-center gap-2">
                     <button type="button" disabled={currentPage === 1} onClick={() => setPage(c => Math.max(1, c - 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#6b7280] transition hover:bg-[#f5eaf5] hover:text-[#6e0b6c] disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={17} /></button>

                     {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                        <button key={n} type="button" onClick={() => setPage(n)} className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${currentPage === n ? 'bg-[#6e0b6c] text-white' : 'border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f5eaf5] hover:text-[#6e0b6c]'}`}>{n}</button>
                     ))}

                     <button type="button" disabled={currentPage === totalPages} onClick={() => setPage(c => Math.min(totalPages, c + 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#6b7280] transition hover:bg-[#f5eaf5] hover:text-[#6e0b6c] disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={17} /></button>
                  </div>
               </div>
            )}

         </section>

         {/* Modal especialista */}
         {modalOpen && evaluacionSeleccionada && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 py-6" onMouseDown={event => { if (event.target === event.currentTarget) cerrarModal(); }}>
               <div role="dialog" aria-modal="true" aria-labelledby="modal-especialista-title" className="w-full max-w-lg overflow-hidden rounded-[26px] bg-white shadow-2xl">

                  <div className="flex items-center justify-between border-b border-[#f0eaf0] px-6 py-5">
                     <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8d2a8a]">MenoTest</p>
                        <h3 id="modal-especialista-title" className="mt-1 text-lg font-bold text-[#171717]">Asignar especialista</h3>
                     </div>
                     <button type="button" onClick={cerrarModal} aria-label="Cerrar modal" className="flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f5eaf5] hover:text-[#6e0b6c]"><X size={20} /></button>
                  </div>

                  <div className="space-y-5 p-6">

                     {/* Paciente */}
                     <div className="rounded-xl bg-[#faf7fa] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8d2a8a]">Paciente</p>
                        <p className="mt-1 text-sm font-bold text-[#171717]">{`${evaluacionSeleccionada.nombre} ${evaluacionSeleccionada.apellido_paterno}`}</p>
                        <p className="mt-1 text-xs text-[#6b7280]">{evaluacionSeleccionada.correo}</p>
                     </div>

                     {/* Selector */}
                     <div>
                        <label htmlFor="especialista-select" className="mb-2 block text-sm font-semibold text-[#171717]">Selecciona una especialista</label>
                        <select id="especialista-select" value={especialistaId ?? ''} onChange={event => setEspecialistaId(event.target.value ? Number(event.target.value) : null)} className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#374151] outline-none transition focus:border-[#6e0b6c] focus:ring-2 focus:ring-[#f5eaf5]">
                           <option value="">Selecciona una opción</option>
                           {ESPECIALISTAS.map(especialista => <option key={especialista.id} value={especialista.id}>{especialista.nombre} — {especialista.especialidad}</option>)}
                        </select>
                     </div>

                     {/* Información especialista */}
                     {especialistaSeleccionada && (
                        <div className="rounded-2xl border border-[#eadfea] bg-[#fcf9fc] p-5">
                           <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5eaf5] text-[#6e0b6c]"><UserRound size={21} /></div>
                              <div>
                                 <p className="font-bold text-[#171717]">{especialistaSeleccionada.nombre}</p>
                                 <p className="text-xs font-medium text-[#8d2a8a]">{especialistaSeleccionada.especialidad}</p>
                              </div>
                           </div>
                           <div className="mt-4 space-y-3 border-t border-[#eadfea] pt-4">
                              <div className="flex items-center gap-2 text-sm text-[#6b7280]"><Mail size={16} className="shrink-0 text-[#6e0b6c]" /><span className="break-all">{especialistaSeleccionada.correo}</span></div>
                              <div className="flex items-center gap-2 text-sm text-[#6b7280]"><Phone size={16} className="shrink-0 text-[#6e0b6c]" /><span>{especialistaSeleccionada.telefono}</span></div>
                           </div>
                        </div>
                     )}

                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-[#f0eaf0] px-6 py-5 sm:flex-row sm:justify-end">
                     <button type="button" onClick={cerrarModal} className="rounded-full border border-[#e5e7eb] bg-white px-6 py-2.5 text-sm font-semibold text-[#6b7280] transition hover:bg-[#fafafa]">Cancelar</button>
                     <button type="button" onClick={asignarEspecialista} disabled={!especialistaSeleccionada} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6e0b6c] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#570956] disabled:cursor-not-allowed disabled:opacity-50">
                        <Check size={17} />
                        Asignar especialista
                     </button>
                  </div>

               </div>
            </div>
         )}

      </div>
   );
}