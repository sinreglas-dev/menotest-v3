'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import MedicalReportPreview from '@/components/dashboard/MedicalReportPreview';
import { Activity, ArrowLeft, CalendarDays, CheckCircle2, ClipboardList, Droplets, FileText, HeartPulse, Mail, MapPin, Phone, Ruler, Scale, UserRound } from 'lucide-react';

// Datos fake
const EVALUATIONS = [
   {
      id: 1284,
      patient: {
         name: 'María',
         paternalLastName: 'González',
         maternalLastName: 'López',
         email: 'maria.gonzalez@email.com',
         phone: '5512345678',
         birthDate: '18 de mayo de 1974',
         age: 52,
         country: 'México',
         height: 164,
         weight: 66
      },
      stage: 'Transición menopáusica',
      score: 38,
      imc: '24.5',
      status: 'Completo',
      date: '22 Sep 2026',
      program: 'Organon',
      menstruation: 'Sí, pero ha cambiado en frecuencia o regularidad.',
      referrals: {
         medicine: { active: true, priority: false },
         gynecology: { active: true, priority: false },
         psychology: { active: false, priority: false }
      },
      symptoms: [
         { name: 'Palpitaciones', category: 'Cardiovascular', intensity: 'Bastante', value: 2 },
         { name: 'Tensión o nerviosismo', category: 'Emocional', intensity: 'Poco', value: 1 },
         { name: 'Dificultades relacionadas con el descanso', category: 'Descanso', intensity: 'Mucho', value: 3 },
         { name: 'Ansiedad', category: 'Emocional', intensity: 'Poco', value: 1 },
         { name: 'Dificultad para concentrarse', category: 'Cognitivo', intensity: 'Bastante', value: 2 },
         { name: 'Falta de energía', category: 'Energía', intensity: 'Bastante', value: 2 },
         { name: 'Mareo', category: 'Neurológico', intensity: 'Bastante', value: 2 },
         { name: 'Dolor de cabeza', category: 'Neurológico', intensity: 'Bastante', value: 2 },
         { name: 'Bochornos', category: 'Vasomotor', intensity: 'Mucho', value: 3 },
         { name: 'Sudoración', category: 'Vasomotor', intensity: 'Bastante', value: 2 },
         { name: 'Resequedad', category: 'Genitourinario', intensity: 'Bastante', value: 2 },
         { name: 'Niebla mental', category: 'Cognitivo', intensity: 'Bastante', value: 2 }
      ],
      habits: [
         { name: 'Consumo de cafeína', answer: 'Moderado', level: 'medium' },
         { name: 'Consumo de alcohol', answer: 'Ocasional', level: 'low' },
         { name: 'Calidad del descanso', answer: 'Menos de 7 horas', level: 'high' },
         { name: 'Nivel de estrés', answer: 'Frecuente', level: 'high' },
         { name: 'Actividad física', answer: '3 veces por semana', level: 'low' },
         { name: 'Hidratación', answer: 'Adecuada', level: 'low' }
      ],
      recommendations: [
         { specialist: 'Medicina general', text: 'Dar seguimiento a los síntomas físicos reportados y valorar su evolución.' },
         { specialist: 'Ginecología', text: 'Considerar valoración ginecológica de acuerdo con los síntomas vasomotores y genitourinarios reportados.' },
         { specialist: 'Bienestar', text: 'Mantener hábitos de descanso, hidratación y actividad física de forma regular.' }
      ]
   }
];

