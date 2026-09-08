'use client';

import { useRef, useState, type ReactNode } from 'react';
import { Activity, Brain, Check, CircleGauge, Copy, Download, Dumbbell, HeartPulse, RotateCcw, Sparkles, Stethoscope, UserRound, Wind } from 'lucide-react';
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';

import MenoTestHeader from './MenoTestHeader';
import MedicalReport from './MedicalReport';

import type { Answer, HabitAnswer, Question } from '@/types/menotest';
import type { PatientData } from '@/components/menotest/PatientForm';
import type { MenoTestProgram } from '@/shared/config/program';

import { evaluateClinicalReferral } from '@/shared/data/clinicalReferral';
import { analyzeSymptoms, getTopSymptoms } from '@/shared/data/categories';
import { calculateAge, calculateIMC, calculateStage, classifyIMC } from '@/shared/data/scoring';
import { getRecommendations, groupRecommendationsBySpecialist, type SpecialistKey } from '@/shared/data/recommendations';


interface Props {
  patient: PatientData;
  menstruationValue: string;
  answers: Answer[];
  habitAnswers: HabitAnswer[];
  questions: Question[];
  score: number;
  program: MenoTestProgram;
  onRestart: () => void;
}


// Hábitos
const HABIT_LABELS: Record<string, string> = {
  caffeine: 'Cafeína',
  alcohol: 'Alcohol',
  sleep: 'Descanso',
  stress: 'Estrés',
  physical_activity: 'Actividad física',
  muscle_strength: 'Fortalecimiento muscular',
  sedentary: 'Tiempo sedentario',
  hydration: 'Hidratación',
  fruit_vegetables: 'Frutas y verduras',
  nutrition: 'Ultraprocesados',
  screens_posture: 'Pantallas antes de dormir',
  tobacco: 'Tabaco'
};


// Nombres amigables de síntomas
const SYMPTOM_LABELS: Record<string, string> = {
  palpitaciones: 'Palpitaciones',
  nervios: 'Tensión o nerviosismo',
  dormir: 'Dificultad para descansar',
  aceleracion: 'Sensación de aceleración',
  ansiedad: 'Ansiedad',
  concentracion: 'Dificultad para concentrarse',
  energia: 'Falta de energía',
  interes: 'Disminución del interés',
  tristeza: 'Tristeza',
  llanto: 'Llanto',
  irritabilidad: 'Irritabilidad',
  mareo: 'Mareo',
  presion: 'Sensación de presión',
  entumecimiento: 'Entumecimiento',
  dolor_cabeza: 'Dolor de cabeza',
  dolor_muscular: 'Dolor muscular o articular',
  sensibilidad: 'Alteraciones de sensibilidad',
  respiracion: 'Dificultad para respirar',
  bochorno: 'Bochornos',
  sudor: 'Sudoración nocturna',
  sexo: 'Cambios en el deseo sexual',
  resequedad: 'Resequedad vaginal',
  incontinencia: 'Incontinencia',
  niebla_mental: 'Niebla mental',
  memoria: 'Dificultades de memoria'
};


// Especialistas
const SPECIALIST_CONFIG: Record<SpecialistKey, { icon: typeof Sparkles; order: number }> = {
  menocoaching: { icon: Sparkles, order: 1 },
  psychology: { icon: Brain, order: 2 },
  exercise: { icon: Dumbbell, order: 3 },
  medical: { icon: Stethoscope, order: 4 }
};


interface StageContent {
  title: string;
  content: ReactNode;
}


