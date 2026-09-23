'use client';

import { Menu } from 'lucide-react';

interface Props {
   onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: Props) {
   return (
      <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-[#eee7ee] bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">

         <div className="flex items-center gap-3">
            <button type="button" onClick={onMenuClick} aria-label="Abrir menú" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e7eb] text-[#6b7280] transition hover:bg-[#f5eaf5] hover:text-[#6e0b6c] lg:hidden">
               <Menu size={20} />
            </button>

            <div>
               <p className="text-sm font-bold text-[#171717] sm:text-base">Panel de administración</p>
               <p className="hidden text-xs text-[#9ca3af] sm:block">MenoTest · Sin Reglas</p>
            </div>
         </div>

         <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6e0b6c] text-sm font-bold text-white">A</div>

      </header>
   );
}