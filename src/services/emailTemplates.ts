/**
 * Plantillas HTML de Correo Náuticas de Alta Gama para Yates Chile
 * Diseñadas para máxima entregabilidad y legibilidad en Gmail, Apple Mail, Outlook y clientes móviles.
 */

const LOGO_URL = 'https://www.yateschile.com/vegvisir-emblem-dark.png';
const CONCIERGE_PHONE = '+56 9 8131 2920';
const CONCIERGE_WA_LINK = 'https://wa.me/56981312920';
const SITE_URL = 'https://www.yateschile.com';

function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatClp(amount: number | undefined | null): string {
  if (!amount && amount !== 0) return 'A convenir';
  return `$${Number(amount).toLocaleString('es-CL')} CLP`;
}

/**
 * Base Shell para todos los correos de Yates Chile
 */
function baseEmailLayout(contentHtml: string, previewText: string = 'Yates Chile - Sailing & Lodge'): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yates Chile</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: #070E1B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1E293B; }
    table { border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    .btn-gold { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #060B14 !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; display: inline-block; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35); }
    .btn-dark { background-color: #0F172A; color: #FFFFFF !important; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 12px; display: inline-block; font-size: 13px; border: 1px solid #334155; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
  </style>
</head>
<body style="background-color: #070E1B; padding: 24px 12px; margin: 0;">
  <!-- Preview Text Hidden -->
  <div style="display: none; font-size: 1px; color: #070E1B; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${escapeHtml(previewText)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; margin: 0 auto;">
    <!-- HEADER -->
    <tr>
      <td style="padding: 24px 0; text-align: center;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <a href="${SITE_URL}" target="_blank" style="text-decoration: none; display: inline-block;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <img src="${LOGO_URL}" width="48" height="48" alt="Yates Chile Emblem" style="display: block; width: 48px; height: 48px; border-radius: 50%; border: 1px solid #334155;">
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 10px;">
                      <span style="font-family: Georgia, serif; font-size: 20px; font-weight: 700; color: #F8FAFC; letter-spacing: 2px; text-transform: uppercase;">YATES CHILE</span>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 2px;">
                      <span style="font-size: 10px; font-weight: 600; color: #F59E0B; letter-spacing: 3px; text-transform: uppercase;">SAILING &amp; LODGE</span>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- MAIN CARD -->
    <tr>
      <td>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          ${contentHtml}
        </table>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="padding: 32px 16px; text-align: center; color: #94A3B8; font-size: 12px; line-height: 1.6;">
        <p style="margin: 0 0 8px 0; color: #CBD5E1; font-weight: 600;">
          Yates Chile · Experiencias Náuticas Exclusivas &amp; Lodge Austral
        </p>
        <p style="margin: 0 0 16px 0;">
          Puerto Montt · Archipiélago Juan Fernández · Fiordos Patagónicos
        </p>
        <p style="margin: 0 0 16px 0;">
          <a href="${CONCIERGE_WA_LINK}" target="_blank" style="color: #F59E0B; text-decoration: none; font-weight: 600;">
            WhatsApp Concierge: ${CONCIERGE_PHONE}
          </a>
          &nbsp;·&nbsp;
          <a href="mailto:contacto@yateschile.com" style="color: #CBD5E1; text-decoration: none;">
            contacto@yateschile.com
          </a>
        </p>
        <p style="margin: 0; font-size: 11px; color: #64748B;">
          © ${new Date().getFullYear()} Yates Chile. Todos los derechos reservados.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// -------------------------------------------------------------------------------------------------
// 1. PASAJERO: CONFIRMACIÓN DE SOLICITUD DE RESERVA
// -------------------------------------------------------------------------------------------------
export interface ExpeditionBookingPassengerEmailData {
  bookingId?: string;
  fullName: string;
  email: string;
  phone: string;
  documentId?: string;
  expeditionName: string;
  startDate: string;
  endDate: string;
  vesselName: string;
  paxCount: number;
  amountClp?: number;
  comprobanteUrl?: string;
}

export function generateExpeditionBookingPassengerEmail(data: ExpeditionBookingPassengerEmailData): { subject: string; html: string } {
  const subject = `Confirmación de Solicitud de Reserva | ${data.expeditionName}`;
  const preview = `Hemos recibido tu solicitud de reserva para ${data.expeditionName} (${data.paxCount} cupos).`;

  const content = `
    <!-- HERO HEADER -->
    <tr>
      <td style="background-color: #0F172A; padding: 36px 32px; text-align: center; border-bottom: 2px solid #F59E0B;">
        <span class="badge" style="background-color: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3);">
          SOLICITUD EN VALIDACIÓN
        </span>
        <h1 style="font-family: Georgia, serif; font-size: 24px; color: #FFFFFF; margin: 16px 0 8px 0; font-weight: 700; line-height: 1.3;">
          ¡Gracias por tu Reserva, ${escapeHtml(data.fullName)}!
        </h1>
        <p style="color: #94A3B8; font-size: 14px; margin: 0; line-height: 1.5;">
          Hemos recibido tus antecedentes y comprobante de transferencia para tu próxima travesía marítima.
        </p>
      </td>
    </tr>

    <!-- BODY CONTENT -->
    <tr>
      <td style="padding: 32px 32px 24px 32px;">
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
          Tu solicitud está siendo revisada por nuestro Concierge Náutico. En un plazo máximo de <strong>24 horas hábiles</strong> validaremos la recepción de los fondos bancarios y recibirás tu <strong>Voucher Definitivo y Bienvenida a Bordo</strong>.
        </p>

        <!-- SUMMARY CARD -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; margin-bottom: 28px;">
          <tr>
            <td style="padding: 20px 24px; border-bottom: 1px solid #E2E8F0;">
              <span style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">DETALLES DE LA EXPEDICIÓN</span>
              <h2 style="font-family: Georgia, serif; font-size: 18px; color: #0F172A; margin: 6px 0 0 0; font-weight: 700;">
                ${escapeHtml(data.expeditionName)}
              </h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 24px;">
              <table role="presentation" width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #334155;">
                <tr>
                  <td width="35%" style="color: #64748B; font-weight: 600;">Período:</td>
                  <td><strong>${escapeHtml(data.startDate)} al ${escapeHtml(data.endDate)}</strong></td>
                </tr>
                <tr>
                  <td style="color: #64748B; font-weight: 600;">Embarcación:</td>
                  <td>${escapeHtml(data.vesselName)}</td>
                </tr>
                <tr>
                  <td style="color: #64748B; font-weight: 600;">Cupos Solicitados:</td>
                  <td><strong>${data.paxCount} ${data.paxCount > 1 ? 'pasajeros' : 'pasajero'}</strong></td>
                </tr>
                ${data.amountClp ? `
                <tr>
                  <td style="color: #64748B; font-weight: 600;">Monto Total:</td>
                  <td style="color: #0F172A; font-weight: 700; font-size: 14px;">${formatClp(data.amountClp)}</td>
                </tr>` : ''}
                ${data.documentId ? `
                <tr>
                  <td style="color: #64748B; font-weight: 600;">RUT / Pasaporte:</td>
                  <td>${escapeHtml(data.documentId)}</td>
                </tr>` : ''}
              </table>
            </td>
          </tr>
        </table>

        <!-- WHATSAPP CTA -->
        <div style="text-align: center; padding: 8px 0 16px 0;">
          <p style="font-size: 13px; color: #64748B; margin-bottom: 16px;">
            ¿Deseas agilizar tu confirmación o tienes alguna solicitud especial de dieta o traslados?
          </p>
          <a href="${CONCIERGE_WA_LINK}?text=${encodeURIComponent(`Hola Concierge Yates Chile, acabo de enviar mi reserva para "${data.expeditionName}" a nombre de ${data.fullName}.`)}" class="btn-gold" target="_blank">
            Hablar con mi Concierge por WhatsApp
          </a>
        </div>
      </td>
    </tr>
  `;

  return { subject, html: baseEmailLayout(content, preview) };
}

// -------------------------------------------------------------------------------------------------
// 2. ADMIN/CONCIERGE: ALERTA DE NUEVA RESERVA
// -------------------------------------------------------------------------------------------------
export function generateExpeditionBookingAdminEmail(data: ExpeditionBookingPassengerEmailData): { subject: string; html: string } {
  const subject = `🚨 Nueva Reserva: ${data.expeditionName} - ${data.fullName} (${data.paxCount} pax)`;
  const preview = `Nueva solicitud de reserva ingresada por ${data.fullName} para ${data.expeditionName}.`;

  const content = `
    <tr>
      <td style="background-color: #0B132B; padding: 28px 32px; border-bottom: 3px solid #3B82F6;">
        <span class="badge" style="background-color: rgba(59, 130, 246, 0.2); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.4);">
          ALERTA OPERATIVA CONCIERGE
        </span>
        <h1 style="font-size: 20px; color: #FFFFFF; margin: 12px 0 0 0; font-weight: 700;">
          Nueva Reserva de Expedición Recibida
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 28px 32px;">
        <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; font-size: 13px; margin-bottom: 24px;">
          <tr>
            <td width="35%" style="color: #64748B; font-weight: 600;">Pasajero Principal:</td>
            <td><strong style="color: #0F172A; font-size: 15px;">${escapeHtml(data.fullName)}</strong></td>
          </tr>
          <tr>
            <td style="color: #64748B; font-weight: 600;">Email:</td>
            <td><a href="mailto:${escapeHtml(data.email)}" style="color: #2563EB;">${escapeHtml(data.email)}</a></td>
          </tr>
          <tr>
            <td style="color: #64748B; font-weight: 600;">Teléfono / WhatsApp:</td>
            <td><a href="https://wa.me/${data.phone.replace(/[^0-9]/g, '')}" target="_blank" style="color: #059669; font-weight: 700;">${escapeHtml(data.phone)}</a></td>
          </tr>
          ${data.documentId ? `
          <tr>
            <td style="color: #64748B; font-weight: 600;">RUT / Pasaporte:</td>
            <td>${escapeHtml(data.documentId)}</td>
          </tr>` : ''}
          <tr>
            <td style="color: #64748B; font-weight: 600;">Expedición:</td>
            <td><strong>${escapeHtml(data.expeditionName)}</strong></td>
          </tr>
          <tr>
            <td style="color: #64748B; font-weight: 600;">Fechas:</td>
            <td>${escapeHtml(data.startDate)} al ${escapeHtml(data.endDate)}</td>
          </tr>
          <tr>
            <td style="color: #64748B; font-weight: 600;">Embarcación:</td>
            <td>${escapeHtml(data.vesselName)}</td>
          </tr>
          <tr>
            <td style="color: #64748B; font-weight: 600;">Cupos Solicitados:</td>
            <td><strong>${data.paxCount} cupos</strong></td>
          </tr>
          ${data.amountClp ? `
          <tr>
            <td style="color: #64748B; font-weight: 600;">Monto:</td>
            <td><strong style="color: #059669; font-size: 15px;">${formatClp(data.amountClp)}</strong></td>
          </tr>` : ''}
          ${data.comprobanteUrl ? `
          <tr>
            <td style="color: #64748B; font-weight: 600;">Comprobante Bancario:</td>
            <td><a href="${data.comprobanteUrl}" target="_blank" style="color: #2563EB; font-weight: 600; text-decoration: underline;">Ver Comprobante Adjunto ↗</a></td>
          </tr>` : ''}
        </table>

        <div style="text-align: center; padding-top: 8px;">
          <a href="${SITE_URL}/#/admin" class="btn-dark" target="_blank">
            Ir al Panel de Administración →
          </a>
        </div>
      </td>
    </tr>
  `;

  return { subject, html: baseEmailLayout(content, preview) };
}

// -------------------------------------------------------------------------------------------------
// 3. PASAJERO: CONFIRMACIÓN DE INSCRIPCIÓN EN LISTA DE ESPERA
// -------------------------------------------------------------------------------------------------
export interface WaitlistEmailData {
  waitlistId?: string;
  fullName: string;
  email: string;
  phone: string;
  expeditionName: string;
  startDate: string;
  endDate: string;
  vesselName?: string;
  paxCount: number;
  claimUrl?: string;
}

export function generateWaitlistPassengerEmail(data: WaitlistEmailData): { subject: string; html: string } {
  const subject = `Inscripción Confirmada en Lista de Espera Prioritaria | ${data.expeditionName}`;
  const preview = `Tus datos han quedado registrados en orden de prioridad para ${data.expeditionName}.`;

  const content = `
    <tr>
      <td style="background-color: #0F172A; padding: 36px 32px; text-align: center; border-bottom: 2px solid #F59E0B;">
        <span class="badge" style="background-color: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3);">
          PRIORIDAD EXCLUSIVA
        </span>
        <h1 style="font-family: Georgia, serif; font-size: 22px; color: #FFFFFF; margin: 16px 0 8px 0; font-weight: 700;">
          Inscripción en Lista de Espera
        </h1>
        <p style="color: #94A3B8; font-size: 14px; margin: 0;">
          Estimado/a ${escapeHtml(data.fullName)}, has quedado registrado/a con prioridad para esta salida náutica.
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding: 32px;">
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
          La salida <strong>${escapeHtml(data.expeditionName)}</strong> se encuentra actualmente al 100% de su capacidad. Por normas de confort y seguridad marítima operamos con plazas limitadas.
        </p>

        <div style="background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px; font-size: 13px; color: #92400E; line-height: 1.5;">
          <strong>¿Cómo opera tu prioridad?</strong> Si un pasajero cancela su plaza o nuestro equipo habilita un cupo adicional o nueva fecha, te contactaremos de inmediato por teléfono o WhatsApp antes de abrir la disponibilidad al público general.
        </div>

        <table role="presentation" width="100%" cellpadding="6" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; font-size: 13px; margin-bottom: 24px;">
          <tr>
            <td width="35%" style="color: #64748B; font-weight: 600;">Expedición:</td>
            <td><strong>${escapeHtml(data.expeditionName)}</strong></td>
          </tr>
          <tr>
            <td style="color: #64748B; font-weight: 600;">Fechas:</td>
            <td>${escapeHtml(data.startDate)} al ${escapeHtml(data.endDate)}</td>
          </tr>
          <tr>
            <td style="color: #64748B; font-weight: 600;">Cupos Solicitados:</td>
            <td><strong>${data.paxCount} ${data.paxCount > 1 ? 'cupos' : 'cupo'}</strong></td>
          </tr>
          <tr>
            <td style="color: #64748B; font-weight: 600;">Contacto registrado:</td>
            <td>${escapeHtml(data.phone)} · ${escapeHtml(data.email)}</td>
          </tr>
        </table>

        <div style="text-align: center; padding: 8px 0;">
          <a href="${CONCIERGE_WA_LINK}" class="btn-dark" target="_blank">
            Contactar al Concierge
          </a>
        </div>
      </td>
    </tr>
  `;

  return { subject, html: baseEmailLayout(content, preview) };
}

// -------------------------------------------------------------------------------------------------
// 4. ADMIN/CONCIERGE: ALERTA DE LISTA DE ESPERA
// -------------------------------------------------------------------------------------------------
export function generateWaitlistAdminEmail(data: WaitlistEmailData): { subject: string; html: string } {
  const subject = `🔔 Nuevo en Lista de Espera: ${data.expeditionName} - ${data.fullName} (${data.paxCount} cupos)`;
  const preview = `Interesado en lista de espera registrado para ${data.expeditionName}.`;

  const content = `
    <tr>
      <td style="background-color: #0F172A; padding: 24px 32px; border-bottom: 3px solid #F59E0B;">
        <span class="badge" style="background-color: rgba(245, 158, 11, 0.2); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.4);">
          ALTA DEMANDA
        </span>
        <h1 style="font-size: 20px; color: #FFFFFF; margin: 12px 0 0 0; font-weight: 700;">
          Nuevo Registro en Lista de Espera
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 28px 32px;">
        <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; font-size: 13px; margin-bottom: 24px;">
          <tr>
            <td width="35%" style="color: #64748B; font-weight: 600;">Pasajero:</td>
            <td><strong style="color: #0F172A; font-size: 15px;">${escapeHtml(data.fullName)}</strong></td>
          </tr>
          <tr>
            <td style="color: #64748B; font-weight: 600;">Email:</td>
            <td><a href="mailto:${escapeHtml(data.email)}" style="color: #2563EB;">${escapeHtml(data.email)}</a></td>
          </tr>
          <tr>
            <td style="color: #64748B; font-weight: 600;">Teléfono:</td>
            <td><a href="https://wa.me/${data.phone.replace(/[^0-9]/g, '')}" target="_blank" style="color: #059669; font-weight: 700;">${escapeHtml(data.phone)}</a></td>
          </tr>
          <tr>
            <td style="color: #64748B; font-weight: 600;">Expedición:</td>
            <td><strong>${escapeHtml(data.expeditionName)}</strong></td>
          </tr>
          <tr>
            <td style="color: #64748B; font-weight: 600;">Fechas:</td>
            <td>${escapeHtml(data.startDate)} al ${escapeHtml(data.endDate)}</td>
          </tr>
          <tr>
            <td style="color: #64748B; font-weight: 600;">Cupos Solicitados:</td>
            <td><strong>${data.paxCount} cupos</strong></td>
          </tr>
        </table>

        <div style="text-align: center;">
          <a href="${SITE_URL}/#/admin" class="btn-dark" target="_blank">
            Ver Lista de Espera en Admin →
          </a>
        </div>
      </td>
    </tr>
  `;

  return { subject, html: baseEmailLayout(content, preview) };
}

// -------------------------------------------------------------------------------------------------
// 5. PASAJERO: CONFIRMACIÓN OFICIAL "BIENVENIDO A BORDO" (TRAS VALIDAR PAGO)
// -------------------------------------------------------------------------------------------------
export function generatePaymentConfirmedPassengerEmail(data: ExpeditionBookingPassengerEmailData): { subject: string; html: string } {
  const subject = `⚓ ¡Bienvenido a Bordo! Reserva Confirmada Oficialmente | ${data.expeditionName}`;
  const preview = `Tu cupo para la expedición ${data.expeditionName} ha sido confirmado con éxito.`;

  const content = `
    <tr>
      <td style="background-color: #070E1B; padding: 40px 32px; text-align: center; border-bottom: 3px solid #10B981;">
        <span class="badge" style="background-color: rgba(16, 185, 129, 0.2); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.4);">
          PAGO VALIDADO · RESERVA CONFIRMADA
        </span>
        <h1 style="font-family: Georgia, serif; font-size: 26px; color: #FFFFFF; margin: 16px 0 8px 0; font-weight: 700;">
          ¡Bienvenido a Bordo, ${escapeHtml(data.fullName)}!
        </h1>
        <p style="color: #94A3B8; font-size: 15px; margin: 0;">
          El Capitán y la tripulación de Yates Chile te dan la bienvenida oficial a tu travesía.
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding: 32px;">
        <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 24px 0;">
          Hemos verificado con éxito tu comprobante de pago. Tu plaza en <strong>${escapeHtml(data.expeditionName)}</strong> se encuentra asegurada de forma definitiva.
        </p>

        <!-- VOUCHER BOX -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); border-radius: 14px; color: #FFFFFF; margin-bottom: 28px; overflow: hidden; border: 1px solid #334155;">
          <tr>
            <td style="padding: 20px 24px; border-bottom: 1px dashed #475569;">
              <span style="font-size: 10px; font-weight: 700; color: #F59E0B; letter-spacing: 2px; text-transform: uppercase;">VOUCHER DE EMBARQUE OFICIAL</span>
              <h2 style="font-family: Georgia, serif; font-size: 20px; color: #FFFFFF; margin: 6px 0 0 0;">
                ${escapeHtml(data.expeditionName)}
              </h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 24px;">
              <table role="presentation" width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #CBD5E1;">
                <tr>
                  <td width="35%" style="color: #94A3B8;">Pasajero:</td>
                  <td><strong style="color: #FFFFFF;">${escapeHtml(data.fullName)}</strong></td>
                </tr>
                <tr>
                  <td style="color: #94A3B8;">Embarcación:</td>
                  <td><strong>${escapeHtml(data.vesselName)}</strong></td>
                </tr>
                <tr>
                  <td style="color: #94A3B8;">Zarpe / Arribo:</td>
                  <td><strong style="color: #F59E0B;">${escapeHtml(data.startDate)} al ${escapeHtml(data.endDate)}</strong></td>
                </tr>
                <tr>
                  <td style="color: #94A3B8;">Cupos Confirmados:</td>
                  <td><strong>${data.paxCount} ${data.paxCount > 1 ? 'pasajeros' : 'pasajero'}</strong></td>
                </tr>
                ${data.amountClp ? `
                <tr>
                  <td style="color: #94A3B8;">Monto Acreditado:</td>
                  <td><strong style="color: #10B981;">${formatClp(data.amountClp)}</strong></td>
                </tr>` : ''}
              </table>
            </td>
          </tr>
        </table>

        <!-- INSTRUCTIONS -->
        <div style="background-color: #F1F5F9; border-radius: 12px; padding: 18px 20px; font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
          <h3 style="font-size: 14px; font-weight: 700; color: #0F172A; margin: 0 0 8px 0;">
            Próximos pasos de navegación:
          </h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Nuestro Concierge te contactará 15 días antes del zarpe con la <strong>Guía de Equipaje Náutico</strong> y condiciones meteorológicas estimadas.</li>
            <li>Se te solicitará ficha médica y preferencias alimentarias a bordo.</li>
            <li>Punto de encuentro y briefing de seguridad marítima previo al desatraque.</li>
          </ul>
        </div>

        <div style="text-align: center;">
          <a href="${CONCIERGE_WA_LINK}" class="btn-gold" target="_blank">
            Coordinar con Concierge por WhatsApp
          </a>
        </div>
      </td>
    </tr>
  `;

  return { subject, html: baseEmailLayout(content, preview) };
}

// -------------------------------------------------------------------------------------------------
// 6. PASAJERO EN LISTA: AVISO DE CUPO LIBERADO
// -------------------------------------------------------------------------------------------------
export function generateWaitlistSlotReleasedEmail(data: WaitlistEmailData): { subject: string; html: string } {
  const subject = `⚡ Cupo Liberado Disponible | ${data.expeditionName} - Yates Chile`;
  const preview = `Se ha liberado un cupo con prioridad exclusiva para ti en ${data.expeditionName}.`;

  const claimLink = data.claimUrl || `${SITE_URL}/#/expediciones`;

  const content = `
    <tr>
      <td style="background-color: #0F172A; padding: 36px 32px; text-align: center; border-bottom: 3px solid #F59E0B;">
        <span class="badge" style="background-color: rgba(245, 158, 11, 0.2); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.4);">
          PRIORIDAD POR 24 HORAS
        </span>
        <h1 style="font-family: Georgia, serif; font-size: 24px; color: #FFFFFF; margin: 16px 0 8px 0; font-weight: 700;">
          ¡Se ha liberado una plaza para ti!
        </h1>
        <p style="color: #94A3B8; font-size: 14px; margin: 0;">
          Estimado/a ${escapeHtml(data.fullName)}, se habilitó disponibilidad en la travesía que estabas esperando.
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding: 32px;">
        <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 20px 0;">
          Como estabas inscrito/a en nuestra Lista de Espera para <strong>${escapeHtml(data.expeditionName)}</strong> (${escapeHtml(data.startDate)} al ${escapeHtml(data.endDate)}), tienes la <strong>primera opción exclusiva</strong> para confirmar tu cupo antes de que se ofrezca al siguiente de la lista o se abra en el catálogo público.
        </p>

        <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 12px; padding: 18px 20px; font-size: 13px; color: #92400E; margin-bottom: 28px; line-height: 1.5; text-align: center;">
          ⏳ <strong>Ventana de exclusividad:</strong> Tu reserva prioritaria estará reservada durante las próximas <strong>24 horas</strong>.
        </div>

        <div style="text-align: center; padding: 8px 0 16px 0;">
          <a href="${claimLink}" class="btn-gold" target="_blank">
            Reclamar y Asegurar mi Cupo Ahora →
          </a>
        </div>

        <p style="text-align: center; font-size: 12px; color: #64748B; margin-top: 16px;">
          O comunícate directamente con nuestro Concierge al <a href="${CONCIERGE_WA_LINK}" style="color: #D97706; font-weight: 700;">WhatsApp ${CONCIERGE_PHONE}</a>.
        </p>
      </td>
    </tr>
  `;

  return { subject, html: baseEmailLayout(content, preview) };
}

// -------------------------------------------------------------------------------------------------
// 7. LODGE: RESERVA / SOLICITUD DE ESTADÍA
// -------------------------------------------------------------------------------------------------
export interface LodgeBookingEmailData {
  fullName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  cabinType?: string;
  notes?: string;
}

export function generateLodgeBookingEmail(data: LodgeBookingEmailData, isAdmin: boolean = false): { subject: string; html: string } {
  const subject = isAdmin
    ? `🏡 Nueva Solicitud de Lodge: ${data.fullName} (${data.guestsCount} huéspedes)`
    : `Solicitud de Estadía en Lodge Recibida | Yates Chile`;
  const preview = `Detalles de estadía en Lodge para ${data.fullName} del ${data.checkIn} al ${data.checkOut}.`;

  const content = `
    <tr>
      <td style="background-color: #0F172A; padding: 36px 32px; text-align: center; border-bottom: 3px solid #14B8A6;">
        <span class="badge" style="background-color: rgba(20, 184, 166, 0.2); color: #2DD4BF; border: 1px solid rgba(20, 184, 166, 0.4);">
          ${isAdmin ? 'NUEVA SOLICITUD DE LODGE' : 'SOLICITUD EN PROCESO'}
        </span>
        <h1 style="font-family: Georgia, serif; font-size: 22px; color: #FFFFFF; margin: 16px 0 8px 0; font-weight: 700;">
          ${isAdmin ? 'Solicitud de Estadía en el Lodge' : `¡Hola, ${escapeHtml(data.fullName)}!`}
        </h1>
        <p style="color: #94A3B8; font-size: 14px; margin: 0;">
          ${isAdmin ? 'Detalles de la solicitud de reserva en el Lodge.' : 'Hemos recibido tu solicitud de estadía en nuestro refugio costero austral.'}
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding: 32px;">
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
          ${isAdmin
            ? `El huésped <strong>${escapeHtml(data.fullName)}</strong> ha solicitado una estadía en el Lodge:`
            : `Nuestro equipo está verificando la disponibilidad de habitaciones y logística marítima para las fechas solicitadas. Nos pondremos en contacto contigo a la brevedad.`}
        </p>

        <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; font-size: 13px; margin-bottom: 24px;">
          <tr>
            <td width="35%" style="color: #64748B; font-weight: 600;">Huésped Principal:</td>
            <td><strong>${escapeHtml(data.fullName)}</strong></td>
          </tr>
          <tr>
            <td style="color: #64748B; font-weight: 600;">Check-in:</td>
            <td><strong>${escapeHtml(data.checkIn)}</strong></td>
          </tr>
          <tr>
            <td style="color: #64748B; font-weight: 600;">Check-out:</td>
            <td><strong>${escapeHtml(data.checkOut)}</strong></td>
          </tr>
          <tr>
            <td style="color: #64748B; font-weight: 600;">Número de Huéspedes:</td>
            <td><strong>${data.guestsCount} personas</strong></td>
          </tr>
          ${data.cabinType ? `
          <tr>
            <td style="color: #64748B; font-weight: 600;">Tipo de Habitación:</td>
            <td>${escapeHtml(data.cabinType)}</td>
          </tr>` : ''}
          <tr>
            <td style="color: #64748B; font-weight: 600;">Contacto:</td>
            <td>${escapeHtml(data.phone)} · <a href="mailto:${escapeHtml(data.email)}" style="color: #2563EB;">${escapeHtml(data.email)}</a></td>
          </tr>
          ${data.notes ? `
          <tr>
            <td style="color: #64748B; font-weight: 600;">Requerimientos:</td>
            <td><em>${escapeHtml(data.notes)}</em></td>
          </tr>` : ''}
        </table>

        <div style="text-align: center;">
          <a href="${CONCIERGE_WA_LINK}" class="btn-dark" target="_blank">
            Coordinar con Concierge del Lodge
          </a>
        </div>
      </td>
    </tr>
  `;

  return { subject, html: baseEmailLayout(content, preview) };
}

// -------------------------------------------------------------------------------------------------
// 8. NEWSLETTER: BIENVENIDA A LA BITÁCORA NÁUTICA
// -------------------------------------------------------------------------------------------------
export interface NewsletterEmailData {
  email: string;
  name?: string;
}

export function generateNewsletterWelcomeEmail(data: NewsletterEmailData): { subject: string; html: string } {
  const subject = `Bienvenido a la Bitácora Exclusiva de Yates Chile 🌊`;
  const preview = `Acceso prioritario a nuevas expediciones, crónicas de navegación y novedades de la flota.`;

  const content = `
    <tr>
      <td style="background-color: #070E1B; padding: 40px 32px; text-align: center; border-bottom: 3px solid #F59E0B;">
        <span class="badge" style="background-color: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3);">
          BITÁCORA DE NAVEGACIÓN
        </span>
        <h1 style="font-family: Georgia, serif; font-size: 24px; color: #FFFFFF; margin: 16px 0 8px 0; font-weight: 700;">
          Bienvenido a Yates Chile
        </h1>
        <p style="color: #94A3B8; font-size: 15px; margin: 0;">
          ${data.name ? `Hola ${escapeHtml(data.name)}, es` : 'Es'} un honor darte la bienvenida a nuestra comunidad marítima.
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding: 32px;">
        <p style="font-size: 14px; color: #334155; line-height: 1.7; margin: 0 0 20px 0;">
          Como parte de nuestra selecta lista de tripulantes y amantes de la navegación, tendrás <strong>acceso prioritario</strong> antes de cada temporada:
        </p>

        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px;">
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;">
            <li><strong>Apertura anticipada de cupos</strong> para la Expedición Archipiélago Juan Fernández / Robinson Crusoe.</li>
            <li><strong>Bitácora y crónicas náuticas</strong> escritas directamente por nuestros patrones de navegación en los fiordos australes.</li>
            <li><strong>Invitaciones a salidas privadas</strong> y charters de temporada en el Velero Vegvísir y Yate Terranova.</li>
          </ul>
        </div>

        <div style="text-align: center; padding: 8px 0;">
          <a href="${SITE_URL}/#/expediciones" class="btn-gold" target="_blank">
            Explorar Calendario de Expediciones →
          </a>
        </div>
      </td>
    </tr>
  `;

  return { subject, html: baseEmailLayout(content, preview) };
}
