'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';

interface Props {
   search: string;
   status: string;
   program: string;
   stage: string;
   onSearchChange: (value: string) => void;
   onStatusChange: (value: string) => void;
   onProgramChange: (value: string) => void;
   onStageChange: (value: string) => void;
   onClear: () => void;
}

export default function MenoTestFilters({ search, status, program, stage, onSearchChange, onStatusChange, onProgramChange, onStageChange, onClear }: Props) {

   const hasFilters = search || status || program || stage;

   return (
      <section className="rounded-2xl border border-[#eee7ee] bg-white p-4 shadow-sm sm:p-5">

         <div className="flex flex-col gap-4 xl:flex-row xl:items-center">

            {/* Buscador */}
            <div className="relative flex-1">
               <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
               <input type="text" value={search} onChange={event => onSearchChange(event.target.value)} placeholder="Buscar por nombre o correo..." className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-white pl-11 pr-4 text-sm text-[#171717] outline-none transition placeholder:text-[#9ca3af] focus:border-[#6e0b6c] focus:ring-2 focus:ring-[#6e0b6c]/10" />
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:flex xl:shrink-0">

               <select value={status} onChange={event => onStatusChange(event.target.value)} className="h-11 min-w-[145px] rounded-xl border border-[#e5e7eb] bg-white px-3 text-sm text-[#6b7280] outline-none transition focus:border-[#6e0b6c]">
                  <option value="">Todos los estados</option>
                  <option value="Completo">Completo</option>
                  <option value="Incompleto">Incompleto</option>
               </select>

               <select value={program} onChange={event => onProgramChange(event.target.value)} className="h-11 min-w-[150px] rounded-xl border border-[#e5e7eb] bg-white px-3 text-sm text-[#6b7280] outline-none transition focus:border-[#6e0b6c]">
                  <option value="">Todas las campañas</option>
                  <option value="General">General</option>
                  <option value="Organon">Organon</option>
                  <option value="Reina Madre">Reina Madre</option>
                  <option value="FEMSA">FEMSA</option>
               </select>

               <select value={stage} onChange={event => onStageChange(event.target.value)} className="h-11 min-w-[175px] rounded-xl border border-[#e5e7eb] bg-white px-3 text-sm text-[#6b7280] outline-none transition focus:border-[#6e0b6c]">
                  <option value="">Todas las etapas</option>
                  <option value="Premenopausia">Premenopausia</option>
                  <option value="Transición menopáusica">Transición menopáusica</option>
                  <option value="Perimenopausia">Perimenopausia</option>
                  <option value="Posmenopausia">Posmenopausia</option>
                  <option value="En evaluación">En evaluación</option>
               </select>

            </div>

            {/* Limpiar */}
            {hasFilters && (
               <button type="button" onClick={onClear} className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] px-4 text-sm font-medium text-[#6b7280] transition hover:border-[#d7bdd6] hover:bg-[#f5eaf5] hover:text-[#6e0b6c]">
                  <X size={16} />
                  Limpiar
               </button>
            )}

         </div>

         <div className="mt-4 flex items-center gap-2 border-t border-[#f4f1f4] pt-4">
            <SlidersHorizontal size={15} className="text-[#9ca3af]" />
            <p className="text-xs text-[#9ca3af]">Utiliza los filtros para encontrar evaluaciones específicas.</p>
         </div>

      </section>
   );
}