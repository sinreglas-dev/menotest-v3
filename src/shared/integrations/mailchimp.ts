import crypto from 'crypto';

const API_KEY = process.env.MAILCHIMP_API_KEY as string;
const SERVER = process.env.MAILCHIMP_SERVER_PREFIX as string;
const LIST_ID = process.env.MAILCHIMP_LIST_ID as string;
const BASE_URL = `https://${SERVER}.api.mailchimp.com/3.0`;

function encabezadoAuth(): string {
  const token = Buffer.from(`anystring:${API_KEY}`).toString('base64');
  return `Basic ${token}`;
}

function hashCorreo(correo: string): string {
  return crypto.createHash('md5').update(correo.trim().toLowerCase()).digest('hex');
}

interface DatosContactoMenotest {
  correo: string;
  nombre: string;
  apellidoPaterno: string;
  telefono?: string;
  etiqueta: string;
}

export async function registrarContactoMenotest(datos: DatosContactoMenotest): Promise<void> {
  if (!API_KEY || !SERVER || !LIST_ID) {
    console.error('[mailchimp] Faltan variables de entorno, se omite la sincronización.');
    return;
  }

  const hash = hashCorreo(datos.correo);

  try {
    // 1) Crear o actualizar el contacto (upsert)
    const respuestaMiembro = await fetch(`${BASE_URL}/lists/${LIST_ID}/members/${hash}`, {
      method: 'PUT',
      headers: {
        Authorization: encabezadoAuth(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: datos.correo,
        status_if_new: 'subscribed',
        merge_fields: {
          FNAME: datos.nombre,
          LNAME: datos.apellidoPaterno,
          PHONE: datos.telefono ?? '',
        },
      }),
    });

    if (!respuestaMiembro.ok) {
      console.error('[mailchimp] Error al crear/actualizar contacto:', await respuestaMiembro.text());
      return;
    }

    // 2) Etiquetar el contacto
    const respuestaTag = await fetch(`${BASE_URL}/lists/${LIST_ID}/members/${hash}/tags`, {
      method: 'POST',
      headers: {
        Authorization: encabezadoAuth(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tags: [{ name: datos.etiqueta, status: 'active' }],
      }),
    });

    if (!respuestaTag.ok) {
      console.error('[mailchimp] Error al etiquetar contacto:', await respuestaTag.text());
    }
  } catch (error) {
    console.error('[mailchimp] Excepción al sincronizar con Mailchimp:', error);
  }
}