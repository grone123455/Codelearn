-- =====================================================
-- Migración: orden de preguntas + Row Level Security
-- Aplicar sobre la base existente (la estructura
-- anterior no tenía estos elementos).
-- =====================================================

-- 1) Campo de orden en las preguntas, para no depender
--    del orden en que se insertaron los registros.

ALTER TABLE preguntas
    ADD COLUMN orden INTEGER;

UPDATE preguntas p
SET orden = sub.orden_calculada
FROM (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY leccion_id
            ORDER BY id
        ) AS orden_calculada
    FROM preguntas
) sub
WHERE p.id = sub.id;

ALTER TABLE preguntas
    ALTER COLUMN orden SET NOT NULL;

-- 2) Row Level Security.
--    El rol público solamente puede leer el contenido
--    publicado. No puede crear, modificar ni eliminar
--    nada. La tabla soluciones queda sin políticas de
--    lectura: inaccesible para el cliente.

ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE opciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE soluciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_puede_leer_cursos_disponibles"
    ON cursos FOR SELECT
    TO anon
    USING (estado = 'disponible');

CREATE POLICY "anon_puede_leer_unidades_publicadas"
    ON unidades FOR SELECT
    TO anon
    USING (estado = 'publicada');

CREATE POLICY "anon_puede_leer_lecciones_publicadas"
    ON lecciones FOR SELECT
    TO anon
    USING (
        EXISTS (
            SELECT 1 FROM unidades u
            WHERE u.id = lecciones.unidad_id
              AND u.estado = 'publicada'
        )
    );

CREATE POLICY "anon_puede_leer_preguntas_publicadas"
    ON preguntas FOR SELECT
    TO anon
    USING (
        EXISTS (
            SELECT 1 FROM lecciones l
            JOIN unidades u ON u.id = l.unidad_id
            WHERE l.id = preguntas.leccion_id
              AND u.estado = 'publicada'
        )
    );

CREATE POLICY "anon_puede_leer_opciones_publicadas"
    ON opciones FOR SELECT
    TO anon
    USING (
        EXISTS (
            SELECT 1 FROM preguntas p
            JOIN lecciones l ON l.id = p.leccion_id
            JOIN unidades u ON u.id = l.unidad_id
            WHERE p.id = opciones.pregunta_id
              AND u.estado = 'publicada'
        )
    );
