import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.BREVO_API_KEY || env.VITE_BREVO_API_KEY || process.env.BREVO_API_KEY || process.env.VITE_BREVO_API_KEY;

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'brevo-api-dev-middleware',
        configureServer(server) {
          server.middlewares.use('/api/send-email', async (req, res) => {
            if (req.method === 'OPTIONS') {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
              res.statusCode = 200;
              res.end();
              return;
            }

            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Method not allowed' }));
              return;
            }

            let raw = '';
            req.on('data', (chunk) => { raw += chunk; });
            req.on('end', async () => {
              res.setHeader('Content-Type', 'application/json');
              try {
                if (!apiKey) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'BREVO_API_KEY not configured in local environment' }));
                  return;
                }

                const body = JSON.parse(raw);

                // Handle newsletter subscribe
                if (body.action === 'subscribe_newsletter' || (body.email && !body.htmlContent)) {
                  const subRes = await fetch('https://api.brevo.com/v3/contacts', {
                    method: 'POST',
                    headers: {
                      'api-key': apiKey,
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                      email: body.email,
                      attributes: body.name ? { NOMBRE: body.name } : undefined,
                      listIds: body.listId ? [body.listId] : [2],
                      updateEnabled: true,
                    }),
                  });
                  const contactData = await subRes.json().catch(() => ({}));
                  if (!body.htmlContent || !body.subject) {
                    res.statusCode = 200;
                    res.end(JSON.stringify({ success: true, contact: contactData }));
                    return;
                  }
                }

                if (!body.to || !body.subject || !body.htmlContent) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'Missing required fields: to, subject, htmlContent' }));
                  return;
                }

                const toRecipients = Array.isArray(body.to)
                  ? body.to
                  : typeof body.to === 'string'
                  ? [{ email: body.to }]
                  : [body.to];

                const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
                  method: 'POST',
                  headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                  },
                  body: JSON.stringify({
                    sender: {
                      name: 'Yates Chile Concierge',
                      email: 'contacto@yateschile.com',
                    },
                    to: toRecipients,
                    subject: body.subject,
                    htmlContent: body.htmlContent,
                    textContent: body.textContent,
                  }),
                });

                const emailData = await brevoRes.json().catch(() => ({}));
                res.statusCode = brevoRes.status;
                res.end(JSON.stringify(emailData));
              } catch (err: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message || 'Internal dev error' }));
              }
            });
          });
        },
      },
    ],
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
              if (id.includes('framer-motion')) return 'vendor-motion';
              if (id.includes('lucide-react')) return 'vendor-icons';
              if (id.includes('@supabase')) return 'vendor-supabase';
            }
          },
        },
      },
    },
  };
});

