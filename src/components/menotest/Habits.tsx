'use client';

import { Check } from 'lucide-react';

import type { HabitAnswer, HabitOption, HabitQuestion } from '@/types/menotest';

interface Props {
   habit: HabitQuestion;
   answer?: HabitAnswer;
   onAnswer: (option: HabitOption) => void;
}

export default function Habits({ habit, answer, onAnswer }: Props) {

   return (
      <div>

         {/* Categoría */}
         <div className="mb-2 inline-flex items-center rounded-full bg-[#f5eaf5] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#6e0b6c]">
            {formatCategory(habit.category)}
         </div>

         {/* Título */}
         <p className="mb-1 text-sm font-semibold text-[#8d2a8a]">
            Hábitos y estilo de vida
         </p>

         {/* Pregunta */}
         <h2 className="max-w-3xl text-xl font-bold leading-tight text-[#171717] sm:text-3xl">
            {habit.question}
         </h2>

         {/* Descripción */}
         <p className="mt-1 max-w-2xl text-sm  text-[#6b7280]">
            Selecciona la opción que mejor describa tus hábitos habituales.
         </p>

         {/* Opciones */}
         <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

            {habit.options.map(option => {

               const isSelected = answer?.optionId === option.id;

               return (
                  <button
                     key={option.id}
                     type="button"
                     onClick={() => onAnswer(option)}
                     className={`group relative flex min-h-[65px] items-center justify-between gap-4 rounded-2xl border px-2 py-2 text-left transition duration-200 ${isSelected ? 'border-[#6e0b6c] bg-[#f8f0f8] shadow-[0_10px_30px_rgba(110,11,108,.08)]' : 'border-[#e5e7eb] bg-white hover:-translate-y-0.5 hover:border-[#6e0b6c]/30 hover:bg-[#fcf9fc] hover:shadow-md'}`}
                  >

                     {/* Texto */}
                     <span className={`text-sm font-semibold leading-relaxed sm:text-base ${isSelected ? 'text-[#6e0b6c]' : 'text-[#171717]'}`}>
                        {option.label}
                     </span>

                     {/* Check */}
                     <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${isSelected ? 'border-[#6e0b6c] bg-[#6e0b6c] text-white' : 'border-[#d1d5db] bg-white text-transparent group-hover:border-[#6e0b6c]/40'}`}>
                        <Check size={16} strokeWidth={3} />
                     </div>

                  </button>
               );

            })}

         </div>

         {/* Nota */}
         <div className="mt-4 rounded-xl bg-[#faf7fa] px-2 py-2">
            <p className="text-xs leading-relaxed text-[#6b7280]">
               Esta información nos ayudará a contextualizar tus resultados y ofrecerte recomendaciones más relevantes para tu estilo de vida.
            </p>
         </div>

      </div>
   );
}

// Formatea la categoría
function formatCategory(category: string): string {
   return category
      .replaceAll('_', ' ')
      .replace(/\b\w/g, letter => letter.toUpperCase());
}