import { Suspense } from 'react';
import HistoriaClinicaClient from '@/components/historia-clinica/HistoriaClinicaClient';

export const metadata = {
   title: 'Historia clínica | MenoTest',
   description: 'Completa tu historia clínica antes de tu consulta con la especialista.'
};

export default function HistoriaClinicaPage() {
   return (
      <Suspense fallback={<FallbackCarga />}>
         <HistoriaClinicaClient />
      </Suspense>
   );
}

function FallbackCarga() {
   return (
      <main className="min-h-screen bg-[#faf7fa]">
         <div className="flex min-h-screen items-center justify-center">
            <p className="text-sm text-[#9ca3af]">Cargando historia clínica...</p>
         </div>
      </main>
   );
}