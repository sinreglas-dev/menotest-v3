'use client';

import Image from 'next/image';

import type { MenoTestProgram } from '@/shared/config/program';
import { getProgramBranding } from '@/shared/config/programBranding';


interface Props {
   program: MenoTestProgram;
}

export default function MenoTestHeader({ program }: Props) {

   // Branding del programa
   const branding = getProgramBranding(program);

   return (
      <header className="w-full">

         <div className="mx-auto flex min-h-[76px] max-w-6xl items-center justify-center px-4 py-4 sm:min-h-[84px] sm:px-6 lg:px-8">

            <div className="flex items-center justify-center gap-4 sm:gap-6">

               {/* Sin Reglas */}
               <div className="relative h-[42px] w-[125px] sm:h-[48px] sm:w-[145px]">
                  <Image
                     src={branding.primaryLogo}
                     alt={branding.primaryLogoAlt}
                     fill
                     priority
                     sizes="(max-width: 640px) 125px, 145px"
                     className="object-contain"
                  />
               </div>

               {/* Partner */}
               {branding.partnerLogo && branding.partnerLogoAlt && (
                  <>

                     {/* Separador */}
                     <div aria-hidden="true" className="h-8 w-px shrink-0 bg-[#ded4de] sm:h-9" />

                     {/* Logo partner */}
                     <div className="relative h-[38px] w-[120px] sm:h-[44px] sm:w-[145px]">
                        <Image
                           src={branding.partnerLogo}
                           alt={branding.partnerLogoAlt}
                           fill
                           sizes="(max-width: 640px) 120px, 145px"
                           className="object-contain"
                        />
                     </div>

                  </>
               )}

            </div>

         </div>

      </header>
   );
}