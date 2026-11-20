
BEGIN;

-- =====================================================
-- CODELEARN - CARGA INICIAL DE LOS TRES CURSOS
-- 3 cursos | 18 unidades | 54 lecciones
-- 162 preguntas | 648 opciones | 162 soluciones
-- =====================================================

-- -----------------------------------------------------
-- 1. CURSOS
-- -----------------------------------------------------

INSERT INTO cursos (id, nombre, descripcion, estado)
VALUES
(
    'curso-js',
    'JavaScript',
    'Aprendé los fundamentos de JavaScript desde cero mediante lecciones y actividades prácticas.',
    'disponible'
),
(
    'curso-html',
    'HTML',
    'Aprendé a construir la estructura de páginas web utilizando HTML.',
    'disponible'
),
(
    'curso-css',
    'CSS',
    'Aprendé a diseñar páginas web con estilos, colores y diseños adaptables.',
    'disponible'
)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    estado = EXCLUDED.estado;

-- -----------------------------------------------------
-- 2. UNIDADES
-- -----------------------------------------------------

INSERT INTO unidades (id, curso_id, orden, titulo, descripcion, estado)
VALUES

-- JAVASCRIPT
('unidad-js-1','curso-js',1,'Primeros pasos','Conocé JavaScript y comenzá a ejecutar tus primeras instrucciones.','publicada'),
('unidad-js-2','curso-js',2,'Variables y tipos de datos','Aprendé a almacenar información y reconocer sus tipos.','bloqueada'),
('unidad-js-3','curso-js',3,'Operadores','Realizá operaciones matemáticas, comparaciones y operaciones lógicas.','bloqueada'),
('unidad-js-4','curso-js',4,'Control de flujo','Aprendé a tomar decisiones utilizando estructuras condicionales.','bloqueada'),
('unidad-js-5','curso-js',5,'Repeticiones y funciones','Repetí instrucciones y organizá tu código mediante funciones.','bloqueada'),
('unidad-js-6','curso-js',6,'Datos e interactividad','Trabajá con arrays, objetos, DOM y eventos.','bloqueada'),

-- HTML
('unidad-html-1','curso-html',1,'Primeros pasos','Conocé HTML y la estructura básica de un documento.','publicada'),
('unidad-html-2','curso-html',2,'Texto','Organizá el contenido textual de una página.','bloqueada'),
('unidad-html-3','curso-html',3,'Enlaces y recursos','Incorporá enlaces, imágenes y recursos externos.','bloqueada'),
('unidad-html-4','curso-html',4,'Organización','Organizá información mediante listas y contenedores.','bloqueada'),
('unidad-html-5','curso-html',5,'Estructura semántica','Utilizá etiquetas para organizar las secciones de una página.','bloqueada'),
('unidad-html-6','curso-html',6,'Formularios y tablas','Construí formularios y presentá información en tablas.','bloqueada'),

-- CSS
('unidad-css-1','curso-css',1,'Primeros pasos','Conocé CSS y aprendé a aplicar estilos.','publicada'),
('unidad-css-2','curso-css',2,'Selectores','Seleccioná los elementos HTML que querés modificar.','bloqueada'),
('unidad-css-3','curso-css',3,'Estilos visuales','Personalizá colores, tipografías, bordes y sombras.','bloqueada'),
('unidad-css-4','curso-css',4,'Modelo de caja','Comprendé las dimensiones, márgenes y espacios de los elementos.','bloqueada'),
('unidad-css-5','curso-css',5,'Distribución','Organizá elementos mediante display, Flexbox y posicionamiento.','bloqueada'),
('unidad-css-6','curso-css',6,'Diseño adaptable','Creá diseños que se adapten a distintos tamaños de pantalla.','bloqueada')

ON CONFLICT (id) DO UPDATE SET
    curso_id = EXCLUDED.curso_id,
    orden = EXCLUDED.orden,
    titulo = EXCLUDED.titulo,
    descripcion = EXCLUDED.descripcion,
    estado = EXCLUDED.estado;

-- -----------------------------------------------------
-- 3. LECCIONES
-- -----------------------------------------------------

INSERT INTO lecciones (id, unidad_id, orden, titulo, explicacion, codigo)
VALUES

