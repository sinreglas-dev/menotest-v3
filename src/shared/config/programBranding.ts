import type { MenoTestProgram } from '@/shared/config/program';

export interface ProgramBranding {
  name: string;
  primaryLogo: string;
  primaryLogoAlt: string;
  partnerLogo: string | null;
  partnerLogoAlt: string | null;
}

// Branding por programa
export const PROGRAM_BRANDING: Record<MenoTestProgram, ProgramBranding> = {

  // General
  general: {
    name: 'Sin Reglas',
    primaryLogo: '/assets/images/logo.webp',
    primaryLogoAlt: 'Sin Reglas',
    partnerLogo: null,
    partnerLogoAlt: null
  },

  // Iztapalapa / Organon
  iztapalapa: {
    name: 'Organon',
    primaryLogo: '/assets/images/logo.webp',
    primaryLogoAlt: 'Sin Reglas',
    partnerLogo: '/assets/images/organon.svg',
    partnerLogoAlt: 'Organon'
  },

  // Reina Madre
  reina_madre: {
    name: 'Reina Madre',
    primaryLogo: '/assets/images/logo.webp',
    primaryLogoAlt: 'Sin Reglas',
    partnerLogo: '/assets/images/reina-madre.jpg',
    partnerLogoAlt: 'Reina Madre'
  },

  // FEMSA
  femsa: {
    name: 'FEMSA',
    primaryLogo: '/assets/images/logo.webp',
    primaryLogoAlt: 'Sin Reglas',
    partnerLogo: '/assets/images/femsa.webp',
    partnerLogoAlt: 'FEMSA'
  }
};

// Obtiene branding del programa
export function getProgramBranding(program: MenoTestProgram): ProgramBranding {
  return PROGRAM_BRANDING[program];
}