-- =====================================================
-- CodeLearn - Esquema de la base de datos
-- Curso, unidades, lecciones, preguntas, opciones
-- y soluciones (protegidas).
-- =====================================================

CREATE TABLE cursos (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    estado TEXT NOT NULL
        CHECK (estado IN ('disponible', 'proximamente'))
);

CREATE TABLE unidades (
    id TEXT PRIMARY KEY,
    curso_id TEXT NOT NULL,
    orden INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    estado TEXT NOT NULL
        CHECK (estado IN ('publicada', 'pendiente', 'bloqueada')),

    CONSTRAINT fk_unidad_curso
        FOREIGN KEY (curso_id)
        REFERENCES cursos(id)
);

CREATE TABLE lecciones (
    id TEXT PRIMARY KEY,
    unidad_id TEXT NOT NULL,
    orden INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    explicacion TEXT NOT NULL,
    codigo TEXT NOT NULL,

    CONSTRAINT fk_leccion_unidad
        FOREIGN KEY (unidad_id)
        REFERENCES unidades(id)
);

CREATE TABLE preguntas (
    id TEXT PRIMARY KEY,
    leccion_id TEXT NOT NULL,
    orden INTEGER NOT NULL,
    enunciado TEXT NOT NULL,
    explicacion TEXT NOT NULL,

    CONSTRAINT fk_pregunta_leccion
        FOREIGN KEY (leccion_id)
        REFERENCES lecciones(id)
);

CREATE TABLE opciones (
    id TEXT PRIMARY KEY,
    pregunta_id TEXT NOT NULL,
    texto TEXT NOT NULL,

    CONSTRAINT fk_opcion_pregunta
        FOREIGN KEY (pregunta_id)
        REFERENCES preguntas(id)
);

-- La tabla de soluciones nunca se consulta desde el
-- cliente: solo la función del servidor verificar-respuesta
-- la lee mediante service_role.

CREATE TABLE soluciones (
    pregunta_id TEXT PRIMARY KEY,
    opcion_correcta_id TEXT NOT NULL,

    CONSTRAINT fk_solucion_pregunta
        FOREIGN KEY (pregunta_id)
        REFERENCES preguntas(id),

    CONSTRAINT fk_solucion_opcion
        FOREIGN KEY (opcion_correcta_id)
        REFERENCES opciones(id)
);

-- =====================================================
-- Row Level Security (RLS)
--
-- El rol público (anon) solamente puede LEER el
-- contenido publicado. No puede crear, modificar ni
-- eliminar nada. La tabla soluciones no tiene ninguna
-- política de lectura, por lo que queda inaccesible
-- para el cliente.
-- =====================================================

ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE opciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE soluciones ENABLE ROW LEVEL SECURITY;

-- Cursos: solo los disponibles se pueden consultar.
CREATE POLICY "anon_puede_leer_cursos_disponibles"
    ON cursos FOR SELECT
    TO anon
    USING (estado = 'disponible');

-- Unidades: solo las publicadas.
CREATE POLICY "anon_puede_leer_unidades_publicadas"
    ON unidades FOR SELECT
    TO anon
    USING (estado = 'publicada');

-- Lecciones: solo si su unidad está publicada.
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

-- Preguntas: solo si su lección está publicada.
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

-- Opciones: solo si su pregunta está publicada.
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

-- Soluciones: sin políticas de SELECT para el rol
-- público. RLS habilitado + sin política = sin acceso.
