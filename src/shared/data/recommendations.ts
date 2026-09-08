// Gestiona las reglas de recomendación del MenoTest.
// Cruza síntomas, hábitos y reglas del JSON para generar recomendaciones por especialista,
// respetando relaciones vigentes, prioridad, deduplicación y límites por especialista.

import recommendationsJson from '@/data/recommendations.json';

import type { Answer, HabitAnswer } from '@/types/menotest';
import { getRelatedHabits, type HabitKey } from '@/shared/data/symptomHabitRelations';

// Especialistas
export type SpecialistKey =
   | 'menocoaching'
   | 'psychology'
   | 'exercise'
   | 'medical';

export const SPECIALIST_LABELS: Record<SpecialistKey, { name: string; specialty: string }> = {
   menocoaching: {
      name: 'Coach Sam Teuscher',
      specialty: 'Menocoaching'
   },
   psychology: {
      name: 'Psicóloga Fernanda Padilla',
      specialty: 'Psicología'
   },
   exercise: {
      name: 'Ana Jimena Ramírez',
      specialty: 'Ejercicio'
   },
   medical: {
      name: 'Dra. Marina Cardoso',
      specialty: 'Salud'
   }
};

// Textos disponibles
export interface RecommendationTexts {
   menocoaching?: string;
   psychology?: string;
   exercise?: string;
   medical?: string;
}

// Regla del JSON
export interface RecommendationRule {
   symptomKey: string;
   symptomValue: number;
   symptomResponse: string;
   relevance: number;
   sourceHabitQuestion: string;
   habitIds: string[];
   recommendations: RecommendationTexts;
}

// Datos del JSON
interface RecommendationData {
   version: number;
   rules: RecommendationRule[];
}

// Recomendación final
export interface SelectedRecommendation {
   id: string;
   specialist: SpecialistKey;
   specialistName: string;
   specialty: string;
   text: string;
   symptomKey: string;
   symptomValue: number;
   habitIds: string[];
   matchedHabitIds: string[];
   relevance: number;
   priority: number;
}

// Datos
const recommendationData = recommendationsJson as RecommendationData;

// Obtiene reglas
export function getRecommendationRules(): RecommendationRule[] {
   return recommendationData.rules ?? [];
}

// Hábitos vigentes relacionados con el síntoma
function getValidHabitIdsForSymptom(symptomKey: string): HabitKey[] {
   return getRelatedHabits(symptomKey).map(relation => relation.habitId);
}

// Busca respuesta de hábito
function findHabitAnswer(habitAnswers: HabitAnswer[], habitId: string): HabitAnswer | undefined {
   return habitAnswers.find(answer => answer.habitId === habitId);
}

// Obtiene hábitos que realmente activan la regla
function getMatchingHabitAnswers(rule: RecommendationRule, habitAnswers: HabitAnswer[]): HabitAnswer[] {

   const validHabitIds = getValidHabitIdsForSymptom(rule.symptomKey);

   const validRuleHabitIds = rule.habitIds.filter(habitId =>
      validHabitIds.includes(habitId as HabitKey)
   );

   return validRuleHabitIds
      .map(habitId => findHabitAnswer(habitAnswers, habitId))
      .filter((answer): answer is HabitAnswer => Boolean(answer && answer.value > 0));
}

// Calcula prioridad de ordenamiento
function calculatePriority(symptomValue: number, relevance: number, matchingHabits: HabitAnswer[]): number {

   const highestHabitValue = matchingHabits.reduce(
      (max, habit) => Math.max(max, habit.value),
      0
   );

   return symptomValue * Math.max(relevance, 1) * Math.max(highestHabitValue, 1);
}

