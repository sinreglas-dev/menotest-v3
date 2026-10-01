'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {

   const [sidebarOpen, setSidebarOpen] = useState(false);
   const router = useRouter();

   useEffect(() => {
      fetch('/api/admin/kpis').then((res) => {
         if (res.status === 401) router.push('/login');
      });
   }, [router]);

   return (
      <div className="min-h-screen bg-[#fafafa]">

         <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

         <div className="min-h-screen lg:pl-[270px]">
            <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

            <main className="p-4 sm:p-6 lg:p-8">
               <div className="mx-auto max-w-[1600px]">{children}</div>
            </main>
         </div>

      </div>
   );
}