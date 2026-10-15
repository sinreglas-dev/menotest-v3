'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ClipboardList, LoaderCircle, ShieldCheck, Stethoscope } from 'lucide-react';
import HistoriaClinicaForm from './HistoriaClinicaForm';

interface DatosHistoria {
   paciente: { nombre: string; apellido_paterno: string };
   especialista: { nombre: string; especialidad: string } | null;
   completada: boolean;
}

export default function HistoriaClinicaClient() {
   // const searchParams = useSearchParams();
   // const token = searchParams.get('token');
   const searchParams = useSearchParams();
   const token = searchParams.get('token');
   const demo = process.env.NODE_ENV === 'development' && searchParams.get('demo') === '1';
   const [datos, setDatos] = useState<DatosHistoria | null>(null);
   const [cargando, setCargando] = useState(true);
   const [error, setError] = useState('');

   useEffect(() => {
      if (demo) {
         setDatos({
            paciente: {
               nombre: 'María',
               apellido_paterno: 'González'
            },
            especialista: {
               nombre: 'Dra. Ana Martínez',
               especialidad: 'Ginecología'
            },
            completada: false
         });

         setCargando(false);
         return;
      }

      if (!token) {
         setError('El enlace de historia clínica no es válido.');
         setCargando(false);
         return;
      }

      const cargar = async () => {
         try {
            const respuesta = await fetch(`/api/historia-clinica?token=${encodeURIComponent(token)}`, { cache: 'no-store' });

            if (!respuesta.ok) throw new Error('El enlace no es válido o ha expirado.');

            const resultado = await respuesta.json();
            setDatos(resultado);
         } catch (error) {
            setError(error instanceof Error ? error.message : 'No fue posible cargar la información.');
         } finally {
            setCargando(false);
         }
      };

      cargar();
   }, [token, demo]);

   return (
      <main className="min-h-screen bg-[#faf7fa]">
         <header className="border-b border-[#eee7ee] bg-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5">
               <Image src="/assets/images/logo.webp" alt="Sin Reglas" width={100} height={40} className="h-auto w-[80px] object-contain" priority />
               <span className="hidden items-center gap-2 text-xs font-semibold text-[#6e0b6c] sm:inline-flex"><ShieldCheck size={17} />Información confidencial</span>
            </div>
         </header>

         <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
            <div className="mb-8 text-center">
               <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5eaf5] text-[#6e0b6c]"><ClipboardList size={27} /></div>
               <h1 className="text-2xl font-bold text-[#171717] sm:text-3xl">Tu historia clínica</h1>
               <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#6b7280]">Queremos conocerte mejor para brindarte una atención personalizada. Completa este formulario antes de tu consulta.</p>
            </div>

            {cargando && (
               <div className="rounded-2xl border border-[#eee7ee] bg-white p-12 text-center shadow-sm">
                  <LoaderCircle size={28} className="mx-auto animate-spin text-[#6e0b6c]" />
                  <p className="mt-4 text-sm text-[#6b7280]">Estamos preparando tu historia clínica...</p>
               </div>
            )}

            {!cargando && error && (
               <div role="alert" className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
                  <p className="text-base font-bold text-[#171717]">No pudimos abrir tu historia clínica</p>
                  <p className="mt-2 text-sm text-[#6b7280]">{error}</p>
                  <p className="mt-3 text-xs text-[#9ca3af]">Solicita un nuevo enlace al equipo de atención.</p>
               </div>
            )}

            {!cargando && datos?.completada && (
               <div className="rounded-2xl border border-[#eee7ee] bg-white p-8 text-center shadow-sm">
                  <ShieldCheck size={38} className="mx-auto text-[#6e0b6c]" />
                  <h2 className="mt-4 text-lg font-bold text-[#171717]">Tu historia clínica ya fue registrada</h2>
                  <p className="mt-2 text-sm text-[#6b7280]">Gracias por completar tu información. Tu especialista podrá revisarla antes de la consulta.</p>
               </div>
            )}

            {!cargando && datos && !datos.completada && (token || demo) && (
               <>
                  <div className="mb-6 rounded-2xl border border-[#eee7ee] bg-white p-6 shadow-sm">
                     <p className="text-xs font-semibold uppercase tracking-wider text-[#8d2a8a]">Información de tu consulta</p>
                     <h2 className="mt-2 text-xl font-bold text-[#171717]">Hola, {datos.paciente.nombre}</h2>
                     <p className="mt-1 text-sm text-[#6b7280]">Este formulario está asociado a tu evaluación MenoTest.</p>

                     {datos.especialista && (
                        <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#faf7fa] p-4">
                           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5eaf5] text-[#6e0b6c]"><Stethoscope size={20} /></div>
                           <div>
                              <p className="text-sm font-semibold text-[#171717]">{datos.especialista.nombre}</p>
                              <p className="text-xs text-[#6b7280]">{datos.especialista.especialidad}</p>
                           </div>
                        </div>
                     )}
                  </div>

                  <HistoriaClinicaForm token={token ?? 'DEMO'} nombrePaciente={datos.paciente.nombre} />
               </>
            )}
         </div>
      </main>
   );
}