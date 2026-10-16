const API_KEY = process.env.MAILCHIMP_TRANSACTIONAL_API_KEY as string;
const FROM_EMAIL = process.env.MAILCHIMP_FROM_EMAIL ?? 'contacto@sin-reglas.mx';
const FROM_NAME = process.env.MAILCHIMP_FROM_NAME ?? 'MenoTest - Sin Reglas';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://menotest.sin-reglas.mx';

interface EnviarAsignacionParams {
   correoEspecialista: string;
   nombreEspecialista: string;
   especialidad: string;
   pacienteNombre: string;
   pacienteApellido: string;
   edad: number;
   etapa: string;
   puntaje: number;
   programa: string;
   evaluacionId: number;
}

export async function enviarNotificacionHistoriaCompletada(
   params: EnviarAsignacionParams
): Promise<boolean> {
   if (!API_KEY) {
      console.error('[correo-especialista] Falta MAILCHIMP_TRANSACTIONAL_API_KEY');
      return false;
   }

   const urlDetalle = `${APP_URL}/especialista/menotest/${params.evaluacionId}`;

   const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #171717;">
         <div style="background: #6e0b6c; padding: 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 20px;">MenoTest · Sin Reglas</h1>
         </div>

         <div style="padding: 32px 24px;">
            <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${params.nombreEspecialista}</strong>,</p>

            <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
               Tu paciente <strong>${params.pacienteNombre} ${params.pacienteApellido}</strong> acaba de completar su <strong>historia clínica</strong>. Ya puedes revisarla antes de su consulta.
            </p>

            <div style="background: #fcf9fc; border-left: 4px solid #6e0b6c; padding: 16px 20px; margin: 20px 0; border-radius: 8px;">
               <p style="margin: 0; font-size: 13px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em;">Paciente</p>
               <p style="margin: 6px 0 0; font-size: 16px; font-weight: 700;">${params.pacienteNombre} ${params.pacienteApellido}</p>
               <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">
                  ${params.edad} años · ${params.etapa} · Puntaje ${params.puntaje}/75
               </p>
               <p style="margin: 4px 0 0; font-size: 13px; color: #8d2a8a; font-weight: 600;">Campaña: ${params.programa}</p>
            </div>

            <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
               Ingresa a tu portal para revisar el expediente completo y dar seguimiento.
            </p>

            <div style="text-align: center; margin: 32px 0;">
               <a href="${urlDetalle}" style="display: inline-block; background: #6e0b6c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px;">
                  Ver historia clínica
               </a>
            </div>

            <p style="font-size: 12px; color: #9ca3af; line-height: 1.5;">
               Si el botón no funciona:<br>
               <a href="${urlDetalle}" style="color: #6e0b6c; word-break: break-all;">${urlDetalle}</a>
            </p>
         </div>

         <div style="background: #fafafa; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} Sin Reglas · Todos los derechos reservados
         </div>
      </div>
   `;

   try {
      const res = await fetch('https://mandrillapp.com/api/1.0/messages/send.json', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            key: API_KEY,
            message: {
               from_email: FROM_EMAIL,
               from_name: FROM_NAME,
               subject: `${params.pacienteNombre} ${params.pacienteApellido} completó su historia clínica`,
               html,
               to: [{ email: params.correoEspecialista, type: 'to' }],
               track_opens: true,
               track_clicks: true,
            },
         }),
      });

      if (!res.ok) {
         console.error('[correo-especialista] HTTP error:', res.status, await res.text());
         return false;
      }

      const data = await res.json();
      const status = data[0]?.status;
      const motivo = data[0]?.reject_reason;

      if (status !== 'sent' && status !== 'queued') {
         console.error('[correo-especialista] Mandrill rechazó:', { status, motivo, respuestaCompleta: data });
         return false;
      }

      return true;
   } catch (error) {
      console.error('[correo-especialista] Excepción:', error);
      return false;
   }
}