// Define y analiza las relaciones entre síntomas y hábitos del MenoTest.
// Estas relaciones no representan causalidad ni modifican el score clínico;
// solo sirven para contextualizar y priorizar recomendaciones.

import type { Answer, HabitAnswer } from '@/types/menotest';

// Hábitos disponibles
export type HabitKey =
   | 'caffeine'
   | 'alcohol'
   | 'sleep'
   | 'stress'
   | 'physical_activity'
   | 'muscle_strength'
   | 'sedentary'
   | 'hydration'
   | 'fruit_vegetables'
   | 'nutrition'
   | 'screens_posture'
   | 'tobacco';

// Fuerza de relación
export type RelationStrength =
   | 'strong'
   | 'moderate';

export interface SymptomHabitRelation {
   habitId: HabitKey;
   strength: RelationStrength;
}

export interface RelevantSymptomHabitRelation {
   symptomKey: string;
   symptomValue: number;
   habitId: HabitKey;
   habitValue: number;
   strength: RelationStrength;
   priority: number;
}

// Relaciones síntoma ↔ hábito
export const SYMPTOM_HABIT_RELATIONS: Record<string, SymptomHabitRelation[]> = {

   // 1. Palpitaciones
   palpitaciones: [
      { habitId: 'caffeine', strength: 'strong' },
      { habitId: 'alcohol', strength: 'strong' },
      { habitId: 'sleep', strength: 'moderate' },
      { habitId: 'stress', strength: 'strong' }
   ],

   // 2. Nervios / tensión
   nervios: [
      { habitId: 'sleep', strength: 'strong' },
      { habitId: 'caffeine', strength: 'strong' },
      { habitId: 'physical_activity', strength: 'moderate' },
      { habitId: 'sedentary', strength: 'moderate' }
   ],

   // 3. Problemas de sueño
   dormir: [
      { habitId: 'screens_posture', strength: 'strong' },
      { habitId: 'sleep', strength: 'strong' },
      { habitId: 'caffeine', strength: 'strong' }
   ],

   // 4. Sensación de aceleración
   aceleracion: [
      { habitId: 'stress', strength: 'strong' },
      { habitId: 'caffeine', strength: 'strong' },
      { habitId: 'sleep', strength: 'strong' }
   ],

   // 5. Ansiedad / pánico
   ansiedad: [
      { habitId: 'alcohol', strength: 'moderate' },
      { habitId: 'sleep', strength: 'strong' },
      { habitId: 'stress', strength: 'strong' }
   ],

   // 6. Concentración
   concentracion: [
      { habitId: 'sleep', strength: 'strong' },
      { habitId: 'stress', strength: 'strong' }
   ],

   // 7. Energía
   energia: [
      { habitId: 'sleep', strength: 'strong' },
      { habitId: 'sedentary', strength: 'strong' },
      { habitId: 'physical_activity', strength: 'strong' },
      { habitId: 'stress', strength: 'moderate' },
      { habitId: 'hydration', strength: 'moderate' }
   ],

   // 8. Pérdida de interés
   interes: [
      { habitId: 'physical_activity', strength: 'moderate' },
      { habitId: 'stress', strength: 'moderate' }
   ],

   // 9. Tristeza
   tristeza: [
      { habitId: 'physical_activity', strength: 'moderate' },
      { habitId: 'sedentary', strength: 'moderate' },
      { habitId: 'stress', strength: 'strong' }
   ],

   // 10. Llanto
   llanto: [
      { habitId: 'stress', strength: 'strong' },
      { habitId: 'sleep', strength: 'strong' }
   ],

   // 11. Irritabilidad
   irritabilidad: [
      { habitId: 'sleep', strength: 'strong' },
      { habitId: 'caffeine', strength: 'moderate' },
      { habitId: 'stress', strength: 'strong' }
   ],

   // 12. Mareo
   mareo: [
      { habitId: 'hydration', strength: 'strong' },
      { habitId: 'sleep', strength: 'moderate' }
   ],

   // 13. Presión / opresión en cabeza
   presion: [
      { habitId: 'stress', strength: 'strong' }
   ],

   // 14. Entumecimiento
   entumecimiento: [
      { habitId: 'sedentary', strength: 'moderate' },
      { habitId: 'physical_activity', strength: 'moderate' }
   ],

   // 15. Dolor de cabeza
   dolor_cabeza: [
      { habitId: 'hydration', strength: 'strong' },
      { habitId: 'sleep', strength: 'strong' },
      { habitId: 'stress', strength: 'moderate' }
   ],

   // 16. Dolores musculares / articulaciones
   dolor_muscular: [
      { habitId: 'physical_activity', strength: 'strong' },
      { habitId: 'sedentary', strength: 'strong' },
      { habitId: 'sleep', strength: 'moderate' }
   ],

   // 17. Hormigueo / sensibilidad
   sensibilidad: [
      { habitId: 'sedentary', strength: 'moderate' },
      { habitId: 'physical_activity', strength: 'moderate' }
   ],

   // 18. Respiración / falta de aire
   respiracion: [
      { habitId: 'physical_activity', strength: 'moderate' },
      { habitId: 'stress', strength: 'strong' },
      { habitId: 'sedentary', strength: 'moderate' }
   ],

   // 19. Bochornos
   bochorno: [
      { habitId: 'caffeine', strength: 'strong' },
      { habitId: 'alcohol', strength: 'strong' },
      { habitId: 'sleep', strength: 'moderate' },
      { habitId: 'stress', strength: 'moderate' }
   ],

   // 20. Sudoración nocturna
   sudor: [
      { habitId: 'alcohol', strength: 'strong' },
      { habitId: 'sleep', strength: 'moderate' }
   ],

   // 21. Deseo sexual
   sexo: [
      { habitId: 'stress', strength: 'strong' },
      { habitId: 'sleep', strength: 'strong' }
   ],

   // 22. Resequedad vaginal
   resequedad: [],

   // 23. Incontinencia
   incontinencia: [
      { habitId: 'physical_activity', strength: 'moderate' },
      { habitId: 'caffeine', strength: 'moderate' }
   ],

   // 24. Niebla mental
   niebla_mental: [
      { habitId: 'sleep', strength: 'strong' },
      { habitId: 'stress', strength: 'moderate' },
      { habitId: 'hydration', strength: 'moderate' }
   ],

   // 25. Memoria
   memoria: [
      { habitId: 'sleep', strength: 'strong' },
      { habitId: 'stress', strength: 'strong' }
   ]
};