-- JAVASCRIPT - UNIDAD 1
('leccion-js-1','unidad-js-1',1,'¿Qué es JavaScript?','JavaScript es un lenguaje de programación que permite agregar interactividad y comportamiento dinámico a las páginas web.','const nombre = "CodeLearn";\nconsole.log(nombre);'),
('leccion-js-2','unidad-js-1',2,'Cómo ejecutar JavaScript','JavaScript puede ejecutarse en el navegador mediante la consola o incorporarse a un documento HTML utilizando la etiqueta script.','console.log("Hola mundo");'),
('leccion-js-3','unidad-js-1',3,'Tu primer programa','Un programa está formado por instrucciones que la computadora ejecuta. Podemos utilizar console.log para mostrar mensajes.','console.log("Mi primer programa");'),

-- JAVASCRIPT - UNIDAD 2
('leccion-js-4','unidad-js-2',1,'Variables con let y const','Las variables permiten almacenar datos. let permite reasignar su valor, mientras que const declara una referencia que no puede reasignarse.','let edad = 18;\nconst nombre = "Ana";'),
('leccion-js-5','unidad-js-2',2,'Números y textos','JavaScript permite trabajar con números y cadenas de texto. Los textos se escriben entre comillas.','let precio = 150;\nlet producto = "Teclado";'),
('leccion-js-6','unidad-js-2',3,'Booleanos y valores especiales','Los booleanos representan true o false. También existen valores especiales como null y undefined.','let activo = true;\nlet resultado = null;'),

-- JAVASCRIPT - UNIDAD 3
('leccion-js-7','unidad-js-3',1,'Operaciones matemáticas','Los operadores aritméticos permiten sumar, restar, multiplicar, dividir y calcular el resto de una división.','let resultado = 10 + 5;\nconsole.log(resultado);'),
('leccion-js-8','unidad-js-3',2,'Operadores de comparación','Los operadores de comparación permiten evaluar relaciones entre valores y devuelven un resultado booleano.','console.log(10 > 5);\nconsole.log(4 === 4);'),
('leccion-js-9','unidad-js-3',3,'Operadores lógicos','Los operadores &&, || y ! permiten combinar o invertir condiciones lógicas.','let edad = 20;\nconsole.log(edad >= 18 && edad < 30);'),

-- JAVASCRIPT - UNIDAD 4
('leccion-js-10','unidad-js-4',1,'Condicional if y else','La estructura if ejecuta instrucciones cuando una condición es verdadera. else permite definir qué sucede cuando es falsa.','let edad = 20;\nif (edad >= 18) {\n  console.log("Mayor de edad");\n} else {\n  console.log("Menor de edad");\n}'),
('leccion-js-11','unidad-js-4',2,'Condicional else if','else if permite evaluar varias condiciones en orden cuando existen diferentes posibilidades.','let nota = 8;\nif (nota >= 9) {\n  console.log("Excelente");\n} else if (nota >= 6) {\n  console.log("Aprobado");\n} else {\n  console.log("Desaprobado");\n}'),
('leccion-js-12','unidad-js-4',3,'Estructura switch','switch permite comparar una expresión con distintos casos y ejecutar el bloque correspondiente.','let dia = 2;\nswitch (dia) {\n  case 1:\n    console.log("Lunes");\n    break;\n  case 2:\n    console.log("Martes");\n    break;\n  default:\n    console.log("Otro día");\n}'),

-- JAVASCRIPT - UNIDAD 5
('leccion-js-13','unidad-js-5',1,'Bucle for','El bucle for permite repetir instrucciones una cantidad determinada de veces.','for (let i = 0; i < 5; i++) {\n  console.log(i);\n}'),
('leccion-js-14','unidad-js-5',2,'Bucle while','while repite instrucciones mientras una condición sea verdadera.','let contador = 0;\nwhile (contador < 3) {\n  console.log(contador);\n  contador++;\n}'),
('leccion-js-15','unidad-js-5',3,'Creación de funciones','Las funciones agrupan instrucciones reutilizables. Pueden recibir parámetros y devolver resultados.','function sumar(a, b) {\n  return a + b;\n}\nconsole.log(sumar(3, 4));'),

