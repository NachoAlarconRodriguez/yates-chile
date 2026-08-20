import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nnzixzoevxeeuayidyuk.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ueml4em9ldnhlZXVheWlkeXVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzA4NTA1OSwiZXhwIjoyMTAyNjYxMDU5fQ.WwBk8CKY8IwBJ6Yd0XeHOt8fsdhD_cOkQCFqaJTjksc';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const sqlStatements = `
-- 1. Extensiones
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. Habitaciones del Lodge (4 Habitaciones)
CREATE TABLE IF NOT EXISTS public.lodge_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number INT UNIQUE NOT NULL,
    room_name TEXT NOT NULL,
    room_type TEXT NOT NULL DEFAULT 'triple',
    max_pax INT NOT NULL DEFAULT 3,
    base_price_clp NUMERIC NOT NULL DEFAULT 220000,
    has_ocean_view BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Reservas y Bloqueos del Lodge
CREATE TABLE IF NOT EXISTS public.lodge_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT UNIQUE NOT NULL,
    room_id UUID REFERENCES public.lodge_rooms(id) ON DELETE SET NULL,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    guest_rut_passport TEXT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    pax_count INT NOT NULL DEFAULT 2,
    channel_source TEXT NOT NULL DEFAULT 'web_direct' CHECK (channel_source IN ('web_direct', 'airbnb', 'booking_com', 'phone_whatsapp', 'maintenance')),
    status TEXT NOT NULL DEFAULT 'pending_transfer' CHECK (status IN ('pending_transfer', 'approved', 'blocked', 'cancelled', 'completed')),
    total_amount NUMERIC NOT NULL DEFAULT 0,
    discount_amount NUMERIC NOT NULL DEFAULT 0,
    discount_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Embarcaciones (Flota)
CREATE TABLE IF NOT EXISTS public.vessels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    capacity_pax INT NOT NULL DEFAULT 12,
    cabins_count INT NOT NULL DEFAULT 5,
    bathrooms_count INT NOT NULL DEFAULT 5,
    registration TEXT,
    builder TEXT,
    crew TEXT,
    badge TEXT,
    main_image TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    hotspots JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Rutas de Expedición
CREATE TABLE IF NOT EXISTS public.expedition_routes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    duration TEXT NOT NULL,
    highlights JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    map_image TEXT,
    recommended_vessel TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Salidas Programadas de Expedición
CREATE TABLE IF NOT EXISTS public.expedition_departures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id TEXT REFERENCES public.expedition_routes(id) ON DELETE CASCADE,
    vessel_id TEXT REFERENCES public.vessels(id) ON DELETE CASCADE,
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    total_slots INT NOT NULL DEFAULT 10,
    available_slots INT NOT NULL DEFAULT 10,
    price_per_pax_clp NUMERIC NOT NULL DEFAULT 1850000,
    price_charter_full_clp NUMERIC DEFAULT 15000000,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'guaranteed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Reservas de Expediciones
CREATE TABLE IF NOT EXISTS public.expedition_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT UNIQUE NOT NULL,
    departure_id UUID REFERENCES public.expedition_departures(id) ON DELETE SET NULL,
    route_id TEXT REFERENCES public.expedition_routes(id) ON DELETE SET NULL,
    vessel_id TEXT REFERENCES public.vessels(id) ON DELETE SET NULL,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    guest_rut_passport TEXT,
    booking_type TEXT NOT NULL DEFAULT 'per_pax' CHECK (booking_type IN ('per_pax', 'full_charter')),
    pax_count INT NOT NULL DEFAULT 1,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    discount_amount NUMERIC NOT NULL DEFAULT 0,
    discount_reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending_transfer' CHECK (status IN ('pending_transfer', 'approved', 'cancelled', 'completed')),
    dietary_medical_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Manifiesto de Pasajeros para Capitanía de Puerto