export default function MenoTestDetailPage() {

   const params = useParams();
   const [reportOpen, setReportOpen] = useState(false);
   const id = Number(params.id);

   // Evaluación
   const evaluation = EVALUATIONS.find(item => item.id === id) || EVALUATIONS[0];
   const fullName = `${evaluation.patient.name} ${evaluation.patient.paternalLastName} ${evaluation.patient.maternalLastName}`;

   return (
      <div className="space-y-6">

         {/* Regresar */}
         <Link href="/dashboard/menotest" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6b7280] transition hover:text-[#6e0b6c]">
            <ArrowLeft size={17} />
            Volver a MenoTest
         </Link>

         {/* Encabezado */}
         <section className="overflow-hidden rounded-2xl border border-[#eee7ee] bg-white shadow-sm">

            <div className="border-b border-[#f0eaf0] p-5 sm:p-6">
               <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div className="flex items-start gap-4">
                     <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f5eaf5] text-[#6e0b6c]">
                        <UserRound size={25} />
                     </div>

                     <div>
                        <div className="flex flex-wrap items-center gap-2">
                           <h1 className="text-xl font-bold tracking-tight text-[#171717] sm:text-2xl">{fullName}</h1>
                           <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">{evaluation.status}</span>
                        </div>

                        <p className="mt-1 text-sm text-[#6b7280]">{evaluation.patient.email}</p>

                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#9ca3af]">
                           <span className="flex items-center gap-1.5"><ClipboardList size={14} />Evaluación #{evaluation.id}</span>
                           <span className="flex items-center gap-1.5"><CalendarDays size={14} />{evaluation.date}</span>
                           <span className="rounded-lg bg-[#f5eaf5] px-2.5 py-1 font-semibold text-[#6e0b6c]">{evaluation.program}</span>
                        </div>
                     </div>
                  </div>

                  <button type="button" onClick={() => setReportOpen(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#ded6de] bg-white px-4 text-sm font-semibold text-[#6e0b6c] transition hover:bg-[#f5eaf5]">
                     <FileText size={17} />
                     Ver reporte médico
                  </button>

               </div>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-2 divide-x divide-y divide-[#f0eaf0] sm:grid-cols-4 sm:divide-y-0">

               <SummaryItem label="Etapa orientativa" value={evaluation.stage} />
               <SummaryItem label="Puntaje" value={`${evaluation.score} / 75`} />
               <SummaryItem label="IMC" value={evaluation.imc} />
               <SummaryItem label="Campaña" value={evaluation.program} />

            </div>

         </section>

         {/* Datos + contexto */}
         <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

            {/* Paciente */}
            <section className="rounded-2xl border border-[#eee7ee] bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">

               <SectionTitle icon={UserRound} title="Datos de la paciente" />

               <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  <PatientData icon={UserRound} label="Nombre" value={fullName} />
                  <PatientData icon={Mail} label="Correo electrónico" value={evaluation.patient.email} />
                  <PatientData icon={Phone} label="Teléfono" value={evaluation.patient.phone} />
                  <PatientData icon={CalendarDays} label="Fecha de nacimiento" value={evaluation.patient.birthDate} />
                  <PatientData icon={UserRound} label="Edad" value={`${evaluation.patient.age} años`} />
                  <PatientData icon={MapPin} label="País" value={evaluation.patient.country} />
                  <PatientData icon={Ruler} label="Estatura" value={`${evaluation.patient.height} cm`} />
                  <PatientData icon={Scale} label="Peso" value={`${evaluation.patient.weight} kg`} />
                  <PatientData icon={Activity} label="IMC" value={evaluation.imc} />
               </div>

            </section>

            {/* Contexto */}
            <section className="rounded-2xl border border-[#eee7ee] bg-white p-5 shadow-sm sm:p-6">

               <SectionTitle icon={Droplets} title="Contexto menstrual" />

               <div className="mt-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-[#9ca3af]">Respuesta</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#374151]">{evaluation.menstruation}</p>
               </div>

               <div className="mt-5 rounded-xl bg-[#faf7fa] p-4">
                  <p className="text-xs font-medium text-[#9ca3af]">Etapa orientativa</p>
                  <p className="mt-1 text-sm font-bold text-[#6e0b6c]">{evaluation.stage}</p>
               </div>

            </section>

         </div>

         {/* Rutas Organon */}
         {evaluation.program === 'Organon' && (
            <section className="rounded-2xl border border-[#eee7ee] bg-white p-5 shadow-sm sm:p-6">

               <SectionTitle icon={HeartPulse} title="Rutas de atención" />

               <p className="mt-2 text-xs leading-5 text-[#9ca3af]">Resultado de las reglas de canalización correspondientes al programa Organon.</p>

               <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <ReferralCard letter="M" title="Medicina General" active={evaluation.referrals.medicine.active} priority={evaluation.referrals.medicine.priority} />
                  <ReferralCard letter="G" title="Ginecología" active={evaluation.referrals.gynecology.active} priority={evaluation.referrals.gynecology.priority} />
                  <ReferralCard letter="P" title="Psicología" active={evaluation.referrals.psychology.active} priority={evaluation.referrals.psychology.priority} />
               </div>

            </section>
         )}

         {/* Síntomas */}
         <section className="overflow-hidden rounded-2xl border border-[#eee7ee] bg-white shadow-sm">

            <div className="p-5 sm:p-6">
               <SectionTitle icon={Activity} title="Síntomas reportados" />
               <p className="mt-2 text-xs text-[#9ca3af]">Síntomas con una intensidad mayor a “Nada”.</p>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full min-w-[700px] text-left">

                  <thead>
                     <tr className="border-y border-[#f0eaf0] bg-[#fcfbfc]">
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Síntoma</th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Categoría</th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Respuesta</th>
                        <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Valor</th>
                     </tr>
                  </thead>

                  <tbody>
                     {evaluation.symptoms.map((symptom, index) => (
                        <tr key={`${symptom.name}-${index}`} className="border-b border-[#f4f1f4] last:border-0">
                           <td className="px-6 py-4 text-sm font-semibold text-[#374151]">{symptom.name}</td>
                           <td className="px-4 py-4 text-sm text-[#6b7280]">{symptom.category}</td>
                           <td className="px-4 py-4"><IntensityBadge value={symptom.value} label={symptom.intensity} /></td>
                           <td className="px-6 py-4 text-right text-sm font-semibold text-[#374151]">{symptom.value}</td>
                        </tr>
                     ))}
                  </tbody>

               </table>
            </div>

         </section>

         {/* Hábitos */}
         <section className="rounded-2xl border border-[#eee7ee] bg-white p-5 shadow-sm sm:p-6">

            <SectionTitle icon={CheckCircle2} title="Hábitos" />

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
               {evaluation.habits.map((habit, index) => (
                  <div key={`${habit.name}-${index}`} className="flex items-center justify-between gap-4 rounded-xl border border-[#f0eaf0] p-4">
                     <div>
                        <p className="text-xs font-medium text-[#9ca3af]">{habit.name}</p>
                        <p className="mt-1 text-sm font-semibold text-[#374151]">{habit.answer}</p>
                     </div>

                     <HabitIndicator level={habit.level} />
                  </div>
               ))}
            </div>

         </section>

         {/* Recomendaciones */}
         <section className="rounded-2xl border border-[#eee7ee] bg-white p-5 shadow-sm sm:p-6">

            <SectionTitle icon={FileText} title="Recomendaciones" />

            <div className="mt-5 space-y-3">
               {evaluation.recommendations.map((recommendation, index) => (
                  <div key={`${recommendation.specialist}-${index}`} className="rounded-xl border border-[#f0eaf0] p-4 sm:p-5">
                     <div className="flex gap-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f5eaf5] text-xs font-bold text-[#6e0b6c]">{index + 1}</div>

                        <div>
                           <p className="text-sm font-bold text-[#171717]">{recommendation.specialist}</p>
                           <p className="mt-1 text-sm leading-6 text-[#6b7280]">{recommendation.text}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

         </section>
         <MedicalReportPreview open={reportOpen} evaluation={evaluation} onClose={() => setReportOpen(false)} />
         {/* <MedicalReportPreview open={true} evaluation={evaluation} onClose={() => setReportOpen(false)} /> */}
      </div>
   );
}

// Título
function SectionTitle({ icon: Icon, title }: { icon: typeof UserRound; title: string }) {
   return (
      <div className="flex items-center gap-3">
         <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5eaf5] text-[#6e0b6c]">
            <Icon size={18} />
         </div>
         <h2 className="text-base font-bold text-[#171717]">{title}</h2>
      </div>
   );
}

// Dato paciente
function PatientData({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
   return (
      <div className="flex items-start gap-3">
         <Icon size={16} className="mt-0.5 shrink-0 text-[#b0a5b0]" />
         <div className="min-w-0">
            <p className="text-xs text-[#9ca3af]">{label}</p>
            <p className="mt-1 break-words text-sm font-semibold text-[#374151]">{value}</p>
         </div>
      </div>
   );
}

// Resumen
function SummaryItem({ label, value }: { label: string; value: string }) {
   return (
      <div className="p-4 sm:p-5">
         <p className="text-[11px] font-medium uppercase tracking-wider text-[#9ca3af]">{label}</p>
         <p className="mt-1.5 text-sm font-bold text-[#374151]">{value}</p>
      </div>
   );
}

// Intensidad
function IntensityBadge({ value, label }: { value: number; label: string }) {

   const styles: Record<number, string> = {
      1: 'bg-slate-100 text-slate-600',
      2: 'bg-amber-50 text-amber-700',
      3: 'bg-rose-50 text-rose-700'
   };

   return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[value] || styles[1]}`}>{label}</span>;
}

// Hábitos
function HabitIndicator({ level }: { level: string }) {

   const styles: Record<string, string> = {
      low: 'bg-emerald-500',
      medium: 'bg-amber-500',
      high: 'bg-rose-500'
   };

   return <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${styles[level] || styles.low}`} />;
}

// Canalización
function ReferralCard({ letter, title, active, priority }: { letter: string; title: string; active: boolean; priority: boolean }) {
   return (
      <div className={`rounded-xl border p-4 ${active ? 'border-[#e1c9e0] bg-[#fcf7fc]' : 'border-[#eeeeee] bg-[#fafafa]'}`}>

         <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${active ? 'bg-[#6e0b6c] text-white' : 'bg-[#eeeeee] text-[#9ca3af]'}`}>{letter}</div>

            <div>
               <p className="text-sm font-bold text-[#374151]">{title}</p>
               <p className={`mt-0.5 text-xs font-semibold ${active ? 'text-[#6e0b6c]' : 'text-[#9ca3af]'}`}>{active ? priority ? 'Canalización prioritaria' : 'Canalización sugerida' : 'Sin canalización'}</p>
            </div>
         </div>

      </div>
   );
}