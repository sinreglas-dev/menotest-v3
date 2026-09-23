const API_KEY = process.env.MAILCHIMP_TRANSACTIONAL_API_KEY as string;
const FROM_EMAIL = process.env.MAILCHIMP_FROM_EMAIL ?? 'contacto@sin-reglas.mx';
const FROM_NAME = process.env.MAILCHIMP_FROM_NAME ?? 'MenoTest - Sin Reglas';

interface EnviarReportesParams {
  correo: string;
  nombre: string;
  reporteUsuarioPdf: string; // base64
  reporteMedicoPdf: string | null; // base64
}

export async function enviarReportesPorCorreo(params: EnviarReportesParams): Promise<boolean> {
  if (!API_KEY) {
    console.error('[mailer] Falta MAILCHIMP_TRANSACTIONAL_API_KEY');
    return false;
  }

  const adjuntos = [
    {
      type: 'application/pdf',
      name: 'reporte-menotest.pdf',
      content: params.reporteUsuarioPdf,
    },
  ];

  if (params.reporteMedicoPdf) {
    adjuntos.push({
      type: 'application/pdf',
      name: 'reporte-medico-menotest.pdf',
      content: params.reporteMedicoPdf,
    });
  }

  const html = `
    <p>¡Hola ${params.nombre}!</p>
    <p>Gracias por completar tu MenoTest. Adjuntamos tu reporte de resultados${params.reporteMedicoPdf ? ' y el reporte médico para compartir con tu especialista' : ''}.</p>
    <p>Equipo Sin Reglas.</p>
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
          subject: 'Tus resultados de MenoTest',
          html,
          to: [{ email: params.correo, type: 'to' }],
          attachments: adjuntos,
        },
      }),
    });

    if (!res.ok) {
      console.error('[mailer] Error al enviar correo:', await res.text());
      return false;
    }

    const data = await res.json();
    return data[0]?.status === 'sent' || data[0]?.status === 'queued';
  } catch (error) {
    console.error('[mailer] Excepción al enviar correo:', error);
    return false;
  }
}