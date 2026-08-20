-- ==============================================================================
-- YATES CHILE & LODGE RINCÓN DE NAVEGANTES - SUPABASE INITIAL SCHEMA
-- ==============================================================================

-- 1. Extensiones
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. Habitaciones del Lodge (4 Habitaciones Exclusivas)
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

-- Seed de las 4 Habitaciones del Lodge
INSERT INTO public.lodge_rooms (room_number, room_name, room_type, max_pax, base_price_clp, has_ocean_view)
VALUES
(1, 'Cabina Proa (Triple Vista Océano)', 'triple', 3, 240000, true),
(2, 'Cabina Barlovento (Triple Vista Océano)', 'triple', 3, 240000, true),
(3, 'Cabina Sotavento (Triple Vista Océano)', 'triple', 3, 240000, true),
(4, 'Cabina Popa (Doble Matrimonial Vista Océano)', 'doble', 2, 210000, true)
ON CONFLICT (room_number) DO NOTHING;

-- 3. Reservas y Bloqueos de Habitaciones del Lodge
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

-- 4. Embarcaciones (Flota: Vegvisir & Terranova)
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

-- Seed de Servicios Iniciales
INSERT INTO public.catalog_services (name, category, description, duration_label, price_clp, max_pax, image_url)
VALUES
('Cabalgata Guiada por la Isla Robinson Crusoe', 'cabalgatas', 'Recorrido a caballo con guías locales por senderos costeros y miradores de Juan Fernández.', 'Medio Día (4 hrs)', 75000, 6, 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80'),
('Buceo & Snorkel con Lobo Fino de Juan Fernández', 'buceo', 'Inmersión en aguas cristalinas protegidas con fauna marina endémica única en el planeta.', '3 Horas', 95000, 6, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'),
('Trekking Bosque de Helechos Gigantes & Mirador Selkirk', 'trekking', 'Caminata botánica y ascenso hacia el mirador histórico de Alejandro Selkirk.', '5 Horas', 55000, 10, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'),
('Cena Gourmet Isleña con Langosta de Juan Fernández en Quincho', 'gastronomia', 'Experiencia culinaria de 4 tiempos maridada con vinos chilenos de autor.', 'Cena 3 hrs', 85000, 11, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80')
ON CONFLICT DO NOTHING;

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

-- Seed de Contenidos CMS Iniciales
INSERT INTO public.site_content (section_key, title, subtitle, body_text, media_url, metadata)
VALUES
('home_hero', 'EXPEDICIONES PATAGONIA & JUAN FERNÁNDEZ', 'Aventura en Territorios Inexplorados', 'Navegaciones exclusivas en velero y yate de expedición, junto a estadías íntimas en nuestro Lodge Rincón de Navegantes.', 'https://www.dropbox.com/scl/fo/41kyrrmy9bhbmj4ra8ge2/APoFuaLsV7SP_dnIe3k8vy0/Fotos/397fa5f6-f7a6-4e5f-ab0c-60f45245ddb4.JPG?rlkey=dydsj8rbegl4ga5x2062vycj6&st=v9ltgbio&raw=1', '{"button_text": "Explorar Flota", "button_link": "/flota"}'::jsonb),
('lodge_overview', 'Lodge Rincón de Navegantes', 'Uberlindo Andaur 222 • Isla Robinson Crusoe', 'Diseñado en torno a 4 cabinas independientes con baño privado y vista al océano para hasta 11 pasajeros, amplio quincho y expediciones guiadas por expertos locales.', '/rincon-de-navegantes.jpg', '{"max_pax": 11, "rooms_count": 4}'::jsonb),
('bank_transfer_info', 'Datos para Transferencia Bancaria', 'Banco de Chile / Banco Santander', 'Yates Chile SpA • RUT: 77.892.341-K • Cuenta Corriente Nº: 00-123456-78 • Email: pagos@yateschile.cl', '', '{"deposit_percentage": 50}'::jsonb)
ON CONFLICT (section_key) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    body_text = EXCLUDED.body_text;

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

-- Políticas de RLS Permisivas para Operación
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public select lodge_rooms" ON public.lodge_rooms;
    CREATE POLICY "Public select lodge_rooms" ON public.lodge_rooms FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public select lodge_bookings" ON public.lodge_bookings;
    CREATE POLICY "Public select lodge_bookings" ON public.lodge_bookings FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public select vessels" ON public.vessels;
    CREATE POLICY "Public select vessels" ON public.vessels FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public select expedition_routes" ON public.expedition_routes;
    CREATE POLICY "Public select expedition_routes" ON public.expedition_routes FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public select expedition_departures" ON public.expedition_departures;
    CREATE POLICY "Public select expedition_departures" ON public.expedition_departures FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public select expedition_bookings" ON public.expedition_bookings;
    CREATE POLICY "Public select expedition_bookings" ON public.expedition_bookings FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public select expedition_passengers" ON public.expedition_passengers;
    CREATE POLICY "Public select expedition_passengers" ON public.expedition_passengers FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public select catalog_services" ON public.catalog_services;
    CREATE POLICY "Public select catalog_services" ON public.catalog_services FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public select payment_installments" ON public.payment_installments;
    CREATE POLICY "Public select payment_installments" ON public.payment_installments FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public select site_content" ON public.site_content;
    CREATE POLICY "Public select site_content" ON public.site_content FOR ALL USING (true) WITH CHECK (true);
END $$;
