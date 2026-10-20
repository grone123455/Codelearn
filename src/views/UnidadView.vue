```vue
<template>
  <section class="pagina">
    <button
      class="volver"
      @click="volverAlCurso"
    >
      ← Volver al curso
    </button>

    <!-- CARGANDO -->
    <div
      v-if="cargando"
      class="estado-pagina"
    >
      <h1>Cargando unidad...</h1>

      <p>
        Estamos obteniendo el contenido desde la base de datos.
      </p>
    </div>

    <!-- ERROR -->
    <div
      v-else-if="error"
      class="estado-pagina"
    >
      <h1>No se pudo cargar la unidad</h1>

      <p>
        Ocurrió un error al obtener la información desde la base de datos.
      </p>

      <button
        class="boton"
        @click="cargarUnidad"
      >
        Reintentar
      </button>
    </div>

    <!-- UNIDAD -->
    <div
      v-else-if="unidad"
      class="contenido"
    >
      <div class="encabezado">
        <span class="etiqueta">
          UNIDAD {{ unidad.orden }}
        </span>

        <h1>
          {{ unidad.titulo }}
        </h1>

        <p>
          {{ unidad.descripcion }}
        </p>
      </div>

      <div class="estado-unidad">
        <span
          v-if="unidad.estado === 'publicada'"
          class="estado disponible"
        >
          ✓ Unidad disponible
        </span>

        <span
          v-else
          class="estado bloqueada"
        >
          🔒 Unidad bloqueada
        </span>
      </div>

      <!-- UNIDAD PUBLICADA -->
      <div
        v-if="unidad.estado === 'publicada'"
        class="lecciones"
      >
        <div class="lecciones-encabezado">
          <span class="etiqueta">
            CONTENIDO
          </span>

          <h2>
            Lecciones
          </h2>

          <p>
            Completá las lecciones para avanzar en la unidad.
          </p>
        </div>

        <!-- CARGANDO LECCIONES -->
        <div
          v-if="cargandoLecciones"
          class="sin-lecciones"
        >
          <h2>
            Cargando lecciones...
          </h2>

          <p>
            Estamos obteniendo las lecciones de esta unidad.
          </p>
        </div>

        <!-- ERROR LECCIONES -->
        <div
          v-else-if="errorLecciones"
          class="sin-lecciones"
        >
          <h2>
            No se pudieron cargar las lecciones
          </h2>

          <p>
            Ocurrió un error al obtener el contenido.
          </p>

          <button
            class="boton"
            @click="cargarLecciones"
          >
            Reintentar
          </button>
        </div>

        <!-- LECCIONES -->
        <div
          v-else-if="lecciones.length > 0"
          class="lista-lecciones"
        >
          <article
            v-for="leccion in lecciones"
            :key="leccion.id"
            class="leccion-card"
            :class="{
              bloqueada: !leccionDesbloqueada(leccion)
            }"
          >
            <div class="numero">
              {{ leccion.orden }}
            </div>

            <div class="leccion-contenido">
              <div class="encabezado-leccion">
                <div>
                  <span class="numero-leccion">
                    LECCIÓN {{ leccion.orden }}
                  </span>

                  <h3>
                    {{ leccion.titulo }}
                  </h3>
                </div>

                <span
                  v-if="leccionDesbloqueada(leccion)"
                  class="estado-leccion disponible"
                >
                  Disponible
                </span>

                <span
                  v-else
                  class="estado-leccion bloqueada"
                >
                  🔒 Bloqueada
                </span>
              </div>

              <p>
                {{ leccion.explicacion }}
              </p>

              <button
                v-if="leccionDesbloqueada(leccion)"
                class="boton"
                @click="seleccionarLeccion(leccion)"
              >
                Ver lección →
              </button>

              <span
                v-else
                class="texto-bloqueada"
              >
                Aprobá la lección anterior para desbloquearla.
              </span>
            </div>
          </article>
        </div>

        <!-- SIN LECCIONES -->
        <div
          v-else
          class="sin-lecciones"
        >
          <h2>
            No hay lecciones disponibles
          </h2>

          <p>
            Todavía no hay contenido para esta unidad.
          </p>
        </div>
      </div>

      <!-- UNIDAD BLOQUEADA -->
      <div
        v-else
        class="bloqueo"
      >
        <div class="bloqueo-icono">
          🔒
        </div>

        <h2>
          Unidad bloqueada
        </h2>

        <p>
          Completá las unidades anteriores para desbloquear
          este contenido.
        </p>

        <button
          class="boton"
          @click="volverAlCurso"
        >
          Volver al curso
        </button>
      </div>
    </div>

    <!-- UNIDAD NO ENCONTRADA -->
    <div
      v-else
      class="error"
    >
      <h1>
        Unidad no encontrada
      </h1>

      <p>
        La unidad que estás buscando no existe o no está disponible.
      </p>

      <button
        class="boton"
        @click="volverAlCurso"
      >
        Volver al curso
      </button>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

import {
  obtenerUnidad,
  obtenerLeccionesPorUnidad,
  obtenerActividadesPorLeccion
} from "../services/datos.js"

const route = useRoute()
const router = useRouter()

const unidad = ref(null)
const lecciones = ref([])

const cargando = ref(true)
const error = ref(false)

const cargandoLecciones = ref(false)
const errorLecciones = ref(false)

const resultadosActividades = ref({})

// =====================================
// CARGAR UNIDAD
// =====================================

async function cargarUnidad() {
  try {
    cargando.value = true
    error.value = false

    const resultado = await obtenerUnidad(
      route.params.id
    )

    unidad.value = resultado

    if (resultado) {
      await cargarLecciones()
    }
  } catch (e) {
    console.error(
      "Error al cargar la unidad:",
      e
    )

    error.value = true
  } finally {
    cargando.value = false
  }
}

// =====================================
// CARGAR LECCIONES
// =====================================

async function cargarLecciones() {
  if (!unidad.value) {
    return
  }

  try {
    cargandoLecciones.value = true
    errorLecciones.value = false

    lecciones.value =
      await obtenerLeccionesPorUnidad(
        unidad.value.id
      )

    await cargarActividades()
  } catch (e) {
    console.error(
      "Error al cargar las lecciones:",
      e
    )

    errorLecciones.value = true
  } finally {
    cargandoLecciones.value = false
  }
}

// =====================================
// CARGAR ACTIVIDADES
// =====================================

async function cargarActividades() {
  resultadosActividades.value = {}

  for (const leccion of lecciones.value) {
    try {
      const actividades =
        await obtenerActividadesPorLeccion(
          leccion.id
        )

      resultadosActividades.value[
        leccion.id
      ] = actividades
    } catch (e) {
      console.error(
        "Error al cargar actividades de la lección:",
        leccion.id,
        e
      )

      resultadosActividades.value[
        leccion.id
      ] = []
    }
  }
}

// =====================================
// RESULTADOS DEL USUARIO
// =====================================

function obtenerResultados() {
  return JSON.parse(
    sessionStorage.getItem(
      "codelearn_resultados"
    ) || "[]"
  )
}

// =====================================
// COMPROBAR SI UNA LECCIÓN ESTÁ APROBADA
// =====================================

function leccionAprobada(leccionId) {
  const actividades =
    resultadosActividades.value[
      leccionId
    ] || []

  if (actividades.length === 0) {
    return false
  }

  const resultados =
    obtenerResultados()

  const resultadosLeccion =
    resultados.filter(
      resultado =>
        resultado.leccionId ===
        leccionId
    )

  const respuestasCorrectas =
    resultadosLeccion.filter(
      resultado =>
        resultado.correcta === true
    ).length

  return respuestasCorrectas >= 2
}

// =====================================
// DESBLOQUEAR LECCIÓN
// =====================================

function leccionDesbloqueada(leccion) {
  if (leccion.orden === 1) {
    return true
  }

  const leccionAnterior =
    lecciones.value.find(
      leccionActual =>
        leccionActual.orden ===
        leccion.orden - 1
    )

  if (!leccionAnterior) {
    return false
  }

  return leccionAprobada(
    leccionAnterior.id
  )
}

// =====================================
// SELECCIONAR LECCIÓN
// =====================================

function seleccionarLeccion(leccion) {
  if (!leccionDesbloqueada(leccion)) {
    return
  }

  router.push(
    `/cursos/javascript/leccion/${leccion.id}`
  )
}

// =====================================
// VOLVER AL CURSO
// =====================================

function volverAlCurso() {
  router.push(
    "/cursos/javascript"
  )
}

// =====================================
// INICIO
// =====================================

onMounted(() => {
  cargarUnidad()
})
</script>

<style scoped>
.pagina {
  max-width: 1000px;

  margin: 0 auto;

  padding: 50px 7% 80px;
}

.volver {
  margin-bottom: 40px;

  padding: 8px 0;

  border: none;

  background: transparent;

  color: #94a3b8;

  font-size: 0.95rem;
  font-weight: 600;

  cursor: pointer;

  transition: 0.2s;
}

.volver:hover {
  color: #22c55e;
}

.encabezado {
  max-width: 800px;
}

.etiqueta {
  color: #22c55e;

  font-size: 0.75rem;
  font-weight: 700;

  letter-spacing: 2px;
}

h1 {
  margin: 12px 0 15px;

  color: #f8fafc;

  font-size: 3rem;
  line-height: 1.15;
}

.encabezado p {
  margin: 0;

  color: #94a3b8;

  font-size: 1.05rem;
  line-height: 1.8;
}

.estado-unidad {
  margin-top: 25px;
}

.estado {
  display: inline-flex;
  align-items: center;

  padding: 7px 12px;

  border-radius: 8px;

  font-size: 0.8rem;
  font-weight: 700;
}

.estado.disponible {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}

.estado.bloqueada {
  background: rgba(100, 116, 139, 0.15);
  color: #94a3b8;
}

.lecciones {
  margin-top: 60px;
}

.lecciones-encabezado {
  margin-bottom: 25px;
}

.lecciones-encabezado h2 {
  margin: 10px 0 8px;

  color: #f8fafc;

  font-size: 1.8rem;
}

.lecciones-encabezado p {
  margin: 0;

  color: #94a3b8;

  font-size: 0.95rem;
}

.lista-lecciones {
  display: flex;

  flex-direction: column;

  gap: 18px;
}

.leccion-card {
  display: flex;
  gap: 20px;

  padding: 25px;

  background: #1e293b;

  border: 1px solid #334155;
  border-radius: 16px;

  transition:
    transform 0.2s,
    border-color 0.2s,
    opacity 0.2s;
}

.leccion-card:not(.bloqueada):hover {
  transform: translateY(-2px);

  border-color: #22c55e;
}

.leccion-card.bloqueada {
  opacity: 0.55;
}

.numero {
  flex-shrink: 0;

  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #0f172a;

  border: 1px solid #22c55e;
  border-radius: 10px;

  color: #22c55e;

  font-size: 1.1rem;
  font-weight: 800;
}

.leccion-card.bloqueada .numero {
  border-color: #475569;

  color: #64748b;
}

.leccion-contenido {
  flex: 1;
  min-width: 0;
}

.encabezado-leccion {
  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 20px;
}

.numero-leccion {
  color: #22c55e;

  font-size: 0.7rem;
  font-weight: 700;

  letter-spacing: 1.5px;
}

.leccion-card.bloqueada .numero-leccion {
  color: #64748b;
}

.leccion-contenido h3 {
  margin: 7px 0 9px;

  color: #f8fafc;

  font-size: 1.3rem;
}

.leccion-contenido p {
  margin: 0 0 18px;

  color: #94a3b8;

  font-size: 0.92rem;
  line-height: 1.7;
}

.estado-leccion {
  flex-shrink: 0;

  padding: 5px 9px;

  border-radius: 6px;

  font-size: 0.7rem;
  font-weight: 700;
}

.estado-leccion.disponible {
  background: rgba(34, 197, 94, 0.12);

  color: #22c55e;
}

.estado-leccion.bloqueada {
  background: rgba(100, 116, 139, 0.15);

  color: #94a3b8;
}

.boton {
  padding: 10px 17px;

  border: none;
  border-radius: 9px;

  background: #22c55e;
  color: #0f172a;

  font-size: 0.85rem;
  font-weight: 700;

  cursor: pointer;

  transition: 0.2s;
}

.boton:hover {
  background: #4ade80;
}

.texto-bloqueada {
  color: #64748b;

  font-size: 0.85rem;
  font-weight: 600;
}

.bloqueo {
  max-width: 600px;

  margin: 70px auto 0;

  padding: 45px 30px;

  text-align: center;

  background: #1e293b;

  border: 1px solid #334155;
  border-radius: 18px;
}

.bloqueo-icono {
  margin-bottom: 15px;

  font-size: 2.5rem;
}

.bloqueo h2 {
  margin: 0 0 10px;

  color: #f8fafc;

  font-size: 1.6rem;
}

.bloqueo p {
  margin: 0 auto 25px;

  max-width: 450px;

  color: #94a3b8;

  line-height: 1.7;
}

.sin-lecciones {
  padding: 45px;

  text-align: center;

  background: #1e293b;

  border: 1px solid #334155;
  border-radius: 16px;
}

.sin-lecciones h2 {
  margin: 0 0 10px;

  color: #f8fafc;
}

.sin-lecciones p {
  margin: 0 0 20px;

  color: #94a3b8;
}

.estado-pagina {
  padding: 80px 20px;

  text-align: center;
}

.estado-pagina h1 {
  font-size: 2.2rem;
}

.estado-pagina p {
  margin: 0 0 25px;

  color: #94a3b8;
}

.error {
  padding: 80px 20px;

  text-align: center;
}

.error h1 {
  font-size: 2.2rem;
}

.error p {
  margin: 0 0 20px;

  color: #94a3b8;
}

@media (max-width: 600px) {
  .pagina {
    padding: 40px 5% 60px;
  }

  h1 {
    font-size: 2.3rem;
  }

  .encabezado p {
    font-size: 0.95rem;
  }

  .lecciones {
    margin-top: 45px;
  }

  .leccion-card {
    gap: 14px;

    padding: 20px;
  }

  .numero {
    width: 40px;
    height: 40px;

    font-size: 0.95rem;
  }

  .encabezado-leccion {
    gap: 10px;
  }

  .leccion-contenido h3 {
    font-size: 1.15rem;
  }

  .estado-leccion {
    font-size: 0.65rem;
  }
}
</style>
