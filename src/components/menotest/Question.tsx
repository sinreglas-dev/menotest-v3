'use client';

import { Check } from 'lucide-react';

import type { Answer, MainOption, Question as QuestionType } from '@/types/menotest';


interface Props {
   question: QuestionType;
   mainOptions: MainOption[];
   answer?: Answer;
   onMainAnswer: (option: MainOption) => void;
}


export default function Question({ question, mainOptions, answer, onMainAnswer }: Props) {

   return (
      <div>

         {/* Categoría */}
         <div className="mb-5 inline-flex items-center rounded-full bg-[#f5eaf5] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#6e0b6c]">
            {question.category}
         </div>


         {/* Pregunta */}
         <h2 className="max-w-3xl text-xl font-bold leading-tight text-[#171717] sm:text-3xl">
            {question.question}
         </h2>

         <p className="mt-3 text-sm leading-relaxed text-[#6b7280]">
            Selecciona la opción que mejor describa cómo te has sentido últimamente.
         </p>


         {/* Opciones */}
         <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

            {mainOptions.map(option => {

               const isSelected = answer?.optionId === option.id;

               return (
                  <button
                     key={option.id}
                     type="button"
                     onClick={() => onMainAnswer(option)}
                     className={`group relative flex min-h-[65px] items-center justify-between gap-4 rounded-2xl border px-2 py-2 text-left transition duration-200 ${isSelected ? 'border-[#6e0b6c] bg-[#f8f0f8] shadow-[0_10px_30px_rgba(110,11,108,.08)]' : 'border-[#e5e7eb] bg-white hover:-translate-y-0.5 hover:border-[#6e0b6c]/30 hover:bg-[#fcf9fc] hover:shadow-md'}`}
                  >

                     <div>
                        <span className={`text-base font-semibold ${isSelected ? 'text-[#6e0b6c]' : 'text-[#171717]'}`}>
                           {option.label}
                        </span>

                        <p className="mt-1 text-xs text-[#9ca3af]">
                           {getOptionDescription(option.id)}
                        </p>
                     </div>


                     {/* Indicador */}
                     <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${isSelected ? 'border-[#6e0b6c] bg-[#6e0b6c] text-white' : 'border-[#d1d5db] bg-white text-transparent group-hover:border-[#6e0b6c]/40'}`}>
                        <Check size={16} strokeWidth={3} />
                     </div>

                  </button>
               );

            })}

         </div>

      </div>
   );
}


// Descripción visual de cada opción
function getOptionDescription(optionId: string): string {

   switch (optionId.toLowerCase()) {

      case 'nada':
         return 'No lo he experimentado.';

      case 'poco':
         return 'Lo he sentido de forma leve.';

      case 'bastante':
         return 'Lo he sentido con cierta frecuencia o intensidad.';

      case 'mucho':
         return 'Lo he sentido de forma frecuente o intensa.';

      default:
         return '';

   }
}