CREATE TABLE IF NOT EXISTS public.expedition_passengers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.expedition_bookings(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    doc_id TEXT NOT NULL,
    nationality TEXT DEFAULT 'Chilena',
    emergency_contact TEXT,
    medical_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Catálogo de Servicios & Actividades Dinámicas (Cabalgatas, Buceo, etc.)
CREATE TABLE IF NOT EXISTS public.catalog_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'cabalgatas' CHECK (category IN ('cabalgatas', 'buceo', 'trekking', 'gastronomia', 'nautica', 'bienestar')),
    description TEXT,
    duration_label TEXT,
    price_clp NUMERIC NOT NULL DEFAULT 65000,
    max_pax INT DEFAULT 8,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Pagos, Cuotas, Comprobantes de Transferencia & Descuentos
CREATE TABLE IF NOT EXISTS public.payment_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_type TEXT NOT NULL CHECK (booking_type IN ('lodge', 'expedition')),
    booking_id UUID NOT NULL,
    installment_number INT NOT NULL DEFAULT 1,
    total_installments INT NOT NULL DEFAULT 2,
    concept TEXT NOT NULL,
    amount_expected NUMERIC NOT NULL,
    amount_paid NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending_upload' CHECK (status IN ('pending_upload', 'pending_approval', 'approved', 'rejected')),
    receipt_url TEXT,
    bank_reference TEXT,
    due_date DATE,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. CMS de Contenidos (Textos, Fotos y Videos del sitio web)
CREATE TABLE IF NOT EXISTS public.site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT UNIQUE NOT NULL,
    title TEXT,
    subtitle TEXT,
    body_text TEXT,
    media_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Habilitar RLS en todas las tablas
ALTER TABLE public.lodge_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lodge_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expedition_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expedition_departures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expedition_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expedition_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Políticas de Lectura Pública (anon y authenticated)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view active rooms" ON public.lodge_rooms;
    CREATE POLICY "Public can view active rooms" ON public.lodge_rooms FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can view active vessels" ON public.vessels;
    CREATE POLICY "Public can view active vessels" ON public.vessels FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can view active routes" ON public.expedition_routes;
    CREATE POLICY "Public can view active routes" ON public.expedition_routes FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can view departures" ON public.expedition_departures;
    CREATE POLICY "Public can view departures" ON public.expedition_departures FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can view services" ON public.catalog_services;
    CREATE POLICY "Public can view services" ON public.catalog_services FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can view site content" ON public.site_content;
    CREATE POLICY "Public can view site content" ON public.site_content FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can view room bookings dates" ON public.lodge_bookings;
    CREATE POLICY "Public can view room bookings dates" ON public.lodge_bookings FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can insert lodge bookings" ON public.lodge_bookings;
    CREATE POLICY "Public can insert lodge bookings" ON public.lodge_bookings FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Public can insert expedition bookings" ON public.expedition_bookings;
    CREATE POLICY "Public can insert expedition bookings" ON public.expedition_bookings FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Public can view their payment installments" ON public.payment_installments;
    CREATE POLICY "Public can view their payment installments" ON public.payment_installments FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can insert payment installments" ON public.payment_installments;
    CREATE POLICY "Public can insert payment installments" ON public.payment_installments FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Public can update receipts" ON public.payment_installments;
    CREATE POLICY "Public can update receipts" ON public.payment_installments FOR UPDATE USING (true);
END $$;
`;

async function run() {
  console.log('Connecting to Supabase and creating schema...');
  
  // Try sending raw SQL query to Supabase via Postgres meta / sql api
  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`
    }
  });
  console.log('Rest endpoint status:', response.status);

  // Use the pg connection or sql query endpoint
  const queryRes = await fetch(`${SUPABASE_URL}/v1/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ query: sqlStatements })
  });

  console.log('Query endpoint status:', queryRes.status);
  if (!queryRes.ok) {
    console.log('Query result text:', await queryRes.text());
  } else {
    console.log('Schema created successfully!');
  }

  // Create Storage Buckets
  console.log('Setting up storage buckets...');
  const { data: b1, error: e1 } = await supabase.storage.createBucket('site-media', { public: true });
  console.log('Bucket site-media:', b1, e1?.message || 'OK');

  const { data: b2, error: e2 } = await supabase.storage.createBucket('receipts', { public: true });
  console.log('Bucket receipts:', b2, e2?.message || 'OK');
}

run().catch(console.error);
