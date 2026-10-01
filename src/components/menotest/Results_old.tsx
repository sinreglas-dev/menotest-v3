'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Activity, Brain, Check, CircleGauge, Copy, Download, Dumbbell, HeartPulse, RotateCcw, Sparkles, Stethoscope, UserRound, Wind } from 'lucide-react';
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';

import MenoTestHeader from './MenoTestHeader';
import MedicalReport, { type MedicalReportHandle } from './MedicalReport';

import type { Answer, HabitAnswer, Question } from '@/types/menotest';
import type { PatientData } from '@/components/menotest/PatientForm';
import type { MenoTestProgram } from '@/shared/config/program';

import { evaluateClinicalReferral } from '@/shared/data/clinicalReferral';
import { analyzeSymptoms, getTopSymptoms } from '@/shared/data/categories';
import { calculateAge, calculateIMC, calculateStage, classifyIMC } from '@/shared/data/scoring';
import { getRecommendations, groupRecommendationsBySpecialist, type SpecialistKey } from '@/shared/data/recommendations';

import { crearDocumentoPdf, agregarElementoAPdf, nombreArchivoSeguro } from '@/shared/pdf/generarPdf';


interface Props {
  patient: PatientData;
  menstruationValue: string;
  answers: Answer[];
  habitAnswers: HabitAnswer[];
  questions: Question[];
  score: number;
  program: MenoTestProgram;
  evaluacionId?: number | null;
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
      title: 'Probablemente estés atravesando una menopausia precoz o prematura.',
      content: (
        <div className="space-y-4 text-sm leading-7 text-[#4b5563] sm:text-base">
          <p>¡Hola <strong>{firstName}</strong>!</p>
          <p>Cuando la menopausia ocurre antes de lo esperado, es especialmente importante contar con acompañamiento médico para entender qué está sucediendo y cuidar tu salud a corto y largo plazo.</p>
          <p>Puede estar relacionada con una insuficiencia ovárica prematura, factores genéticos o autoinmunes, algunos tratamientos contra el cáncer, quimioterapia, radioterapia o ciertas cirugías. En algunos casos, la causa no se identifica.</p>
          <p>Existen distintas opciones de tratamiento y manejo. La terapia hormonal puede ser una de ellas, dependiendo de tu historia clínica y situación particular. Por eso, te recomendamos conversar con una profesional de la salud sobre sus posibles beneficios y riesgos en tu caso.</p>
          <p>Puedes pedir una cita con nuestro equipo médico en la Clínica Virtual:</p>
          <p className="text-sm text-[#6e0b6c] underline"><a href="https://sin-reglas.mx/clinica-virtual/" target="_blank" rel="noopener noreferrer">https://sin-reglas.mx/clinica-virtual/</a></p>
          <p>También puedes complementar tu atención con nuestro Menocoaching, para trabajar hábitos y herramientas que te ayuden a sentirte mejor durante esta etapa.</p>
          <p>Reserva tu sesión aquí:</p>
          <p className="text-sm text-[#6e0b6c] underline"><a href="https://sin-reglas.mx/menocoaching/" target="_blank" rel="noopener noreferrer">https://sin-reglas.mx/menocoaching/</a></p>
          <p>Y recuerda: no tienes que transitar esta etapa sola. Informarte y recibir atención adecuada puede hacer una gran diferencia.</p>
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
          <p>Una histerectomía no necesariamente significa que hayas entrado en la menopausia. Si conservas uno o ambos ovarios, estos pueden continuar produciendo hormonas, aunque ya no tengas menstruaciones. Por eso puede ser más difícil identificar en qué etapa de la transición te encuentras.</p>
          <p>Los cambios hormonales y los síntomas son diferentes para cada mujer y pueden aparecer gradualmente. Si has comenzado a notar cambios físicos, emocionales, cognitivos o sexuales que antes no tenías, vale la pena prestarles atención.</p>
          <p>Te recomendamos consultar con una profesional de la salud para entender mejor en qué momento estás y qué cuidados pueden ser adecuados para ti.</p>
          <p>También puedes apoyarte en nuestro Menocoaching para trabajar hábitos y herramientas que favorezcan tu bienestar.</p>
          <p>Reserva tu sesión aquí:</p>
          <p className="text-sm text-[#6e0b6c] underline"><a href="https://sin-reglas.mx/menocoaching/" target="_blank" rel="noopener noreferrer">https://sin-reglas.mx/menocoaching/</a></p>
          <p>Conoce más sobre los síntomas y las distintas etapas en nuestra Guía de la Menopausia:</p>
          <p className="text-sm text-[#6e0b6c] underline"><a href="https://sin-reglas.mx/guia-de-la-menopausia/" target="_blank" rel="noopener noreferrer">https://sin-reglas.mx/guia-de-la-menopausia/</a></p>
          <p>Entender lo que está pasando en tu cuerpo es el primer paso para poder cuidarlo mejor.</p>
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
          <p>La perimenopausia es la etapa de transición hacia la menopausia. Durante este periodo, tus hormonas comienzan a fluctuar y pueden aparecer síntomas nuevos o intensificarse algunos que ya tenías. Esta transición puede durar desde algunos meses hasta varios años y cada mujer la vive de manera diferente.</p>
          <p>Puedes experimentar cambios en tu menstruación, sueño, energía, estado de ánimo, concentración, sexualidad y otros aspectos de tu salud. Conocer estos cambios te ayudará a entender mejor lo que estás viviendo y a buscar las herramientas adecuadas para manejarlos.</p>
          <p>Tus resultados pueden ser un buen punto de partida para hablar con una profesional de la salud. Te recomendamos una valoración médica para revisar tus síntomas, antecedentes y necesidades de manera integral.</p>
          <p>Agenda una cita en nuestra Clínica Virtual:</p>
          <p className="text-sm text-[#6e0b6c] underline"><a href="https://sin-reglas.mx/clinica-virtual/" target="_blank" rel="noopener noreferrer">https://sin-reglas.mx/clinica-virtual/</a></p>
          <p>También puedes complementar tu cuidado con nuestro Menocoaching, enfocado en hábitos y herramientas para sentirte mejor durante esta transición.</p>
          <p className="text-sm text-[#6e0b6c] underline"><a href="https://sin-reglas.mx/menocoaching/" target="_blank" rel="noopener noreferrer">https://sin-reglas.mx/menocoaching/</a></p>
          <p>No se trata solamente de atravesar esta etapa, sino de entender qué necesita tu cuerpo y empezar a cuidarte de una manera diferente.</p>
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
          <p>La posmenopausia comienza después de haber pasado 12 meses consecutivos sin menstruación. Algunos síntomas pueden disminuir con el tiempo, aunque otros pueden continuar o aparecer en esta etapa.</p>
          <p>Ahora es especialmente importante mirar tu salud a largo plazo. Los cambios hormonales asociados con la menopausia pueden influir en distintos aspectos de tu salud, por lo que vale la pena poner atención a factores como tu salud cardiovascular, ósea, metabólica, sexual, cognitiva y emocional.</p>
          <p>La nutrición, el ejercicio, el sueño y la salud emocional cobran especial importancia en esta etapa. No necesitas cambiar todo de un día para otro: pequeños cambios sostenidos pueden tener un impacto importante en tu bienestar.</p>
          <p>Te recomendamos una valoración médica para revisar tus síntomas, antecedentes y factores de riesgo.</p>
          <p>Agenda una cita en nuestra Clínica Virtual:</p>
          <p className="text-sm text-[#6e0b6c] underline"><a href="https://sin-reglas.mx/clinica-virtual/" target="_blank" rel="noopener noreferrer">https://sin-reglas.mx/clinica-virtual/</a></p>
          <p>También puedes apoyarte en nuestro Menocoaching para construir hábitos que funcionen para esta nueva etapa.</p>
          <p className="text-sm text-[#6e0b6c] underline"><a href="https://sin-reglas.mx/menocoaching/" target="_blank" rel="noopener noreferrer">https://sin-reglas.mx/menocoaching/</a></p>
          <p>La posmenopausia no es el final de algo: es una nueva etapa en la que cuidar tu salud hoy puede cambiar cómo vivirás los próximos años.</p>
        </div>
      )
    };
  }


  // Antes de la perimenopausia
  return {
    title: 'Aún no estás en la perimenopausia, pero es un gran momento para prepararte.',
    content: (
      <div className="space-y-4 text-sm leading-7 text-[#4b5563] sm:text-base">
        <p>¡Hola <strong>{firstName}</strong>!</p>
        <p>La menopausia es una etapa natural de la vida y conocerla antes de que llegue puede ayudarte a vivirla con más información, tranquilidad y herramientas.</p>
        <p>Tu experiencia durante esta transición no depende solamente de las hormonas. Tu alimentación, actividad física, sueño, salud emocional y otros hábitos también pueden influir en cómo te sientes. Por eso, este es un buen momento para poner atención a tu salud y empezar a cuidarte pensando en los próximos años.</p>
        <p>La transición a la menopausia puede venir acompañada de distintos síntomas. Conocerlos te ayudará a reconocer cambios en tu cuerpo y saber cuándo buscar orientación o atención.</p>
        <p>Si quieres prepararte de manera más personalizada, te invitamos a nuestro Menocoaching, donde podrás trabajar en hábitos y herramientas para cuidar tu bienestar durante esta etapa.</p>
        <p className="font-semibold text-[#6e0b6c]">Reserva tu sesión aquí:</p>
        <p className="text-sm text-[#6e0b6c] underline"><a href="https://sin-reglas.mx/menocoaching/" target="_blank" rel="noopener noreferrer">https://sin-reglas.mx/menocoaching/</a></p>
        <p>También puedes conocer más sobre la menopausia, sus etapas y síntomas en nuestra Guía de la Menopausia:</p>
        <p className="text-sm text-[#6e0b6c] underline"><a href="https://sin-reglas.mx/guia-de-la-menopausia/" target="_blank" rel="noopener noreferrer">https://sin-reglas.mx/guia-de-la-menopausia/</a></p>
        <p>Recuerda: conocer tu cuerpo hoy también es una forma de cuidar tu salud futura.</p>
      </div>
    )
  };
}


