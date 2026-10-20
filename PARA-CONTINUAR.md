# CodeLearn — Documento de traspaso (para continuar el proyecto)

Fecha de este estado: **20 de octubre de 2026**.

Proyecto escolar de 5 etapas: **Vue 3 + Vite + Quasar (estilos) + Supabase**.
Carpeta del proyecto: `C:\Users\Usuario\OneDrive\Documentos\Año 2026 Tomas\codelearn`

---

## 1. Estado general de las etapas

| Etapa | Tema | Estado |
|-------|------|--------|
| 1 | Estructura base, rutas, vistas, datos de contenido | ✅ Completa |
| 2 | Lecciones, actividades, regla de aprobación (2 de 3) | ✅ Completa |
| 3 | Verificación en servidor + seguridad (RLS) | ✅ Completa (ver detalle y pruebas manuales pendientes abajo) |
| 4 | Supabase Auth: usuarios, perfiles, rutas protegidas | ❌ No empezada |
| 5 | Intentos/progreso en base de datos, historial | ❌ No empezada |

---

## 2. Cómo levantar el proyecto

```sh
npm install        # ya ejecutado
npm run dev        # servidor de desarrollo (Vite). Si el puerto 5173 está ocupado usa 5174
npm run lint       # debe pasar limpio (pasa ✅)
npm run build      # build de producción (pasa ✅)
```

Comandos de Supabase (la CLI de Supabase ya está logueada en esta máquina):

```sh
npx supabase db push                      # aplicar migraciones nuevas
npx supabase functions deploy verificar-respuesta   # desplegar la función
```

Base de datos: proyecto **Supabase "Codelearn"**, ref `crseocdwrurzgvserihj`, región `sa-east-1`.
URL y clave pública están en `.env` (hay `.env.example` como referencia).
**Nunca** poner la `service_role` en el frontend.

> Nota: si el proyecto aparece INACTIVE en el dashboard, hay que restaurarlo (plan gratuito se pausa).
> Justo después de restaurar, `db push` puede fallar 1 minuto con error de "tenant not found": esperar y reintentar.

---

## 3. Qué hay implementado y verificado en la Etapa 3

### 3.1 Función del servidor `supabase/functions/verificar-respuesta/index.ts`
- Recibe `{ preguntaId, opcionId }`.
- Valida que la pregunta exista (404 si no).
- Valida que la unidad esté **publicada** y el curso **disponible** (404 si no).
- Valida que la opción pertenezca a la pregunta (404 si no).
- Compara con la solución usando `ctx.supabaseAdmin` (la clave service_role vive SOLO en el servidor).
- Devuelve `{ correcta: boolean, explicacion: string }`.
- `verify_jwt = false` en `supabase/config.toml`.
- **El navegador nunca ve la tabla `soluciones`.**

### 3.2 RLS (migración `supabase/migrations/20261020000000_orden_preguntas_y_rls.sql`, YA APLICADA)
- Políticas SELECT para `anon` en: `cursos`, `unidades`, `lecciones`, `preguntas`, `opciones`.
- `unidades` solo se ve si `estado = 'publicada'`; `cursos` solo si `estado = 'disponible'`.
- Tabla `soluciones`: **sin políticas** → inaccesible desde el cliente.
- Agrega el campo `orden` (preguntas/unidades/lecciones se ordenan por `orden`).

### 3.3 Pruebas automatizadas/probadas con éxito (20/10/2026)
**Contra la API (clave pública anónima):**
- `soluciones` → 0 filas (protegida) ✅
- `cursos` → devuelve "JavaScript / disponible" ✅
- `unidades` → solo "Introducción a JavaScript" (publicada) ✅
- Función: respuesta correcta → `correcta: true` ✅
- Función: respuesta incorrecta → `correcta: false` ✅
- Función: opción de otra pregunta → 404 ✅
- Función: pregunta inexistente → 404 ✅
- Codificación: los datos en la base están en UTF-8 correcto (los "??" en la consola de Windows son solo de visualización) ✅

**Recorrido completo en el navegador (app en funcionamiento):**
- Inicio → Cursos → Curso JavaScript → Unidad 1 → Lección 1 → Actividades ✅
- Botón "Confirmar" deshabilitado hasta elegir opción ✅
- Feedback de **correcta** con explicación desde el servidor ✅
- Feedback de **incorrecta** con explicación desde el servidor ✅
- "Siguiente actividad" carga la siguiente pregunta ✅
- "Ver resultados" → pantalla de resultados con regla 2 de 3 ✅
- Resultado **no aprobado** (1/3) y **aprobado** (3/3, 100%) ✅
- "Volver a intentar" reinicia la lección y limpia resultados ✅
- Al aprobar la lección 1 se **desbloquea la lección 2** ✅
- Actividad con ID inexistente → "Actividad no encontrada" con botón de recuperación ✅
- Consola del navegador sin errores ✅
- `npm run lint` y `npm run build` pasan limpios ✅

### 3.4 Bugs corregidos (no reintroducir)
1. **`src/App.vue`**: `<RouterView :key="$route.fullPath" />` es OBLIGATORIO. Sin la `:key`, Vue reutiliza el componente al cambiar solo el parámetro de ruta y "Siguiente actividad" mostraba la pregunta vieja (el bug original de la Etapa 3).
2. **`Navbar.vue` → `AppNavbar.vue`** por la regla `vue/multi-word-component-names`.
3. Promesas sin `await` en `ResultadosView.vue` y `JavaScriptView.vue` (bugs async).
4. `supabase/seed.sql` reescrito en UTF-8 y con el campo `orden` (el viejo tenía caracteres rotados).
5. `src/services/datos.js` ordena las preguntas por `orden`.