-- JAVASCRIPT - UNIDAD 6
('leccion-js-16','unidad-js-6',1,'Arrays','Los arrays permiten almacenar varios valores en una misma estructura y acceder a ellos mediante índices.','const frutas = ["Manzana", "Pera"];\nconsole.log(frutas[0]);'),
('leccion-js-17','unidad-js-6',2,'Objetos','Los objetos permiten agrupar información mediante propiedades y valores.','const persona = {\n  nombre: "Ana",\n  edad: 18\n};\nconsole.log(persona.nombre);'),
('leccion-js-18','unidad-js-6',3,'DOM y eventos','El DOM representa la estructura de un documento HTML. JavaScript puede modificar sus elementos y responder a eventos.','const boton = document.querySelector("button");\nboton.addEventListener("click", () => {\n  console.log("Botón presionado");\n});'),

-- HTML - UNIDAD 1
('leccion-html-1','unidad-html-1',1,'¿Qué es HTML?','HTML es un lenguaje de marcado que permite definir la estructura y el contenido de una página web.','<h1>Mi primera página</h1>\n<p>Hola mundo</p>'),
('leccion-html-2','unidad-html-1',2,'Estructura de un documento','Un documento HTML utiliza las etiquetas doctype, html, head y body para organizar su estructura básica.','<!DOCTYPE html>\n<html>\n<head>\n  <title>Mi página</title>\n</head>\n<body>\n  <h1>Hola</h1>\n</body>\n</html>'),
('leccion-html-3','unidad-html-1',3,'Etiquetas y atributos','Las etiquetas definen elementos HTML. Los atributos agregan información o configuración a esos elementos.','<p class="introduccion">Hola</p>'),

-- HTML - UNIDAD 2
('leccion-html-4','unidad-html-2',1,'Títulos HTML','Las etiquetas h1 a h6 representan títulos de diferentes niveles jerárquicos.','<h1>Título principal</h1>\n<h2>Subtítulo</h2>'),
('leccion-html-5','unidad-html-2',2,'Párrafos y saltos de línea','La etiqueta p representa un párrafo y br permite insertar un salto de línea.','<p>Primera línea<br>Segunda línea</p>'),
('leccion-html-6','unidad-html-2',3,'Énfasis y formato','HTML ofrece etiquetas como strong y em para destacar la importancia o el énfasis de un texto.','<p><strong>Importante</strong></p>\n<p><em>Énfasis</em></p>'),

-- HTML - UNIDAD 3
('leccion-html-7','unidad-html-3',1,'Enlaces','La etiqueta a permite crear enlaces utilizando el atributo href para indicar el destino.','<a href="https://example.com">Visitar sitio</a>'),
('leccion-html-8','unidad-html-3',2,'Imágenes','La etiqueta img permite incorporar imágenes. El atributo src indica su ubicación y alt proporciona una descripción alternativa.','<img src="imagen.jpg" alt="Descripción de la imagen">'),
('leccion-html-9','unidad-html-3',3,'Rutas de archivos','Las rutas relativas indican ubicaciones respecto del archivo actual. Las rutas absolutas indican una dirección completa.','<img src="imagenes/foto.jpg" alt="Foto">\n<a href="/contacto.html">Contacto</a>'),

-- HTML - UNIDAD 4
('leccion-html-10','unidad-html-4',1,'Listas ordenadas','La etiqueta ol crea listas ordenadas y cada elemento se representa mediante li.','<ol>\n  <li>Primero</li>\n  <li>Segundo</li>\n</ol>'),
('leccion-html-11','unidad-html-4',2,'Listas desordenadas','La etiqueta ul crea listas sin numeración y utiliza li para cada elemento.','<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n</ul>'),
('leccion-html-12','unidad-html-4',3,'Contenedores','Las etiquetas div y span permiten agrupar contenido. div es un contenedor de bloque y span es un contenedor en línea.','<div>\n  <p>Texto <span>destacado</span></p>\n</div>'),

-- HTML - UNIDAD 5
('leccion-html-13','unidad-html-5',1,'Header, nav y main','header representa una cabecera, nav agrupa enlaces de navegación y main contiene el contenido principal.','<header>Cabecera</header>\n<nav>Menú</nav>\n<main>Contenido</main>'),
('leccion-html-14','unidad-html-5',2,'Section y article','section agrupa contenido relacionado y article representa contenido independiente que puede tener sentido por sí mismo.','<section>\n  <article>\n    <h2>Noticia</h2>\n    <p>Contenido</p>\n  </article>\n</section>'),
('leccion-html-15','unidad-html-5',3,'Footer','footer representa el pie de una página o sección y suele contener información complementaria.','<footer>\n  <p>Todos los derechos reservados</p>\n</footer>'),

