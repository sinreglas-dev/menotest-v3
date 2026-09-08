'use client';

import { useState } from 'react';

import Welcome from '@/components/menotest/Welcome';
import PatientForm, { PatientData } from '@/components/menotest/PatientForm';
import Quiz from '@/components/menotest/Quiz';
import Results from '@/components/menotest/Results';

import testDataJson from '@/data/menotest.json';

import { calculateTotalScore } from '@/shared/data/scoring';
import { calculateAge, calculateStage, calculateIMC, classifyIMC } from '@/shared/data/scoring'; 

import type { MenoTestProgram } from '@/shared/config/program';
import type {
  Answer,
  HabitAnswer,
  QuizResult,
  TestData
} from '@/types/menotest';

// Datos del test
const testData = testDataJson as TestData;

// Pasos disponibles
type Step = 'welcome' | 'patient' | 'quiz' | 'results';

interface Props {
  program: MenoTestProgram;
}

export default function MenoTestClient({ program }: Props) {

  // Paso actual
  const [step, setStep] = useState<Step>('welcome');

  // Datos del paciente
  const [patient, setPatient] = useState<PatientData | null>(null);

  // Contexto menstrual
  const [menstruationValue, setMenstruationValue] = useState('');

  // Respuestas de síntomas
  const [answers, setAnswers] = useState<Answer[]>([]);

  // Respuestas de hábitos
  const [habitAnswers, setHabitAnswers] = useState<HabitAnswer[]>([]);

  // Puntaje total de síntomas
  const [score, setScore] = useState(0);

  // Guarda los datos del paciente e inicia el test
  const handlePatient = (data: PatientData) => {
    setPatient(data);
    setStep('quiz');
  };

  // Procesa las respuestas al terminar el test
  const handleFinishTest = async (quizResult: QuizResult) => {
    const {
      menstruationValue: selectedMenstruationValue,
      answers: testAnswers,
      habitAnswers: testHabitAnswers,
    } = quizResult;

    // Guarda las respuestas en el estado local
    setMenstruationValue(selectedMenstruationValue);
    setAnswers(testAnswers);
    setHabitAnswers(testHabitAnswers);

    // Calcula el puntaje de síntomas
    const total = calculateTotalScore(testAnswers);
    setScore(total);

    // Cálculos adicionales (si el paciente existe)
    if (patient) {
      const edad = calculateAge(
        patient.birthYear + '-' + patient.birthMonth + '-' + patient.birthDay
      );
      const { stage } = calculateStage(selectedMenstruationValue, edad, total);
      const imcValor = calculateIMC(Number(patient.weight), Number(patient.height) / 100);
      const imcClasif = classifyIMC(imcValor);

      // Guardado en segundo plano — no bloquea la vista de resultados
      try {
        const res = await fetch('/api/evaluacion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            programa: program,
            paciente: patient,
            valorMenstruacion: selectedMenstruationValue,
            respuestas: testAnswers,
            respuestasHabitos: testHabitAnswers,
            puntajeTotal: total,
            etapa: stage,
            imc: Math.round(imcValor * 100) / 100,
            imcClasificacion: imcClasif,
          }),
        });
        if (!res.ok) {
          console.error('No se pudo guardar la evaluación en el servidor.');
        }
      } catch (error) {
        console.error('Error de red al guardar la evaluación:', error);
      }
    }

    // Muestra los resultados (después de iniciar el guardado)
    setStep('results');
  };

  // Regresa al formulario del paciente
  const handleBackToPatient = () => {
    setStep('patient');
  };

  // Reinicia toda la evaluación
  const restartTest = () => {
    setPatient(null);
    setMenstruationValue('');
    setAnswers([]);
    setHabitAnswers([]);
    setScore(0);
    setStep('welcome');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <main className="min-h-screen bg-[#fafafa]">

      {/* Pantalla de bienvenida */}
      {step === 'welcome' && (
        <Welcome
          program={program}
          onStart={() => setStep('patient')}
        />
      )}

      {/* Formulario de datos personales */}
      {step === 'patient' && (
        <PatientForm
          program={program}
          onSubmit={handlePatient}
          onBack={() => setStep('welcome')}
        />
      )}

      {/* Evaluación */}
      {step === 'quiz' && (
        <Quiz
          data={testData}
          program={program}
          onFinish={handleFinishTest}
          onBack={handleBackToPatient}
        />
      )}

      {/* Resultados finales */}
      {step === 'results' && patient && (
        <Results
          patient={patient}
          menstruationValue={menstruationValue}
          answers={answers}
          habitAnswers={habitAnswers}
          questions={testData.questions}
          score={score}
          program={program}
          onRestart={restartTest}
        />
      )}

    </main>
  );
}