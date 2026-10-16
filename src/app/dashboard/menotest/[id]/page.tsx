'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import MedicalReportPreview from '@/components/dashboard/MedicalReportPreview';
import { Activity, ArrowLeft, CalendarDays, CheckCircle2, ClipboardList, Clock3, Droplets, FileText, HeartPulse, Mail, MapPin, Phone, Ruler, Scale, Stethoscope, UserRound, X } from 'lucide-react';

// ==================== TIPOS ====================

interface Especialista {
   id: number;
   nombre: string;
   especialidad: string;
   correo: string;
   telefono: string;
}

interface HistoriaClinica {
   completada: boolean;
   enfermedades?: string[];
   otrasEnfermedades?: string;
   medicamentos?: string;
   alergias?: string;
   cirugias?: string;
   antecedentesFamiliares?: string;
   observaciones?: string;
}



const HISTORIA_CLINICA_DEMO: HistoriaClinica = {
   completada: true,
   enfermedades: ['Hipertensión arterial', 'Hipotiroidismo', 'Migraña'],
   otrasEnfermedades: 'Gastritis crónica diagnosticada hace aproximadamente 3 años.',
   medicamentos: 'Levotiroxina 50 mcg diariamente. Losartán 50 mg cada 24 horas.',
   alergias: 'Alergia a la penicilina.',
   cirugias: 'Cesárea en 2012. Apendicectomía en 2018.',
   antecedentesFamiliares: 'Madre con diabetes mellitus tipo 2. Padre con hipertensión arterial.',
   observaciones: 'Refiere episodios frecuentes de fatiga, dificultad para dormir y dolores de cabeza ocasionales.'
};

// ==================== PÁGINA ====================

