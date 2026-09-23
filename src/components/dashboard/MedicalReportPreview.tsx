'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Activity, FileText, HeartPulse, X } from 'lucide-react';

interface Patient {
   name: string;
   paternalLastName: string;
   maternalLastName: string;
   email: string;
   phone: string;
   birthDate: string;
   age: number;
   country: string;
   height: number;
   weight: number;
}

interface Referral {
   active: boolean;
   priority: boolean;
}

interface Symptom {
   name: string;
   category: string;
   intensity: string;
   value: number;
}

interface Habit {
   name: string;
   answer: string;
   level: string;
}

interface Recommendation {
   specialist: string;
   text: string;
}

interface Evaluation {
   id: number;
   patient: Patient;
   stage: string;
   score: number;
   imc: string;
   status: string;
   date: string;
   program: string;
   menstruation: string;
   referrals: {
      medicine: Referral;
      gynecology: Referral;
      psychology: Referral;
   };
   symptoms: Symptom[];
   habits: Habit[];
   recommendations: Recommendation[];
}

interface Props {
   open: boolean;
   evaluation: Evaluation;
   onClose: () => void;
}

export default function MedicalReportPreview({ open, evaluation, onClose }: Props) {

   // Control del modal
   useEffect(() => {
      if (!open) return;

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (event: KeyboardEvent) => {
         if (event.key === 'Escape') onClose();
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
         document.body.style.overflow = previousOverflow;
         window.removeEventListener('keydown', handleKeyDown);
      };
   }, [open, onClose]);

   if (!open || typeof document === 'undefined') return null;

   const fullName = `${evaluation.patient.name} ${evaluation.patient.paternalLastName} ${evaluation.patient.maternalLastName}`;

   return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#171717]/50 p-0 backdrop-blur-sm sm:p-5" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>

         {/* Modal */}
         <div className="flex h-full w-full flex-col overflow-hidden bg-[#f5f5f5] shadow-2xl sm:h-[94vh] sm:max-w-[1100px] sm:rounded-2xl">

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 py-4 sm:px-6">

               <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5eaf5] text-[#6e0b6c]">
                     <FileText size={19} />
                  </div>

                  <div>
                     <h2 className="text-sm font-bold text-[#171717] sm:text-base">Reporte médico</h2>
                     <p className="text-xs text-[#9ca3af]">Vista previa · Evaluación #{evaluation.id}</p>
                  </div>
               </div>

               <button type="button" onClick={onClose} aria-label="Cerrar reporte" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e7eb] text-[#6b7280] transition hover:bg-[#f5eaf5] hover:text-[#6e0b6c]">
                  <X size={19} />
               </button>

            </div>

            {/* Documento */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">

               <article className="mx-auto min-h-[1000px] max-w-[850px] bg-white p-5 shadow-sm sm:p-8 lg:p-12">

                  {/* Encabezado */}
                  <div className="border-b-2 border-[#6e0b6c] pb-6">

                     <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                        <div>
                           <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6e0b6c]">MenoTest</p>
                           <h1 className="mt-2 text-2xl font-bold text-[#171717]">Reporte de evaluación</h1>
                           <p className="mt-2 max-w-[500px] text-xs leading-5 text-[#6b7280]">Resumen de la información registrada durante la evaluación MenoTest.</p>
                        </div>

                        <div className="text-left sm:text-right">
                           <p className="text-xs text-[#9ca3af]">Evaluación</p>
                           <p className="mt-1 text-sm font-bold text-[#374151]">#{evaluation.id}</p>
                           <p className="mt-2 text-xs text-[#9ca3af]">{evaluation.date}</p>
                        </div>

                     </div>

                  </div>

                  {/* 1 Datos */}
                  <ReportSection number="1" title="Datos de la paciente">

                     <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                        <ReportField label="Nombre completo" value={fullName} />
                        <ReportField label="Edad" value={`${evaluation.patient.age} años`} />
                        <ReportField label="Correo electrónico" value={evaluation.patient.email} />
                        <ReportField label="Teléfono" value={evaluation.patient.phone} />
                        <ReportField label="Fecha de nacimiento" value={evaluation.patient.birthDate} />
                        <ReportField label="País" value={evaluation.patient.country} />
                        <ReportField label="Estatura" value={`${evaluation.patient.height} cm`} />
                        <ReportField label="Peso" value={`${evaluation.patient.weight} kg`} />
                        <ReportField label="IMC" value={evaluation.imc} />
                        <ReportField label="Campaña" value={evaluation.program} />
                     </div>

                  </ReportSection>

                  {/* 2 Contexto */}
                  <ReportSection number="2" title="Contexto menstrual y etapa orientativa">

                     <div className="rounded-xl border border-[#eee7ee] bg-[#fcfbfc] p-4">
                        <p className="text-xs font-medium text-[#9ca3af]">Contexto menstrual</p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-[#374151]">{evaluation.menstruation}</p>
                     </div>

                     <div className="mt-3 rounded-xl bg-[#f5eaf5] p-4">
                        <p className="text-xs font-medium text-[#8d6f8c]">Etapa orientativa</p>
                        <p className="mt-1 text-base font-bold text-[#6e0b6c]">{evaluation.stage}</p>
                     </div>

                  </ReportSection>

                  {/* 3 Síntomas */}
                  <ReportSection number="3" title="Síntomas reportados">

                     <div className="overflow-hidden rounded-xl border border-[#e5e7eb]">

                        <table className="w-full text-left">

                           <thead>
                              <tr className="bg-[#fafafa]">
                                 <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">Síntoma</th>
                                 <th className="hidden px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] sm:table-cell">Categoría</th>
                                 <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">Respuesta</th>
                              </tr>
                           </thead>

                           <tbody>
                              {evaluation.symptoms.map((symptom, index) => (
                                 <tr key={`${symptom.name}-${index}`} className="border-t border-[#eeeeee]">
                                    <td className="px-4 py-3 text-xs font-semibold text-[#374151]">{symptom.name}</td>
                                    <td className="hidden px-4 py-3 text-xs text-[#6b7280] sm:table-cell">{symptom.category}</td>
                                    <td className="px-4 py-3 text-right">
                                       <span className="text-xs font-semibold text-[#374151]">{symptom.intensity}</span>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>

                        </table>

                     </div>

                  </ReportSection>

                  {/* 4 Hábitos */}
                  <ReportSection number="4" title="Hábitos">

                     <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {evaluation.habits.map((habit, index) => (
                           <div key={`${habit.name}-${index}`} className="rounded-lg border border-[#eeeeee] px-4 py-3">
                              <p className="text-[10px] font-medium uppercase tracking-wide text-[#9ca3af]">{habit.name}</p>
                              <p className="mt-1 text-xs font-semibold text-[#374151]">{habit.answer}</p>
                           </div>
                        ))}
                     </div>

                  </ReportSection>

                  {/* 5 Canalización */}
                  {evaluation.program === 'Organon' && (
                     <ReportSection number="5" title="Rutas de atención">

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                           <ReportReferral letter="M" title="Medicina General" active={evaluation.referrals.medicine.active} priority={evaluation.referrals.medicine.priority} />
                           <ReportReferral letter="G" title="Ginecología" active={evaluation.referrals.gynecology.active} priority={evaluation.referrals.gynecology.priority} />
                           <ReportReferral letter="P" title="Psicología" active={evaluation.referrals.psychology.active} priority={evaluation.referrals.psychology.priority} />
                        </div>

                     </ReportSection>
                  )}

                  {/* Recomendaciones */}
                  <ReportSection number={evaluation.program === 'Organon' ? '6' : '5'} title="Recomendaciones">

                     <div className="space-y-3">
                        {evaluation.recommendations.map((recommendation, index) => (
                           <div key={`${recommendation.specialist}-${index}`} className="rounded-xl border border-[#eeeeee] p-4">
                              <p className="text-xs font-bold text-[#6e0b6c]">{recommendation.specialist}</p>
                              <p className="mt-1.5 text-xs leading-5 text-[#6b7280]">{recommendation.text}</p>
                           </div>
                        ))}
                     </div>

                  </ReportSection>

                  {/* Consideraciones */}
                  <ReportSection number={evaluation.program === 'Organon' ? '7' : '6'} title="Consideraciones">

                     <div className="rounded-xl border border-[#eee7ee] bg-[#fafafa] p-4">
                        <div className="flex gap-3">
                           <HeartPulse size={18} className="mt-0.5 shrink-0 text-[#6e0b6c]" />
                           <p className="text-xs leading-5 text-[#6b7280]">Este reporte resume las respuestas registradas durante MenoTest y tiene un propósito informativo y orientativo. No sustituye una valoración, diagnóstico o tratamiento realizado por profesionales de la salud.</p>
                        </div>
                     </div>

                  </ReportSection>

                  {/* Footer */}
                  <footer className="mt-10 flex items-center justify-between border-t border-[#eeeeee] pt-5">
                     <div>
                        <p className="text-xs font-bold text-[#6e0b6c]">MenoTest · Sin Reglas</p>
                        <p className="mt-1 text-[10px] text-[#9ca3af]">Reporte de evaluación</p>
                     </div>

                     <Activity size={20} className="text-[#d7bdd6]" />
                  </footer>

               </article>

            </div>

         </div>

      </div>,
      document.body
   );
}

// Sección
function ReportSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
   return (
      <section className="mt-8">
         <h2 className="mb-4 text-sm font-bold text-[#171717]">{number}.- {title}</h2>
         {children}
      </section>
   );
}

// Campo
function ReportField({ label, value }: { label: string; value: string }) {
   return (
      <div>
         <p className="text-[10px] font-medium uppercase tracking-wide text-[#9ca3af]">{label}</p>
         <p className="mt-1 text-xs font-semibold text-[#374151]">{value}</p>
      </div>
   );
}

// Canalización
function ReportReferral({ letter, title, active, priority }: { letter: string; title: string; active: boolean; priority: boolean }) {
   return (
      <div className={`rounded-xl border p-4 ${active ? 'border-[#dfc5de] bg-[#fcf7fc]' : 'border-[#eeeeee] bg-[#fafafa]'}`}>
         <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${active ? 'bg-[#6e0b6c] text-white' : 'bg-[#eeeeee] text-[#9ca3af]'}`}>{letter}</div>
         <p className="mt-3 text-xs font-bold text-[#374151]">{title}</p>
         <p className={`mt-1 text-[10px] font-semibold ${active ? 'text-[#6e0b6c]' : 'text-[#9ca3af]'}`}>{active ? priority ? 'Canalización prioritaria' : 'Canalización sugerida' : 'Sin canalización'}</p>
      </div>
   );
}