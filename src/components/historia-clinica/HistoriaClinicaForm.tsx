'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronRight, HeartPulse, LoaderCircle } from 'lucide-react';

interface Props {
   token: string;
   nombrePaciente: string;
}

interface Formulario {
   enfermedades: string[];
   otrasEnfermedades: string;
   medicamentos: string;
   alergias: string;
   cirugias: string;
   antecedentesFamiliares: string;
   observaciones: string;
}

const ENFERMEDADES = [
   'Diabetes',
   'Hipertensión arterial',
   'Enfermedades cardiovasculares',
   'Enfermedades de la tiroides',
   'Osteoporosis',
   'Enfermedades autoinmunes',
   'Ansiedad',
   'Depresión',
   'Ninguna de las anteriores'
];

export default function HistoriaClinicaForm({ token, nombrePaciente }: Props) {
   const [form, setForm] = useState<Formulario>({ enfermedades: [], otrasEnfermedades: '', medicamentos: '', alergias: '', cirugias: '', antecedentesFamiliares: '', observaciones: '' });
   const [enviando, setEnviando] = useState(false);
   const [enviado, setEnviado] = useState(false);
   const [error, setError] = useState('');

   const actualizar = (campo: keyof Formulario, valor: string) => setForm(prev => ({ ...prev, [campo]: valor }));

   const cambiarEnfermedad = (enfermedad: string) => {
      setForm(prev => {
         if (enfermedad === 'Ninguna de las anteriores') return { ...prev, enfermedades: prev.enfermedades.includes(enfermedad) ? [] : [enfermedad] };
         const anteriores = prev.enfermedades.filter(item => item !== 'Ninguna de las anteriores');
         return { ...prev, enfermedades: anteriores.includes(enfermedad) ? anteriores.filter(item => item !== enfermedad) : [...anteriores, enfermedad] };
      });
   };

   const enviar = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError('');
      setEnviando(true);

      try {
         const respuesta = await fetch('/api/historia-clinica', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, respuestas: form })
         });

         if (!respuesta.ok) {
            const resultado = await respuesta.json().catch(() => ({}));
            throw new Error(resultado.error || 'No fue posible guardar tu historia clínica.');
         }

         setEnviado(true);
      } catch (error) {
         setError(error instanceof Error ? error.message : 'Ocurrió un error al enviar el formulario.');
      } finally {
         setEnviando(false);
      }
   };

   if (enviado) {
      return (
         <div className="rounded-2xl border border-[#eee7ee] bg-white p-10 text-center shadow-sm">
            <CheckCircle2 size={44} className="mx-auto text-[#6e0b6c]" />
            <h2 className="mt-4 text-xl font-bold text-[#171717]">¡Gracias, {nombrePaciente}!</h2>
            <p className="mt-3 text-sm leading-6 text-[#6b7280]">Tu historia clínica fue enviada correctamente. Tu especialista podrá revisarla antes de tu consulta.</p>
         </div>
      );
   }

   return (
      <form onSubmit={enviar} className="overflow-hidden rounded-2xl border border-[#eee7ee] bg-white shadow-sm">

         <div className="border-b border-[#f0eaf0] px-6 py-6">
            <div className="flex items-center gap-3">
               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5eaf5] text-[#6e0b6c]"><HeartPulse size={22} /></div>
               <div>
                  <h2 className="text-lg font-bold text-[#171717]">Antecedentes médicos</h2>
                  <p className="mt-1 text-xs text-[#9ca3af]">Responde con información actualizada y precisa.</p>
               </div>
            </div>
         </div>

         <div className="space-y-7 p-6">

            {/* Enfermedades */}
            <div>
               <label className="mb-3 block text-sm font-bold text-[#171717]">¿Presentas alguna de las siguientes enfermedades?</label>
               <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {ENFERMEDADES.map(enfermedad => (
                     <label key={enfermedad} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#eee7ee] p-3.5 transition hover:border-[#d7bdd6] hover:bg-[#fcf9fc]">
                        <input type="checkbox" checked={form.enfermedades.includes(enfermedad)} onChange={() => cambiarEnfermedad(enfermedad)} className="h-4 w-4 accent-[#6e0b6c]" />
                        <span className="text-sm text-[#374151]">{enfermedad}</span>
                     </label>
                  ))}
               </div>
            </div>

            {/* Otras enfermedades */}
            <div>
               <label htmlFor="otrasEnfermedades" className="mb-2 block text-sm font-semibold text-[#171717]">¿Tienes alguna otra enfermedad o condición médica?</label>
               <textarea id="otrasEnfermedades" rows={3} value={form.otrasEnfermedades} onChange={e => actualizar('otrasEnfermedades', e.target.value)} placeholder="Especifica si tienes alguna otra condición..." className="w-full resize-none rounded-xl border border-[#e5e7eb] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#6e0b6c]" />
            </div>

            {/* Medicamentos */}
            <div>
               <label htmlFor="medicamentos" className="mb-2 block text-sm font-semibold text-[#171717]">¿Tomas algún medicamento actualmente?</label>
               <textarea id="medicamentos" rows={3} value={form.medicamentos} onChange={e => actualizar('medicamentos', e.target.value)} placeholder="Indica nombre, dosis y frecuencia si los conoces..." className="w-full resize-none rounded-xl border border-[#e5e7eb] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#6e0b6c]" />
            </div>

            {/* Alergias */}
            <div>
               <label htmlFor="alergias" className="mb-2 block text-sm font-semibold text-[#171717]">¿Tienes alergias conocidas?</label>
               <textarea id="alergias" rows={3} value={form.alergias} onChange={e => actualizar('alergias', e.target.value)} placeholder="Medicamentos, alimentos u otras alergias..." className="w-full resize-none rounded-xl border border-[#e5e7eb] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#6e0b6c]" />
            </div>

            {/* Cirugías */}
            <div>
               <label htmlFor="cirugias" className="mb-2 block text-sm font-semibold text-[#171717]">¿Te han realizado alguna cirugía?</label>
               <textarea id="cirugias" rows={3} value={form.cirugias} onChange={e => actualizar('cirugias', e.target.value)} placeholder="Describe el procedimiento y fecha aproximada..." className="w-full resize-none rounded-xl border border-[#e5e7eb] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#6e0b6c]" />
            </div>

            {/* Antecedentes familiares */}
            <div>
               <label htmlFor="antecedentesFamiliares" className="mb-2 block text-sm font-semibold text-[#171717]">¿Existen antecedentes de enfermedades importantes en tu familia?</label>
               <textarea id="antecedentesFamiliares" rows={3} value={form.antecedentesFamiliares} onChange={e => actualizar('antecedentesFamiliares', e.target.value)} placeholder="Indica enfermedades y parentesco..." className="w-full resize-none rounded-xl border border-[#e5e7eb] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#6e0b6c]" />
            </div>

            {/* Observaciones */}
            <div>
               <label htmlFor="observaciones" className="mb-2 block text-sm font-semibold text-[#171717]">¿Hay algo más que quieras compartir con tu especialista?</label>
               <textarea id="observaciones" rows={3} value={form.observaciones} onChange={e => actualizar('observaciones', e.target.value)} placeholder="Información adicional que consideres importante..." className="w-full resize-none rounded-xl border border-[#e5e7eb] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#6e0b6c]" />
            </div>

            {error && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

         </div>

         {/* Enviar */}
         <div className="flex flex-col gap-3 border-t border-[#f0eaf0] bg-[#fcfbfc] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-[#9ca3af]">Tu información será utilizada para preparar tu consulta médica.</p>
            <button type="submit" disabled={enviando} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6e0b6c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#570956] disabled:cursor-not-allowed disabled:opacity-60">
               {enviando ? <LoaderCircle size={17} className="animate-spin" /> : <ChevronRight size={17} />}
               {enviando ? 'Enviando...' : 'Enviar historia clínica'}
            </button>
         </div>

      </form>
   );
}