
-- =============================================
-- RESULTADOS Y FINALIZACION DE INTENTOS
-- =============================================

ALTER TABLE public.intentos_leccion
    ADD COLUMN IF NOT EXISTS total_preguntas INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS respuestas_correctas INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS respuestas_incorrectas INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS porcentaje INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS aprobado BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS finalizado BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS finalizado_en TIMESTAMPTZ;

-- Evitar valores fuera de los rangos posibles.
ALTER TABLE public.intentos_leccion
    ADD CONSTRAINT intentos_total_no_negativo
        CHECK (total_preguntas >= 0),
    ADD CONSTRAINT intentos_correctas_no_negativo
        CHECK (respuestas_correctas >= 0),
    ADD CONSTRAINT intentos_incorrectas_no_negativo
        CHECK (respuestas_incorrectas >= 0),
    ADD CONSTRAINT intentos_porcentaje_valido
        CHECK (porcentaje BETWEEN 0 AND 100);
