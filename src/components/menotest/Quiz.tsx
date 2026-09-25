'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import QuestionComponent from './Question';
import ProgressBar from './ProgressBar';
import MenstruationQuestion from './MenstruationQuestion';
import Habits from './Habits';
import MenoTestHeader from './MenoTestHeader';

import type { Answer, HabitAnswer, HabitOption, MainOption, QuizResult, TestData } from '@/types/menotest';
import type { MenoTestProgram } from '@/shared/config/program';

interface Props {
  data: TestData;
  onFinish: (result: QuizResult) => void;
  onBack: () => void;
  program: MenoTestProgram;
}

type QuizStep = 'menstruation' | 'questions' | 'habits';

export default function Quiz({ data, onFinish, onBack, program }: Props) {

  // Etapa actual
  const [quizStep, setQuizStep] = useState<QuizStep>('menstruation');

  // Contexto menstrual
  const [menstruationValue, setMenstruationValue] = useState('');

  // Síntomas
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);

  // Hábitos
  const [currentHabitIndex, setCurrentHabitIndex] = useState(0);
  const [habitAnswers, setHabitAnswers] = useState<HabitAnswer[]>([]);

  // Pregunta actual
  const currentQuestion = data.questions[currentQuestionIndex];
  const totalQuestions = data.questions.length;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Hábito actual
  const currentHabit = data.habits[currentHabitIndex];
  const totalHabits = data.habits.length;
  const isFirstHabit = currentHabitIndex === 0;
  const isLastHabit = currentHabitIndex === totalHabits - 1;

  // Respuesta actual de hábito
  const currentHabitAnswer = useMemo(() => {
    if (quizStep !== 'habits') return undefined;
    return habitAnswers.find(answer => answer.habitId === currentHabit.id);
  }, [habitAnswers, currentHabit.id, quizStep]);

  // Respuesta actual de síntoma
  const currentAnswer = useMemo(() => {
    return answers.find(answer => answer.questionId === currentQuestion.id);
  }, [answers, currentQuestion.id]);

  const isCurrentQuestionComplete = Boolean(currentAnswer);

  // Responder síntoma
  const handleMainAnswer = (option: MainOption) => {

    setAnswers(previousAnswers => {

      const newAnswer: Answer = {
        questionId: currentQuestion.id,
        key: currentQuestion.key,
        category: currentQuestion.category,
        optionId: option.id,
        value: option.value
      };

      const exists = previousAnswers.some(answer => answer.questionId === currentQuestion.id);

      if (!exists) return [...previousAnswers, newAnswer];

      return previousAnswers.map(answer => answer.questionId === currentQuestion.id ? newAnswer : answer);
    });
  };

  // Responder hábito
  const handleHabitAnswer = (option: HabitOption) => {

    setHabitAnswers(previousAnswers => {

      const newAnswer: HabitAnswer = {
        habitId: currentHabit.id,
        category: currentHabit.category,
        optionId: option.id,
        value: option.value
      };

      const exists = previousAnswers.some(answer => answer.habitId === currentHabit.id);

      if (!exists) return [...previousAnswers, newAnswer];

      return previousAnswers.map(answer => answer.habitId === currentHabit.id ? newAnswer : answer);
    });
  };

  // Continúa después de menstruación
  const handleMenstruationNext = () => {
    if (!menstruationValue) return;

    setQuizStep('questions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Anterior
  const handlePrevious = () => {

    // Hábitos
    if (quizStep === 'habits') {

      if (isFirstHabit) {
        setQuizStep('questions');
        setCurrentQuestionIndex(totalQuestions - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      setCurrentHabitIndex(previous => previous - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Menstruación
    if (quizStep === 'menstruation') {
      onBack();
      return;
    }

    // Primera pregunta
    if (isFirstQuestion) {
      setQuizStep('menstruation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Pregunta anterior
    setCurrentQuestionIndex(previous => previous - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Siguiente pregunta
  const handleNext = () => {
    if (!isCurrentQuestionComplete) return;

    if (isLastQuestion) {
      setQuizStep('habits');
      setCurrentHabitIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentQuestionIndex(previous => previous + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Siguiente hábito
  const handleHabitNext = () => {
    if (!currentHabitAnswer) return;

    if (isLastHabit) {
      onFinish({ menstruationValue, answers, habitAnswers });
      return;
    }

    setCurrentHabitIndex(previous => previous + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Progreso de síntomas
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#fafafa]">

      {/* Fondos decorativos */}
      <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-[#6e0b6c]/10 blur-3xl" />
      <div className="absolute -right-40 bottom-10 h-[500px] w-[500px] rounded-full bg-[#8d2a8a]/10 blur-3xl" />

      {/* Header */}
      <div className="relative z-20">
        <MenoTestHeader program={program} />
      </div>

      {/* Contenido */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-5 lg:px-10 lg:pb-20">

        <div className="mx-auto w-full max-w-4xl">

          {/* Información superior */}
          <div className="mb-6">

            <div className="mb-3 flex items-end justify-between gap-4">

              <div>
                <span className="text-sm font-semibold text-[#6e0b6c]">Paso 2 de 3</span>

                <p className="mt-1 text-sm text-[#6b7280]">
                  {quizStep === 'menstruation'
                    ? 'Antes de comenzar, necesitamos conocer un poco más sobre ti.'
                    : quizStep === 'questions'
                      ? 'Responde según cómo te has sentido últimamente.'
                      : 'Ahora queremos conocer algunos aspectos de tus hábitos y estilo de vida.'}
                </p>
              </div>

              <div className="text-right">

                <span className="text-sm font-semibold text-[#171717]">
                  {quizStep === 'menstruation'
                    ? 'Antes de comenzar'
                    : quizStep === 'questions'
                      ? `Pregunta ${currentQuestionIndex + 1} de ${totalQuestions}`
                      : `Hábito ${currentHabitIndex + 1} de ${totalHabits}`}
                </span>

                {quizStep === 'questions' && (
                  <p className="mt-1 text-xs text-[#9ca3af]">{Math.round(progress)}% completado</p>
                )}

              </div>

            </div>

            {/* Barra de progreso */}
            {quizStep === 'questions' && (
              <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
            )}

            {quizStep === 'habits' && (
              <ProgressBar current={currentHabitIndex + 1} total={totalHabits} />
            )}

          </div>

          {/* Card principal */}
          <div className="rounded-[32px] border border-[#e9e4e9] bg-white/95 p-6 shadow-[0_30px_80px_rgba(110,11,108,.08)] backdrop-blur-xl sm:p-10">

            {/* Menstruación */}
            {quizStep === 'menstruation' && (
              <MenstruationQuestion value={menstruationValue} onChange={setMenstruationValue} />
            )}

            {/* Preguntas */}
            {quizStep === 'questions' && (
              <QuestionComponent
                question={currentQuestion}
                mainOptions={data.mainOptions}
                answer={currentAnswer}
                onMainAnswer={handleMainAnswer}
              />
            )}

            {/* Hábitos */}
            {quizStep === 'habits' && (
              <Habits
                habit={currentHabit}
                answer={currentHabitAnswer}
                onAnswer={handleHabitAnswer}
              />
            )}

            {/* Navegación */}
            <div className="mt-4 flex flex-col-reverse gap-3 border-t border-[#eee8ee] pt-4 sm:flex-row sm:items-center sm:justify-between">

              <button type="button" onClick={handlePrevious} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-6 py-3.5 text-sm font-semibold text-[#6b7280] transition hover:border-[#6e0b6c]/30 hover:bg-[#faf7fa] hover:text-[#6e0b6c]">
                <ArrowLeft size={18} />
                {quizStep === 'menstruation' ? 'Volver a mis datos' : 'Anterior'}
              </button>

              {quizStep === 'menstruation' ? (

                <button
                  type="button"
                  onClick={handleMenstruationNext}
                  disabled={!menstruationValue}
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#6e0b6c] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#6e0b6c]/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#570956] disabled:cursor-not-allowed disabled:bg-[#d8c4d7] disabled:text-white/80 disabled:opacity-60 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:bg-[#d8c4d7]"
                >
                  Comenzar evaluación
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1 group-disabled:translate-x-0" />
                </button>

              ) : quizStep === 'questions' ? (

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isCurrentQuestionComplete}
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#6e0b6c] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#6e0b6c]/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#570956] disabled:cursor-not-allowed disabled:bg-[#d8c4d7] disabled:text-white/80 disabled:opacity-60 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:bg-[#d8c4d7]"
                >
                  {isLastQuestion ? 'Continuar a hábitos' : 'Siguiente'}
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1 group-disabled:translate-x-0" />
                </button>

              ) : (

                <button
                  type="button"
                  onClick={handleHabitNext}
                  disabled={!currentHabitAnswer}
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#6e0b6c] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#6e0b6c]/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#570956] disabled:cursor-not-allowed disabled:bg-[#d8c4d7] disabled:text-white/80 disabled:opacity-60 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:bg-[#d8c4d7]"
                >
                  {isLastHabit ? 'Ver mis resultados' : 'Siguiente'}
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1 group-disabled:translate-x-0" />
                </button>

              )}

            </div>

            {/* Mensajes */}
            {quizStep === 'menstruation' && !menstruationValue && (
              <p className="mt-4 text-center text-xs text-[#9ca3af] sm:text-right">Selecciona una opción para continuar.</p>
            )}

            {quizStep === 'questions' && !isCurrentQuestionComplete && (
              <p className="mt-4 text-center text-xs text-[#9ca3af] sm:text-right">Selecciona una respuesta para continuar.</p>
            )}

            {quizStep === 'habits' && !currentHabitAnswer && (
              <p className="mt-4 text-center text-xs text-[#9ca3af] sm:text-right">Selecciona una opción para continuar.</p>
            )}

          </div>

        </div>

      </div>

    </section>
  );
}