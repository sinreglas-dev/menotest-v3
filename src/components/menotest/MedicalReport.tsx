'use client';

// Muestra y genera el reporte estructurado para profesionales de salud.
// Resume las respuestas del MenoTest sin generar diagnósticos ni modificar las reglas clínicas.

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Activity, Brain, Check, Download, FileText, HeartPulse, LoaderCircle, Stethoscope, X } from 'lucide-react';

import type { Answer, HabitAnswer, Question } from '@/types/menotest';
import type { PatientData } from '@/components/menotest/PatientForm';
import type { MenoTestProgram } from '@/shared/config/program';

import { evaluateClinicalReferral } from '@/shared/data/clinicalReferral';
import { calculateAge, calculateIMC, calculateStage, classifyIMC } from '@/shared/data/scoring';

import { crearDocumentoPdf, agregarElementoAPdf, nombreArchivoSeguro } from '@/shared/pdf/generarPdf';


interface Props {
   patient: PatientData;
   menstruationValue: string;
   answers: Answer[];
   habitAnswers: HabitAnswer[];
   questions: Question[];
   score: number;
   program: MenoTestProgram;
}

// Handle expuesto hacia componentes padres
export interface MedicalReportHandle {
   generarPdfBlob: () => Promise<Blob | null>;
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


// Contexto menstrual
const MENSTRUATION_LABELS: Record<string, string> = {
   regular: 'Mi menstruación es regular',
   irregular: 'Mi menstruación es irregular',
   trh_sangrado: 'Uso terapia hormonal y continúo presentando sangrado',
   stopped: 'Mi menstruación se detuvo',
   trh_detenida: 'Uso terapia hormonal y mi menstruación se detuvo',
   histerectomia_ovarios: 'Histerectomía conservando uno o ambos ovarios',
   histerectomia_sin_ovarios: 'Histerectomía con retiro de ovarios',
   medicamentos: 'Mi menstruación se detuvo debido a medicamentos o tratamiento médico',
   cancer: 'Mi menstruación se detuvo durante o después de un tratamiento contra el cáncer'
};


// Categorías
const CATEGORY_LABELS: Record<string, string> = {
   cardiovascular: 'Cardiovascular',
   emocional: 'Emocional',
   sueño: 'Descanso',
   cognitivo: 'Cognitivo',
   energia: 'Energía',
   neurologico: 'Neurológico',
   musculoesqueletico: 'Musculoesquelético',
   respiratorio: 'Respiratorio',
   vasomotor: 'Vasomotor',
   sexual: 'Salud sexual',
   genitourinario: 'Genitourinario'
};


// Síntomas
const SYMPTOM_LABELS: Record<string, string> = {
   palpitaciones: 'Palpitaciones',
   nervios: 'Tensión o nerviosismo',
   dormir: 'Dificultades relacionadas con el descanso',
   aceleracion: 'Sensación de aceleración o agitación',
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
   sudor: 'Sudoración',
   sexo: 'Cambios relacionados con la sexualidad',
   resequedad: 'Resequedad',
   incontinencia: 'Incontinencia',
   niebla_mental: 'Niebla mental',
   memoria: 'Dificultades relacionadas con la memoria'
};


// Intensidades
const INTENSITY_LABELS: Record<number, string> = {
   0: 'Nada',
   1: 'Poco',
   2: 'Bastante',
   3: 'Mucho'
};


const HABIT_VALUE_LABELS: Record<number, string> = {
   0: 'Favorable',
   1: 'Leve',
   2: 'Moderado',
   3: 'Relevante'
};


const MedicalReport = forwardRef<MedicalReportHandle, Props>(function MedicalReport(
   { patient, menstruationValue, answers, habitAnswers, questions, score, program },
   ref
) {

   // Estado
   const [isOpen, setIsOpen] = useState(false);
   const [isGenerating, setIsGenerating] = useState(false);
   const reportRef = useRef<HTMLDivElement>(null);


   // Bloquear scroll al abrir
   useEffect(() => {

      if (!isOpen) return;

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
         document.body.style.overflow = previousOverflow;
      };

   }, [isOpen]);


   // Paciente
   const fullName = [patient.name, patient.paternalLastName, patient.maternalLastName].filter(Boolean).join(' ').trim();
   const birthDate = [patient.birthYear, patient.birthMonth.padStart(2, '0'), patient.birthDay.padStart(2, '0')].join('-');
   const formattedBirthDate = formatDate(birthDate);
   const age = calculateAge(birthDate);


   // IMC
   const weight = Number(patient.weight);
   const rawHeight = Number(patient.height);
   const heightMeters = rawHeight > 3 ? rawHeight / 100 : rawHeight;
   const imc = calculateIMC(weight, heightMeters);
   const imcClassification = classifyIMC(imc);


   // Etapa
   const stageResult = calculateStage(menstruationValue, age, score);
   const menstruationLabel = MENSTRUATION_LABELS[menstruationValue] ?? formatKey(menstruationValue);


   // Síntomas
   const symptomRows = answers
      .map(answer => {
         const question = questions.find(item => item.id === answer.questionId);

         return {
            ...answer,
            question: question?.question ?? SYMPTOM_LABELS[answer.key] ?? formatKey(answer.key),
            label: SYMPTOM_LABELS[answer.key] ?? question?.question ?? formatKey(answer.key),
            categoryLabel: CATEGORY_LABELS[answer.category] ?? formatKey(answer.category),
            intensity: INTENSITY_LABELS[answer.value] ?? '—'
         };
      })
      .sort((a, b) => b.value - a.value || a.questionId - b.questionId);

   const activeSymptoms = symptomRows.filter(symptom => symptom.value > 0);


   // Distribución
   const intensityDistribution = {
      much: symptomRows.filter(symptom => symptom.value === 3).length,
      quite: symptomRows.filter(symptom => symptom.value === 2).length,
      little: symptomRows.filter(symptom => symptom.value === 1).length,
      none: symptomRows.filter(symptom => symptom.value === 0).length
   };


   // Hábitos
   const sortedHabits = [...habitAnswers].sort((a, b) => b.value - a.value);


   // Derivación Organon / Iztapalapa
   const isIztapalapa = program === 'iztapalapa';
   const clinicalReferral = isIztapalapa ? evaluateClinicalReferral(answers, score) : null;


   /**
    * Construye el PDF a partir del DOM del reporte.
    * Devuelve el objeto jsPDF listo para descargar o exportar como Blob.
    */
   const construirPdf = async () => {
      if (!reportRef.current) return null;

      const pdf = await crearDocumentoPdf();
      await agregarElementoAPdf(pdf, reportRef.current);

      return pdf;
   };


   // Descargar PDF
   const downloadMedicalReport = async () => {

      if (isGenerating) return;

      try {
         setIsGenerating(true);

         const pdf = await construirPdf();
         if (!pdf) return;

         const patientFileName = nombreArchivoSeguro(fullName);

         pdf.save(
            patientFileName
               ? `reporte-medico-menotest-${patientFileName}.pdf`
               : 'reporte-medico-menotest.pdf'
         );

      } catch (error) {

         console.error('[MenoTest] Error generando reporte médico:', error);

      } finally {

         setIsGenerating(false);
      }
   };


   // Expone la generación silenciosa (sin descargar) para el envío automático por correo
   useImperativeHandle(ref, () => ({
      generarPdfBlob: async () => {
         const pdf = await construirPdf();
         return pdf ? (pdf.output('blob') as Blob) : null;
      },
   }), []);


   return (
      <>

         {/* Botón abrir */}
         <button type="button" onClick={() => setIsOpen(true)} className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-full border border-[#6e0b6c] bg-white px-6 py-3 text-sm font-semibold text-[#6e0b6c] transition hover:bg-[#f8f1f8]">
            <FileText size={17} />
            Ver reporte médico
         </button>


         {/*
            Modal SIEMPRE montado en el DOM.
            - Cuando isOpen = true: se muestra como overlay normal.
            - Cuando isOpen = false: se posiciona fuera de la pantalla, sin interacción
              y con opacidad 0. Así `reportRef.current` nunca es null y el PDF médico
              puede generarse en segundo plano apenas se muestran los resultados.
         */}
         <div
            aria-hidden={!isOpen}
            className={
               isOpen
                  ? 'fixed inset-0 z-[100] overflow-y-auto bg-black/60 px-3 py-5 sm:px-6 sm:py-8'
                  : 'pointer-events-none fixed left-[-9999px] top-0 opacity-0'
            }
         >

            <div className="mx-auto max-w-6xl">


               {/* Controles */}
               <div className="sticky top-3 z-20 mb-4 flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">

                  <div>
                     <p className="font-bold text-[#171717]">Vista previa del reporte médico</p>
                     <p className="mt-1 text-xs text-[#6b7280]">Puedes revisar el contenido antes de descargarlo.</p>
                  </div>


                  <div className="flex flex-wrap gap-2">

                     <button type="button" onClick={downloadMedicalReport} disabled={isGenerating} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6e0b6c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#570956] disabled:cursor-not-allowed disabled:opacity-60">
                        {isGenerating ? <LoaderCircle size={16} className="animate-spin" /> : <Download size={16} />}
                        {isGenerating ? 'Generando...' : 'Descargar PDF'}
                     </button>

                     <button type="button" onClick={() => setIsOpen(false)} disabled={isGenerating} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-5 py-2.5 text-sm font-semibold text-[#4b5563] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-60">
                        <X size={16} />
                        Cerrar
                     </button>

                  </div>

               </div>


               {/* Fondo vista previa */}
               <div className="overflow-x-auto rounded-[28px] bg-[#d9d9d9] p-3 shadow-2xl sm:p-6">

                  {/* Documento — SIEMPRE montado, es el que se convierte a PDF */}
                  <div ref={reportRef} className="mx-auto w-[900px] bg-white px-12 py-10 text-[#171717]">


                     {/* Encabezado */}
                     <header className="border-b-4 border-[#6e0b6c] pb-6">

                        <div className="flex items-center justify-between gap-8">

                           <div>
                              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8d2a8a]">MenoTest</p>
                              <h1 className="mt-2 text-3xl font-bold text-[#171717]">Reporte para profesional de salud</h1>
                              <p className="mt-2 text-sm leading-6 text-[#6b7280]">Resumen estructurado de las respuestas proporcionadas durante la evaluación.</p>
                           </div>

                           <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f5eaf5] text-[#6e0b6c]">
                              <Stethoscope size={27} />
                           </div>

                        </div>

                     </header>


                     {/* Datos paciente */}
                     <MedicalSection number="1" title="Datos de la paciente">

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                           <MedicalData label="Nombre" value={fullName || '—'} />
                           <MedicalData label="Edad" value={age > 0 ? `${age} años` : '—'} />
                           <MedicalData label="Correo electrónico" value={patient.email || '—'} />
                           <MedicalData label="Fecha de nacimiento" value={formattedBirthDate} />
                           <MedicalData label="Estatura" value={rawHeight > 0 ? `${rawHeight} cm` : '—'} />
                           <MedicalData label="Peso" value={weight > 0 ? `${weight} kg` : '—'} />
                           <MedicalData label="IMC" value={imc > 0 ? imc.toFixed(1) : '—'} />
                           <MedicalData label="Clasificación IMC" value={imc > 0 ? imcClassification : '—'} />
                        </div>

                     </MedicalSection>


                     {/* Contexto menstrual */}
                     <MedicalSection number="2" title="Contexto menstrual">

                        <div className="grid grid-cols-2 gap-4">

                           <div className="rounded-2xl border border-[#eadfea] bg-[#fcf9fc] p-5">
                              <p className="text-xs font-bold uppercase tracking-wide text-[#8d2a8a]">Situación reportada</p>
                              <p className="mt-2 text-base font-semibold leading-6 text-[#171717]">{menstruationLabel}</p>
                           </div>

                           <div className="rounded-2xl border border-[#eadfea] bg-[#fcf9fc] p-5">
                              <p className="text-xs font-bold uppercase tracking-wide text-[#8d2a8a]">Etapa orientativa</p>
                              <p className="mt-2 text-base font-semibold leading-6 text-[#171717]">{stageResult.stage}</p>
                           </div>

                        </div>

                     </MedicalSection>


                     {/* Síntomas */}
                     <MedicalSection number="3" title="Síntomas reportados">

                        <p className="mb-5 text-sm leading-6 text-[#6b7280]">Las respuestas se muestran ordenadas de mayor a menor intensidad. La escala utilizada es Nada = 0, Poco = 1, Bastante = 2 y Mucho = 3.</p>

                        {activeSymptoms.length > 0 ? (

                           <div className="overflow-hidden rounded-2xl border border-[#e5e7eb]">

                              <div className="grid grid-cols-[1fr_180px_120px] bg-[#f8f1f8] px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#6e0b6c]">
                                 <span>Síntoma evaluado</span>
                                 <span>Área</span>
                                 <span>Intensidad</span>
                              </div>

                              {activeSymptoms.map(symptom => (
                                 <div key={symptom.key} className="grid grid-cols-[1fr_180px_120px] items-center border-t border-[#eeeeee] px-4 py-3 text-xs">

                                    <span className="pr-4 font-medium leading-5 text-[#374151]">{symptom.label}</span>

                                    <span className="pr-4 text-[#6b7280]">{symptom.categoryLabel}</span>

                                    <span className="font-semibold text-[#171717]">{symptom.intensity} · {symptom.value}</span>

                                 </div>
                              ))}

                           </div>

                        ) : (

                           <div className="rounded-2xl bg-[#fafafa] p-5">
                              <p className="text-sm text-[#6b7280]">No se reportaron síntomas con intensidad mayor a cero.</p>
                           </div>

                        )}

                     </MedicalSection>


                     {/* Sin síntomas */}
                     {intensityDistribution.none > 0 && (
                        <MedicalSection number="4" title="Síntomas sin presencia reportada">

                           <div className="flex flex-wrap gap-2">
                              {symptomRows.filter(symptom => symptom.value === 0).map(symptom => <span key={symptom.key} className="rounded-full px-3 py-1.5 text-xs font-medium text-[#6e0b6c]">{symptom.label}</span>)}
                           </div>

                        </MedicalSection>
                     )}


                     {/* Hábitos */}
                     <MedicalSection number="5" title="Hábitos reportados">

                        <p className="mb-5 text-sm leading-6 text-[#6b7280]">Los hábitos se muestran como información complementaria y no forman parte de la puntuación global de síntomas.</p>


                        {sortedHabits.length > 0 ? (

                           <div className="grid grid-cols-2 gap-3">

                              {sortedHabits.map(habit => (
                                 <div key={habit.habitId} className="flex items-center justify-between gap-4 rounded-xl border border-[#eeeeee] bg-[#fafafa] px-4 py-3">

                                    <div>
                                       <p className="text-xs font-semibold text-[#374151]">{HABIT_LABELS[habit.habitId] ?? formatKey(habit.habitId)}</p>
                                       <p className="mt-1 text-[10px] text-[#9ca3af]">{HABIT_VALUE_LABELS[habit.value] ?? `Valor ${habit.value}`}</p>
                                    </div>

                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-[#6e0b6c]">{habit.value}</span>

                                 </div>
                              ))}

                           </div>

                        ) : (

                           <p className="text-sm text-[#6b7280]">No se encontraron respuestas de hábitos.</p>

                        )}

                     </MedicalSection>


                     {/* Orientación clínica Organon */}
                     {isIztapalapa && clinicalReferral && (
                        <MedicalSection number="6" title="Orientación de atención">

                           <p className="mb-5 text-sm leading-6 text-[#6b7280]">Las siguientes rutas se activan mediante las reglas de tamizaje configuradas para este programa. Su activación no representa un diagnóstico.</p>


                           <div className="grid grid-cols-3 gap-4">
                              <MedicalReferralCard icon={Stethoscope} letter="M" label="Medicina General" active={clinicalReferral.generalMedicine.requiresAttention} />
                              <MedicalReferralCard icon={HeartPulse} letter="G" label="Ginecología" active={clinicalReferral.gynecology.requiresAttention} />
                              <MedicalReferralCard icon={Brain} letter="P" label="Psicología" active={clinicalReferral.psychology.requiresAttention} />
                           </div>


                           {/* Medicina General */}
                           {clinicalReferral.generalMedicine.requiresAttention && (
                              <div className="mt-5 rounded-2xl border border-[#eadfea] p-5">

                                 <div className="flex items-center gap-3">
                                    <Stethoscope size={18} className="text-[#6e0b6c]" />
                                    <p className="font-bold text-[#171717]">Medicina General</p>
                                 </div>

                                 <div className="mt-4 grid grid-cols-2 gap-4">
                                    <MedicalData label="Puntaje de tamizaje" value={`${clinicalReferral.generalMedicine.score} / 18`} />
                                    <MedicalData label="Atención prioritaria" value={clinicalReferral.generalMedicine.priority ? 'Sí' : 'No'} />
                                 </div>

                                 {clinicalReferral.generalMedicine.triggeredByBreathing && (
                                    <p className="mt-4 rounded-xl bg-[#f8f1f8] px-4 py-3 text-xs leading-5 text-[#6b7280]">La ruta también se activó por la respuesta registrada en dificultad para respirar.</p>
                                 )}

                              </div>
                           )}


                           {/* Ginecología */}
                           {clinicalReferral.gynecology.requiresAttention && (
                              <div className="mt-4 rounded-2xl border border-[#eadfea] p-5">

                                 <div className="flex items-center gap-3">
                                    <HeartPulse size={18} className="text-[#6e0b6c]" />
                                    <p className="font-bold text-[#171717]">Ginecología</p>
                                 </div>

                                 <div className="mt-4">
                                    <MedicalData label="Criterio de activación" value={getGynecologyReason(clinicalReferral.gynecology.triggeredByTotalScore, clinicalReferral.gynecology.triggeredByRescue)} />
                                 </div>

                                 {clinicalReferral.gynecology.triggeredByRescue && clinicalReferral.gynecology.rescueSymptoms.length > 0 && (
                                    <div className="mt-4">
                                       <p className="text-[10px] font-bold uppercase tracking-wide text-[#9ca3af]">Síntomas involucrados en criterio de rescate</p>

                                       <div className="mt-2 flex flex-wrap gap-2">
                                          {clinicalReferral.gynecology.rescueSymptoms.map(key => <span key={key} className="rounded-full bg-[#f8f1f8] px-3 py-1 text-xs font-semibold text-[#6e0b6c]">{SYMPTOM_LABELS[key] ?? formatKey(key)}</span>)}
                                       </div>
                                    </div>
                                 )}

                              </div>
                           )}


                           {/* Psicología */}
                           {clinicalReferral.psychology.requiresAttention && (
                              <div className="mt-4 rounded-2xl border border-[#eadfea] p-5">

                                 <div className="flex items-center gap-3">
                                    <Brain size={18} className="text-[#6e0b6c]" />
                                    <p className="font-bold text-[#171717]">Psicología</p>
                                 </div>

                                 {clinicalReferral.psychology.triggeredSymptoms.length > 0 && (
                                    <div className="mt-4">
                                       <p className="text-[10px] font-bold uppercase tracking-wide text-[#9ca3af]">Respuestas que activaron la orientación</p>

                                       <div className="mt-2 flex flex-wrap gap-2">
                                          {clinicalReferral.psychology.triggeredSymptoms.map(key => <span key={key} className="rounded-full px-3 py-1 text-xs font-semibold text-[#6e0b6c]">{SYMPTOM_LABELS[key] ?? formatKey(key)}</span>)}
                                       </div>
                                    </div>
                                 )}

                              </div>
                           )}

                        </MedicalSection>
                     )}


                     {/* Observaciones */}
                     <MedicalSection number={isIztapalapa ? '7' : '6'} title="Consideraciones para valoración">

                        <div className="rounded-2xl bg-[#f8f1f8] p-5">

                           <div className="flex items-start gap-3">

                              <Activity size={19} className="mt-0.5 shrink-0 text-[#6e0b6c]" />

                              <p className="text-sm leading-6 text-[#4b5563]">Se sugiere revisar los síntomas y hábitos reportados en conjunto con antecedentes personales, antecedentes ginecológicos, tratamientos actuales, exploración física y criterio clínico del profesional de salud.</p>

                           </div>

                        </div>

                     </MedicalSection>


                     {/* Disclaimer */}
                     <footer className="mt-10 border-t border-[#e5e7eb] pt-6">

                        <div className="flex items-start gap-3">

                           <Check size={17} className="mt-0.5 shrink-0 text-[#6e0b6c]" />

                           <div>
                              <p className="text-xs font-semibold text-[#374151]">Documento de apoyo para valoración profesional</p>
                              <p className="mt-1 text-[11px] leading-5 text-[#9ca3af]">Este reporte resume las respuestas proporcionadas por la paciente y, cuando corresponde, las reglas de tamizaje configuradas en MenoTest. No constituye diagnóstico, prescripción ni sustituye la valoración de un profesional de salud.</p>
                           </div>

                        </div>

                     </footer>

                  </div>

               </div>

            </div>

         </div>

      </>
   );
});

export default MedicalReport;


// Sección
function MedicalSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
   return (
      <section className="mt-9">

         <div className="mb-5 border-b border-[#e5e7eb] pb-3">
            <h2 className="text-lg font-bold text-[#171717]">{number}.- {title}</h2>
         </div>

         {children}

      </section>
   );
}


// Dato
function MedicalData({ label, value }: { label: string; value: string }) {
   return (
      <div>
         <p className="text-[10px] font-bold uppercase tracking-wide text-[#9ca3af]">{label}</p>
         <p className="mt-1 text-sm font-semibold leading-5 text-[#374151]">{value}</p>
      </div>
   );
}


// Ruta clínica
function MedicalReferralCard({ icon: Icon, letter, label, active }: { icon: typeof Activity; letter: string; label: string; active: boolean }) {
   return (
      <div className={`rounded-2xl border p-4 ${active ? 'border-[#d9bfd8] bg-[#fcf8fc]' : 'border-[#eeeeee] bg-[#fafafa]'}`}>

         <div className="flex items-center justify-between">

            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? 'bg-[#f5eaf5] text-[#6e0b6c]' : 'bg-[#f3f4f6] text-[#9ca3af]'}`}>
               <Icon size={18} />
            </div>

            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${active ? 'bg-[#6e0b6c] text-white' : 'bg-[#e5e7eb] text-[#9ca3af]'}`}>
               {active ? <Check size={13} strokeWidth={3} /> : '—'}
            </div>

         </div>

         <p className={`mt-3 text-lg font-bold ${active ? 'text-[#6e0b6c]' : 'text-[#9ca3af]'}`}>{letter}</p>
         <p className={`mt-1 text-xs font-semibold ${active ? 'text-[#374151]' : 'text-[#9ca3af]'}`}>{label}</p>
         <p className="mt-1 text-[10px] text-[#9ca3af]">{active ? 'Ruta activada' : 'Sin activación'}</p>

      </div>
   );
}


// Motivo Ginecología
function getGynecologyReason(triggeredByTotalScore: boolean, triggeredByRescue: boolean): string {

   if (triggeredByTotalScore && triggeredByRescue) return 'Puntaje global y criterio de rescate sintomático';
   if (triggeredByTotalScore) return 'Puntaje global del MenoTest';
   if (triggeredByRescue) return 'Criterio de rescate sintomático';

   return 'Sin activación';
}


// Fecha
function formatDate(date: string): string {

   const [year, month, day] = date.split('-');

   if (!year || !month || !day) return '—';

   return `${day}/${month}/${year}`;
}


// Formatea keys
function formatKey(key: string): string {
   return key.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}