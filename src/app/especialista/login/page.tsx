'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, LockKeyhole, Mail, Stethoscope } from 'lucide-react';

export default function EspecialistaLoginPage() {
   const router = useRouter();
   const [correo, setCorreo] = useState('');
   const [password, setPassword] = useState('');
   const [mostrarPassword, setMostrarPassword] = useState(false);
   const [cargando, setCargando] = useState(false);
   const [error, setError] = useState('');

   const iniciarSesion = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError('');
      setCargando(true);

      try {
         const respuesta = await fetch('/api/especialista/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ correo, password })
         });

         const datos = await respuesta.json().catch(() => ({}));

         if (!respuesta.ok) {
            setError(datos.error || 'No fue posible iniciar sesión.');
            return;
         }

         router.replace('/especialista');
         router.refresh();
      } catch {
         setError('No fue posible conectar con el servidor. Inténtalo nuevamente.');
      } finally {
         setCargando(false);
      }
   };

   return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7fa] px-4 py-10">
         <div className="w-full max-w-[440px]">

            {/* Identidad */}
            <div className="mb-8 text-center">
               <div className="mb-6 flex justify-center">
                  <Image src="/assets/images/logo.webp" alt="Sin Reglas" width={185} height={65} className="h-auto w-[185px] object-contain" priority />
               </div>
               <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5eaf5] text-[#6e0b6c]"><Stethoscope size={27} /></div>
               <h1 className="text-2xl font-bold text-[#171717]">Portal de especialistas</h1>
               <p className="mt-2 text-sm text-[#6b7280]">Accede para consultar las evaluaciones de tus pacientes.</p>
            </div>

            {/* Formulario */}
            <form onSubmit={iniciarSesion} className="rounded-3xl border border-[#eee7ee] bg-white p-7 shadow-sm sm:p-9">
               <h2 className="mb-6 text-lg font-bold text-[#171717]">Iniciar sesión</h2>

               <div className="space-y-5">
                  <div>
                     <label htmlFor="correo" className="mb-2 block text-sm font-semibold text-[#374151]">Correo electrónico</label>
                     <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                        <input id="correo" type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="especialista@correo.com" autoComplete="username" required className="w-full rounded-xl border border-[#e5e7eb] bg-white py-3 pl-11 pr-4 text-sm text-[#171717] outline-none transition focus:border-[#6e0b6c] focus:ring-2 focus:ring-[#f5eaf5]" />
                     </div>
                  </div>

                  <div>
                     <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#374151]">Contraseña</label>
                     <div className="relative">
                        <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                        <input id="password" type={mostrarPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Ingresa tu contraseña" autoComplete="current-password" required className="w-full rounded-xl border border-[#e5e7eb] bg-white py-3 pl-11 pr-12 text-sm text-[#171717] outline-none transition focus:border-[#6e0b6c] focus:ring-2 focus:ring-[#f5eaf5]" />
                        <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)} aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] transition hover:text-[#6e0b6c]">{mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                     </div>
                  </div>

                  {error && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

                  <button type="submit" disabled={cargando} className="flex w-full items-center justify-center rounded-xl bg-[#6e0b6c] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#570956] disabled:cursor-not-allowed disabled:opacity-60">{cargando ? 'Ingresando...' : 'Ingresar al portal'}</button>
               </div>
            </form>

            <p className="mt-6 text-center text-xs text-[#9ca3af]">MenoTest · Plataforma para especialistas</p>
         </div>
      </main>
   );
}