// Contenido por etapa
function getStageContent(stage: string, firstName: string): StageContent {

  const normalizedStage = stage.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');


  // Menopausia precoz / prematura
  if (normalizedStage.includes('precoz') || normalizedStage.includes('prematura')) {
    return {
      title: 'Probablemente estés en la menopausia precoz o prematura',
      content: (
        <div className="space-y-4 text-sm leading-7 text-[#4b5563] sm:text-base">
          <p>¡Hola <strong>{firstName}</strong>!</p>
          <p>La menopausia prematura puede ser causada por una insuficiencia ovárica prematura, que ocurre cuando los ovarios no producen los niveles normales de hormonas reproductivas. Esto puede deberse a factores genéticos, enfermedades autoinmunes u otras causas desconocidas.</p>
          <p>Además, existen otros factores que dañan los ovarios o impiden que el cuerpo produzca estrógeno, como tratamientos contra el cáncer, cirugía para extirpar los ovarios o el útero, quimioterapia y radioterapia.</p>
          <p>La terapia con estrógeno es una opción utilizada para evitar ciertas complicaciones relacionadas con osteoporosis y enfermedades cardiovasculares, entre otras. Te recomendamos conversar con tu doctora sobre los riesgos y beneficios de esta terapia en tu caso particular.</p>
        </div>
      )
    };
  }


  // Histerectomía
  if (normalizedStage.includes('histerect')) {
    return {
      title: 'Te hicieron la histerectomía y aún conservas uno o dos ovarios',
      content: (
        <div className="space-y-4 text-sm leading-7 text-[#4b5563] sm:text-base">
          <p>¡Hola <strong>{firstName}</strong>!</p>
          <p>Este procedimiento no te hace entrar directo a la menopausia. Para saber exactamente en qué momento estás, te recomendamos consultar con tu doctora.</p>

          <div className="rounded-2xl bg-[#faf7fa] p-5">
            <p className="font-bold text-[#171717]">¿Qué tienes que saber?</p>
            <p className="mt-2">Ya no menstruas, pero al tener uno o ambos ovarios, sigues produciendo hormonas. Todas las mujeres presentan diferentes síntomas y no todos son inmediatos. Además, pueden variar a lo largo del tiempo.</p>
          </div>

          <p>¡Que no te dé miedo ni te tome por sorpresa! Es una etapa natural de la vida por la que todas vamos a pasar. Además, es una gran oportunidad para verte a ti misma y cuidarte.</p>
        </div>
      )
    };
  }


  // Perimenopausia
  if (normalizedStage.includes('perimenop')) {
    return {
      title: 'Probablemente estés en la perimenopausia',
      content: (
        <div className="space-y-4 text-sm leading-7 text-[#4b5563] sm:text-base">
          <p>¡Hola <strong>{firstName}</strong>!</p>
          <p>La perimenopausia, conocida como la transición a la menopausia, se refiere a la etapa previa al día de tu última menstruación, antes de dejar de menstruar por 12 meses consecutivos.</p>
          <p>Es ahora cuando tus hormonas se vuelven impredecibles y tu cuerpo puede experimentar síntomas que antes no tenías, o que ahora sientes con mayor intensidad.</p>
          <p className="font-semibold text-[#6e0b6c]">Y sí, ¡a todas nos pasa!</p>
          <p>Nuestro cuerpo cambia y se prepara para una nueva etapa. Cada cuerpo la experimenta de forma distinta. Puede durar desde algunos meses hasta varios años.</p>
          <p>Conocer los síntomas te permitirá identificarlos y manejarlos adecuadamente.</p>
          <p>¡Que no te dé miedo ni te tome por sorpresa! Es una etapa natural de la vida por la que todas vamos a pasar. Además, es una gran oportunidad para verte a ti misma y cuidarte.</p>
        </div>
      )
    };
  }


  // Posmenopausia
  if (normalizedStage.includes('posmenop') || normalizedStage.includes('postmenop')) {
    return {
      title: 'Probablemente estés en la posmenopausia',
      content: (
        <div className="space-y-4 text-sm leading-7 text-[#4b5563] sm:text-base">
          <p>¡Hola <strong>{firstName}</strong>!</p>
          <p>Esta etapa es posterior a la menopausia, es decir, después del día de tu última menstruación. En esta etapa tus hormonas se nivelan y los síntomas que antes te molestaban pueden ir disminuyendo.</p>
          <p className="font-semibold text-[#6e0b6c]">¡Una buena noticia por donde lo veas!</p>
          <p>Lo importante en esta etapa es poner atención a tu salud a largo plazo, ya que los factores de riesgo para enfermedades del corazón, entre otras, se incrementan.</p>

          <div className="rounded-2xl bg-[#faf7fa] p-5">
            <p className="font-bold text-[#171717]">¿Qué tienes que saber?</p>
            <p className="mt-2">Todas las mujeres envejecemos naturalmente y experimentamos diferentes etapas de la vida. ¡Es normal!</p>
          </div>

          <p>Es importante que hagas cambios en tu estilo de vida. Lo que en algún momento te funcionó, quizá ahora necesite algunos ajustes.</p>
          <p>En esta etapa es muy importante cuidar tu nutrición, ejercicio, sueño y salud mental. Hacer cambios pequeños de manera constante es mejor que tratar de cambiar todo de un día para otro.</p>
        </div>
      )
    };
  }


  // Antes de la perimenopausia
  return {
    title: 'Aún no estás en la peri, pero es buena idea que te prepares',
    content: (
      <div className="space-y-4 text-sm leading-7 text-[#4b5563] sm:text-base">
        <p>¡Hola <strong>{firstName}</strong>!</p>
        <p>¡Que no te dé miedo ni te tome por sorpresa! Es una etapa natural de la vida por la que todas vamos a pasar. Además, es una gran oportunidad para verte a ti misma y cuidarte.</p>
        <p>¿Sabías que tu vivencia de la menopausia depende de muchos factores, incluyendo tus hábitos de ejercicio, nutrición, sueño y salud emocional?</p>
        <p>¡Es importante que te prepares!</p>
        <p>La menopausia tiene 34 síntomas. Conocerlos puede ayudarte a identificarlos con mayor facilidad cuando sucedan y transitar esta etapa de forma más consciente, informada y cuidada.</p>
        <p className="font-semibold text-[#6e0b6c]">Ya sabes lo que dicen… ¡la información es poder!</p>
      </div>
    )
  };
}


