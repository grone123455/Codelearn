BEGIN;

INSERT INTO cursos (
    id,
    nombre,
    descripcion,
    estado
)
VALUES (
    'curso-js',
    'JavaScript',
    'Aprendé los fundamentos de JavaScript desde cero mediante lecciones y actividades prácticas.',
    'disponible'
);

INSERT INTO unidades (
    id,
    curso_id,
    orden,
    titulo,
    descripcion,
    estado
)
VALUES
(
    'unidad-js-1',
    'curso-js',
    1,
    'Introducción a JavaScript',
    'Conocé qué es JavaScript, para qué se utiliza y cómo comenzar a trabajar con este lenguaje.',
    'publicada'
),
(
    'unidad-js-2',
    'curso-js',
    2,
    'Variables y datos',
    'Aprendé a almacenar información utilizando variables y diferentes tipos de datos.',
    'bloqueada'
),
(
    'unidad-js-3',
    'curso-js',
    3,
    'Condicionales',
    'Aprendé a tomar decisiones dentro de tus programas utilizando condiciones.',
    'bloqueada'
),
(
    'unidad-js-4',
    'curso-js',
    4,
    'Bucles',
    'Descubrí cómo repetir instrucciones utilizando diferentes tipos de bucles.',
    'bloqueada'
),
(
    'unidad-js-5',
    'curso-js',
    5,
    'Funciones',
    'Aprendé a crear funciones para organizar y reutilizar tu código.',
    'bloqueada'
);

INSERT INTO lecciones (
    id,
    unidad_id,
    orden,
    titulo,
    explicacion,
    codigo
)
VALUES
(
    'leccion-js-1',
    'unidad-js-1',
    1,
    '¿Qué es JavaScript?',
    'JavaScript es un lenguaje de programación utilizado principalmente para agregar interactividad y comportamiento dinámico a las páginas web. Permite trabajar con información y ejecutar instrucciones que modifican el comportamiento de una aplicación.',
    $$const nombre = "CodeLearn";

console.log(nombre);$$
),
(
    'leccion-js-2',
    'unidad-js-1',
    2,
    'Primeros pasos con JavaScript',
    'Para comenzar a programar con JavaScript podemos utilizar variables y diferentes tipos de valores. La palabra let permite declarar una variable cuyo valor puede cambiar posteriormente.',
    $$let edad = 18;

console.log(edad);$$
);

INSERT INTO preguntas (
    id,
    leccion_id,
    orden,
    enunciado,
    explicacion
)
VALUES
(
    'actividad-js-1',
    'leccion-js-1',
    1,
    '¿Para qué se utiliza principalmente JavaScript?',
    'JavaScript es un lenguaje de programación que permite agregar interactividad y comportamiento dinámico a las páginas web.'
),
(
    'actividad-js-2',
    'leccion-js-1',
    2,
    '¿Qué instrucción permite mostrar información en la consola del navegador?',
    'console.log() permite mostrar mensajes y valores en la consola del navegador.'
),
(
    'actividad-js-3',
    'leccion-js-1',
    3,
    'Observá el siguiente código: const nombre = "CodeLearn"; console.log(nombre); ¿qué se muestra en la consola?',
    'La variable nombre contiene el texto "CodeLearn" y console.log(nombre) muestra ese valor en la consola.'
),
(
    'actividad-js-4',
    'leccion-js-2',
    1,
    '¿Qué palabra permite declarar una variable cuyo valor puede cambiar posteriormente?',
    'let permite declarar una variable cuyo valor puede modificarse posteriormente.'
),
(
    'actividad-js-5',
    'leccion-js-2',
    2,
    'En el código let edad = 18;, ¿qué tipo de valor se almacena en la variable edad?',
    'El valor 18 es un número, por lo que la variable edad almacena un valor numérico.'
),
(
    'actividad-js-6',
    'leccion-js-2',
    3,
    '¿Qué instrucción permite mostrar el valor de la variable edad en la consola?',
    'console.log(edad) muestra en la consola el valor almacenado en la variable edad.'
);

INSERT INTO opciones (
    id,
    pregunta_id,
    texto
)
VALUES
(
    'opcion-js-1-1',
    'actividad-js-1',
    'Para agregar interactividad y comportamiento a las páginas web'
),
(
    'opcion-js-1-2',
    'actividad-js-1',
    'Para crear únicamente imágenes'
),
(
    'opcion-js-1-3',
    'actividad-js-1',
    'Para editar archivos de audio'
),
(
    'opcion-js-1-4',
    'actividad-js-1',
    'Para almacenar archivos en una computadora'
),
(
    'opcion-js-2-1',
    'actividad-js-2',
    'console.log()'
),
(
    'opcion-js-2-2',
    'actividad-js-2',
    'console.show()'
),
(
    'opcion-js-2-3',
    'actividad-js-2',
    'print()'
),
(
    'opcion-js-2-4',
    'actividad-js-2',
    'display()'
),
(
    'opcion-js-3-1',
    'actividad-js-3',
    'CodeLearn'
),
(
    'opcion-js-3-2',
    'actividad-js-3',
    'nombre'
),
(
    'opcion-js-3-3',
    'actividad-js-3',
    'const'
),
(
    'opcion-js-3-4',
    'actividad-js-3',
    'No se muestra nada'
),
(
    'opcion-js-4-1',
    'actividad-js-4',
    'let'
),
(
    'opcion-js-4-2',
    'actividad-js-4',
    'variable'
),
(
    'opcion-js-4-3',
    'actividad-js-4',
    'change'
),
(
    'opcion-js-4-4',
    'actividad-js-4',
    'value'
),
(
    'opcion-js-5-1',
    'actividad-js-5',
    'Un número'
),
(
    'opcion-js-5-2',
    'actividad-js-5',
    'Un texto'
),
(
    'opcion-js-5-3',
    'actividad-js-5',
    'Una imagen'
),
(
    'opcion-js-5-4',
    'actividad-js-5',
    'Una función'
),
(
    'opcion-js-6-1',
    'actividad-js-6',
    'console.log(edad)'
),
(
    'opcion-js-6-2',
    'actividad-js-6',
    'console.show(edad)'
),
(
    'opcion-js-6-3',
    'actividad-js-6',
    'print.console(edad)'
),
(
    'opcion-js-6-4',
    'actividad-js-6',
    'display(edad)'
);

INSERT INTO soluciones (
    pregunta_id,
    opcion_correcta_id
)
VALUES
(
    'actividad-js-1',
    'opcion-js-1-1'
),
(
    'actividad-js-2',
    'opcion-js-2-1'
),
(
    'actividad-js-3',
    'opcion-js-3-1'
),
(
    'actividad-js-4',
    'opcion-js-4-1'
),
(
    'actividad-js-5',
    'opcion-js-5-1'
),
(
    'actividad-js-6',
    'opcion-js-6-1'
);

COMMIT;
