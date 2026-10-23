
-- =============================================
-- HISTORIAL DE INTENTOS Y RESPUESTAS
-- =============================================

-- Un registro por cada intento de realizar una lección.
CREATE TABLE IF NOT EXISTS public.intentos_leccion (
    id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL
        REFERENCES auth.users(id) ON DELETE CASCADE,
    leccion_id TEXT NOT NULL
        REFERENCES public.lecciones(id) ON DELETE CASCADE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cada respuesta dada durante un intento.
CREATE TABLE IF NOT EXISTS public.respuestas_intento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intento_id UUID NOT NULL
        REFERENCES public.intentos_leccion(id) ON DELETE CASCADE,
    pregunta_id TEXT NOT NULL
        REFERENCES public.preguntas(id) ON DELETE CASCADE,
    opcion_seleccionada_id TEXT NOT NULL
        REFERENCES public.opciones(id),
    correcta BOOLEAN NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Una sola respuesta vigente por pregunta dentro del intento.
    CONSTRAINT respuestas_intento_unicas
        UNIQUE (intento_id, pregunta_id)
);

-- Índices para consultar el historial más rápido.
CREATE INDEX IF NOT EXISTS idx_intentos_usuario_fecha
    ON public.intentos_leccion (usuario_id, creado_en DESC);

CREATE INDEX IF NOT EXISTS idx_intentos_leccion
    ON public.intentos_leccion (leccion_id);

CREATE INDEX IF NOT EXISTS idx_respuestas_intento
    ON public.respuestas_intento (intento_id);

-- =============================================
-- SEGURIDAD RLS
-- =============================================

ALTER TABLE public.intentos_leccion
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.respuestas_intento
    ENABLE ROW LEVEL SECURITY;

-- Cada usuario puede consultar sus propios intentos.
DROP POLICY IF EXISTS "Consultar intentos propios"
    ON public.intentos_leccion;

CREATE POLICY "Consultar intentos propios"
    ON public.intentos_leccion
    FOR SELECT
    TO authenticated
    USING (usuario_id = (SELECT auth.uid()));

-- Cada usuario puede consultar las respuestas
-- pertenecientes a sus propios intentos.
DROP POLICY IF EXISTS "Consultar respuestas propias"
    ON public.respuestas_intento;

CREATE POLICY "Consultar respuestas propias"
    ON public.respuestas_intento
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.intentos_leccion AS intento
            WHERE intento.id = respuestas_intento.intento_id
              AND intento.usuario_id = (SELECT auth.uid())
        )
    );