-- HTML - UNIDAD 6
('leccion-html-16','unidad-html-6',1,'Tablas HTML','Las tablas permiten organizar información en filas y columnas mediante table, tr, th y td.','<table>\n  <tr><th>Nombre</th><th>Edad</th></tr>\n  <tr><td>Ana</td><td>18</td></tr>\n</table>'),
('leccion-html-17','unidad-html-6',2,'Campos de formulario','Los formularios permiten recibir información. input ofrece distintos tipos de campos para ingresar datos.','<form>\n  <input type="text" name="nombre">\n</form>'),
('leccion-html-18','unidad-html-6',3,'Labels y botones','label identifica un campo de formulario y button permite ejecutar una acción.','<label for="nombre">Nombre</label>\n<input id="nombre" type="text">\n<button type="submit">Enviar</button>'),

-- CSS - UNIDAD 1
('leccion-css-1','unidad-css-1',1,'¿Qué es CSS?','CSS es un lenguaje de estilos que permite definir la apariencia visual de los documentos HTML.','h1 {\n  color: green;\n}'),
('leccion-css-2','unidad-css-1',2,'Formas de aplicar CSS','CSS puede aplicarse mediante estilos en línea, una etiqueta style o un archivo externo vinculado al documento HTML.','<link rel="stylesheet" href="estilos.css">'),
('leccion-css-3','unidad-css-1',3,'Sintaxis CSS','Una regla CSS contiene un selector y un bloque de declaraciones formado por propiedades y valores.','p {\n  color: blue;\n  font-size: 16px;\n}'),

-- CSS - UNIDAD 2
('leccion-css-4','unidad-css-2',1,'Selectores de etiquetas','Los selectores de etiquetas permiten aplicar estilos a todos los elementos HTML de un tipo determinado.','p {\n  color: red;\n}'),
('leccion-css-5','unidad-css-2',2,'Clases e identificadores','Las clases se seleccionan con punto y los identificadores con numeral. Las clases pueden reutilizarse en varios elementos.','.destacado {\n  color: orange;\n}\n#principal {\n  font-size: 24px;\n}'),
('leccion-css-6','unidad-css-2',3,'Selectores combinados','Los selectores combinados permiten seleccionar elementos según su relación con otros elementos.','article p {\n  color: gray;\n}'),

-- CSS - UNIDAD 3
('leccion-css-7','unidad-css-3',1,'Colores y fondos','CSS permite modificar colores de texto y fondos mediante nombres, valores hexadecimales, RGB y otras funciones.','body {\n  background-color: #f0f0f0;\n  color: #222222;\n}'),
('leccion-css-8','unidad-css-3',2,'Tipografías','Las propiedades font-family, font-size y font-weight permiten configurar la apariencia del texto.','p {\n  font-family: Arial, sans-serif;\n  font-size: 18px;\n  font-weight: bold;\n}'),
('leccion-css-9','unidad-css-3',3,'Bordes y sombras','Las propiedades border, border-radius y box-shadow permiten definir bordes redondeados y sombras.','.tarjeta {\n  border: 1px solid gray;\n  border-radius: 12px;\n  box-shadow: 0 2px 5px gray;\n}'),

-- CSS - UNIDAD 4
('leccion-css-10','unidad-css-4',1,'Ancho y alto','width y height permiten establecer el ancho y alto de un elemento.','div {\n  width: 300px;\n  height: 150px;\n}'),
('leccion-css-11','unidad-css-4',2,'Margin y padding','margin define el espacio exterior de un elemento y padding define el espacio entre su contenido y su borde.','div {\n  margin: 20px;\n  padding: 10px;\n}'),
('leccion-css-12','unidad-css-4',3,'Border y box-sizing','border define el borde de un elemento. box-sizing permite controlar cómo se calculan sus dimensiones.','* {\n  box-sizing: border-box;\n}'),

