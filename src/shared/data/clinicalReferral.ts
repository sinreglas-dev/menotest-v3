// Evalúa las rutas clínicas especiales del programa Organon/Iztapalapa.
// Medicina General, Ginecología y Psicología se calculan de forma independiente
// y no modifican el score principal ni la etapa orientativa del MenoTest.

import type { Answer } from '@/types/menotest';

import {
   evaluatePsychologicalReferral,
   type PsychologicalReferralResult
} from '@/shared/data/psychologicalReferral';


// Medicina General
export interface GeneralMedicineReferralResult {
   score: number;
   requiresAttention: boolean;
   priority: boolean;
   triggeredByBreathing: boolean;
}


// Ginecología
export interface GynecologyReferralResult {
   requiresAttention: boolean;
   triggeredByTotalScore: boolean;
   triggeredByRescue: boolean;
   rescueSymptoms: string[];
}


// Ruta médica
export type MedicalRoute =
   | 'none'
   | 'general'
   | 'gynecology'
   | 'both';


// Resultado integral
export interface ClinicalReferralResult {
   generalMedicine: GeneralMedicineReferralResult;
   gynecology: GynecologyReferralResult;
   psychology: PsychologicalReferralResult;
   medicalRoute: MedicalRoute;
   requiresMedicalAttention: boolean;
}


// Preguntas de Medicina General
const GENERAL_MEDICINE_KEYS = [
   'palpitaciones',
   'mareo',
   'entumecimiento',
   'dolor_cabeza',
   'sensibilidad',
   'respiracion'
];


// Preguntas de rescate ginecológico
const GYNECOLOGY_RESCUE_KEYS = [
   'bochorno',
   'sudor',
   'resequedad',
   'incontinencia'
];


// Busca una respuesta por key
function getAnswerByKey(answers: Answer[], key: string): Answer | undefined {
   return answers.find(answer => answer.key === key);
}


// Medicina General
export function evaluateGeneralMedicineReferral(answers: Answer[]): GeneralMedicineReferralResult {

   const score = GENERAL_MEDICINE_KEYS.reduce((total, key) => {
      return total + (getAnswerByKey(answers, key)?.value ?? 0);
   }, 0);

   const breathingValue = getAnswerByKey(answers, 'respiracion')?.value ?? 0;
   const triggeredByBreathing = breathingValue === 3;

   const requiresAttention = score >= 4 || triggeredByBreathing;
   const priority = score >= 7 || triggeredByBreathing;

   return {
      score,
      requiresAttention,
      priority,
      triggeredByBreathing
   };
}


// Ginecología
export function evaluateGynecologyReferral(answers: Answer[], totalScore: number): GynecologyReferralResult {

   // Derivación directa por score total
   if (totalScore >= 29) {
      return {
         requiresAttention: true,
         triggeredByTotalScore: true,
         triggeredByRescue: false,
         rescueSymptoms: []
      };
   }

   const rescueAnswers = GYNECOLOGY_RESCUE_KEYS
      .map(key => getAnswerByKey(answers, key))
      .filter((answer): answer is Answer => Boolean(answer));

   const symptomsAtLeastTwo = rescueAnswers.filter(answer => answer.value >= 2);
   const symptomsAtThree = rescueAnswers.filter(answer => answer.value === 3);

   const triggeredByRescue = symptomsAtLeastTwo.length >= 2 && symptomsAtThree.length >= 1;

   return {
      requiresAttention: triggeredByRescue,
      triggeredByTotalScore: false,
      triggeredByRescue,
      rescueSymptoms: triggeredByRescue ? symptomsAtLeastTwo.map(answer => answer.key) : []
   };
}


// Ruta médica final
function getMedicalRoute(
   generalMedicine: GeneralMedicineReferralResult,
   gynecology: GynecologyReferralResult
): MedicalRoute {

   if (generalMedicine.requiresAttention && gynecology.requiresAttention) return 'both';
   if (generalMedicine.requiresAttention) return 'general';
   if (gynecology.requiresAttention) return 'gynecology';

   return 'none';
}


// Evaluación integral
export function evaluateClinicalReferral(answers: Answer[], totalScore: number): ClinicalReferralResult {

   const generalMedicine = evaluateGeneralMedicineReferral(answers);
   const gynecology = evaluateGynecologyReferral(answers, totalScore);
   const psychology = evaluatePsychologicalReferral(answers);

   const medicalRoute = getMedicalRoute(generalMedicine, gynecology);

   return {
      generalMedicine,
      gynecology,
      psychology,
      medicalRoute,
      requiresMedicalAttention: medicalRoute !== 'none'
   };
}