import {
  generateExpeditionBookingPassengerEmail,
  generateExpeditionBookingAdminEmail,
  generateWaitlistPassengerEmail,
  generateWaitlistAdminEmail,
  generatePaymentConfirmedPassengerEmail,
  generateWaitlistSlotReleasedEmail,
  generateLodgeBookingEmail,
  generateNewsletterWelcomeEmail,
  type ExpeditionBookingPassengerEmailData,
  type WaitlistEmailData,
  type LodgeBookingEmailData,
} from './emailTemplates';

const ADMIN_EMAIL = 'contacto@yateschile.com';

interface SendEmailPayload {
  to: string | { email: string; name?: string } | { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
}

interface NewsletterPayload {
  email: string;
  name?: string;
  listId?: number;
}

class EmailService {
  private async postToApi(body: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // 1. Try internal backend serverless / dev endpoint
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const json = await response.json().catch(() => ({}));
        return { success: true, data: json };
      }

      // If /api/send-email returned 404 (e.g. running in client-only preview)
      if (response.status === 404) {
        return await this.fallbackDirectBrevo(body);
      }

      const errJson = await response.json().catch(() => ({ error: 'Error al enviar correo' }));
      return { success: false, error: errJson.error || `HTTP ${response.status}` };
    } catch (err: any) {
      console.warn('API /api/send-email unreachable, trying direct client fallback:', err);
      return await this.fallbackDirectBrevo(body);
    }
  }

  /**
   * Fallback directo en caso de que la función serverless no responda (usando VITE_BREVO_API_KEY)
   */
  private async fallbackDirectBrevo(body: any): Promise<{ success: boolean; data?: any; error?: string }> {
    const directKey = (import.meta as any).env?.VITE_BREVO_API_KEY || (import.meta as any).env?.BREVO_API_KEY;
    if (!directKey) {
      return { success: false, error: 'Sin clave de Brevo para fallback' };
    }

    try {
      if (body.action === 'subscribe_newsletter') {
        await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'api-key': directKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            email: body.email,
            attributes: body.name ? { NOMBRE: body.name } : undefined,
            listIds: [2],
            updateEnabled: true,
          }),
        }).catch(() => {});
      }

      if (body.to && body.subject && body.htmlContent) {
        const toRecipients = Array.isArray(body.to)
          ? body.to
          : typeof body.to === 'string'
          ? [{ email: body.to }]
          : [body.to];

        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': directKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'Yates Chile Concierge', email: ADMIN_EMAIL },
            to: toRecipients,
            subject: body.subject,
            htmlContent: body.htmlContent,
          }),
        });

        if (res.ok) {
          const json = await res.json().catch(() => ({}));
          return { success: true, data: json };
        }
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Envía un correo genérico con HTML
   */
  async sendEmail(payload: SendEmailPayload) {
    return this.postToApi({
      action: 'send_email',
      to: payload.to,
      subject: payload.subject,
      htmlContent: payload.htmlContent,
      textContent: payload.textContent,
    });
  }

  /**
   * 1 & 2. Flujo de Reserva de Expedición: Envía email al Pasajero y Alerta al Concierge
   */
  async sendExpeditionBookingEmails(data: ExpeditionBookingPassengerEmailData) {
    const results = { passenger: false, admin: false };

    try {
      // 1. Correo al Pasajero
      const passengerTemplate = generateExpeditionBookingPassengerEmail(data);
      const resPassenger = await this.sendEmail({
        to: { email: data.email, name: data.fullName },
        subject: passengerTemplate.subject,
        htmlContent: passengerTemplate.html,
      });
      results.passenger = resPassenger.success;
    } catch (e) {
      console.error('Error enviando correo de reserva al pasajero:', e);
    }

    try {
      // 2. Alerta al Admin/Concierge
      const adminTemplate = generateExpeditionBookingAdminEmail(data);
      const resAdmin = await this.sendEmail({
        to: ADMIN_EMAIL,
        subject: adminTemplate.subject,
        htmlContent: adminTemplate.html,
      });
      results.admin = resAdmin.success;
    } catch (e) {
      console.error('Error enviando alerta de reserva al admin:', e);
    }

    return results;
  }

  /**
   * 3 & 4. Flujo de Lista de Espera: Envía confirmación al Pasajero y Alerta al Concierge
   */
  async sendWaitlistEmails(data: WaitlistEmailData) {
    const results = { passenger: false, admin: false };

    try {
      // 1. Al Pasajero
      const passengerTemplate = generateWaitlistPassengerEmail(data);
      const resPassenger = await this.sendEmail({
        to: { email: data.email, name: data.fullName },
        subject: passengerTemplate.subject,
        htmlContent: passengerTemplate.html,
      });
      results.passenger = resPassenger.success;
    } catch (e) {
      console.error('Error enviando confirmación de lista de espera al pasajero:', e);
    }

    try {
      // 2. Al Admin/Concierge
      const adminTemplate = generateWaitlistAdminEmail(data);
      const resAdmin = await this.sendEmail({
        to: ADMIN_EMAIL,
        subject: adminTemplate.subject,
        htmlContent: adminTemplate.html,
      });
      results.admin = resAdmin.success;
    } catch (e) {
      console.error('Error enviando alerta de lista de espera al admin:', e);
    }

    return results;
  }

  /**
   * 5. Flujo de Confirmación de Pago: "Bienvenido a Bordo" con Voucher Oficial
   */
  async sendPaymentConfirmedEmail(data: ExpeditionBookingPassengerEmailData) {
    const template = generatePaymentConfirmedPassengerEmail(data);
    return this.sendEmail({
      to: { email: data.email, name: data.fullName },
      subject: template.subject,
      htmlContent: template.html,
    });
  }

  /**
   * 6. Flujo de Cupo Liberado para Lista de Espera
   */
  async sendWaitlistSlotReleasedEmail(data: WaitlistEmailData) {
    const template = generateWaitlistSlotReleasedEmail(data);
    return this.sendEmail({
      to: { email: data.email, name: data.fullName },
      subject: template.subject,
      htmlContent: template.html,
    });
  }

  /**
   * 7. Flujo de Lodge: Solicitud de estadía (Huésped y Concierge)
   */
  async sendLodgeBookingEmails(data: LodgeBookingEmailData) {
    const results = { guest: false, admin: false };

    try {
      const guestTemplate = generateLodgeBookingEmail(data, false);
      const resGuest = await this.sendEmail({
        to: { email: data.email, name: data.fullName },
        subject: guestTemplate.subject,
        htmlContent: guestTemplate.html,
      });
      results.guest = resGuest.success;
    } catch (e) {
      console.error('Error enviando confirmación de lodge al huésped:', e);
    }

    try {
      const adminTemplate = generateLodgeBookingEmail(data, true);
      const resAdmin = await this.sendEmail({
        to: ADMIN_EMAIL,
        subject: adminTemplate.subject,
        htmlContent: adminTemplate.html,
      });
      results.admin = resAdmin.success;
    } catch (e) {
      console.error('Error enviando alerta de lodge al admin:', e);
    }

    return results;
  }

  /**
   * 8. Flujo de Newsletter: Sincronización en CRM de Brevo + Correo de Bienvenida
   */
  async subscribeNewsletter(payload: NewsletterPayload) {
    const welcomeTemplate = generateNewsletterWelcomeEmail({
      email: payload.email,
      name: payload.name,
    });

    return this.postToApi({
      action: 'subscribe_newsletter',
      email: payload.email,
      name: payload.name,
      listId: payload.listId || 2,
      to: { email: payload.email, name: payload.name },
      subject: welcomeTemplate.subject,
      htmlContent: welcomeTemplate.html,
    });
  }
}

export const emailService = new EmailService();
