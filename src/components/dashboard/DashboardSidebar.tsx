'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ClipboardList, LayoutDashboard, LogOut, X } from 'lucide-react';

interface Props {
   open: boolean;
   onClose: () => void;
}

const MENU = [
   { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
   { label: 'MenoTest', href: '/dashboard/menotest', icon: ClipboardList }
];

export default function DashboardSidebar({ open, onClose }: Props) {

   const pathname = usePathname();
   const router = useRouter();

   // Navegación
   const isActive = (href: string) => href === '/dashboard' ? pathname === href : pathname.startsWith(href);

   // Logout temporal
   const handleLogout = () => {
      router.push('/login');
   };

   return (
      <>
         {/* Overlay móvil */}
         {open && <button type="button" aria-label="Cerrar menú" onClick={onClose} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden" />}

         {/* Sidebar */}
         <aside className={`fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col border-r border-[#eee7ee] bg-white transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>

            {/* Logo */}
            <div className="flex h-[82px] items-center justify-between border-b border-[#f0eaf0] px-6">
               <Link href="/dashboard" onClick={onClose} className="relative block h-[44px] w-[135px]">
                  <Image src="/assets/images/logo.webp" alt="Sin Reglas" fill priority sizes="135px" className="object-contain object-left" />
               </Link>

               <button type="button" onClick={onClose} aria-label="Cerrar menú" className="flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f5eaf5] hover:text-[#6e0b6c] lg:hidden">
                  <X size={20} />
               </button>
            </div>

            {/* Programa */}
            <div className="px-5 pt-6">
               <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a1a1aa]">Administración</p>
            </div>

            {/* Menú */}
            <nav className="mt-3 flex-1 space-y-1 px-4">
               {MENU.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                     <Link key={item.href} href={item.href} onClick={onClose} className={`flex h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition ${active ? 'bg-[#f5eaf5] text-[#6e0b6c]' : 'text-[#6b7280] hover:bg-[#faf7fa] hover:text-[#6e0b6c]'}`}>
                        <Icon size={19} strokeWidth={active ? 2.3 : 2} />
                        {item.label}
                     </Link>
                  );
               })}
            </nav>

            {/* Usuario */}
            <div className="border-t border-[#f0eaf0] p-4">
               <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#fafafa] p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6e0b6c] text-sm font-bold text-white">A</div>

                  <div className="min-w-0">
                     <p className="truncate text-sm font-semibold text-[#171717]">Administrador</p>
                     <p className="truncate text-[11px] text-[#9ca3af]">admin@sin-reglas.mx</p>
                  </div>
               </div>

               <button type="button" onClick={handleLogout} className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#6b7280] transition hover:bg-red-50 hover:text-red-600">
                  <LogOut size={18} />
                  Cerrar sesión
               </button>
            </div>

         </aside>
      </>
   );
}