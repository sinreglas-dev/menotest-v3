'use client';

import { FormEvent, useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import Select, { StylesConfig } from 'react-select';

import MenoTestHeader from './MenoTestHeader';
import type { MenoTestProgram } from '@/shared/config/program';


export interface PatientData {
   email: string;
   name: string;
   paternalLastName: string;
   maternalLastName: string;
   phone: string;
   birthYear: string;
   birthMonth: string;
   birthDay: string;
   height: string;
   weight: string;
   country: string;
   termsAccepted: boolean;
}

interface Props {
   onSubmit: (data: PatientData) => void;
   onBack: () => void;
   program: MenoTestProgram;
}

interface SelectOption {
   value: string;
   label: string;
}

// Países
const countries = [
   'México',
   'Argentina',
   'Bolivia',
   'Chile',
   'Colombia',
   'Costa Rica',
   'Cuba',
   'Ecuador',
   'El Salvador',
   'España',
   'Estados Unidos',
   'Guatemala',
   'Honduras',
   'Nicaragua',
   'Panamá',
   'Paraguay',
   'Perú',
   'Puerto Rico',
   'República Dominicana',
   'Uruguay',
   'Venezuela',
   'Alemania',
   'Australia',
   'Bélgica',
   'Brasil',
   'Canadá',
   'China',
   'Corea del Sur',
   'Dinamarca',
   'Emiratos Árabes Unidos',
   'Filipinas',
   'Francia',
   'Grecia',
   'India',
   'Indonesia',
   'Irlanda',
   'Israel',
   'Italia',
   'Japón',
   'Malasia',
   'Marruecos',
   'Nigeria',
   'Países Bajos',
   'Polonia',
   'Portugal',
   'Reino Unido',
   'Rusia',
   'Sudáfrica',
   'Suecia',
   'Suiza',
   'Tailandia',
   'Turquía'
];

// Opciones de fecha
const currentYear = new Date().getFullYear();

const yearOptions: SelectOption[] = Array.from({ length: 100 }, (_, i) => {
   const year = currentYear - i;
   return { value: String(year), label: String(year) };
});

const monthOptions: SelectOption[] = [
   { value: '01', label: 'Enero' },
   { value: '02', label: 'Febrero' },
   { value: '03', label: 'Marzo' },
   { value: '04', label: 'Abril' },
   { value: '05', label: 'Mayo' },
   { value: '06', label: 'Junio' },
   { value: '07', label: 'Julio' },
   { value: '08', label: 'Agosto' },
   { value: '09', label: 'Septiembre' },
   { value: '10', label: 'Octubre' },
   { value: '11', label: 'Noviembre' },
   { value: '12', label: 'Diciembre' }
];

const dayOptions: SelectOption[] = Array.from({ length: 31 }, (_, i) => {
   const day = i + 1;
   return { value: String(day).padStart(2, '0'), label: String(day) };
});

const countryOptions: SelectOption[] = countries.map(country => ({
   value: country,
   label: country
}));

export default function PatientForm({ onSubmit, onBack, program }: Props) {

   // Datos del formulario
   const [form, setForm] = useState<PatientData>({
      email: '',
      name: '',
      paternalLastName: '',
      maternalLastName: '',
      phone: '',
      birthYear: '',
      birthMonth: '',
      birthDay: '',
      height: '',
      weight: '',
      country: 'México',
      termsAccepted: false
   });

   // Actualiza un campo
   const updateField = <K extends keyof PatientData>(field: K, value: PatientData[K]) => {
      setForm(previous => ({ ...previous, [field]: value }));
   };

   // Envía el formulario
   const handleSubmit = (e: FormEvent) => {
      e.preventDefault();

      if (!form.termsAccepted) return;
      if (!form.birthYear || !form.birthMonth || !form.birthDay || !form.country) return;

      onSubmit(form);
   };


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
         <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-center px-5 pb-16 pt-5 lg:px-10 lg:pb-20">

            <div className="w-full max-w-3xl">

               <div className="rounded-[32px] border border-[#e9e4e9] bg-white/95 p-6 shadow-[0_30px_80px_rgba(110,11,108,.08)] backdrop-blur-xl sm:p-10">

                  {/* Encabezado */}
                  <div className="mb-9 text-center">

                     <div className="mb-6 flex justify-start">
                        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-[#6b7280] transition hover:text-[#6e0b6c]">
                           <ArrowLeft size={17} />
                           Regresar
                        </button>
                     </div>

                     <span className="mb-4 inline-flex items-center rounded-full bg-[#f5eaf5] px-4 py-2 text-sm font-semibold text-[#6e0b6c]">Paso 1 de 3</span>

                     <h1 className="text-3xl font-semibold tracking-tight text-[#171717] sm:text-4xl">Datos personales</h1>

                     <p className="mx-auto mt-3 max-w-lg text-[#6b7280]">Los necesitamos para personalizar tu evaluación.</p>

                  </div>

                  {/* Formulario */}
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">

                     {/* Correo */}
                     <div className="md:col-span-2">
                        <Input
                           label="Correo electrónico"
                           type="email"
                           placeholder="tu@correo.com"
                           value={form.email}
                           onChange={value => updateField('email', value)}
                           required
                        />
                     </div>

                     {/* Nombre */}
                     <Input
                        label="Nombre"
                        placeholder="Tu nombre"
                        value={form.name}
                        onChange={value => updateField('name', value)}
                        required
                     />

                     {/* Apellido paterno */}
                     <Input
                        label="Apellido paterno"
                        placeholder="Apellido"
                        value={form.paternalLastName}
                        onChange={value => updateField('paternalLastName', value)}
                        required
                     />

                     {/* Apellido materno */}
                     <Input
                        label="Apellido materno"
                        placeholder="Opcional"
                        value={form.maternalLastName}
                        onChange={value => updateField('maternalLastName', value)}
                     />

                     {/* Teléfono */}
                     <Input
                        label="Teléfono"
                        type="tel"
                        placeholder="10 dígitos"
                        maxLength={10}
                        value={form.phone}
                        onChange={value => updateField('phone', value.replace(/\D/g, ''))}
                        required
                     />

                     {/* Fecha de nacimiento */}
                     <div className="md:col-span-2">

                        <label className="mb-2 block text-sm font-semibold text-[#171717]">
                           Fecha de nacimiento <span className="ml-1 text-[#6e0b6c]">*</span>
                        </label>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                           <Select<SelectOption>
                              instanceId="birth-year"
                              options={yearOptions}
                              placeholder="Año"
                              isSearchable
                              value={yearOptions.find(option => option.value === form.birthYear) || null}
                              onChange={option => updateField('birthYear', option?.value || '')}
                              styles={selectStyles}
                              noOptionsMessage={() => 'Sin resultados'}
                           />

                           <Select<SelectOption>
                              instanceId="birth-month"
                              options={monthOptions}
                              placeholder="Mes"
                              isSearchable
                              value={monthOptions.find(option => option.value === form.birthMonth) || null}
                              onChange={option => updateField('birthMonth', option?.value || '')}
                              styles={selectStyles}
                              noOptionsMessage={() => 'Sin resultados'}
                           />

                           <Select<SelectOption>
                              instanceId="birth-day"
                              options={dayOptions}
                              placeholder="Día"
                              isSearchable
                              value={dayOptions.find(option => option.value === form.birthDay) || null}
                              onChange={option => updateField('birthDay', option?.value || '')}
                              styles={selectStyles}
                              noOptionsMessage={() => 'Sin resultados'}
                           />

                        </div>

                     </div>

                     {/* Estatura */}
                     <Input
                        label="Estatura (cm)"
                        type="number"
                        placeholder="Ej: 165"
                        min="100"
                        max="250"
                        value={form.height}
                        onChange={value => updateField('height', value)}
                        required
                     />

                     {/* Peso */}
                     <Input
                        label="Peso (kg)"
                        type="number"
                        placeholder="Ej: 65"
                        min="30"
                        max="300"
                        step="0.1"
                        value={form.weight}
                        onChange={value => updateField('weight', value)}
                        required
                     />

                     {/* País */}
                     <div className="md:col-span-2">

                        <label className="mb-2 block text-sm font-semibold text-[#171717]">
                           País <span className="ml-1 text-[#6e0b6c]">*</span>
                        </label>

                        <Select<SelectOption>
                           instanceId="country"
                           options={countryOptions}
                           placeholder="Selecciona tu país"
                           isSearchable
                           value={countryOptions.find(option => option.value === form.country) || null}
                           onChange={option => updateField('country', option?.value || '')}
                           styles={selectStyles}
                           noOptionsMessage={() => 'No encontramos ese país'}
                        />

                     </div>


                     {/* Términos */}
                     <div className="mt-2 md:col-span-2">

                        <label className="flex cursor-pointer items-start gap-3">

                           <input
                              type="checkbox"
                              required
                              checked={form.termsAccepted}
                              onChange={e => updateField('termsAccepted', e.target.checked)}
                              className="mt-1 h-4 w-4 cursor-pointer accent-[#6e0b6c]"
                           />

                           <span className="text-sm leading-6 text-[#6b7280]">
                              Acepto los{' '}
                              <a href="https://sin-reglas.mx/terminos-y-condiciones" target="_blank" rel="noopener noreferrer" className="font-medium text-[#6e0b6c] underline underline-offset-2 transition hover:text-[#570956]">términos y condiciones</a>
                              {' '}y el{' '}
                              <a href="https://sin-reglas.mx/aviso-privacidad" target="_blank" rel="noopener noreferrer" className="font-medium text-[#6e0b6c] underline underline-offset-2 transition hover:text-[#570956]">aviso de privacidad</a>.
                           </span>

                        </label>

                     </div>

                     {/* Seguridad */}
                     <div className="mt-2 rounded-2xl border border-[#6e0b6c]/10 bg-[#f8f1f8] px-4 py-3 md:col-span-2">

                        <div className="flex items-start gap-3">
                           <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#6e0b6c]" />
                           <p className="text-xs leading-5 text-[#6b7280]">Tu información será utilizada únicamente para personalizar tu evaluación y generar tus resultados.</p>
                        </div>
                        <div className="flex items-start gap-3">
                           
                           <p className="mt-7 max-w-xl  text-[#716764] text-xs">
                              Menotest es una herramienta de tamizaje desarrollada por SinReglas para identificar síntomas frecuentes durante la transición menopáusica y el climaterio. Su diseño se basa en la evidencia científica disponible sobre sintomatología climatérica, incluyendo la literatura relacionada con escalas clínicas previamente publicadas, como la Greene Climacteric Scale, pero no constituye una reproducción, traducción ni versión autorizada de dicha escala.
                              Menotest incorpora dimensiones adicionales desarrolladas por SinReglas, incluyendo salud urogenital, sueño, energía, cognición, impacto funcional, hábitos y contexto clínico. Sus resultados tienen finalidad orientativa y educativa, y no sustituyen una valoración médica individual ni deben interpretarse como diagnóstico.
                           </p>

                        </div>

                     </div>

                     {/* Botón */}
                     <div className="mt-4 md:col-span-2">

                        <button
                           type="submit"
                           disabled={!form.termsAccepted}
                           className="group flex w-full items-center justify-center gap-3 rounded-full bg-[#6e0b6c] px-8 py-4 font-semibold text-white shadow-lg shadow-[#6e0b6c]/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#570956] hover:shadow-xl hover:shadow-[#6e0b6c]/25 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-[#6e0b6c]"
                        >
                           Iniciar mi evaluación
                           <ArrowRight size={19} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </button>

                     </div>

                  </form>

               </div>

            </div>

         </div>

      </section>
   );
}

// Input reutilizable
interface InputProps {
   label: string;
   type?: string;
   placeholder?: string;
   value: string;
   onChange: (value: string) => void;
   required?: boolean;
   maxLength?: number;
   min?: string;
   max?: string;
   step?: string;
}

function Input({
   label,
   type = 'text',
   placeholder,
   value,
   onChange,
   required = false,
   maxLength,
   min,
   max,
   step
}: InputProps) {

   return (
      <label className="block">

         <span className="mb-2 block text-sm font-semibold text-[#171717]">
            {label}
            {required && <span className="ml-1 text-[#6e0b6c]">*</span>}
         </span>

         <input
            required={required}
            type={type}
            placeholder={placeholder}
            value={value}
            maxLength={maxLength}
            min={min}
            max={max}
            step={step}
            onChange={e => onChange(e.target.value)}
            className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3.5 text-[#171717] outline-none transition placeholder:text-[#9ca3af] hover:border-[#cbb5ca] focus:border-[#6e0b6c] focus:ring-4 focus:ring-[#6e0b6c]/10"
         />

      </label>
   );
}

// Estilos de react-select
const selectStyles: StylesConfig<SelectOption, false> = {

   control: (base, state) => ({
      ...base,
      minHeight: '52px',
      borderRadius: '0.75rem',
      borderColor: state.isFocused ? '#6e0b6c' : '#e5e7eb',
      backgroundColor: '#ffffff',
      boxShadow: state.isFocused ? '0 0 0 4px rgba(110, 11, 108, 0.10)' : 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
         borderColor: state.isFocused ? '#6e0b6c' : '#cbb5ca'
      }
   }),

   valueContainer: base => ({
      ...base,
      padding: '0 16px'
   }),

   placeholder: base => ({
      ...base,
      color: '#9ca3af'
   }),

   singleValue: base => ({
      ...base,
      color: '#171717'
   }),

   input: base => ({
      ...base,
      color: '#171717'
   }),

   indicatorSeparator: () => ({
      display: 'none'
   }),

   dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? '#6e0b6c' : '#6b7280',
      paddingRight: '14px',
      transition: 'all 0.2s ease',
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      '&:hover': {
         color: '#6e0b6c'
      }
   }),

   menu: base => ({
      ...base,
      borderRadius: '0.75rem',
      overflow: 'hidden',
      zIndex: 100
   }),

   menuList: base => ({
      ...base,
      maxHeight: '220px',
      padding: '4px'
   }),

   option: (base, state) => ({
      ...base,
      borderRadius: '0.5rem',
      cursor: 'pointer',
      backgroundColor: state.isSelected ? '#6e0b6c' : state.isFocused ? '#f5eaf5' : '#ffffff',
      color: state.isSelected ? '#ffffff' : '#171717',
      '&:active': {
         backgroundColor: state.isSelected ? '#6e0b6c' : '#f5eaf5'
      }
   })

};