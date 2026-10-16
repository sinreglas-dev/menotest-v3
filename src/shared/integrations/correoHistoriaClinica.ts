const API_KEY = process.env.MAILCHIMP_TRANSACTIONAL_API_KEY as string;
const FROM_EMAIL = process.env.MAILCHIMP_FROM_EMAIL ?? 'contacto@sin-reglas.mx';
const FROM_NAME = process.env.MAILCHIMP_FROM_NAME ?? 'MenoTest - Sin Reglas';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://menotest.sin-reglas.mx';

interface EnviarHistoriaParams {
   correo: string;
   nombre: string;
   apellidoPaterno: string;
   token: string;
   especialistaNombre: string;
   especialistaEspecialidad: string;
}

export async function enviarHistoriaClinicaPorCorreo(params: EnviarHistoriaParams): Promise<boolean> {
   if (!API_KEY) {
      console.error('[correo-historia] Falta MAILCHIMP_TRANSACTIONAL_API_KEY');
      return false;
   }

   const urlHistoria = `${APP_URL}/historia-clinica?token=${encodeURIComponent(params.token)}`;

   const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #171717;">
         <div style="background: #6e0b6c; padding: 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 20px;">MenoTest · Sin Reglas</h1>
         </div>

         <div style="padding: 32px 24px;">
            <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${params.nombre} ${params.apellidoPaterno}</strong>,</p>

            <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
               Ya tienes una especialista asignada para dar seguimiento a tus resultados.
            </p>

            <div style="background: #fcf9fc; border-left: 4px solid #6e0b6c; padding: 16px 20px; margin: 20px 0; border-radius: 8px;">
               <p style="margin: 0; font-size: 13px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em;">Tu especialista</p>
               <p style="margin: 6px 0 0; font-size: 16px; font-weight: 700;">${params.especialistaNombre}</p>
               <p style="margin: 2px 0 0; font-size: 14px; color: #8d2a8a;">${params.especialistaEspecialidad}</p>
            </div>

            <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
               Antes de tu consulta, te pedimos completar tu <strong>historia clínica</strong>. Solo toma unos minutos y nos ayuda a brindarte una atención más personalizada.
            </p>

            <div style="text-align: center; margin: 32px 0;">
               <a href="${urlHistoria}" style="display: inline-block; background: #6e0b6c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px;">
                  Completar historia clínica
               </a>
            </div>

            <p style="font-size: 12px; color: #9ca3af; line-height: 1.5;">
               Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
               <a href="${urlHistoria}" style="color: #6e0b6c; word-break: break-all;">${urlHistoria}</a>
            </p>

            <p style="font-size: 12px; color: #9ca3af; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
               Este enlace expira en 30 días. Si tienes algún problema, respóndenos este correo.
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
               subject: `${params.especialistaNombre} te acompaña en tu proceso · Completa tu historia clínica`,
               html,
               to: [{ email: params.correo, type: 'to' }],
               track_opens: true,
               track_clicks: true,
            },
         }),
      });

      if (!res.ok) {
        const errorTexto = await res.text();
        console.error('[correo-historia] HTTP error:', res.status, errorTexto);
        return false;
        }

        const data = await res.json();
        const status = data[0]?.status;
        const motivo = data[0]?.reject_reason;

        if (status !== 'sent' && status !== 'queued') {
        console.error('[correo-historia] Mandrill rechazó:', {
            status,
            motivo,
            respuestaCompleta: data,
        });
        return false;
        }

        return true;
   } catch (error) {
      console.error('[correo-historia] Excepción:', error);
      return false;
   }
}