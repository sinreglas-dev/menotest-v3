'use client';

import { useState, useEffect } from 'react';

import Welcome from '@/components/menotest/Welcome';
import PatientForm, { PatientData } from '@/components/menotest/PatientForm';
import Quiz from '@/components/menotest/Quiz';
import Results from '@/components/menotest/Results';

import testDataJson from '@/data/menotest.json';

import {
  calculateTotalScore,
  calculateAge,
  calculateStage,
  calculateIMC,
  classifyIMC,
} from '@/shared/data/scoring';

import type { MenoTestProgram } from '@/shared/config/program';
import type { Answer, HabitAnswer, QuizResult, TestData } from '@/types/menotest';

// Datos del test
const testData = testDataJson as TestData;

// Pasos disponibles
type Step = 'welcome' | 'patient' | 'quiz' | 'results';
type EstadoBaseDatos = 'verificando' | 'activa' | 'error';

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

  // ID de la evaluación guardada en el servidor (para envío de reportes)
  const [evaluacionId, setEvaluacionId] = useState<number | null>(null);

  // Estado de la conexión a base de datos
  const [estadoBd, setEstadoBd] = useState<EstadoBaseDatos>('verificando');
  const [verificandoAlComenzar, setVerificandoAlComenzar] = useState(false);

  /**
   * Verifica si la base de datos está disponible consultando /api/salud.
   * Devuelve `true` si está activa, `false` si hay error.
   */
  const verificarBaseDatos = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/salud', { cache: 'no-store' });
      const activa = res.ok;
      setEstadoBd(activa ? 'activa' : 'error');
      return activa;
    } catch {
      setEstadoBd('error');
      return false;
    }
  };

  // Verificación silenciosa al cargar la página
  useEffect(() => {
    verificarBaseDatos();
  }, []);

  // Verificación bloqueante al dar clic en "Comenzar evaluación"
  const handleStart = async () => {
    setVerificandoAlComenzar(true);
    const activa = await verificarBaseDatos();
    setVerificandoAlComenzar(false);

    if (!activa) return; // se queda en welcome mostrando el aviso de error
    setStep('patient');
  };

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
        } else {
          // Guardamos el id que devuelve el endpoint para disparar el envío de reportes
          const data = await res.json();
          if (data?.ok && typeof data.evaluacionId === 'number') {
            setEvaluacionId(data.evaluacionId);
          }
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
    setEvaluacionId(null);
    setStep('welcome');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <main className="min-h-screen bg-[#fafafa]">

      {/* Banner de error de conexión a base de datos */}
      {step === 'welcome' && estadoBd === 'error' && (
        <div className="fixed left-0 right-0 top-0 z-50 bg-red-600 px-4 py-3 text-center text-sm font-medium text-white">
          No se pudo conectar con la base de datos. Verifica la configuración antes de continuar.
          <button
            onClick={verificarBaseDatos}
            className="ml-3 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Pantalla de bienvenida */}
      {step === 'welcome' && (
        <Welcome
          program={program}
          onStart={handleStart}
          cargando={verificandoAlComenzar}
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
          evaluacionId={evaluacionId}
          onRestart={restartTest}
        />
      )}

    </main>
  );
}