export default function Results({ patient, menstruationValue, answers, habitAnswers, questions, score, program, onRestart }: Props) {

  // Referencias PDF
  const resultSummaryRef = useRef<HTMLDivElement>(null);
  const resultRecommendationsRef = useRef<HTMLDivElement>(null);

  // Estados
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);


  // Descargar PDF
  const downloadPdf = async () => {

    if (!resultSummaryRef.current || !resultRecommendationsRef.current || isGeneratingPdf) return;

    try {

      setIsGeneratingPdf(true);

      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      const html2canvas = html2canvasModule.default;
      const jsPDF = jsPDFModule.jsPDF;


      // Crear PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const printableWidth = pageWidth - margin * 2;
      const printableHeight = pageHeight - margin * 2;


      // Agrega sección al PDF
      const addSectionToPdf = async (element: HTMLDivElement, startOnNewPage: boolean) => {

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#fafafa',
          logging: false,
          windowWidth: element.scrollWidth
        });

        const pxPerMm = canvas.width / printableWidth;
        const pageHeightPx = Math.floor(printableHeight * pxPerMm);

        let renderedHeight = 0;
        let localPageIndex = 0;

        while (renderedHeight < canvas.height) {

          if (startOnNewPage || localPageIndex > 0) {
            pdf.addPage();
            startOnNewPage = false;
          }

          const currentPageHeight = Math.min(pageHeightPx, canvas.height - renderedHeight);
          const pageCanvas = document.createElement('canvas');

          pageCanvas.width = canvas.width;
          pageCanvas.height = currentPageHeight;

          const context = pageCanvas.getContext('2d');

          if (!context) break;

          context.fillStyle = '#fafafa';
          context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

          context.drawImage(canvas, 0, renderedHeight, canvas.width, currentPageHeight, 0, 0, canvas.width, currentPageHeight);

          const imageData = pageCanvas.toDataURL('image/jpeg', 0.95);
          const imageHeightMm = currentPageHeight / pxPerMm;

          pdf.addImage(imageData, 'JPEG', margin, margin, printableWidth, imageHeightMm);

          renderedHeight += currentPageHeight;
          localPageIndex++;
        }
      };


      // Página 1
      await addSectionToPdf(resultSummaryRef.current, false);

      // Página 2
      await addSectionToPdf(resultRecommendationsRef.current, true);


      // Nombre PDF
      const patientName = patient.name
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const fileName = patientName ? `menotest-${patientName}.pdf` : 'menotest-resultados.pdf';

      pdf.save(fileName);

    } catch (error) {

      console.error('[MenoTest] Error generando PDF:', error);

    } finally {

      setIsGeneratingPdf(false);
    }
  };


  // URL pública
  const getShareUrl = () => `${window.location.origin}/menotest`;
  const shareText = 'Conoce más sobre tu etapa y bienestar con MenoTest.';


  // Facebook
  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };


  // WhatsApp
  const shareWhatsApp = () => {
    const message = `${shareText} ${getShareUrl()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };


  // X
  const shareX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };


  // LinkedIn
  const shareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };


  // Copiar enlace
  const copyShareLink = async () => {

    try {
      await navigator.clipboard.writeText(getShareUrl());
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2500);
    } catch (error) {
      console.error('[MenoTest] Error copiando enlace:', error);
    }
  };


  // Nombre
  const firstName = patient.name.trim().split(/\s+/)[0] || patient.name;
  const fullName = [patient.name, patient.paternalLastName, patient.maternalLastName].filter(Boolean).join(' ').trim();


  // Edad
  const birthDate = [patient.birthYear, patient.birthMonth.padStart(2, '0'), patient.birthDay.padStart(2, '0')].join('-');
  const age = calculateAge(birthDate);


  // IMC
  const weight = Number(patient.weight);
  const rawHeight = Number(patient.height);
  const heightMeters = rawHeight > 3 ? rawHeight / 100 : rawHeight;
  const imc = calculateIMC(weight, heightMeters);
  const imcClassification = classifyIMC(imc);


  // Etapa
  const stageResult = calculateStage(menstruationValue, age, score);
  const stageContent = getStageContent(stageResult.stage, firstName);


  // Síntomas
  const symptoms = analyzeSymptoms(answers, questions);
  const topSymptoms = getTopSymptoms(symptoms, 5);


  // Recomendaciones
  const recommendations = getRecommendations(answers, habitAnswers, {
    maxTotal: 8,
    maxPerSpecialist: 2
  });

  const groupedRecommendations = groupRecommendationsBySpecialist(recommendations);

  const specialistGroups = (Object.entries(groupedRecommendations) as [SpecialistKey, typeof recommendations][])
    .filter(([, items]) => items.length > 0)
    .sort(([a], [b]) => SPECIALIST_CONFIG[a].order - SPECIALIST_CONFIG[b].order);


  // Derivación Organon
  const isIztapalapa = program === 'iztapalapa';
  const clinicalReferral = isIztapalapa ? evaluateClinicalReferral(answers, score) : null;

  const hasClinicalReferral = Boolean(
    clinicalReferral?.generalMedicine.requiresAttention ||
    clinicalReferral?.gynecology.requiresAttention ||
    clinicalReferral?.psychology.requiresAttention
  );


  return (
    <main className="min-h-screen bg-[#fafafa] px-4 pb-10 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">


        {/* Header */}
        <MenoTestHeader program={program} />


        {/* PDF 1 */}
        <div ref={resultSummaryRef} className="border-t-4 border-[#6e0b6c] pt-8">

          {/* Encabezado */}
          <header className="mb-10 text-center">

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5eaf5] text-[#6e0b6c]">
              <Sparkles size={26} />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8d2a8a]">Tu MenoTest</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl">Hola, {fullName}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#6b7280] sm:text-base">Este es un resumen de los síntomas y hábitos que reportaste, junto con recomendaciones orientativas de nuestro equipo de especialistas.</p>

          </header>


          {/* Resumen */}
          <section className="rounded-[30px] border border-[#ece5ec] bg-white p-6 shadow-sm sm:p-8">

            <div className="grid gap-5 md:grid-cols-3">
              <SummaryCard icon={HeartPulse} label="Etapa orientativa" value={stageResult.stage} />
              <SummaryCard icon={UserRound} label="Edad" value={age > 0 ? `${age} años` : '—'} />
              <SummaryCard icon={CircleGauge} label="IMC" value={imc > 0 ? `${imc.toFixed(1)} · ${imcClassification}` : '—'} />
            </div>


            {/* Información etapa */}
            <div className="mt-8 overflow-hidden rounded-[26px] border border-[#eadfea] bg-[#fcf9fc]">

              <div className="border-b border-[#eadfea] bg-[#f8f1f8] px-6 py-5 sm:px-7">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6e0b6c] text-white">
                    <HeartPulse size={21} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8d2a8a]">Sobre tu etapa</p>
                    <h2 className="mt-1 text-xl font-bold leading-snug text-[#171717] sm:text-2xl">{stageContent.title}</h2>
                  </div>

                </div>

              </div>

              <div className="p-6 sm:p-7">{stageContent.content}</div>

            </div>

            <p className="mt-5 text-xs leading-6 text-[#9ca3af]">La etapa mostrada es orientativa y se calcula con las respuestas del cuestionario. No sustituye una valoración médica.</p>

          </section>


          {/* Síntomas */}
          <section className="mt-6 rounded-[30px] border border-[#ece5ec] bg-white p-6 shadow-sm sm:p-8">

            <SectionTitle icon={Activity} eyebrow="Mayor intensidad" title="Síntomas principales" />

            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">

              {topSymptoms.length > 0 ? (

                topSymptoms.map(symptom => (
                  <div key={symptom.key} className="flex min-h-[94px] items-center gap-4 rounded-2xl bg-[#fafafa] p-4">

                    <div className="min-w-0 flex-1">

                      <p className="font-semibold text-[#171717]">
                        {getSymptomLabel(symptom.key)}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#6b7280]">
                        {getIntensityDescription(symptom.key, symptom.value)}
                      </p>

                    </div>

                    <div className="flex shrink-0 gap-1">
                      {[1, 2, 3].map(point => (
                        <span key={point} className={`h-2.5 w-2.5 rounded-full ${point <= symptom.value ? 'bg-[#6e0b6c]' : 'bg-[#e5e7eb]'}`} />
                      ))}
                    </div>

                  </div>
                ))

              ) : (

                <div className="md:col-span-3">
                  <p className="text-sm text-[#6b7280]">No reportaste síntomas relevantes.</p>
                </div>

              )}

            </div>

          </section>

        </div>


        {/* PDF 2 */}
        <div ref={resultRecommendationsRef} className="pt-6">

          <section className="rounded-[30px] border border-[#ece5ec] bg-white p-6 shadow-sm sm:p-8">

            <SectionTitle icon={Sparkles} eyebrow="Tu equipo" title="Recomendaciones para ti" />

            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6b7280]">Estas recomendaciones se seleccionan según los síntomas y hábitos que reportaste.</p>


            {specialistGroups.length > 0 ? (

              <div className="mt-8 grid gap-5 lg:grid-cols-2">

                {specialistGroups.map(([specialist, items]) => {

                  const Icon = SPECIALIST_CONFIG[specialist].icon;
                  const first = items[0];

                  return (
                    <article key={specialist} className="rounded-[24px] border border-[#eadfea] bg-[#fcf9fc] p-5 sm:p-6">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5eaf5] text-[#6e0b6c]">
                          <Icon size={21} />
                        </div>

                        <div>
                          <h3 className="font-bold text-[#171717]">{first.specialistName}</h3>
                          <p className="text-xs font-medium text-[#8d2a8a]">{first.specialty}</p>
                        </div>

                      </div>


                      <div className="mt-6 space-y-5">

                        {items.map(recommendation => (
                          <div key={recommendation.id}>

                            <p className="text-sm leading-7 text-[#4b5563]">{recommendation.text}</p>

                            {recommendation.matchedHabitIds.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {recommendation.matchedHabitIds.map(habitId => (
                                  <span key={habitId} className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#6e0b6c] ring-1 ring-[#eadfea]">
                                    {HABIT_LABELS[habitId] ?? formatKey(habitId)}
                                  </span>
                                ))}
                              </div>
                            )}

                            <p className="mt-3 text-[11px] text-[#9ca3af]">
                              Relacionado con: {getSymptomLabel(recommendation.symptomKey)}
                            </p>

                          </div>
                        ))}

                      </div>

                    </article>
                  );

                })}

              </div>

            ) : (

              <div className="mt-8 rounded-2xl bg-[#fafafa] p-5">
                <p className="text-sm leading-7 text-[#6b7280]">No encontramos recomendaciones específicas para esta combinación de síntomas y hábitos.</p>
              </div>

            )}


            {/* Aviso */}
            <div className="mt-8 rounded-2xl bg-[#f8f1f8] p-5">

              <div className="flex gap-3">

                <Wind className="mt-0.5 shrink-0 text-[#6e0b6c]" size={19} />

                <div className="flex-1">
                  <p className="text-xs leading-6 text-[#6b7280]">Las recomendaciones son orientativas y buscan ayudarte a identificar áreas de bienestar que podrías revisar. No constituyen diagnóstico ni sustituyen una consulta con un profesional de salud.</p>
                </div>

              </div>


              {/* Orientación Organon */}
              {isIztapalapa && clinicalReferral && hasClinicalReferral && (
                <div className="mt-5 border-t border-[#e7d9e6] pt-5">

                  <div className="flex flex-wrap gap-3">

                    {clinicalReferral.generalMedicine.requiresAttention && (
                      <ReferralIndicator icon={Stethoscope} letter="M" />
                    )}

                    {clinicalReferral.gynecology.requiresAttention && (
                      <ReferralIndicator icon={HeartPulse} letter="G" />
                    )}

                    {clinicalReferral.psychology.requiresAttention && (
                      <ReferralIndicator icon={Brain} letter="P" />
                    )}

                  </div>

                </div>
              )}

            </div>

          </section>

        </div>


        {/* Compartir */}
        <section className="mt-8 rounded-[30px] border border-[#ece5ec] bg-white p-6 text-center shadow-sm sm:p-8">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5eaf5] text-[#6e0b6c]">
            <Sparkles size={22} />
          </div>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#8d2a8a]">Comparte bienestar</p>

          <h2 className="mt-2 text-xl font-bold text-[#171717] sm:text-2xl">Comparte MenoTest</h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#6b7280]">Invita a más mujeres a conocer mejor su etapa y descubrir herramientas para cuidar su bienestar.</p>


          {/* Redes sociales */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">

            <SocialButton label="Facebook" onClick={shareFacebook} icon={<FaFacebookF size={17} />} />
            <SocialButton label="WhatsApp" onClick={shareWhatsApp} icon={<FaWhatsapp size={19} />} />
            <SocialButton label="X" onClick={shareX} icon={<FaXTwitter size={17} />} />
            <SocialButton label="LinkedIn" onClick={shareLinkedIn} icon={<FaLinkedinIn size={17} />} />
            <SocialButton label={shareCopied ? 'Enlace copiado' : 'Copiar enlace'} onClick={copyShareLink} icon={shareCopied ? <Check size={17} /> : <Copy size={17} />} />

          </div>

          <p className="mt-5 text-[11px] font-bold leading-5 text-[#ff0000]">Al compartir, únicamente se envía el enlace público de MenoTest. Tus resultados permanecen privados.</p>

        </section>


        {/* Acciones */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">

          <button type="button" onClick={downloadPdf} disabled={isGeneratingPdf} className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-full bg-[#6e0b6c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#570956] disabled:cursor-not-allowed disabled:opacity-60">

            {isGeneratingPdf ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Generando PDF...
              </>
            ) : (
              <>
                <Download size={17} />
                Descargar resultados
              </>
            )}

          </button>


          <MedicalReport
            patient={patient}
            menstruationValue={menstruationValue}
            answers={answers}
            habitAnswers={habitAnswers}
            questions={questions}
            score={score}
            program={program}
          />


          <button type="button" onClick={onRestart} disabled={isGeneratingPdf} className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-full border border-[#d9c5d8] bg-white px-6 py-3 text-sm font-semibold text-[#6e0b6c] transition hover:border-[#6e0b6c] hover:bg-[#faf5fa] disabled:cursor-not-allowed disabled:opacity-60">
            <RotateCcw size={17} />
            Realizar nuevamente
          </button>

        </div>

      </div>

    </main>
  );
}


// Botón social
function SocialButton({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex min-w-[145px] items-center justify-center gap-2 rounded-full border border-[#e4d5e3] bg-white px-5 py-2.5 text-sm font-semibold text-[#6e0b6c] transition hover:border-[#6e0b6c] hover:bg-[#f8f1f8] active:scale-[0.98]">
      <span className="flex h-7 w-7 items-center justify-center">{icon}</span>
      <span>{label}</span>
    </button>
  );
}


// Indicador orientación
function ReferralIndicator({ icon: Icon, letter }: { icon: typeof Activity; letter: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-[#eadfea]">
      <Icon size={17} strokeWidth={2.3} className="text-[#6e0b6c]" />
      <span className="text-xs font-bold text-[#6e0b6c]">{letter}</span>
      <Check size={14} strokeWidth={3} className="text-[#6e0b6c]" />
    </div>
  );
}


// Card resumen
function SummaryCard({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#faf7fa] p-5">

      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5eaf5] text-[#6e0b6c]">
        <Icon size={20} />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-[#8d2a8a]">{label}</p>
      <p className="mt-2 text-xl font-bold leading-tight text-[#171717]">{value}</p>

    </div>
  );
}


// Título sección
function SectionTitle({ icon: Icon, eyebrow, title }: { icon: typeof Activity; eyebrow: string; title: string }) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5eaf5] text-[#6e0b6c]">
        <Icon size={20} />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8d2a8a]">{eyebrow}</p>
        <h2 className="text-xl font-bold text-[#171717]">{title}</h2>
      </div>

    </div>
  );
}


// Nombre visible del síntoma
function getSymptomLabel(key: string): string {
  return SYMPTOM_LABELS[key] ?? formatKey(key);
}


// Descripción intensidad
function getIntensityDescription(key: string, value: number): string {

  // Energía
  if (key === 'energia') {

    switch (value) {
      case 1:
        return 'Has notado una ligera disminución de energía';

      case 2:
        return 'Has sentido falta de energía con frecuencia';

      case 3:
        return 'Has experimentado una disminución importante de energía';

      default:
        return 'No reportaste falta de energía';
    }
  }


  // Descanso
  if (key === 'dormir') {

    switch (value) {
      case 1:
        return 'Has notado algunas dificultades para descansar';

      case 2:
        return 'Las dificultades para descansar aparecen con frecuencia';

      case 3:
        return 'Has experimentado dificultades importantes para descansar';

      default:
        return 'No reportaste dificultades para descansar';
    }
  }


  // Concentración
  if (key === 'concentracion') {

    switch (value) {
      case 1:
        return 'Has notado algunas dificultades para concentrarte';

      case 2:
        return 'Te cuesta concentrarte con cierta frecuencia';

      case 3:
        return 'Has experimentado dificultades importantes para concentrarte';

      default:
        return 'No reportaste dificultades de concentración';
    }
  }


  // Memoria
  if (key === 'memoria') {

    switch (value) {
      case 1:
        return 'Has notado algunos olvidos ocasionales';

      case 2:
        return 'Los olvidos aparecen con cierta frecuencia';

      case 3:
        return 'Has experimentado dificultades importantes de memoria';

      default:
        return 'No reportaste dificultades de memoria';
    }
  }


  // Respiración
  if (key === 'respiracion') {

    switch (value) {
      case 1:
        return 'Has notado dificultad para respirar ocasionalmente';

      case 2:
        return 'La dificultad para respirar aparece con cierta frecuencia';

      case 3:
        return 'Has experimentado dificultad para respirar con mayor intensidad';

      default:
        return 'No reportaste dificultad para respirar';
    }
  }


  // Resequedad
  if (key === 'resequedad') {

    switch (value) {
      case 1:
        return 'Has notado resequedad de forma ocasional';

      case 2:
        return 'La resequedad aparece con cierta frecuencia';

      case 3:
        return 'Has experimentado resequedad de forma importante';

      default:
        return 'No reportaste resequedad';
    }
  }


  // Resto
  switch (value) {
    case 1:
      return 'Lo notas de vez en cuando';

    case 2:
      return 'Lo experimentas con frecuencia';

    case 3:
      return 'Lo experimentas con mayor intensidad';

    default:
      return 'No reportaste este síntoma';
  }
}


// Formatea keys
function formatKey(key: string): string {
  return key.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}