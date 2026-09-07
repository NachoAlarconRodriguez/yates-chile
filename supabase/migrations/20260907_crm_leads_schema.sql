-- ==============================================================================
-- YATES CHILE - CRM CLIENTS, LEADS & ACCESS REQUESTS MIGRATION
-- ==============================================================================

-- 1. CRM DE CLIENTES (Fichas Centralizadas)
CREATE TABLE IF NOT EXISTS public.crm_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    rut_or_passport TEXT,
    birth_date TEXT,
    nationality TEXT DEFAULT 'Chilena',
    city TEXT,
    category TEXT DEFAULT 'standard' CHECK (category IN ('vip', 'regular', 'corporativo', 'standard')),
    tags JSONB DEFAULT '[]'::jsonb,
    total_spent_clp NUMERIC DEFAULT 0,
    bookings_count INT DEFAULT 0,
    last_activity_date DATE,
    dietary_preferences TEXT,
    diving_level TEXT,
    beverage_preference TEXT,
    emergency_contact TEXT,
    notes TEXT,
    admin_notes JSONB DEFAULT '[]'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. PROSPECTOS / LEADS (Web, Newsletter, Reservas Abandonadas)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    doc_id TEXT,
    origin TEXT NOT NULL DEFAULT 'contacto_web' CHECK (origin IN (
        'reserva_incompleta', 'newsletter', 'brochure', 'contacto_web', 
        'expedicion_interest', 'lodge_interest', 'whatsapp', 'manual'
    )),
    origin_details TEXT,
    status TEXT NOT NULL DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'contactado', 'cotizando', 'convertido', 'descartado')),
    interest_type TEXT NOT NULL DEFAULT 'general' CHECK (interest_type IN ('expediciones', 'lodge', 'charter', 'general')),
    estimated_pax INT DEFAULT 2,
    tentative_date TEXT,
    notes TEXT,
    city TEXT,
    country TEXT,
    estimated_budget_clp NUMERIC DEFAULT 0,
    converted_customer_id UUID REFERENCES public.crm_clients(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. SOLICITUDES DE ACCESO ADMINISTRATIVO
CREATE TABLE IF NOT EXISTS public.admin_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. POLÍTICAS DE SEGURIDAD (RLS)
ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on crm_clients" ON public.crm_clients;
CREATE POLICY "Allow all operations on crm_clients" ON public.crm_clients FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on leads" ON public.leads;
CREATE POLICY "Allow all operations on leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.admin_access_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on admin_access_requests" ON public.admin_access_requests;
CREATE POLICY "Allow all operations on admin_access_requests" ON public.admin_access_requests FOR ALL USING (true) WITH CHECK (true);

-- 5. SEED INICIAL DE CLIENTES CRM
INSERT INTO public.crm_clients (
    id, full_name, email, phone, rut_or_passport, birth_date, nationality, city, category, tags,
    total_spent_clp, bookings_count, last_activity_date, dietary_preferences, diving_level,
    beverage_preference, emergency_contact, notes, admin_notes, timeline
)
VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'Rodrigo Valenzuela Riesco',
    'r.valenzuela@inversionesvr.cl',
    '+56 9 8412 9901',
    '12.483.921-K',
    '14/05/1982',
    'Chilena',
    'Santiago, Chile',
    'vip',
    '["VIP Gold", "Expedicionario", "Lodge Rincón", "Alto LTV"]'::jsonb,
    14850000,
    5,
    '2026-08-15',
    'Celíaco estricto (100% libre de gluten). Prefiere productos marinos frescos de Juan Fernández.',
    'Patrón de Bahía / Certificación Buceo Open Water',
    'Vino Cabernet Sauvignon reserva o Carménère alta gama.',
    'María Teresa Edwards (+56 9 8412 9902)',
    'Cliente de altísima fidelidad. Viaja frecuentemente con su familia. Priorizar habitaciones Proa y Barlovento.',
    '[{"id": "an-1", "createdAt": "15/08/2026 11:30", "author": "Administrador General", "content": "Cliente de altísima fidelidad. Viaja frecuentemente con su familia. Priorizar habitaciones Proa y Barlovento."}]'::jsonb,
    '[{"id": "t-1", "date": "15 Ago 2026", "type": "booking", "title": "Reserva Confirmada — Expedición Selkirk Extremo", "description": "4 cupos reservados a bordo del Velero Vegvisir para zarpe de Noviembre 2026."}]'::jsonb
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Carolina Echeverría Undurraga',
    'carolina.echeverria@estudioundurraga.cl',
    '+56 9 9234 5678',
    '15.392.184-3',
    '22/09/1988',
    'Chilena',
    'Viña del Mar, Chile',
    'vip',
    '["VIP Platinum", "Lodge Lover", "Buceo"]'::jsonb,
    8400000,
    3,
    '2026-08-20',
    'Vegetariana flexible (consume pescados y mariscos locales).',
    'Buceo Avanzado (PADI Advanced Open Water)',
    'Chardonnay y Sauvignon Blanc costero.',
    'Matías Valdés (+56 9 9234 5679)',
    'Interesada en fotografía submarina y excursiones botánicas en Juan Fernández.',
    '[]'::jsonb,
    '[]'::jsonb
),
(
    'a0000000-0000-0000-0000-000000000003',
    'Pierre-Yves Dubois',
    'pydubois@oceanexpeditions.fr',
    '+33 6 12 34 56 78',
    'PAS-19FR88291',
    '03/11/1975',
    'Francesa',
    'Lyon, Francia',
    'vip',
    '["Internacional", "Navegante", "Vegvisir"]'::jsonb,
    7400000,
    1,
    '2026-07-10',
    'Sin restricciones alimentarias. Aficionado a la gastronomía local isleña.',
    'Capitán de Yate de Alta Mar (Permis Hauturier Francés)',
    'Vinos tintos de guarda y cervezas artesanales.',
    'Sophie Dubois (+33 6 98 76 54 32)',
    'Navegante experimentado francés. Habla inglés y francés.',
    '[]'::jsonb,
    '[]'::jsonb
),
(
    'a0000000-0000-0000-0000-000000000004',
    'Matías Larraín Matte',
    'matias.larrain@inversioneslp.cl',
    '+56 9 7123 4567',
    '16.782.903-8',
    '18/02/1991',
    'Chilena',
    'Zapallar, Chile',
    'regular',
    '["Corporativo", "Charter Completo"]'::jsonb,
    0,
    0,
    '2026-08-27',
    'Sin restricciones.',
    'Básico / Snorkel',
    'Pisco Sour tradicional y espumantes.',
    'Camila Larraín (+56 9 7123 4568)',
    'Consultó por charter completo para directores de su empresa.',
    '[]'::jsonb,
    '[]'::jsonb
),
(
    'a0000000-0000-0000-0000-000000000005',
    'Test Pasajero',
    'contacto@yateschile.cl',
    '+56 9 5333 2492',
    'Sin documento',
    '01/01/1990',
    'Chilena',
    'Chile',
    'standard',
    '["Prueba", "Web"]'::jsonb,
    0,
    0,
    '2026-09-01',
    'Sin notas adicionales.',
    'Principiante',
    'Agua mineral',
    'Sin contacto',
    'Perfil de prueba generado automáticamente.',
    '[]'::jsonb,
    '[]'::jsonb
),
(
    'a0000000-0000-0000-0000-000000000006',
    'Ana María Silva Gana',
    'amsilva@patagoniatrekking.cl',
    '+56 9 6543 2109',
    '14.218.490-2',
    '05/07/1984',
    'Chilena',
    'Concepción, Chile',
    'regular',
    '["Trekking", "Flora Endémica"]'::jsonb,
    0,
    0,
    '2026-08-10',
    'Vegetariana.',
    'Snorkel',
    'Infusiones de hierbas y vino blanco.',
    'Jorge Silva (+56 9 6543 2110)',
    'Enfocada en avistamiento de aves y senderismo de alta exigencia.',
    '[]'::jsonb,
    '[]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 6. SEED INICIAL DE LEADS
INSERT INTO public.leads (
    id, full_name, email, phone, doc_id, origin, origin_details, status, interest_type,
    estimated_pax, tentative_date, notes, city, country, estimated_budget_clp
)
VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'Ignacio Alarcón Rodríguez',
    'ignacio.alarcon@orangedesign.cl',
    '+56 9 8412 9901',
    '17.318.824-2',
    'reserva_incompleta',
    'Reserva Web Incompleta (Sin Pago)',
    'nuevo',
    'expediciones',
    1,
    '31 oct 2026 - 10 nov 2026',
    'RUT: 17.318.824-2. Llenó el formulario de reserva para Expedición Juan Fernández pero no registró abono ni pago.',
    'Santiago',
    'Chile',
    1850000
),
(
    'b0000000-0000-0000-0000-000000000002',
    'Matías Larraín Palma',
    'matias.larrain@inversioneslp.cl',
    '',
    NULL,
    'newsletter',
    'Suscripción Newsletter Web',
    'nuevo',
    'general',
    2,
    NULL,
    'Suscripción directa al Newsletter oficial desde el sitio web público.',
    'Chile',
    'Chile',
    0
)
ON CONFLICT (id) DO NOTHING;
