// Evalúa respuestas psicológicas específicas para identificar si se requiere atención,
// sin modificar el score, la etapa ni el flujo general del MenoTest.

import type { Answer } from '@/types/menotest';

export interface PsychologicalReferralResult {
   requiresAttention: boolean;
   triggeredSymptoms: string[];
}

// Reglas de canalización psicológica
const PSYCHOLOGICAL_REFERRAL_RULES: Record<string, number> = {
   nervios: 3,
   llanto: 3,
   ansiedad: 2,
   interes: 2,
   tristeza: 2
};

// Evalúa respuestas bandera
export function evaluatePsychologicalReferral(answers: Answer[]): PsychologicalReferralResult {

   const triggeredSymptoms = answers
      .filter(answer => {

         const minimumValue = PSYCHOLOGICAL_REFERRAL_RULES[answer.key];

         if (minimumValue === undefined) return false;

         return answer.value >= minimumValue;

      })
      .map(answer => answer.key);


   return {
      requiresAttention: triggeredSymptoms.length > 0,
      triggeredSymptoms
   };
}

// Detecta programa Iztapalapa por pathname
export function isIztapalapaProgram(pathname: string): boolean {
   return pathname.toLowerCase().split('/').includes('iztapalapa');
}