export default function Results({
  patient,
  menstruationValue,
  answers,
  habitAnswers,
  questions,
  score,
  program,
  evaluacionId,
  onRestart,
}: Props) {

  // Referencias PDF
  const resultSummaryRef = useRef<HTMLDivElement>(null);
  const resultRecommendationsRef = useRef<HTMLDivElement>(null);
  const medicalReportRef = useRef<MedicalReportHandle>(null);

  // Bandera anti-duplicado: garantiza que el envío por correo se dispare una sola vez,
  // incluso si React StrictMode monta/desmonta el componente dos veces en desarrollo.
  const yaEnviadoRef = useRef(false);

  // Estados
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [envioReportes, setEnvioReportes] = useState<'enviando' | 'enviado' | 'error' | null>(null);


  // ==================== GENERACIÓN DE PDFs ====================

  /**
   * Construye el PDF del reporte de usuario (resumen + recomendaciones).
   * Cada sección se pinta en el PDF paginando automáticamente.
   */
  // const construirReporteUsuarioPdf = async () => {
  //   if (!resultSummaryRef.current || !resultRecommendationsRef.current) return null;

  //   const pdf = await crearDocumentoPdf();
  //   await agregarElementoAPdf(pdf, resultSummaryRef.current, { fondoColor: '#fafafa' });
  //   await agregarElementoAPdf(pdf, resultRecommendationsRef.current, {
  //     fondoColor: '#fafafa',
  //     iniciarEnNuevaPagina: true,
  //   });

  //   return pdf;
  // };
  const construirReporteUsuarioPdf = async () => {
    if (!resultSummaryRef.current || !resultRecommendationsRef.current) return null;

    const pdf = await crearDocumentoPdf();

    await agregarElementoAPdf(pdf, resultSummaryRef.current, {
      fondoColor: '#fafafa',
      anchoCaptura: 1152
    });

    await agregarElementoAPdf(pdf, resultRecommendationsRef.current, {
      fondoColor: '#fafafa',
      iniciarEnNuevaPagina: true,
      anchoCaptura: 1152
    });

    return pdf;
  };

  /**
   * Descarga el PDF del reporte de usuario al disco.
   */
  // const downloadPdf = async () => {
  //   if (isGeneratingPdf) return;

  //   try {
  //     setIsGeneratingPdf(true);

  //     const pdf = await construirReporteUsuarioPdf();
  //     if (!pdf) return;

  //     const patientFileName = nombreArchivoSeguro(
  //       `${patient.name} ${patient.paternalLastName}`
  //     );

  //     pdf.save(
  //       patientFileName
  //         ? `reporte-menotest-${patientFileName}.pdf`
  //         : 'reporte-menotest.pdf'
  //     );

  //   } catch (error) {
  //     console.error('[MenoTest] Error generando el reporte:', error);
  //   } finally {
  //     setIsGeneratingPdf(false);
  //   }
  // };


  const downloadPdf = async () => {
    if (isGeneratingPdf) return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const pdfWindow = isIOS ? window.open('', '_blank') : null;

    if (pdfWindow) {
      pdfWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Generando reporte...</title>
        </head>
        <body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fafafa;font-family:Arial,sans-serif;color:#6e0b6c;">
          <div style="text-align:center;padding:24px;">
            <p style="margin:0;font-size:16px;font-weight:600;">Generando tu reporte...</p>
            <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">Espera un momento.</p>
          </div>
        </body>
      </html>
    `);
      pdfWindow.document.close();
    }

    try {
      setIsGeneratingPdf(true);

      const pdf = await construirReporteUsuarioPdf();

      if (!pdf) {
        pdfWindow?.close();
        return;
      }

      const patientFileName = nombreArchivoSeguro(`${patient.name} ${patient.paternalLastName}`);
      const fileName = patientFileName ? `reporte-menotest-${patientFileName}.pdf` : 'reporte-menotest.pdf';

      if (isIOS && pdfWindow) {
        const pdfBlob = pdf.output('blob') as Blob;
        const pdfUrl = URL.createObjectURL(pdfBlob);

        pdfWindow.location.replace(pdfUrl);

        window.setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 120000);

        return;
      }

      pdf.save(fileName);
    } catch (error) {
      pdfWindow?.close();
      console.error('[MenoTest] Error generando el reporte:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };


  // ==================== ENVÍO AUTOMÁTICO POR CORREO ====================

  /**
   * Envía ambos PDFs (reporte de usuario + reporte médico) al correo de la paciente.
   * Se ejecuta una sola vez, apenas se muestran los resultados.
   *
   * La bandera `yaEnviadoRef` evita que React StrictMode dispare dos veces
   * la petición de red al montar el componente en desarrollo.
   */
  useEffect(() => {
    if (!evaluacionId || yaEnviadoRef.current) return;
    yaEnviadoRef.current = true;

    const enviarReportes = async () => {
      setEnvioReportes('enviando');

      try {
        const [pdfUsuario, pdfMedico] = await Promise.all([
          construirReporteUsuarioPdf(),
          medicalReportRef.current?.generarPdfBlob(),
        ]);

        if (!pdfUsuario) {
          throw new Error('No se pudo generar el reporte de usuario');
        }

        const blobUsuario = pdfUsuario.output('blob') as Blob;
        const base64Usuario = await blobToBase64(blobUsuario);
        const base64Medico = pdfMedico ? await blobToBase64(pdfMedico) : null;

        const res = await fetch('/api/evaluacion/enviar-reportes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            evaluacionId,
            correo: patient.email,
            nombre: patient.name,
            reporteUsuarioPdf: base64Usuario,
            reporteMedicoPdf: base64Medico,
          }),
        });

        setEnvioReportes(res.ok ? 'enviado' : 'error');
      } catch (error) {
        console.error('[MenoTest] Error al enviar reportes por correo:', error);
        setEnvioReportes('error');
      }
    };

    enviarReportes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluacionId]);


  // ==================== COMPARTIR ====================

  const getShareUrl = () => `${window.location.origin}/menotest`;
  const shareText = 'Conoce más sobre tu etapa y bienestar con MenoTest.';

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareWhatsApp = () => {
    const message = `${shareText} ${getShareUrl()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const shareX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2500);
    } catch (error) {
      console.error('[MenoTest] Error copiando enlace:', error);
    }
  };


  // ==================== DATOS DERIVADOS ====================

  const firstName = patient.name.trim().split(/\s+/)[0] || patient.name;
  const fullName = [patient.name, patient.paternalLastName, patient.maternalLastName].filter(Boolean).join(' ').trim();

  const birthDate = [patient.birthYear, patient.birthMonth.padStart(2, '0'), patient.birthDay.padStart(2, '0')].join('-');
  const age = calculateAge(birthDate);

  const weight = Number(patient.weight);
  const rawHeight = Number(patient.height);
  const heightMeters = rawHeight > 3 ? rawHeight / 100 : rawHeight;
  const imc = calculateIMC(weight, heightMeters);
  const imcClassification = classifyIMC(imc);

  const stageResult = calculateStage(menstruationValue, age, score);
  const stageContent = getStageContent(stageResult.stage, firstName);

  const symptoms = analyzeSymptoms(answers, questions);
  const topSymptoms = getTopSymptoms(symptoms, 5);

  const recommendations = getRecommendations(answers, habitAnswers, {
    maxTotal: 8,
    maxPerSpecialist: 2
  });

  const groupedRecommendations = groupRecommendationsBySpecialist(recommendations);

  const specialistGroups = (Object.entries(groupedRecommendations) as [SpecialistKey, typeof recommendations][])
    .filter(([, items]) => items.length > 0)
    .sort(([a], [b]) => SPECIALIST_CONFIG[a].order - SPECIALIST_CONFIG[b].order);

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


        {/* Aviso discreto de envío de reportes */}
        {envioReportes === 'enviando' && (
          <p className="mt-4 text-center text-sm text-[#6b7280]">
            Enviando tus reportes a tu correo...
          </p>
        )}

        {envioReportes === 'enviado' && (
          <p className="mt-4 text-center text-sm font-medium text-[#197821]">
            Tus reportes fueron enviados a {patient.email}.
          </p>
        )}

        {envioReportes === 'error' && (
          <p className="mt-4 text-center text-sm font-medium text-[#b91c1c]">
            No pudimos enviar tus reportes automáticamente. Puedes descargarlos manualmente.
          </p>
        )}


        {/* PDF 1 */}
        <div ref={resultSummaryRef} className="mt-6 border-t-4 border-[#6e0b6c] pt-8">

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
            ref={medicalReportRef}
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


// ==================== HELPERS ====================

/**
 * Convierte un Blob a base64 (sin el prefijo data:...).
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const resultado = reader.result as string;
      resolve(resultado.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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

  if (key === 'energia') {
    switch (value) {
      case 1: return 'Has notado una ligera disminución de energía';
      case 2: return 'Has sentido falta de energía con frecuencia';
      case 3: return 'Has experimentado una disminución importante de energía';
      default: return 'No reportaste falta de energía';
    }
  }

  if (key === 'dormir') {
    switch (value) {
      case 1: return 'Has notado algunas dificultades para descansar';
      case 2: return 'Las dificultades para descansar aparecen con frecuencia';
      case 3: return 'Has experimentado dificultades importantes para descansar';
      default: return 'No reportaste dificultades para descansar';
    }
  }

  if (key === 'concentracion') {
    switch (value) {
      case 1: return 'Has notado algunas dificultades para concentrarte';
      case 2: return 'Te cuesta concentrarte con cierta frecuencia';
      case 3: return 'Has experimentado dificultades importantes para concentrarte';
      default: return 'No reportaste dificultades de concentración';
    }
  }

  if (key === 'memoria') {
    switch (value) {
      case 1: return 'Has notado algunos olvidos ocasionales';
      case 2: return 'Los olvidos aparecen con cierta frecuencia';
      case 3: return 'Has experimentado dificultades importantes de memoria';
      default: return 'No reportaste dificultades de memoria';
    }
  }

  if (key === 'respiracion') {
    switch (value) {
      case 1: return 'Has notado dificultad para respirar ocasionalmente';
      case 2: return 'La dificultad para respirar aparece con cierta frecuencia';
      case 3: return 'Has experimentado dificultad para respirar con mayor intensidad';
      default: return 'No reportaste dificultad para respirar';
    }
  }

  if (key === 'resequedad') {
    switch (value) {
      case 1: return 'Has notado resequedad de forma ocasional';
      case 2: return 'La resequedad aparece con cierta frecuencia';
      case 3: return 'Has experimentado resequedad de forma importante';
      default: return 'No reportaste resequedad';
    }
  }

  switch (value) {
    case 1: return 'Lo notas de vez en cuando';
    case 2: return 'Lo experimentas con frecuencia';
    case 3: return 'Lo experimentas con mayor intensidad';
    default: return 'No reportaste este síntoma';
  }
}


// Formatea keys
function formatKey(key: string): string {
  return key.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}