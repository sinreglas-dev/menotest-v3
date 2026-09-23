'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';

export default function LoginPage() {

   const router = useRouter();

   // Estados
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [error, setError] = useState('');

   // Login temporal frontend
   const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError('');

      if (!email.trim() || !password.trim()) {
         setError('Ingresa tu correo electrónico y contraseña.');
         return;
      }

      router.push('/dashboard');
   };

   return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf7fa] px-4 py-10 sm:px-6">

         {/* Fondo */}
         <div className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#6e0b6c]/[0.05] blur-3xl" />
         <div className="pointer-events-none absolute -bottom-40 -right-32 h-[480px] w-[480px] rounded-full bg-[#8d2a8a]/[0.06] blur-3xl" />

         <div className="relative z-10 w-full max-w-[430px]">

            {/* Logo */}
            <div className="mb-8 text-center">
               <div className="relative mx-auto h-[58px] w-[175px]">
                  <Image src="/assets/images/logo.webp" alt="Sin Reglas" fill priority sizes="175px" className="object-contain" />
               </div>

               <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#8d2a8a]">Administración MenoTest</p>
            </div>

            {/* Card */}
            <section className="rounded-[28px] border border-[#eadfea] bg-white p-6 shadow-[0_20px_60px_rgba(110,11,108,0.08)] sm:p-8">

               {/* Encabezado */}
               <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5eaf5] text-[#6e0b6c]">
                     <LockKeyhole size={22} />
                  </div>

                  <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#171717]">Bienvenido</h1>
                  <p className="mx-auto mt-2 max-w-[310px] text-sm leading-6 text-[#6b7280]">Ingresa tus datos para acceder al panel de administración de MenoTest.</p>
               </div>

               {/* Formulario */}
               <form onSubmit={handleSubmit} className="mt-8 space-y-5">

                  {/* Correo */}
                  <div>
                     <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#374151]">Correo electrónico</label>

                     <div className="relative">
                        <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />

                        <input id="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="correo@ejemplo.com" className="h-12 w-full rounded-xl border border-[#ded6de] bg-white pl-11 pr-4 text-sm text-[#171717] outline-none transition placeholder:text-[#9ca3af] focus:border-[#6e0b6c] focus:ring-2 focus:ring-[#6e0b6c]/10" />
                     </div>
                  </div>

                  {/* Contraseña */}
                  <div>
                     <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#374151]">Contraseña</label>

                     <div className="relative">
                        <LockKeyhole size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />

                        <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Ingresa tu contraseña" className="h-12 w-full rounded-xl border border-[#ded6de] bg-white pl-11 pr-12 text-sm text-[#171717] outline-none transition placeholder:text-[#9ca3af] focus:border-[#6e0b6c] focus:ring-2 focus:ring-[#6e0b6c]/10" />

                        <button type="button" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#9ca3af] transition hover:text-[#6e0b6c]">
                           {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                     </div>
                  </div>

                  {/* Error */}
                  {error && (
                     <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                        <p className="text-xs font-medium leading-5 text-red-600">{error}</p>
                     </div>
                  )}

                  {/* Botón */}
                  <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#6e0b6c] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#570956] active:scale-[0.99]">
                     Iniciar sesión
                  </button>

               </form>

               {/* Footer */}
               <div className="mt-7 border-t border-[#eeeeee] pt-5 text-center">
                  <p className="text-[11px] leading-5 text-[#9ca3af]">Acceso exclusivo para personal autorizado.</p>
               </div>

            </section>

            <p className="mt-6 text-center text-[11px] text-[#9ca3af]">MenoTest · Sin Reglas</p>

         </div>

      </main>
   );
}