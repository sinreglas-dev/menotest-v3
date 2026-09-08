import { headers } from 'next/headers';

import MenoTestClient from '@/components/menotest/MenoTestClient';

import { getProgramFromHostname } from '@/shared/config/program';

export default async function Page() {

   const headersList =
      await headers();

   const hostname =
      headersList.get('host') || '';

   const program =
      getProgramFromHostname(
         hostname
      );

   return (
      <MenoTestClient
         program={program}
      />
   );
}