// Busca reglas aplicables
export function getMatchingRecommendationRules(answers: Answer[], habitAnswers: HabitAnswer[]): RecommendationRule[] {

   return recommendationData.rules.filter(rule => {

      const symptomAnswer = answers.find(answer => answer.key === rule.symptomKey);

      if (!symptomAnswer) return false;
      if (symptomAnswer.value !== rule.symptomValue) return false;
      if (symptomAnswer.value <= 0) return false;

      const matchingHabits = getMatchingHabitAnswers(rule, habitAnswers);

      return matchingHabits.length > 0;
   });
}

// Genera recomendaciones por especialista
export function generateSpecialistRecommendations(answers: Answer[], habitAnswers: HabitAnswer[]): SelectedRecommendation[] {

   const matchingRules = getMatchingRecommendationRules(answers, habitAnswers);
   const result: SelectedRecommendation[] = [];

   matchingRules.forEach(rule => {

      const symptomAnswer = answers.find(answer => answer.key === rule.symptomKey);

      if (!symptomAnswer) return;

      const matchingHabits = getMatchingHabitAnswers(rule, habitAnswers);

      if (matchingHabits.length === 0) return;

      const matchedHabitIds = matchingHabits.map(habit => habit.habitId);

      const priority = calculatePriority(
         symptomAnswer.value,
         rule.relevance,
         matchingHabits
      );

      const specialists: SpecialistKey[] = [
         'menocoaching',
         'psychology',
         'exercise',
         'medical'
      ];

      specialists.forEach(specialist => {

         const text = rule.recommendations[specialist];

         if (!text || text.trim() === '') return;

         const specialistInfo = SPECIALIST_LABELS[specialist];

         result.push({
            id: [
               rule.symptomKey,
               rule.symptomValue,
               matchedHabitIds.join('-'),
               specialist
            ].join('__'),
            specialist,
            specialistName: specialistInfo.name,
            specialty: specialistInfo.specialty,
            text: text.trim(),
            symptomKey: rule.symptomKey,
            symptomValue: rule.symptomValue,
            habitIds: rule.habitIds,
            matchedHabitIds,
            relevance: rule.relevance,
            priority
         });

      });

   });

   return result.sort((a, b) => b.priority - a.priority);
}

// Elimina recomendaciones repetidas
export function removeDuplicateRecommendations(recommendations: SelectedRecommendation[]): SelectedRecommendation[] {

   const seen = new Set<string>();

   return recommendations.filter(recommendation => {

      const normalizedText = recommendation.text.trim().toLowerCase().replace(/\s+/g, ' ');

      const fingerprint = [
         recommendation.specialist,
         normalizedText
      ].join('__');

      if (seen.has(fingerprint)) return false;

      seen.add(fingerprint);

      return true;
   });
}

// Obtiene recomendaciones finales
export function getRecommendations(
   answers: Answer[],
   habitAnswers: HabitAnswer[],
   options?: {
      maxTotal?: number;
      maxPerSpecialist?: number;
   }
): SelectedRecommendation[] {

   const {
      maxTotal = 8,
      maxPerSpecialist = 2
   } = options ?? {};

   const generated = generateSpecialistRecommendations(answers, habitAnswers);
   const unique = removeDuplicateRecommendations(generated);

   const specialistCount = new Map<SpecialistKey, number>();

   const limited = unique.filter(recommendation => {

      const current = specialistCount.get(recommendation.specialist) ?? 0;

      if (current >= maxPerSpecialist) return false;

      specialistCount.set(recommendation.specialist, current + 1);

      return true;
   });

   return limited.slice(0, maxTotal);
}

// Agrupa recomendaciones por especialista
export function groupRecommendationsBySpecialist(
   recommendations: SelectedRecommendation[]
): Partial<Record<SpecialistKey, SelectedRecommendation[]>> {

   return recommendations.reduce<Partial<Record<SpecialistKey, SelectedRecommendation[]>>>(
      (groups, recommendation) => {

         const specialist = recommendation.specialist;

         if (!groups[specialist]) groups[specialist] = [];

         groups[specialist]!.push(recommendation);

         return groups;
      },
      {}
   );
}