export default function MenoTestDetailPage() {
   const params = useParams();
   const id = Number(params.id);

   const [evaluation, setEvaluation] = useState<any>(null);
   const [cargando, setCargando] = useState(true);
   const [reportOpen, setReportOpen] = useState(false);

   // Especialistas
   const [modalEspecialista, setModalEspecialista] = useState(false);
   const [especialistaId, setEspecialistaId] = useState<number | null>(null);

   // Demostración
   const [mostrarHistoriaDemo, setMostrarHistoriaDemo] = useState(false);
   const esDesarrollo = process.env.NODE_ENV === 'development';

   
   const [especialistas, setEspecialistas] = useState<Especialista[]>([]);
   const [guardandoEspecialista, setGuardandoEspecialista] = useState(false);

   useEffect(() => {
      const cargar = async () => {
         try {
            const res = await fetch('/api/admin/especialistas', { cache: 'no-store' });
            if (!res.ok) return;
            const data = await res.json();
            setEspecialistas(data.datos ?? []);
         } catch (error) {
            console.error('Error cargando especialistas:', error);
         }
      };
      cargar();
   }, []);;

   // Cargar evaluación
   useEffect(() => {
      const cargar = async () => {
         setCargando(true);

         try {
            const res = await fetch(`/api/admin/evaluaciones/${id}`, { cache: 'no-store' });
            if (!res.ok) throw new Error('No encontrado');

            const data = await res.json();
            setEvaluation(data);
         } catch (error) {
            console.error('Error cargando detalle:', error);
            setEvaluation(null);
         } finally {
            setCargando(false);
         }
      };

      if (Number.isInteger(id) && id > 0) cargar();
      else setCargando(false);
   }, [id]);

   // Abrir modal
   const abrirModalEspecialista = () => {
      if (!evaluation) return;

      setEspecialistaId(evaluation.especialista_id ?? evaluation.especialista?.id ?? null);
      setModalEspecialista(true);
   };

   // Cerrar modal
   const cerrarModalEspecialista = () => {
      setModalEspecialista(false);
      setEspecialistaId(null);
   };

   // Asignación especialista
   const asignarEspecialista = async () => {
      if (!especialistaId || !evaluation) return;

      setGuardandoEspecialista(true);

      try {
         const res = await fetch(`/api/admin/evaluaciones/${evaluation.id}/especialista`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ especialistaId }),
         });

         const data = await res.json();
         if (!res.ok) throw new Error(data.error || 'No se pudo asignar');

         const esp = especialistas.find(e => e.id === especialistaId);
         if (!esp) return;

         setEvaluation((prev: any) => ({
            ...prev,
            especialista_id: esp.id,
            especialista_nombre: esp.nombre,
            especialista: {
               id: esp.id,
               nombre: esp.nombre,
               especialidad: esp.especialidad,
               correo: esp.correo,
               telefono: esp.telefono,
            },
            historia_clinica: prev.historia_clinica ?? { completada: false },
         }));

         setMostrarHistoriaDemo(false);
         cerrarModalEspecialista();
      } catch (error: any) {
         console.error(error);
         alert(error.message || 'Error al asignar especialista');
      } finally {
         setGuardandoEspecialista(false);
      }
   };

   const especialistaSeleccionada = especialistas.find(item => item.id === especialistaId);

   if (cargando) {
      return <div className="py-16 text-center text-sm text-[#9ca3af]">Cargando evaluación...</div>;
   }

   if (!evaluation) {
      return (
         <div className="py-16 text-center">
            <p className="text-sm font-semibold text-[#171717]">No encontramos esta evaluación</p>
            <Link href="/dashboard/menotest" className="mt-2 inline-block text-sm text-[#6e0b6c] hover:underline">Volver a MenoTest</Link>
         </div>
      );
   }

   const fullName = `${evaluation.patient.name ?? ''} ${evaluation.patient.paternalLastName ?? ''} ${evaluation.patient.maternalLastName ?? ''}`.trim();
   const tieneEspecialista = Boolean(evaluation.especialista_id || evaluation.especialista?.id);

   // Historia real o demostración
   const historiaClinica: HistoriaClinica | null = esDesarrollo && mostrarHistoriaDemo ? HISTORIA_CLINICA_DEMO : evaluation.historia_clinica ?? null;
   const historiaCompletada = historiaClinica?.completada === true;

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

         {/* Historia clínica */}
         <section className="overflow-hidden rounded-2xl border border-[#eee7ee] bg-white shadow-sm">

            <div className="flex flex-col gap-4 border-b border-[#f0eaf0] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
               <div>
                  <SectionTitle icon={HeartPulse} title="Historia clínica" />
                  <p className="mt-2 text-xs text-[#9ca3af]">Antecedentes médicos proporcionados por la paciente antes de su consulta.</p>
               </div>

               {tieneEspecialista && (
                  <button type="button" onClick={abrirModalEspecialista} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e4d5e3] px-4 py-2.5 text-xs font-semibold text-[#6e0b6c] transition hover:bg-[#f5eaf5]">
                     <Stethoscope size={16} />
                     Cambiar especialista
                  </button>
               )}
            </div>

            {/* Sin especialista */}
            {!tieneEspecialista && (
               <div className="flex flex-col items-center px-6 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5eaf5] text-[#6e0b6c]">
                     <Stethoscope size={30} />
                  </div>

                  <h3 className="mt-5 text-base font-bold text-[#171717]">Esta paciente aún no tiene especialista asignada</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#6b7280]">Asigna una especialista para iniciar el seguimiento médico y habilitar el proceso de historia clínica.</p>

                  <button type="button" onClick={abrirModalEspecialista} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6e0b6c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#570956]">
                     <Stethoscope size={17} />
                     Asignar especialista
                  </button>
               </div>
            )}

            {/* Especialista asignada */}
            {tieneEspecialista && (
               <div className="p-5 sm:p-6">

                  {/* Controles de demostración */}
                  {esDesarrollo && (
                     <div className="mb-5 flex flex-col gap-3 rounded-xl border border-dashed border-[#d9c2d8] bg-[#faf7fa] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                           <p className="text-xs font-bold text-[#6e0b6c]">Vista de demostración</p>
                           <p className="mt-1 text-xs text-[#6b7280]">Visualiza cómo aparecerá la historia clínica cuando la paciente complete el formulario.</p>
                        </div>

                        <button type="button" onClick={() => setMostrarHistoriaDemo(!mostrarHistoriaDemo)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#6e0b6c] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#570956]">
                           {mostrarHistoriaDemo ? 'Ver historia pendiente' : 'Ver historia completada'}
                        </button>
                     </div>
                  )}

                  {/* Especialista */}
                  <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#eadfea] bg-[#fcf9fc] p-4 sm:flex-row sm:items-center sm:justify-between">
                     <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5eaf5] text-[#6e0b6c]"><UserRound size={21} /></div>

                        <div>
                           <p className="text-xs text-[#9ca3af]">Especialista asignada</p>
                           <p className="mt-1 text-sm font-bold text-[#171717]">{evaluation.especialista_nombre ?? evaluation.especialista?.nombre ?? 'Especialista asignada'}</p>
                           {evaluation.especialista?.especialidad && <p className="mt-1 text-xs text-[#8d2a8a]">{evaluation.especialista.especialidad}</p>}
                        </div>
                     </div>

                     <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${historiaCompletada ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {historiaCompletada ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                        {historiaCompletada ? 'Historia completada' : 'Historia pendiente'}
                     </span>
                  </div>

                  {/* Historia pendiente */}
                  {!historiaCompletada && (
                     <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 px-6 py-10 text-center">
                        <Clock3 size={34} className="mx-auto text-amber-500" />
                        <h3 className="mt-4 text-base font-bold text-[#171717]">La paciente aún no completa su historia clínica</h3>
                        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#6b7280]">La historia clínica se mostrará aquí cuando la paciente responda el formulario enviado a su correo electrónico.</p>
                     </div>
                  )}

                  {/* Historia completada */}
                  {historiaCompletada && historiaClinica && (
                     <div className="space-y-6">

                        <div>
                           <h3 className="mb-3 text-sm font-bold text-[#171717]">Enfermedades reportadas</h3>

                           {historiaClinica.enfermedades?.length ? (
                              <div className="flex flex-wrap gap-2">
                                 {historiaClinica.enfermedades.map((enfermedad, index) => (
                                    <span key={index} className="rounded-lg bg-[#f5eaf5] px-3 py-2 text-xs font-semibold text-[#6e0b6c]">{enfermedad}</span>
                                 ))}
                              </div>
                           ) : (
                              <p className="text-sm text-[#9ca3af]">Sin enfermedades registradas.</p>
                           )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                           <ClinicalData label="Otras enfermedades" value={historiaClinica.otrasEnfermedades} />
                           <ClinicalData label="Medicamentos actuales" value={historiaClinica.medicamentos} />
                           <ClinicalData label="Alergias" value={historiaClinica.alergias} />
                           <ClinicalData label="Cirugías" value={historiaClinica.cirugias} />
                           <ClinicalData label="Antecedentes familiares" value={historiaClinica.antecedentesFamiliares} />
                           <ClinicalData label="Observaciones adicionales" value={historiaClinica.observaciones} />
                        </div>

                     </div>
                  )}

               </div>
            )}

         </section>

         {/* Síntomas */}
         <section className="overflow-hidden rounded-2xl border border-[#eee7ee] bg-white shadow-sm">

            <div className="p-5 sm:p-6">
               <SectionTitle icon={Activity} title="Síntomas reportados" />
               <p className="mt-2 text-xs text-[#9ca3af]">Síntomas con una intensidad mayor a "Nada".</p>
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
                     {evaluation.symptoms.length === 0 && (
                        <tr>
                           <td colSpan={4} className="px-6 py-10 text-center text-sm text-[#9ca3af]">No se reportaron síntomas con intensidad mayor a cero.</td>
                        </tr>
                     )}

                     {evaluation.symptoms.map((symptom: any, index: number) => (
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
               {evaluation.habits.length === 0 && (
                  <p className="col-span-full text-sm text-[#9ca3af]">No se registraron hábitos.</p>
               )}

               {evaluation.habits.map((habit: any, index: number) => (
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
               {evaluation.recommendations.length === 0 && (
                  <p className="text-sm text-[#9ca3af]">No hay recomendaciones para esta evaluación.</p>
               )}

               {evaluation.recommendations.map((recommendation: any, index: number) => (
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

         {/* Modal asignar especialista */}
         {modalEspecialista && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 py-6" onMouseDown={event => { if (event.target === event.currentTarget) cerrarModalEspecialista(); }}>
               <div role="dialog" aria-modal="true" aria-labelledby="modal-especialista-title" className="w-full max-w-lg overflow-hidden rounded-[26px] bg-white shadow-2xl">

                  <div className="flex items-center justify-between border-b border-[#f0eaf0] px-6 py-5">
                     <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8d2a8a]">MenoTest</p>
                        <h3 id="modal-especialista-title" className="mt-1 text-lg font-bold text-[#171717]">{tieneEspecialista ? 'Cambiar especialista' : 'Asignar especialista'}</h3>
                     </div>

                     <button type="button" onClick={cerrarModalEspecialista} aria-label="Cerrar modal" className="flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f5eaf5] hover:text-[#6e0b6c]">
                        <X size={20} />
                     </button>
                  </div>

                  <div className="space-y-5 p-6">

                     {/* Paciente */}
                     <div className="rounded-xl bg-[#faf7fa] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8d2a8a]">Paciente</p>
                        <p className="mt-1 text-sm font-bold text-[#171717]">{fullName}</p>
                        <p className="mt-1 text-xs text-[#6b7280]">{evaluation.patient.email}</p>
                     </div>

                     {/* Selector */}
                     <div>
                        <label htmlFor="especialista-select" className="mb-2 block text-sm font-semibold text-[#171717]">Selecciona una especialista</label>

                        <select id="especialista-select" value={especialistaId ?? ''} onChange={event => setEspecialistaId(event.target.value ? Number(event.target.value) : null)} className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#374151] outline-none transition focus:border-[#6e0b6c] focus:ring-2 focus:ring-[#f5eaf5]">
                           <option value="">Selecciona una opción</option>
                           {especialistas.map(especialista => <option key={especialista.id} value={especialista.id}>{especialista.nombre} — {especialista.especialidad}</option>)}
                        </select>
                     </div>

                     {/* Información especialista */}
                     {especialistaSeleccionada && (
                        <div className="rounded-2xl border border-[#eadfea] bg-[#fcf9fc] p-5">
                           <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5eaf5] text-[#6e0b6c]"><UserRound size={21} /></div>

                              <div>
                                 <p className="font-bold text-[#171717]">{especialistaSeleccionada.nombre}</p>
                                 <p className="text-xs font-medium text-[#8d2a8a]">{especialistaSeleccionada.especialidad}</p>
                              </div>
                           </div>

                           <div className="mt-4 space-y-3 border-t border-[#eadfea] pt-4">
                              <div className="flex items-center gap-2 text-sm text-[#6b7280]"><Mail size={16} className="shrink-0 text-[#6e0b6c]" /><span className="break-all">{especialistaSeleccionada.correo}</span></div>
                              <div className="flex items-center gap-2 text-sm text-[#6b7280]"><Phone size={16} className="shrink-0 text-[#6e0b6c]" /><span>{especialistaSeleccionada.telefono}</span></div>
                           </div>
                        </div>
                     )}

                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-[#f0eaf0] px-6 py-5 sm:flex-row sm:justify-end">
                     <button type="button" onClick={cerrarModalEspecialista} className="rounded-full border border-[#e5e7eb] bg-white px-6 py-2.5 text-sm font-semibold text-[#6b7280] transition hover:bg-[#fafafa]">Cancelar</button>

                     <button type="button" onClick={asignarEspecialista} disabled={!especialistaSeleccionada} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6e0b6c] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#570956] disabled:cursor-not-allowed disabled:opacity-50">
                        <CheckCircle2 size={17} />
                        {tieneEspecialista ? 'Cambiar especialista' : 'Asignar especialista'}
                     </button>
                  </div>

               </div>
            </div>
         )}

         <MedicalReportPreview open={reportOpen} evaluation={evaluation} onClose={() => setReportOpen(false)} />

      </div>
   );
}

// ==================== HELPERS ====================

function SectionTitle({ icon: Icon, title }: { icon: typeof UserRound; title: string }) {
   return (
      <div className="flex items-center gap-3">
         <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5eaf5] text-[#6e0b6c]"><Icon size={18} /></div>
         <h2 className="text-base font-bold text-[#171717]">{title}</h2>
      </div>
   );
}

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

function SummaryItem({ label, value }: { label: string; value: string }) {
   return (
      <div className="p-4 sm:p-5">
         <p className="text-[11px] font-medium uppercase tracking-wider text-[#9ca3af]">{label}</p>
         <p className="mt-1.5 text-sm font-bold text-[#374151]">{value}</p>
      </div>
   );
}

function IntensityBadge({ value, label }: { value: number; label: string }) {
   const styles: Record<number, string> = {
      1: 'bg-slate-100 text-slate-600',
      2: 'bg-amber-50 text-amber-700',
      3: 'bg-rose-50 text-rose-700'
   };

   return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[value] || styles[1]}`}>{label}</span>;
}

function HabitIndicator({ level }: { level: string }) {
   const styles: Record<string, string> = {
      low: 'bg-emerald-500',
      medium: 'bg-amber-500',
      high: 'bg-rose-500'
   };

   return <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${styles[level] || styles.low}`} />;
}

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

function ClinicalData({ label, value }: { label: string; value?: string | null }) {
   return (
      <div className="rounded-xl border border-[#f0eaf0] bg-[#fcfbfc] p-4">
         <p className="text-xs font-semibold text-[#9ca3af]">{label}</p>
         <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#374151]">{value?.trim() || 'No especificado'}</p>
      </div>
   );
}