-- CSS - UNIDAD 5
('leccion-css-13','unidad-css-5',1,'Display','La propiedad display define cómo participa un elemento en el diseño, por ejemplo como block, inline o flex.','.contenedor {\n  display: flex;\n}'),
('leccion-css-14','unidad-css-5',2,'Flexbox','Flexbox permite distribuir y alinear elementos dentro de un contenedor mediante propiedades como justify-content y align-items.',' .contenedor {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}'),
('leccion-css-15','unidad-css-5',3,'Posicionamiento','La propiedad position permite controlar la ubicación de los elementos mediante valores como relative, absolute y fixed.','.caja {\n  position: relative;\n  top: 10px;\n}'),

-- CSS - UNIDAD 6
('leccion-css-16','unidad-css-6',1,'Unidades de medida','CSS ofrece unidades absolutas y relativas. px, %, em, rem, vw y vh permiten definir diferentes dimensiones.','h1 {\n  font-size: 2rem;\n  width: 80%;\n}'),
('leccion-css-17','unidad-css-6',2,'Media queries','Las media queries permiten aplicar estilos cuando se cumplen determinadas condiciones, como un ancho máximo de pantalla.','@media (max-width: 600px) {\n  h1 {\n    font-size: 24px;\n  }\n}'),
('leccion-css-18','unidad-css-6',3,'Diseño responsive','El diseño responsive adapta la presentación de una página a diferentes tamaños de pantalla y dispositivos.','img {\n  max-width: 100%;\n  height: auto;\n}')

ON CONFLICT (id) DO UPDATE SET
    unidad_id = EXCLUDED.unidad_id,
    orden = EXCLUDED.orden,
    titulo = EXCLUDED.titulo,
    explicacion = EXCLUDED.explicacion,
    codigo = EXCLUDED.codigo;

-- -----------------------------------------------------
-- 4. PREGUNTAS Y OPCIONES
-- Se generan tres preguntas por cada lección.
-- Cada pregunta tiene cuatro opciones.
-- La opción 1 es la correcta.
-- -----------------------------------------------------

WITH lecciones_ordenadas AS (
    SELECT
        l.id AS leccion_id,
        l.titulo,
        l.explicacion,
        c.id AS curso_id,
        ROW_NUMBER() OVER (
            PARTITION BY c.id
            ORDER BY u.orden, l.orden
        ) AS numero_leccion
    FROM lecciones l
    JOIN unidades u ON u.id = l.unidad_id
    JOIN cursos c ON c.id = u.curso_id
),
preguntas_generadas AS (
    SELECT
        lo.*,
        q.orden_pregunta,
        q.enunciado,
        CASE
            WHEN lo.curso_id = 'curso-js' THEN
                'actividad-js-' || ((lo.numero_leccion - 1) * 3 + q.orden_pregunta)
            WHEN lo.curso_id = 'curso-html' THEN
                'actividad-html-' || ((lo.numero_leccion - 1) * 3 + q.orden_pregunta)
            ELSE
                'actividad-css-' || ((lo.numero_leccion - 1) * 3 + q.orden_pregunta)
        END AS pregunta_id
    FROM lecciones_ordenadas lo
    CROSS JOIN LATERAL (
        VALUES
        (1, '¿Cuál es la idea principal de ' || lo.titulo || '?'),
        (2, 'Según la lección, ¿qué afirmación es correcta sobre ' || lo.titulo || '?'),
        (3, '¿Qué concepto deberías recordar al trabajar con ' || lo.titulo || '?')
    ) AS q(orden_pregunta, enunciado)
)
INSERT INTO preguntas (id, leccion_id, orden, enunciado, explicacion)
SELECT
    pregunta_id,
    leccion_id,
    orden_pregunta,
    enunciado,
    explicacion
FROM preguntas_generadas
ON CONFLICT (id) DO UPDATE SET
    leccion_id = EXCLUDED.leccion_id,
    orden = EXCLUDED.orden,
    enunciado = EXCLUDED.enunciado,
    explicacion = EXCLUDED.explicacion;

-- -----------------------------------------------------
-- 5. OPCIONES
-- -----------------------------------------------------

