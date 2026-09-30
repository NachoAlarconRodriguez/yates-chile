import {
  generateExpeditionBookingPassengerEmail,
  generateExpeditionBookingAdminEmail,
  generateWaitlistPassengerEmail,
  generateWaitlistAdminEmail,
  generatePaymentConfirmedPassengerEmail,
  generateWaitlistSlotReleasedEmail,
  generateLodgeBookingEmail,
  generateNewsletterWelcomeEmail,
} from '../src/services/emailTemplates.ts';

import fs from 'fs';
import path from 'path';

let envKey = process.env.BREVO_API_KEY || process.env.VITE_BREVO_API_KEY;
if (!envKey) {
  try {
    const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf-8');
    const match = envContent.match(/BREVO_API_KEY=(.+)/);
    if (match) envKey = match[1].trim();
  } catch {}
}

const BREVO_KEY = envKey || '';
const TARGET_EMAIL = process.argv[2] || 'ialarconr.684@gmail.com';
const SENDER_EMAIL = 'contacto@yateschile.com';
const SENDER_NAME = 'Yates Chile Concierge';

async function sendBrevoEmail(subject: string, htmlContent: string) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: TARGET_EMAIL, name: 'Ignacio Alarcón' }],
      subject: `[PRUEBA] ${subject}`,
      htmlContent: htmlContent,
    }),
  });

  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: json };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log(`\n🚀 Iniciando envío de los 8 correos de prueba a: ${TARGET_EMAIL}\n`);

  const emails = [
    {
      name: '1. Reserva de Expedición (Pasajero)',
      gen: () =>
        generateExpeditionBookingPassengerEmail({
          bookingId: 'EXP-2026-8842',
          fullName: 'Ignacio Alarcón Rodríguez',
          email: TARGET_EMAIL,
          phone: '+56 9 5333 2492',
          documentId: '18.452.931-4',
          expeditionName: 'Expedición Robinson Crusoe – Noviembre 2026',
          startDate: '15 nov 2026',
          endDate: '30 nov 2026',
          vesselName: 'Velero Végvísir (Koopmans 48)',
          paxCount: 2,
          amountClp: 5600000,
        }),
    },
    {
      name: '2. Alerta de Reserva al Concierge (Admin)',
      gen: () =>
        generateExpeditionBookingAdminEmail({
          bookingId: 'EXP-2026-8842',
          fullName: 'Ignacio Alarcón Rodríguez',
          email: TARGET_EMAIL,
          phone: '+56 9 5333 2492',
          documentId: '18.452.931-4',
          expeditionName: 'Expedición Robinson Crusoe – Noviembre 2026',
          startDate: '15 nov 2026',
          endDate: '30 nov 2026',
          vesselName: 'Velero Végvísir (Koopmans 48)',
          paxCount: 2,
          amountClp: 5600000,
          comprobanteUrl: 'https://www.yateschile.com/comprobante-ejemplo.pdf',
        }),
    },
    {
      name: '3. Lista de Espera Confirmada (Pasajero)',
      gen: () =>
        generateWaitlistPassengerEmail({
          waitlistId: 'wl-2026-001',
          fullName: 'Ignacio Alarcón Rodríguez',
          email: TARGET_EMAIL,
          phone: '+56 9 5333 2492',
          expeditionName: 'Expedición Robinson Crusoe – Octubre 2026',
          startDate: '01 oct 2026',
          endDate: '15 oct 2026',
          vesselName: 'Velero Végvísir',
          paxCount: 1,
        }),
    },
    {
      name: '4. Alerta de Lista de Espera (Concierge)',
      gen: () =>
        generateWaitlistAdminEmail({
          waitlistId: 'wl-2026-001',
          fullName: 'Ignacio Alarcón Rodríguez',
          email: TARGET_EMAIL,
          phone: '+56 9 5333 2492',
          expeditionName: 'Expedición Robinson Crusoe – Octubre 2026',
          startDate: '01 oct 2026',
          endDate: '15 oct 2026',
          paxCount: 1,
        }),
    },
    {
      name: '5. Bienvenido a Bordo (Pago Validado con Voucher)',
      gen: () =>
        generatePaymentConfirmedPassengerEmail({
          bookingId: 'EXP-2026-8842',
          fullName: 'Ignacio Alarcón Rodríguez',
          email: TARGET_EMAIL,
          phone: '+56 9 5333 2492',
          documentId: '18.452.931-4',
          expeditionName: 'Expedición Robinson Crusoe – Noviembre 2026',
          startDate: '15 nov 2026',
          endDate: '30 nov 2026',
          vesselName: 'Velero Végvísir (Koopmans 48)',
          paxCount: 2,
          amountClp: 5600000,
        }),
    },
    {
      name: '6. Notificación de Cupo Liberado (Lista de Espera)',
      gen: () =>
        generateWaitlistSlotReleasedEmail({
          waitlistId: 'wl-2026-001',
          fullName: 'Ignacio Alarcón Rodríguez',
          email: TARGET_EMAIL,
          phone: '+56 9 5333 2492',
          expeditionName: 'Expedición Robinson Crusoe – Octubre 2026',
          startDate: '01 oct 2026',
          endDate: '15 oct 2026',
          paxCount: 1,
          claimUrl: 'https://www.yateschile.com/expediciones',
        }),
    },
    {
      name: '7. Solicitud de Estadía en el Lodge (Huésped)',
      gen: () =>
        generateLodgeBookingEmail(
          {
            fullName: 'Ignacio Alarcón Rodríguez',
            email: TARGET_EMAIL,
            phone: '+56 9 5333 2492',
            checkIn: '10 dic 2026',
            checkOut: '15 dic 2026',
            guestsCount: 4,
            cabinType: 'Cabaña Master Vista Océano',
            notes: 'Requerimos traslado náutico desde Bahía Cumberland y menú libre de mariscos.',
          },
          false
        ),
    },
    {
      name: '8. Bienvenida al Newsletter (Bitácora Náutica)',
      gen: () =>
        generateNewsletterWelcomeEmail({
          email: TARGET_EMAIL,
          name: 'Ignacio Alarcón',
        }),
    },
  ];

  for (let i = 0; i < emails.length; i++) {
    const item = emails[i];
    const { subject, html } = item.gen();
    console.log(`Enviando [${i + 1}/8] ${item.name}...`);
    const result = await sendBrevoEmail(subject, html);

    if (result.ok) {
      console.log(`  ✓ Enviado con éxito (MessageId: ${result.data?.messageId || 'OK'})`);
    } else {
      console.error(`  ✗ Error enviando (${result.status}):`, result.data);
    }

    // Pequeño retardo entre envíos
    await sleep(800);
  }

  console.log('\n🎉 ¡Envío de pruebas completado con éxito! Revisa tu bandeja de entrada en Gmail.\n');
}

run().catch(console.error);
