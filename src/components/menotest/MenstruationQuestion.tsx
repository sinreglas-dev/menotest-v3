'use client';

import { Check } from 'lucide-react';


export interface MenstruationOption {
   id: string;
   label: string;
   description?: string;
}

interface Props {
   value: string;
   onChange: (value: string) => void;
}


// Opciones
// const options: MenstruationOption[] = [
//    {
//       id: 'regular',
//       label: 'Tengo menstruaciones regulares',
//       description: 'Mi periodo continúa presentándose de forma regular.'
//    },
//    {
//       id: 'irregular',
//       label: 'Tengo menstruaciones irregulares',
//       description: 'He tenido uno o varios períodos en los últimos 12 meses.'
//    },
//    {
//       id: 'trh_sangrado',
//       label: 'Estoy tomando THR y hormonas (ej. anticonceptivos)',
//       description: 'Esto me prodcue sangrados irregulares.'
//    },
//    {
//       id: 'stopped',
//       label: 'Mi menstruación se ha detenido',
//       description: 'Ocurrio naturalmente hace más de 1 año.'
//    },
//    {
//       id: 'trh_detenida',
//       label: 'Estoy tomando THR y hormonas que detuvieron mi menstruación',
//       description: 'Ej. anticonceptivos orales, hormonas, implante o inyección hormonal.'
//    },
//    {
//       id: 'histerectomia_ovarios',
//       label: 'Tuve una histerectomía (extirpoación de útero)',
//       description: 'Pero conservo 1 o ambos ovarios.'
//    },
//    {
//       id: 'histerectomia_sin_ovarios',
//       label: 'Tuve una histerectomía (extirpoación de útero)',
//       description: 'Me removieronambos ovarios y estoy tomando TRH.'
//    },
//    {
//       id: 'medicamentos',
//       label: 'Mi menstruación se detuvo.',
//       description: 'Estoy tomando otros medicamentos para detener mi menstruación.'
//    },
//    {
//       id: 'cancer',
//       label: 'Mi menstruación cambió o se detuvo',
//       description: 'He recibido un tratamiento contra el cáncer que afectó mi menstruación.'
//    }
// ];
const options: MenstruationOption[] = [
   {
      id: 'regular',
      label: 'Tengo menstruaciones regulares',
      description: 'Mi periodo continúa presentándose de forma regular.'
   },
   {
      id: 'irregular',
      label: 'Tengo menstruaciones irregulares',
      description: 'He tenido uno o varios periodos en los últimos 12 meses.'
   },
   {
      id: 'trh_sangrado',
      label: 'Estoy tomando TRH y hormonas (ej. anticonceptivos)',
      description: 'Esto me produce sangrados irregulares.'
   },
   {
      id: 'stopped',
      label: 'Mi menstruación se ha detenido',
      description: 'Ocurrió naturalmente hace más de 1 año.'
   },
   {
      id: 'trh_detenida',
      label: 'Estoy tomando TRH y hormonas que detuvieron mi menstruación',
      description: 'Ej. anticonceptivos orales, hormonas, implante o inyección hormonal.'
   },
   {
      id: 'histerectomia_ovarios',
      label: 'Tuve una histerectomía (extirpación del útero)',
      description: 'Pero conservo uno o ambos ovarios.'
   },
   {
      id: 'histerectomia_sin_ovarios',
      label: 'Tuve una histerectomía (extirpación del útero)',
      description: 'Me removieron ambos ovarios y estoy tomando TRH.'
   },
   {
      id: 'medicamentos',
      label: 'Mi menstruación se detuvo',
      description: 'Estoy tomando otros medicamentos para detener mi menstruación.'
   },
   {
      id: 'cancer',
      label: 'Mi menstruación cambió o se detuvo',
      description: 'He recibido un tratamiento contra el cáncer que afectó mi menstruación.'
   }
];


export default function MenstruationQuestion({ value, onChange }: Props) {

   return (
      <div className="w-full">

         {/* Categoría */}
         <div className="mb-4">
            <span className="inline-flex items-center rounded-full bg-[#f5eaf5] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6e0b6c]">
               Contexto menstrual
            </span>
         </div>


         {/* Pregunta */}
         <div className="mb-2">

            <h2 className="text-xl font-semibold leading-tight tracking-tight text-[#171717] sm:text-3xl">
               ¿Cuál de las siguientes opciones describe mejor tu situación menstrual actual?
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b7280] sm:text-base">
               Selecciona la opción que más se acerque a tu situación actual. Esta información nos ayudará a contextualizar tus resultados.
            </p>

         </div>


         {/* Opciones */}
         <div className="space-y-1">

            {options.map(option => {

               const selected = value === option.id;

               return (
                  <button
                     key={option.id}
                     type="button"
                     onClick={() => onChange(option.id)}
                     className={`group flex w-full items-start justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-200 ${selected ? 'border-[#6e0b6c] bg-[#f8f1f8] shadow-[0_10px_25px_rgba(110,11,108,.08)]' : 'border-[#e5e7eb] bg-white hover:border-[#6e0b6c]/40 hover:bg-[#fcf9fc]'}`}
                  >

                     <div className="flex-1">

                        <p className={`font-semibold transition-colors ${selected ? 'text-[#6e0b6c]' : 'text-[#171717]'}`}>
                           {option.label}
                        </p>

                        {option.description && (
                           <p className="mt-1 text-sm leading-5 text-[#6b7280]">
                              {option.description}
                           </p>
                        )}

                     </div>


                     {/* Check */}
                     <span className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${selected ? 'border-[#6e0b6c] bg-[#6e0b6c] text-white' : 'border-[#d1d5db] bg-white text-transparent'}`}>
                        <Check size={15} strokeWidth={3} />
                     </span>

                  </button>
               );

            })}

         </div>

      </div>
   );
}