<template>
  <section class="pagina">
    <button
      class="volver"
      @click="volverACursos"
    >
      ← Volver a cursos
    </button>

    <div class="encabezado">
      <span class="etiqueta">
        CURSO
      </span>

      <h1>
        JavaScript
      </h1>

      <p>
        Aprendé los fundamentos de JavaScript mediante
        lecciones y actividades prácticas.
      </p>
    </div>

    <div class="progreso">
      <div class="progreso-info">
        <span>
          Progreso del curso
        </span>

        <strong>
          0%
        </strong>
      </div>

      <div class="barra">
        <div class="barra-progreso"></div>
      </div>
    </div>

    <div class="unidades">
      <div class="unidades-encabezado">
        <span class="etiqueta">
          CONTENIDO
        </span>

        <h2>
          Unidades del curso
        </h2>

        <p>
          Completá las unidades en orden para avanzar
          en el curso.
        </p>
      </div>

      <div
        v-if="cargando"
        class="sin-unidades"
      >
        <h2>
          Cargando unidades...
        </h2>

        <p>
          Estamos obteniendo el contenido desde la base de datos.
        </p>
      </div>

      <div
        v-else-if="error"
        class="sin-unidades"
      >
        <h2>
          No se pudieron cargar las unidades
        </h2>

        <p>
          Ocurrió un error al conectar con la base de datos.
        </p>

        <button
          class="boton"
          @click="reintentar"
        >
          Reintentar
        </button>
      </div>

      <div
        v-else-if="unidades.length > 0"
        class="lista-unidades"
      >
        <UnidadCard
          v-for="unidad in unidades"
          :key="unidad.id"
          :unidad="unidad"
          @seleccionar="seleccionarUnidad"
        />
      </div>

      <div
        v-else
        class="sin-unidades"
      >
        <h2>
          No hay unidades disponibles
        </h2>

        <p>
          Todavía no hay contenido para este curso.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref
} from "vue"

import {
  useRouter
} from "vue-router"

import UnidadCard from "../components/UnidadCard.vue"

import {
  obtenerUnidadesPorCurso,
  obtenerLeccionesPorUnidad,
  obtenerActividadesPorLeccion
} from "../services/datos.js"

const router = useRouter()

const unidadesOriginales = ref([])

const leccionesPorUnidad = ref({})

const actividadesPorLeccion = ref({})

const cargando = ref(true)

const error = ref(false)

async function cargarUnidades() {
  try {
    error.value = false
    cargando.value = true

    unidadesOriginales.value =
      await obtenerUnidadesPorCurso(
        "curso-js"
      )

    await cargarContenido()
  } catch (e) {
    console.error(
      "Error al cargar las unidades:",
      e
    )

    error.value = true
  } finally {
    cargando.value = false
  }
}

function reintentar() {
  cargarUnidades()
}

async function cargarContenido() {
  const leccionesMapa = {}

  const actividadesMapa = {}

  for (const unidad of unidadesOriginales.value) {
    try {
      const lecciones =
        await obtenerLeccionesPorUnidad(
          unidad.id
        )

      leccionesMapa[unidad.id] = lecciones

      for (const leccion of lecciones) {
        const actividades =
          await obtenerActividadesPorLeccion(
            leccion.id
          )

        actividadesMapa[leccion.id] =
          actividades
      }
    } catch (e) {
      console.error(
        "Error al cargar el contenido de la unidad:",
        unidad.id,
        e
      )

      leccionesMapa[unidad.id] = []
    }
  }

  leccionesPorUnidad.value = leccionesMapa

  actividadesPorLeccion.value =
    actividadesMapa
}

onMounted(() => {
  cargarUnidades()
})

function obtenerResultados() {
  return JSON.parse(
    sessionStorage.getItem(
      "codelearn_resultados"
    ) || "[]"
  )
}

