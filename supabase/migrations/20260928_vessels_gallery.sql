-- Migration: Add gallery column to public.vessels
-- Date: 2026-09-28

-- 1. Agregar columna gallery como JSONB para almacenar fotos personalizadas por embarcación
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;
