// Programas disponibles
export type MenoTestProgram =
  | 'general'
  | 'iztapalapa'
  | 'reina_madre'
  | 'femsa';

// Resolver programa por hostname
export function getProgramFromHostname(hostname: string): MenoTestProgram {

  const forcedProgram = process.env.NEXT_PUBLIC_MENOTEST_PROGRAM;

  // Variable de entorno
  if (
    forcedProgram === 'general' ||
    forcedProgram === 'iztapalapa' ||
    forcedProgram === 'reina_madre' ||
    forcedProgram === 'femsa'
  ) {
    console.log('%c[MenoTest] Programa por ENV:', 'color:#6e0b6c;font-weight:bold;', forcedProgram);
    return forcedProgram;
  }

  // Hostname
  const host = hostname.toLowerCase().trim();

  // Organon → Iztapalapa
  if (host === 'organon.menotest.sin-reglas.mx' || host.startsWith('organon.')) {
    logProgram('iztapalapa', host);
    return 'iztapalapa';
  }

  // Reina Madre
  if (host === 'reinamadre.menotest.sin-reglas.mx' || host.startsWith('reinamadre.')) {
    logProgram('reina_madre', host);
    return 'reina_madre';
  }

  // FEMSa
  if (host === 'femsa.menotest.sin-reglas.mx' || host.startsWith('femsa.')) {
    logProgram('femsa', host);
    return 'femsa';
  }

  // General
  logProgram('general', host);
  return 'general';
}

// Log del programa detectado
function logProgram(program: MenoTestProgram, host: string) {
  console.log('%c[MenoTest] Programa por HOST:', 'color:#6e0b6c;font-weight:bold;', program);
  console.log('[MenoTest] Host:', host);
}

// Helpers
export function isIztapalapaProgram(program: MenoTestProgram): boolean {
  return program === 'iztapalapa';
}

export function isReinaMadreProgram(program: MenoTestProgram): boolean {
  return program === 'reina_madre';
}

export function isFemsaProgram(program: MenoTestProgram): boolean {
  return program === 'femsa';
}

export function isGeneralProgram(program: MenoTestProgram): boolean {
  return program === 'general';
}