WITH lecciones_ordenadas AS (
    SELECT
        l.id AS leccion_id,
        l.explicacion,
        c.id AS curso_id,
        ROW_NUMBER() OVER (
            PARTITION BY c.id
            ORDER BY u.orden, l.orden
        ) AS numero_leccion
    FROM lecciones l
    JOIN unidades u ON u.id = l.unidad_id
    JOIN cursos c ON c.id = u.curso_id
),
preguntas_generadas AS (
    SELECT
        lo.*,
        q.orden_pregunta,
        CASE
            WHEN lo.curso_id = 'curso-js' THEN
                'actividad-js-' || ((lo.numero_leccion - 1) * 3 + q.orden_pregunta)
            WHEN lo.curso_id = 'curso-html' THEN
                'actividad-html-' || ((lo.numero_leccion - 1) * 3 + q.orden_pregunta)
            ELSE
                'actividad-css-' || ((lo.numero_leccion - 1) * 3 + q.orden_pregunta)
        END AS pregunta_id
    FROM lecciones_ordenadas lo
    CROSS JOIN LATERAL (
        VALUES (1), (2), (3)
    ) AS q(orden_pregunta)
),
opciones_generadas AS (
    SELECT
        pg.pregunta_id,
        o.numero_opcion,
        CASE
            WHEN o.numero_opcion = 1 THEN pg.explicacion
            WHEN o.numero_opcion = 2 THEN 'El concepto no tiene relación con el desarrollo de páginas web.'
            WHEN o.numero_opcion = 3 THEN 'Se utiliza exclusivamente para almacenar archivos en el servidor.'
            ELSE 'Es una función que solamente permite modificar imágenes.'
        END AS texto
    FROM preguntas_generadas pg
    CROSS JOIN LATERAL (
        VALUES (1), (2), (3), (4)
    ) AS o(numero_opcion)
)
INSERT INTO opciones (id, pregunta_id, texto)
SELECT
    'opcion-' || pregunta_id || '-' || numero_opcion,
    pregunta_id,
    texto
FROM opciones_generadas
ON CONFLICT (id) DO UPDATE SET
    pregunta_id = EXCLUDED.pregunta_id,
    texto = EXCLUDED.texto;

-- -----------------------------------------------------
-- 6. SOLUCIONES
-- -----------------------------------------------------

WITH lecciones_ordenadas AS (
    SELECT
        c.id AS curso_id,
        ROW_NUMBER() OVER (
            PARTITION BY c.id
            ORDER BY u.orden, l.orden
        ) AS numero_leccion
    FROM lecciones l
    JOIN unidades u ON u.id = l.unidad_id
    JOIN cursos c ON c.id = u.curso_id
),
preguntas_generadas AS (
    SELECT
        lo.curso_id,
        lo.numero_leccion,
        q.orden_pregunta,
        CASE
            WHEN lo.curso_id = 'curso-js' THEN
                'actividad-js-' || ((lo.numero_leccion - 1) * 3 + q.orden_pregunta)
            WHEN lo.curso_id = 'curso-html' THEN
                'actividad-html-' || ((lo.numero_leccion - 1) * 3 + q.orden_pregunta)
            ELSE
                'actividad-css-' || ((lo.numero_leccion - 1) * 3 + q.orden_pregunta)
        END AS pregunta_id
    FROM lecciones_ordenadas lo
    CROSS JOIN LATERAL (
        VALUES (1), (2), (3)
    ) AS q(orden_pregunta)
)
INSERT INTO soluciones (pregunta_id, opcion_correcta_id)
SELECT
    pregunta_id,
    'opcion-' || pregunta_id || '-1'
FROM preguntas_generadas
ON CONFLICT (pregunta_id) DO UPDATE SET
    opcion_correcta_id = EXCLUDED.opcion_correcta_id;

COMMIT;

-- -----------------------------------------------------
-- 7. COMPROBACIÓN DE LOS DATOS
-- -----------------------------------------------------

SELECT
    (SELECT COUNT(*) FROM cursos) AS cursos,
    (SELECT COUNT(*) FROM unidades) AS unidades,
    (SELECT COUNT(*) FROM lecciones) AS lecciones,
    (SELECT COUNT(*) FROM preguntas) AS preguntas,
    (SELECT COUNT(*) FROM opciones) AS opciones,
    (SELECT COUNT(*) FROM soluciones) AS soluciones;
