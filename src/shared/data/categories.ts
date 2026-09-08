// Analiza las respuestas del test para identificar síntomas principales,
// categorías con mayor intensidad, puntaje obtenido y máximo posible por categoría.

import type { Answer, Question } from '@/types/menotest';

export interface SymptomAnalysis {
   questionId: number;
   key: string;
   category: string;
   question: string;
   value: number;
   optionId: string;
   intensity: 'Nada' | 'Poco' | 'Bastante' | 'Mucho';
}

export interface CategoryAnalysis {
   category: string;
   label: string;
   score: number;
   maxScore: number;
   percentage: number;
   symptomCount: number;
   activeSymptoms: number;
}

// Nombres visuales
export const CATEGORY_LABELS: Record<string, string> = {
   cardiovascular: 'Cardiovascular',
   emocional: 'Emocional',
   sueño: 'Sueño',
   cognitivo: 'Cognitivo',
   energia: 'Energía',
   neurologico: 'Neurológico',
   musculoesqueletico: 'Musculoesquelético',
   respiratorio: 'Respiratorio',
   vasomotor: 'Vasomotor',
   sexual: 'Salud sexual',
   genitourinario: 'Genitourinario'
};

// Intensidad de respuesta
export function getAnswerIntensity(value: number): SymptomAnalysis['intensity'] {

   switch (value) {
      case 1:
         return 'Poco';

      case 2:
         return 'Bastante';

      case 3:
         return 'Mucho';

      default:
         return 'Nada';
   }
}

// Analiza síntomas
export function analyzeSymptoms(answers: Answer[], questions: Question[]): SymptomAnalysis[] {

   return answers
      .map(answer => {

         const question = questions.find(item => item.id === answer.questionId);

         if (!question) return null;

         return {
            questionId: answer.questionId,
            key: answer.key,
            category: answer.category,
            question: question.question,
            value: answer.value,
            optionId: answer.optionId,
            intensity: getAnswerIntensity(answer.value)
         };

      })
      .filter((symptom): symptom is SymptomAnalysis => symptom !== null);
}

// Síntomas activos
export function getActiveSymptoms(symptoms: SymptomAnalysis[]): SymptomAnalysis[] {
   return symptoms.filter(symptom => symptom.value > 0);
}

// Síntomas principales
export function getTopSymptoms(symptoms: SymptomAnalysis[], limit = 5): SymptomAnalysis[] {
   return [...symptoms]
      .filter(symptom => symptom.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
}

// Analiza categorías
export function analyzeCategories(symptoms: SymptomAnalysis[]): CategoryAnalysis[] {

   const categories = new Map<string, CategoryAnalysis>();
   const maxPerSymptom = 3;

   symptoms.forEach(symptom => {

      const existing = categories.get(symptom.category);

      if (!existing) {

         categories.set(symptom.category, {
            category: symptom.category,
            label: CATEGORY_LABELS[symptom.category] ?? formatCategory(symptom.category),
            score: symptom.value,
            maxScore: maxPerSymptom,
            percentage: 0,
            symptomCount: 1,
            activeSymptoms: symptom.value > 0 ? 1 : 0
         });

         return;
      }

      existing.score += symptom.value;
      existing.maxScore += maxPerSymptom;
      existing.symptomCount += 1;

      if (symptom.value > 0) existing.activeSymptoms += 1;
   });

   // Calcula porcentaje real por categoría
   return Array.from(categories.values())
      .map(category => ({
         ...category,
         percentage: category.maxScore > 0 ? Math.round((category.score / category.maxScore) * 100) : 0
      }))
      .sort((a, b) => {
         if (b.percentage !== a.percentage) return b.percentage - a.percentage;
         return b.score - a.score;
      });
}

// Categorías activas
export function getActiveCategories(categories: CategoryAnalysis[]): CategoryAnalysis[] {
   return categories.filter(category => category.score > 0);
}

// Categorías principales
export function getTopCategories(categories: CategoryAnalysis[], limit = 3): CategoryAnalysis[] {
   return categories
      .filter(category => category.score > 0)
      .slice(0, limit);
}

// Formatea categoría
function formatCategory(category: string): string {
   return category.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}