### 3.5 Pruebas MANUALES que faltan (las hace una persona, no se pueden automatizar)
Estas tres pruebas están pedidas en la consigna de la Etapa 3 y **aún no se hicieron**:
1. **Dos dispositivos**: abrir la app en la compu y en el celular (misma red o con datos) y verificar que el contenido se vea bien en ambos.
2. **Modificar contenido en Supabase**: cambiar el título de un curso en el SQL Editor del dashboard y comprobar que la app muestra el cambio (recargando).
3. **Sin conexión**: cerrar el WiFi y verificar que la app muestre un mensaje de error claro (no se rompa).

Si el docente pide documentación entregable de la Etapa 3, generar: DER (diagrama entidad-relación), diccionario de datos y registro de pruebas (se puede armar a partir de la sección 3.3).

> **Importante sobre "anomalías" durante las pruebas**: en el navegador del panel de revisión hay una ventana visible que **otra persona puede estar usando al mismo tiempo**. Un supuesto "bug" (actividad 3 contestada sola) resultó ser otra persona haciendo clic durante la prueba. Se verificó con instrumentación de eventos: la app sola NO hace clics ni navega sola. Si se repetía, usar `sessionStorage.__ev` como log de eventos (clics, navegaciones, llamadas a la función) para atribuir cada acción.

---

## 4. Etapa 4 — Qué falta hacer (NO empezada)

Requisitos (según la consigna unificada del proyecto):
- Autenticación con **Supabase Auth**: usuarios propios del curso (no hace falta email real si la consigna permite invitados/anónimos — **confirmar con la consigna original**).
- Tabla `perfiles` ligada a `auth.users`.
- **Rutas protegidas** en el router (las pantallas de progreso/resultados solo para usuarios con sesión).
- **Ampliar RLS**: ahora las políticas son para `anon`; hay que pasarlas a usuarios autenticados y ligar progreso/perfil al `auth.uid()`.
- La app debe seguir funcionando para quien solo navega el contenido público (cursos/lecciones), si la consigna lo indica.

Archivos clave a tocar: `src/router/` (guardas), `src/services/supabase.js`, nuevas vistas de acceso, migración NUEVA en `supabase/migrations/` (no editar la aplicada), RLS con `auth.uid()`.

## 5. Etapa 5 — Qué falta hacer (NO empezada)

- Tabla de **intentos/progreso** (respuestas por usuario, por actividad, con fecha).
- Pantalla de **historial** del alumno.
- La **regla de aprobación 2 de 3 de la Etapa 2 se reutiliza igual** (no inventar otra).
- La función `verificar-respuesta` de la Etapa 3 **se amplía** en la Etapa 5 (por ejemplo, para guardar el intento y calcular progreso en el servidor).
- **Validación en servidor** de todo lo que sea resultado/progreso (el cliente no define si aprobó).

---

## 6. Reglas del proyecto que NO se pueden violar

1. Son **5 etapas** con su numeración original. No agregar funcionalidades fuera de alcance: **sin panel de admin, sin rankings, sin competencias oficiales**.
2. **RLS siempre activo.** Soluciones jamás consultables desde el cliente. `service_role` solo en el servidor (Edge Functions). Todo resultado validado en el servidor.
3. Regla de aprobación: **≥ 2 respuestas correctas de 3** para aprobar la lección (Etapa 2, reutilizada en Etapa 5).
4. Explicaciones al usuario en **español simple** (el alumno pidió que se le explique con lenguaje sencillo y en español rioplatense).
5. La consigna original de las 5 etapas la tiene el alumno (no está en el repo). Ante dudas de alcance, pedirle que pegue el enunciado.

---

## 7. Mapa rápido del código

```
src/
  App.vue                 → Navbar + <RouterView :key="$route.fullPath" /> (clave del fix)
  router/                 → rutas: /, /cursos, /cursos/javascript, unidad, leccion, /actividad/:id, /resultados
  views/
    InicioView.vue        → portada
    CursosView.vue        → lista de cursos
    JavaScriptView.vue    → curso JS con unidades
    UnidadView.vue        → lecciones de la unidad (bloqueo/desbloqueo)
    LeccionView.vue       → contenido de la lección + botón a actividades
    ActividadView.vue     → pregunta, confirmar (llama a la función), feedback, siguiente
    ResultadosView.vue    → puntaje, regla 2 de 3, reintentar
  services/
    datos.js              → consultas a Supabase (cursos, unidades, lecciones, preguntas)
    supabase.js           → cliente Supabase (clave pública)
supabase/
  schema.sql              → esquema completo de referencia (reproducible)
  seed.sql                → datos iniciales en UTF-8 con campo orden
  migrations/
    20261020000000_orden_preguntas_y_rls.sql   → APLICADA (orden + RLS)
  functions/
    verificar-respuesta/  → función desplegada (verificar y re-desplegar con cada cambio)
  config.toml             → verify_jwt = false para la función
```

---

## 8. Checklist para retomar

- [ ] Pedir/practicar las 3 pruebas manuales de la Etapa 3 (sección 3.5).
- [ ] Si el docente pide documentación: DER + diccionario de datos + registro de pruebas.
- [ ] Arrancar Etapa 4 (auth + perfiles + rutas protegidas + RLS con `auth.uid()`).
- [ ] Arrancar Etapa 5 (tabla de intentos, historial, ampliación de la función, validación en servidor).
- [ ] Después de cada cambio: `npm run lint` + `npm run build` + probar el recorrido en el navegador.
