'use client';

import {
  ArrowRight,
  Bot,
  ShieldCheck,
  FileText,
  HeartPulse
} from 'lucide-react';

import MenoTestHeader from '@/components/menotest/MenoTestHeader';
import type { MenoTestProgram } from '@/shared/config/program';

interface Props {
  onStart: () => void;
  program: MenoTestProgram;
}

export default function Welcome({ onStart, program }: Props) {

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#fcf7fb]">

      {/* Fondos decorativos */}
      <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-[#db9eda]/30 blur-3xl" />
      <div className="absolute -right-40 bottom-10 h-[500px] w-[500px] rounded-full bg-[#db9eda]/40 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col">

        {/* Header */}
        <MenoTestHeader program={program} />

        {/* Contenido principal */}
        <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-6 py-12 lg:px-10">

          <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-14">

            {/* Columna izquierda */}
            <div className="max-w-2xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#6e0b6c]/40 bg-white/70 px-4 py-2 text-sm font-medium text-[#6e0b6c] backdrop-blur">
                <HeartPulse size={17} />
                Evaluación personalizada
              </div>

              <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-[#352d2b] sm:text-5xl lg:text-7xl">
                Tu MenoTest
                <span className="block text-[#6e0b6c]">personalizado</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-[#716764] sm:text-xl">
                En menos de 5 minutos, descubre en qué etapa del proceso de menopausia te encuentras y recibe orientación personalizada de acuerdo con tus respuestas.
              </p>

              {/* Botón desktop */}
              <button
                type="button"
                onClick={onStart}
                className="group mt-9 hidden items-center gap-3 rounded-full bg-[#6e0b6c] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#b67d82]/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#560f55] lg:inline-flex"
              >
                Comenzar evaluación

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform group-hover:translate-x-1">
                  <ArrowRight size={18} />
                </span>
              </button>

            </div>

            {/* Columna derecha */}
            <div className="relative">

              <div className="rounded-[32px] border border-white/70 bg-white/70 p-5 shadow-[0_30px_80px_rgba(83,63,57,.12)] backdrop-blur-xl sm:p-7">

                <div className="mb-7">
                  <h2 className="mt-2 text-2xl font-semibold text-[#3a3230]">
                    Conoce mejor lo que estás viviendo
                  </h2>

                  <span className="text-sm font-medium uppercase tracking-[0.18em] text-black/50">
                    Tu evaluación incluye
                  </span>
                </div>

                <div className="flex flex-col gap-4">

                  <Feature
                    icon={<Bot size={22} />}
                    title="Evaluación guiada"
                    description="Responde cada pregunta paso a paso de forma sencilla."
                    className="order-2 lg:order-1"
                  />

                  <Feature
                    icon={<HeartPulse size={22} />}
                    title="Resultado personalizado"
                    description="Algoritmo de evaluación validado por especialistas."
                    className="order-3 lg:order-2"
                  />

                  <Feature
                    icon={<FileText size={22} />}
                    title="Reporte descargable"
                    description="Obtén un PDF con tu resultado para conservarlo o compartirlo con tu médico."
                    className="order-1 lg:order-3"
                  />

                </div>

                <p className="mt-5 flex items-center gap-2 text-sm text-[#197821]">
                  <ShieldCheck size={16} />
                  Tus datos son confidenciales y están protegidos.
                </p>

              </div>

              {/* Elemento decorativo */}
              <div className="absolute -bottom-6 -right-6 -z-10 h-40 w-40 rounded-full bg-[#cfa6a9]/30 blur-2xl" />

            </div>

            {/* Botón mobile */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={onStart}
                className="group flex w-full items-center justify-center gap-3 rounded-full bg-[#6e0b6c] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#b67d82]/20 transition duration-300 hover:bg-[#560f55]"
              >
                Comenzar evaluación

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <ArrowRight size={18} />
                </span>
              </button>
            </div>

          </div>

        </main>

        {/* Footer */}
        <footer className="mx-auto w-full max-w-7xl px-6 pb-7 text-center text-xs text-[#968985] lg:px-10">
          © {new Date().getFullYear()} SinReglas · Todos los derechos reservados
        </footer>

      </div>

    </section>
  );
}

// Tarjeta de característica
function Feature({
  icon,
  title,
  description,
  className = ''
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}) {

  return (
    <div className={`group flex gap-4 rounded-2xl border border-[#eee5e1] bg-white/80 p-4 transition hover:border-[#560f55] hover:shadow-sm ${className}`}>

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f1ecf1] text-[#6e0b6c]">
        {icon}
      </div>

      <div>
        <h3 className="font-semibold text-[#453b38]">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[#817572]">{description}</p>
      </div>

    </div>
  );
}