// Obtiene hábitos relacionados
export function getRelatedHabits(symptomKey: string): SymptomHabitRelation[] {
   return SYMPTOM_HABIT_RELATIONS[symptomKey] ?? [];
}

// Obtiene síntomas relacionados
export function getSymptomsForHabit(habitId: HabitKey): string[] {
   return Object.entries(SYMPTOM_HABIT_RELATIONS)
      .filter(([, relations]) => relations.some(relation => relation.habitId === habitId))
      .map(([symptomKey]) => symptomKey);
}

// Obtiene respuesta de hábito
export function getHabitAnswer(habitAnswers: HabitAnswer[], habitId: HabitKey): HabitAnswer | undefined {
   return habitAnswers.find(answer => answer.habitId === habitId);
}

// Calcula prioridad de relación
export function calculateRelationPriority(symptomValue: number, habitValue: number, strength: RelationStrength): number {
   const strengthMultiplier = strength === 'strong' ? 2 : 1;
   return symptomValue * habitValue * strengthMultiplier;
}

// Cruza síntomas con hábitos activos
export function analyzeSymptomHabitRelations(
   answers: Answer[],
   habitAnswers: HabitAnswer[]
): RelevantSymptomHabitRelation[] {
   const result: RelevantSymptomHabitRelation[] = [];
   answers.forEach(symptom => {
      if (symptom.value <= 0) return;
      const relations = getRelatedHabits(symptom.key);
      relations.forEach(relation => {
         const habitAnswer = getHabitAnswer(habitAnswers, relation.habitId);
         if (!habitAnswer) return;
         if (habitAnswer.value <= 0) return;
         result.push({
            symptomKey: symptom.key,
            symptomValue: symptom.value,
            habitId: relation.habitId,
            habitValue: habitAnswer.value,
            strength: relation.strength,
            priority: calculateRelationPriority(
               symptom.value,
               habitAnswer.value,
               relation.strength
            )
         });
      });
   });
   return result.sort((a, b) => b.priority - a.priority);
}

// Obtiene relaciones principales
export function getTopSymptomHabitRelations(
   relations: RelevantSymptomHabitRelation[],
   limit = 5
): RelevantSymptomHabitRelation[] {
   return relations.slice(0, limit);
}

// Obtiene hábitos relevantes únicos
export function getRelevantHabitIds(relations: RelevantSymptomHabitRelation[]): HabitKey[] {
   return Array.from(new Set(relations.map(relation => relation.habitId)));
}