import type { IncomingMessage, ServerResponse } from 'http';

interface RequestBody {
  action?: 'send_email' | 'subscribe_newsletter';
  to?: string | { email: string; name?: string }[];
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  email?: string;
  name?: string;
  listId?: number;
}

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.BREVO_API_KEY || process.env.VITE_BREVO_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'BREVO_API_KEY not configured on server' });
    return;
  }

  try {
    const body: RequestBody = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    // Action 1: Subscribe to Newsletter in Brevo CRM
    if (body.action === 'subscribe_newsletter' || (body.email && !body.htmlContent)) {
      const emailToSubscribe = body.email;
      if (!emailToSubscribe) {
        res.status(400).json({ error: 'Email is required for newsletter subscription' });
        return;
      }

      const brevoContactRes = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: emailToSubscribe,
          attributes: body.name ? { NOMBRE: body.name } : undefined,
          listIds: body.listId ? [body.listId] : [2], // 2 is default list in Brevo
          updateEnabled: true
        })
      });

      const contactData = await brevoContactRes.json().catch(() => ({}));
      
      // If there is also an email to send (e.g. welcome email), proceed, otherwise return
      if (!body.htmlContent || !body.subject) {
        res.status(200).json({ success: true, contact: contactData });
        return;
      }
    }

    // Action 2: Send Transactional Email
    if (!body.to || !body.subject || !body.htmlContent) {
      res.status(400).json({ error: 'Missing required fields: to, subject, htmlContent' });
      return;
    }

    const toRecipients = Array.isArray(body.to)
      ? body.to
      : typeof body.to === 'string'
      ? [{ email: body.to }]
      : [body.to];

    const brevoEmailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'Yates Chile Concierge',
          email: 'contacto@yateschile.com'
        },
        to: toRecipients,
        subject: body.subject,
        htmlContent: body.htmlContent,
        textContent: body.textContent
      })
    });

    const emailData = await brevoEmailRes.json().catch(() => ({}));

    if (!brevoEmailRes.ok) {
      res.status(brevoEmailRes.status).json({
        error: 'Brevo API error',
        details: emailData
      });
      return;
    }

    res.status(200).json({ success: true, data: emailData });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
