'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import EvaluacionDetalleView from '@/components/shared/EvaluacionDetalleView';

export default function EspecialistaEvaluacionDetallePage() {
   const params = useParams();
   const id = Number(params.id);

   const [evaluation, setEvaluation] = useState<any>(null);
   const [cargando, setCargando] = useState(true);
   const [error, setError] = useState('');

   useEffect(() => {
      const cargar = async () => {
         setCargando(true);
         setError('');

         try {
            const res = await fetch(`/api/especialista/evaluaciones/${id}`, {
               credentials: 'same-origin',
               cache: 'no-store',
            });

            if (res.status === 401) {
               window.location.replace('/especialista/login');
               return;
            }

            if (res.status === 403) {
               setError('No tienes acceso a esta evaluación.');
               return;
            }

            if (!res.ok) throw new Error('No encontrada');

            setEvaluation(await res.json());
         } catch {
            setError('No pudimos cargar esta evaluación.');
         } finally {
            setCargando(false);
         }
      };

      if (Number.isInteger(id) && id > 0) cargar();
      else {
         setError('ID inválido');
         setCargando(false);
      }
   }, [id]);

   return (
      <div className="min-h-screen bg-[#fafafa]">
         <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
            {cargando && (
               <div className="py-20 text-center text-sm text-[#9ca3af]">Cargando evaluación...</div>
            )}

            {!cargando && error && (
               <div className="mx-auto max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
                  <p className="text-base font-bold text-[#171717]">No pudimos abrir la evaluación</p>
                  <p className="mt-2 text-sm text-[#6b7280]">{error}</p>
                  <Link
                     href="/especialista"
                     className="mt-5 inline-block rounded-xl bg-[#6e0b6c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#570956]"
                  >
                     Volver a mi dashboard
                  </Link>
               </div>
            )}

            {!cargando && evaluation && (
               <EvaluacionDetalleView
                  evaluation={evaluation}
                  volverHref="/especialista"
                  volverLabel="Volver a mi dashboard"
                  modoEspecialista
               />
            )}
         </div>
      </div>
   );
}