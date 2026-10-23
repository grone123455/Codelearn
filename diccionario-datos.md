# CodeLearn — Diccionario de datos

## 1. Objetivo

Este documento describe las tablas de la base de datos de CodeLearn, sus campos, las relaciones entre ellas y las restricciones principales.

La base de datos utiliza Supabase y PostgreSQL para almacenar los cursos, las unidades, las lecciones y las actividades de programación.

## 2. Tabla `cursos`

Almacena los cursos disponibles en la aplicación.

| Campo | Tipo de dato | Descripción | Restricciones |
|---|---|---|---|
| `id` | TEXT | Identificador único del curso. | Clave primaria |
| `nombre` | TEXT | Nombre del curso. | Obligatorio |
| `descripcion` | TEXT | Descripción del curso. | Obligatorio |
| `estado` | TEXT | Indica si el curso está disponible o próximo. | Obligatorio; valores permitidos: `disponible`, `proximamente` |

## 3. Tabla `unidades`

Almacena las unidades que pertenecen a cada curso.

| Campo | Tipo de dato | Descripción | Restricciones |
|---|---|---|---|
| `id` | TEXT | Identificador único de la unidad. | Clave primaria |
| `curso_id` | TEXT | Identifica el curso al que pertenece. | Clave foránea hacia `cursos.id`; obligatorio |
| `orden` | INTEGER | Posición de la unidad dentro del curso. | Obligatorio |
| `titulo` | TEXT | Nombre de la unidad. | Obligatorio |
| `descripcion` | TEXT | Descripción de la unidad. | Obligatorio |
| `estado` | TEXT | Indica la disponibilidad de la unidad. | Obligatorio; valores permitidos: `publicada`, `pendiente`, `bloqueada` |

## 4. Tabla `lecciones`

Almacena las lecciones de cada unidad.

| Campo | Tipo de dato | Descripción | Restricciones |
|---|---|---|---|
| `id` | TEXT | Identificador único de la lección. | Clave primaria |
| `unidad_id` | TEXT | Identifica la unidad a la que pertenece. | Clave foránea hacia `unidades.id`; obligatorio |
| `orden` | INTEGER | Posición de la lección dentro de la unidad. | Obligatorio |
| `titulo` | TEXT | Título de la lección. | Obligatorio |
| `explicacion` | TEXT | Explicación del contenido educativo. | Obligatorio |
| `codigo` | TEXT | Ejemplo de código de programación. | Obligatorio |

## 5. Tabla `preguntas`

Almacena las preguntas de las actividades de cada lección.

| Campo | Tipo de dato | Descripción | Restricciones |
|---|---|---|---|
| `id` | TEXT | Identificador único de la pregunta. | Clave primaria |
| `leccion_id` | TEXT | Identifica la lección a la que pertenece. | Clave foránea hacia `lecciones.id`; obligatorio |
| `orden` | INTEGER | Posición de la pregunta dentro de la lección. | Obligatorio |
| `enunciado` | TEXT | Texto de la pregunta. | Obligatorio |
| `explicacion` | TEXT | Explicación que se muestra al corregir la respuesta. | Obligatorio |

## 6. Tabla `opciones`

Almacena las opciones de respuesta de cada pregunta.

| Campo | Tipo de dato | Descripción | Restricciones |
|---|---|---|---|
| `id` | TEXT | Identificador único de la opción. | Clave primaria |
| `pregunta_id` | TEXT | Identifica la pregunta a la que pertenece. | Clave foránea hacia `preguntas.id`; obligatorio |
| `texto` | TEXT | Texto que ve el usuario como posible respuesta. | Obligatorio |

Cada pregunta tiene opciones de respuesta y una sola opción correcta definida en la tabla `soluciones`.

## 7. Tabla `soluciones`

Almacena la respuesta correcta de cada pregunta. Esta información se utiliza desde la función de verificación del servidor para corregir las respuestas.

| Campo | Tipo de dato | Descripción | Restricciones |
|---|---|---|---|
| `pregunta_id` | TEXT | Identifica la pregunta cuya solución se almacena. | Clave primaria y clave foránea hacia `preguntas.id` |
| `opcion_correcta_id` | TEXT | Identifica la opción correcta. | Clave foránea hacia `opciones.id`; debe corresponder a una opción de la misma pregunta |

La tabla está protegida para impedir que los roles públicos consulten directamente las soluciones. La corrección se realiza mediante la función de verificación del servidor.

## 8. Relaciones entre las tablas

Las relaciones de la base de datos son las siguientes:

- Un curso puede tener varias unidades.
- Cada unidad pertenece a un curso.
- Una unidad puede tener varias lecciones.
- Cada lección pertenece a una unidad.
- Una lección puede tener varias preguntas.
- Cada pregunta pertenece a una lección.
- Una pregunta puede tener varias opciones.
- Cada opción pertenece a una pregunta.
- Cada pregunta tiene una solución que identifica su opción correcta.

## 9. Integridad de los datos

Las claves primarias identifican de forma única los registros. Las claves foráneas relacionan las tablas y ayudan a evitar referencias a registros inexistentes.

Los campos obligatorios utilizan restricciones `NOT NULL`. Los estados de los cursos y las unidades tienen restricciones `CHECK` para limitar los valores permitidos.

La base de datos utiliza políticas de seguridad de nivel de fila (RLS) para controlar el acceso al contenido publicado. Los roles públicos no tienen permisos directos para modificar las tablas de contenido ni consultar directamente las soluciones.

## 10. Alcance actual

En esta etapa, la base de datos contiene el curso de JavaScript, cinco unidades, dos lecciones completas, seis preguntas, sus opciones y sus soluciones.

La primera unidad está publicada. Las unidades restantes permanecen bloqueadas o pendientes.

El almacenamiento persistente del progreso personal, los intentos y el historial de respuestas corresponde a las etapas posteriores del proyecto.