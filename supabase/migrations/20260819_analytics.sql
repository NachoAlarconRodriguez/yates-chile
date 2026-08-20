-- ============================================================================
-- YATES CHILE - ANALYTICS & TRAFFIC GEOLOCATION TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.analytics_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  country_name TEXT DEFAULT 'Chile',
  country_code TEXT DEFAULT 'CL',
  region_name TEXT DEFAULT 'Región Metropolitana',
  city TEXT DEFAULT 'Santiago',
  device_type TEXT DEFAULT 'desktop', -- 'desktop', 'mobile', 'tablet'
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast aggregation in dashboard
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_country ON public.analytics_page_views (country_name);
CREATE INDEX IF NOT EXISTS idx_analytics_page ON public.analytics_page_views (page_path);

-- RLS Policies
ALTER TABLE public.analytics_page_views ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'analytics_page_views' AND policyname = 'Public can insert page views'
  ) THEN
    CREATE POLICY "Public can insert page views" ON public.analytics_page_views FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'analytics_page_views' AND policyname = 'Anyone can read analytics'
  ) THEN
    CREATE POLICY "Anyone can read analytics" ON public.analytics_page_views FOR SELECT USING (true);
  END IF;
END $$;

-- Initial realistic seed data so the dashboard reflects visitor metrics immediately
INSERT INTO public.analytics_page_views (session_id, page_path, page_title, country_name, country_code, region_name, city, device_type, created_at)
VALUES 
  ('sess-01', '/', 'Inicio • Yates Chile & Robinson Crusoe', 'Chile', 'CL', 'Región Metropolitana', 'Santiago (Las Condes)', 'desktop', NOW() - INTERVAL '1 hour'),
  ('sess-02', '/lodge', 'Lodge Rincón de Navegantes', 'Chile', 'CL', 'Región Metropolitana', 'Santiago (Providencia)', 'mobile', NOW() - INTERVAL '2 hours'),
  ('sess-03', '/expediciones', 'Expediciones Náuticas Selkirk & Alejandro Selkirk', 'Chile', 'CL', 'Región de Valparaíso', 'Viña del Mar', 'desktop', NOW() - INTERVAL '3 hours'),
  ('sess-04', '/lodge', 'Lodge Rincón de Navegantes', 'Estados Unidos', 'US', 'Florida', 'Miami', 'desktop', NOW() - INTERVAL '4 hours'),
  ('sess-05', '/cabalgatas', 'Cabalgatas & Experiencias Insulares', 'Chile', 'CL', 'Región de Los Lagos', 'Puerto Varas', 'mobile', NOW() - INTERVAL '5 hours'),
  ('sess-06', '/lodge', 'Lodge Rincón de Navegantes', 'Alemania', 'DE', 'Bayern', 'Múnich', 'desktop', NOW() - INTERVAL '6 hours'),
  ('sess-07', '/', 'Inicio • Yates Chile & Robinson Crusoe', 'Argentina', 'AR', 'Buenos Aires', 'Buenos Aires', 'mobile', NOW() - INTERVAL '8 hours'),
  ('sess-08', '/expediciones', 'Expediciones Náuticas Selkirk', 'España', 'ES', 'Comunidad de Madrid', 'Madrid', 'desktop', NOW() - INTERVAL '10 hours'),
  ('sess-09', '/lodge', 'Lodge Rincón de Navegantes', 'Chile', 'CL', 'Región de Antofagasta', 'Antofagasta', 'desktop', NOW() - INTERVAL '12 hours'),
  ('sess-10', '/buceo', 'Buceo con Lobos Finos de Dos Pelos', 'Brasil', 'BR', 'São Paulo', 'São Paulo', 'mobile', NOW() - INTERVAL '14 hours'),
  ('sess-11', '/lodge', 'Lodge Rincón de Navegantes', 'Chile', 'CL', 'Región Metropolitana', 'Santiago (Vitacura)', 'desktop', NOW() - INTERVAL '18 hours'),
  ('sess-12', '/', 'Inicio • Yates Chile & Robinson Crusoe', 'Chile', 'CL', 'Región Metropolitana', 'Santiago (La Reina)', 'mobile', NOW() - INTERVAL '22 hours');
