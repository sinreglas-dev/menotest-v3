// Centraliza la lógica de puntuación del MenoTest.
// Calcula score e intensidad de síntomas, edad, IMC y etapa orientativa
// a partir de las respuestas del cuestionario y los datos de la paciente.

import type { Answer } from '@/types/menotest';

// Configuración
export const TOTAL_SYMPTOMS = 25;
export const MAX_SCORE_PER_SYMPTOM = 3;
export const MAX_SYMPTOM_SCORE = TOTAL_SYMPTOMS * MAX_SCORE_PER_SYMPTOM;

// Etapas
export type MenopauseStage =
   | 'Premenopausia'
   | 'Perimenopausia'
   | 'Posmenopausia'
   | 'Histerectomía'
   | 'Menopausia temprana'
   | 'Aún no estás, pero es buena idea prepararte';

export interface StageResult {
   stage: MenopauseStage;
   work: number;
}

// Score menstrual
export const MENSTRUATION_SCORE_MAP: Record<string, number> = {
   regular: 0,
   irregular: 1,
   trh_sangrado: 2,
   stopped: 3,
   trh_detenida: 4,
   histerectomia_ovarios: 5,
   histerectomia_sin_ovarios: 6,
   medicamentos: 7,
   cancer: 8
};

// Umbral provisional heredado del proyecto anterior
export const MENOPAUSE_SCORE_THRESHOLD = 12;

// Score total de síntomas
export function calculateTotalScore(answers: Answer[]): number {
   return answers.reduce((total, answer) => total + answer.value, 0);
}

// Porcentaje de intensidad
export function calculateScorePercentage(score: number): number {

   if (score <= 0) return 0;

   const percentage = (score / MAX_SYMPTOM_SCORE) * 100;

   return Math.min(100, Math.round(percentage));
}

// Intensidad global orientativa
export type SymptomIntensity =
   | 'Sin síntomas relevantes'
   | 'Leve'
   | 'Moderada'
   | 'Alta';

export function getSymptomIntensity(score: number): SymptomIntensity {

   if (score === 0) return 'Sin síntomas relevantes';

   const percentage = calculateScorePercentage(score);

   if (percentage <= 25) return 'Leve';
   if (percentage <= 50) return 'Moderada';

   return 'Alta';
}

// Fecha de nacimiento
interface ParsedBirthDate {
   year: number;
   month: number;
   day: number;
}

function parseBirthDate(birthDate: string): ParsedBirthDate | null {

   const [year, month, day] = (birthDate ?? '').split('-').map(Number);

   if (!year || !month || !day) return null;

   return {
      year,
      month,
      day
   };
}

// Calcula edad
export function calculateAge(birthDate: string): number {
   const parsed = parseBirthDate(birthDate);
   if (!parsed) return 0;
   const today = new Date();
   let age = today.getFullYear() - parsed.year;
   const monthDifference = today.getMonth() + 1 - parsed.month;
   if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < parsed.day)) {
      age--;
   }
   return age;
}

// Formatea fecha
export function formatBirthDate(birthDate: string): string {
   const parsed = parseBirthDate(birthDate);
   if (!parsed) return birthDate ?? '';
   const localDate = new Date(parsed.year, parsed.month - 1, parsed.day);
   return localDate.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
   });
}

// Calcula IMC
export function calculateIMC(weightKg: number, heightMeters: number): number {
   if (
      !Number.isFinite(weightKg) ||
      !Number.isFinite(heightMeters) ||
      weightKg <= 0 ||
      heightMeters <= 0
   ) {
      return 0;
   }
   return weightKg / (heightMeters * heightMeters);
}

// Clasifica IMC
export function classifyIMC(imc: number): string {
   if (!Number.isFinite(imc) || imc <= 0) return 'No disponible';
   if (imc < 18.5) return 'Bajo peso';
   if (imc < 25) return 'Normal';
   if (imc < 30) return 'Sobrepeso';
   if (imc < 35) return 'Obesidad clase I';
   if (imc < 40) return 'Obesidad clase II';
   return 'Obesidad clase III';
}

// Etapa según respuesta menstrual
const STAGE_BY_ANSWER: Record<number, MenopauseStage> = {
   1: 'Perimenopausia',
   2: 'Perimenopausia',
   3: 'Posmenopausia',
   4: 'Perimenopausia',
   5: 'Histerectomía',
   6: 'Posmenopausia',
   7: 'Posmenopausia',
   8: 'Posmenopausia'
};

// Determina etapa orientativa
export function calculateStage(menstruationValue: string, age: number, totalScore: number): StageResult {
   const work = MENSTRUATION_SCORE_MAP[menstruationValue] ?? 0;
   // Histerectomía conservando ovarios
   if (work === 5) {
      return {
         stage: 'Histerectomía',
         work
      };
   }

   // Menores de 40 años
   if (age < 40) {
      if (totalScore < MENOPAUSE_SCORE_THRESHOLD) {
         return {
            stage: 'Aún no estás, pero es buena idea prepararte',
            work
         };
      }
      return {
         stage: 'Menopausia temprana',
         work
      };
   }

   // Menstruación regular
   if (work === 0) {
      return {
         stage: totalScore < MENOPAUSE_SCORE_THRESHOLD ? 'Premenopausia' : 'Perimenopausia',
         work
      };
   }

   // Resto de respuestas
   return {
      stage: STAGE_BY_ANSWER[work] ?? 'Perimenopausia',
      work
   };
}