function leccionAprobada(
  leccionId
) {
  const actividades =
    actividadesPorLeccion.value[
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

  const correctas =
    resultadosLeccion.filter(
      resultado =>
        resultado.correcta === true
    ).length

  return correctas >= 2
}

function unidadCompletada(
  unidadId
) {
  const lecciones =
    leccionesPorUnidad.value[
      unidadId
    ] || []

  if (lecciones.length === 0) {
    return false
  }

  return lecciones.every(
    leccion =>
      leccionAprobada(
        leccion.id
      )
  )
}

function unidadDesbloqueada(
  unidad
) {
  if (unidad.orden === 1) {
    return true
  }

  const unidadAnterior =
    unidadesOriginales.value.find(
      unidadActual =>
        unidadActual.orden ===
        unidad.orden - 1
    )

  if (!unidadAnterior) {
    return false
  }

  return unidadCompletada(
    unidadAnterior.id
  )
}

const unidades = computed(() => {
  return unidadesOriginales.value.map(
    unidad => {
      return {
        ...unidad,
        estado:
          unidadDesbloqueada(
            unidad
          )
            ? "publicada"
            : "bloqueada"
      }
    }
  )
})

function seleccionarUnidad(
  unidad
) {
  if (
    unidad.estado ===
    "bloqueada"
  ) {
    return
  }

  router.push(
    `/cursos/javascript/unidad/${unidad.id}`
  )
}

function volverACursos() {
  router.push("/cursos")
}
</script>

<style scoped>
.pagina {
  max-width: 1100px;

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
  max-width: 750px;

  margin-bottom: 35px;
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

  font-size: 3.2rem;
  line-height: 1.1;
}

.encabezado p {
  margin: 0;

  color: #94a3b8;

  font-size: 1.05rem;
  line-height: 1.8;
}

.progreso {
  margin-bottom: 60px;

  padding: 22px 25px;

  background: #1e293b;

  border: 1px solid #334155;

  border-radius: 14px;
}

.progreso-info {
  display: flex;

  align-items: center;
  justify-content: space-between;

  margin-bottom: 12px;
}

.progreso-info span {
  color: #94a3b8;

  font-size: 0.9rem;
  font-weight: 600;
}

.progreso-info strong {
  color: #22c55e;

  font-size: 0.9rem;
}

.barra {
  width: 100%;
  height: 8px;

  overflow: hidden;

  background: #0f172a;

  border-radius: 20px;
}

.barra-progreso {
  width: 0%;
  height: 100%;

  background: #22c55e;

  border-radius: 20px;
}

.unidades-encabezado {
  margin-bottom: 25px;
}

.unidades-encabezado h2 {
  margin: 10px 0 8px;

  color: #f8fafc;

  font-size: 1.8rem;
}

.unidades-encabezado p {
  margin: 0;

  color: #94a3b8;

  font-size: 0.95rem;
}

.lista-unidades {
  display: flex;

  flex-direction: column;

  gap: 18px;
}

.sin-unidades {
  padding: 50px;

  text-align: center;

  background: #1e293b;

  border: 1px solid #334155;

  border-radius: 16px;
}

.sin-unidades h2 {
  margin: 0 0 10px;

  color: #f8fafc;
}

.sin-unidades p {
  margin: 0;

  color: #94a3b8;
}

.sin-unidades .boton {
  margin-top: 20px;

  padding: 12px 20px;

  border: none;
  border-radius: 10px;

  background: #22c55e;

  color: #0f172a;

  font-size: 0.9rem;
  font-weight: 700;

  cursor: pointer;

  transition: 0.2s;
}

.sin-unidades .boton:hover {
  background: #4ade80;
}

@media (max-width: 600px) {
  .pagina {
    padding: 40px 5% 60px;
  }

  h1 {
    font-size: 2.4rem;
  }

  .encabezado p {
    font-size: 0.95rem;
  }

  .progreso {
    margin-bottom: 45px;

    padding: 18px;
  }

  .unidades-encabezado h2 {
    font-size: 1.5rem;
  }
}
</style>