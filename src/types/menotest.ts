// Define los tipos principales utilizados por el MenoTest:
// preguntas, respuestas, hábitos, configuración del JSON y resultado completo del quiz.

// Opciones de síntomas: Nada 0, Poco 1, Bastante 2, Mucho 3
export interface MainOption {
   id: string;
   label: string;
   value: number;
}

// Preguntas de síntomas
export interface Question {
   id: number;
   key: string;
   category: string;
   question: string;
}

// Respuesta de síntoma
export interface Answer {
   questionId: number;
   key: string;
   category: string;
   optionId: string;
   value: number;
}

// Opciones de hábitos
export interface HabitOption {
   id: string;
   label: string;
   value: number;
}

// Pregunta de hábito
export interface HabitQuestion {
   id: string;
   category: string;
   question: string;
   options: HabitOption[];
}

// Respuesta de hábito
export interface HabitAnswer {
   habitId: string;
   category: string;
   optionId: string;
   value: number;
}

// Resultado temporal
export interface TestResult {
   min: number;
   max: number;
   level: string;
   title: string;
   description: string;
   recommendation: string;
}

// JSON completo del MenoTest
export interface TestData {
   title: string;
   description: string;
   mainOptions: MainOption[];
   questions: Question[];
   habits: HabitQuestion[];
   results?: TestResult[];
}

// Resultado recolectado por el Quiz
export interface QuizResult {
   menstruationValue: string;
   answers: Answer[];
   habitAnswers: HabitAnswer[];
}