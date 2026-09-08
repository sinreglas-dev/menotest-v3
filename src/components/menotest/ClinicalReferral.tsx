'use client';

import { AlertTriangle, Check, Stethoscope } from 'lucide-react';

import type { ClinicalReferralResult } from '@/shared/data/clinicalReferral';


interface Props {
   referral: ClinicalReferralResult;
}


export default function ClinicalReferral({ referral }: Props) {

   const {
      generalMedicine,
      gynecology,
      psychology
   } = referral;


   return (
      <section className="mt-10">

         {/* Encabezado */}
         <div className="mb-6">

            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#f5eaf5] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#6e0b6c]">
               <Stethoscope size={15} />
               Orientación de atención
            </div>

            <h2 className="text-2xl font-bold text-[#171717] sm:text-3xl">
               ¿Qué tipo de valoración puede ser conveniente?
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#6b7280]">
               De acuerdo con tus respuestas, estas son las áreas de atención identificadas por el cuestionario.
            </p>

         </div>


         {/* Indicadores */}
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            <ReferralIndicator
               letter="M"
               title="Medicina General"
               active={generalMedicine.requiresAttention}
               priority={generalMedicine.priority}
            />

            <ReferralIndicator
               letter="G"
               title="Ginecología"
               active={gynecology.requiresAttention}
            />

            <ReferralIndicator
               letter="P"
               title="Psicología"
               active={psychology.requiresAttention}
            />

         </div>


         {/* Prioridad MG */}
         {generalMedicine.priority && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#ead7b2] bg-[#fffaf0] px-5 py-4">

               <AlertTriangle size={20} className="mt-0.5 shrink-0 text-[#8a5b00]" />

               <div>
                  <p className="font-semibold text-[#6b4700]">
                     Medicina General con prioridad
                  </p>

                  <p className="mt-1 text-sm leading-relaxed text-[#7a6540]">
                     Tus respuestas indican que la valoración de Medicina General debería realizarse primero dentro de la ruta médica.
                  </p>
               </div>

            </div>
         )}


         {/* Ruta doble */}
         {generalMedicine.requiresAttention && gynecology.requiresAttention && (
            <div className="mt-5 rounded-2xl bg-[#faf7fa] px-5 py-4">
               <p className="text-sm leading-relaxed text-[#555]">
                  Se identificaron criterios tanto para Medicina General como para Ginecología. Ambas valoraciones pueden ser convenientes.
               </p>
            </div>
         )}


         {/* Disclaimer */}
         <p className="mt-5 text-xs leading-relaxed text-[#8a8a8a]">
            Estos criterios son orientativos y operativos. No representan un diagnóstico médico ni sustituyen una valoración profesional.
         </p>

      </section>
   );
}


interface ReferralIndicatorProps {
   letter: string;
   title: string;
   active: boolean;
   priority?: boolean;
}


function ReferralIndicator({ letter, title, active, priority = false }: ReferralIndicatorProps) {

   return (
      <div className={`rounded-2xl border p-5 ${active ? 'border-[#6e0b6c]/25 bg-[#fbf7fb]' : 'border-[#e5e7eb] bg-white'}`}>

         <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

               <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${active ? 'bg-[#6e0b6c] text-white' : 'bg-[#f3f4f6] text-[#9ca3af]'}`}>
                  {letter}
               </div>

               <div>
                  <p className={`font-semibold ${active ? 'text-[#171717]' : 'text-[#6b7280]'}`}>
                     {title}
                  </p>

                  {priority && active && (
                     <p className="mt-0.5 text-xs font-semibold text-[#8a5b00]">
                        Prioridad
                     </p>
                  )}
               </div>

            </div>


            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${active ? 'bg-[#6e0b6c] text-white' : 'bg-[#f3f4f6] text-[#b8b8b8]'}`}>
               {active ? <Check size={17} strokeWidth={3} /> : '—'}
            </div>

         </div>

      </div>
   );
}