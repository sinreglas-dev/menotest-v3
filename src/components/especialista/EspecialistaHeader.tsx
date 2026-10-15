'use client';

import Image from 'next/image';
import { LogOut, Stethoscope } from 'lucide-react';

interface Props {
   nombre?: string;
}

export default function EspecialistaHeader({ nombre = 'Especialista' }: Props) {
   const cerrarSesion = async () => {
      try {
         const respuesta = await fetch('/api/especialista/logout', { method: 'POST' });
         if (!respuesta.ok) throw new Error('No se pudo cerrar sesión');
         window.location.assign('/especialista/login');
      } catch {
         alert('No fue posible cerrar sesión. Inténtalo nuevamente.');
      }
   };

   return (
      <header className="border-b border-[#eee7ee] bg-white">
         <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <div className="flex items-center gap-4">
               <Image src="/assets/images/logo.webp" alt="Sin Reglas" width={125} height={45} className="h-auto w-[125px] object-contain" />
               <div className="hidden h-8 w-px bg-[#e5e7eb] sm:block" />
               <div className="hidden items-center gap-2 text-[#6e0b6c] sm:flex"><Stethoscope size={17} /><span className="text-sm font-bold">Portal de especialistas</span></div>
            </div>

            <div className="flex items-center gap-3">
               <div className="hidden text-right sm:block">
                  <p className="text-xs text-[#9ca3af]">Sesión de especialista</p>
                  <p className="text-sm font-semibold text-[#171717]">{nombre}</p>
               </div>
               <button type="button" onClick={cerrarSesion} className="inline-flex items-center gap-2 rounded-xl border border-[#eee7ee] px-3 py-2.5 text-xs font-semibold text-[#6b7280] transition hover:border-[#6e0b6c] hover:text-[#6e0b6c]"><LogOut size={16} /><span className="hidden sm:inline">Cerrar sesión</span></button>
            </div>
         </div>
      </header>
   );
}