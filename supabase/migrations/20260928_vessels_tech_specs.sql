-- Migration: Add length and tech specs to public.vessels
-- Date: 2026-09-28

-- 1. Columna dedicada para eslora
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS length TEXT;

-- 2. Columna JSONB para especificaciones tecnicas avanzadas (electronica, autonomia, desembarco, etc.)
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'::jsonb;

-- 3. Inicializar valores existentes para barcos actuales
UPDATE public.vessels 
SET length = '52.5 ft (16 m)',
    builder = 'Dufour (Francés)'
WHERE id = 'vegvisir' AND (length IS NULL OR length = '');

UPDATE public.vessels 
SET length = '65 ft (20 m)',
    builder = 'Hatteras 65ft LRC (Americano)'
WHERE id = 'terranova' AND (length IS NULL OR length = '');

UPDATE public.vessels 
SET length = '53 ft (16 m)',
    builder = 'Beneteau (Francés)'
WHERE id = 'vessel-1790196641122' AND (length IS NULL OR length = '');
