'use client';

import { useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {

   const [sidebarOpen, setSidebarOpen] = useState(false);

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