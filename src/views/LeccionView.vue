```vue
<template>
  <section class="pagina">
    <button
      class="volver"
      @click="volverAUnidad"
    >
      ← Volver a la unidad
    </button>

    <!-- CARGANDO -->
    <div
      v-if="cargando"
      class="estado-pagina"
    >
      <h1>
        Cargando lección...
      </h1>

      <p>
        Estamos obteniendo el contenido desde la base de datos.
      </p>
    </div>

    <!-- ERROR -->
    <div
      v-else-if="error"
      class="estado-pagina"
    >
      <h1>
        No se pudo cargar la lección
      </h1>

      <p>
        Ocurrió un error al obtener la información desde la base de datos.
      </p>

      <button
        class="comenzar"
        @click="cargarLeccion"
      >
        Reintentar
      </button>
    </div>

    <!-- LECCIÓN -->
    <div
      v-else-if="leccion"
      class="contenido"
    >
      <div class="encabezado">
        <span class="etiqueta">
          LECCIÓN {{ leccion.orden }}
        </span>

        <h1>
          {{ leccion.titulo }}
        </h1>

        <p class="explicacion">
          {{ leccion.explicacion }}
        </p>
      </div>

      <div class="ejemplo">
        <div class="ejemplo-cabecera">
          <span>
            EJEMPLO DE CÓDIGO
          </span>

          <span>
            JavaScript
          </span>
        </div>

        <pre><code>{{ leccion.codigo }}</code></pre>
      </div>

      <div class="actividades">
        <div class="actividades-encabezado">
          <span class="etiqueta">
            PRÁCTICA
          </span>

          <h2>
            Poné a prueba lo aprendido
          </h2>

          <p>
            Esta lección tiene
            {{ actividadesLeccion.length }}
            actividades.
          </p>
        </div>

        <div class="info-card">
          <div class="info-icono">
            ✓
          </div>

          <div>
            <h3>
              Completá las actividades
            </h3>

            <p>
              Respondé las preguntas y recibí una explicación
              después de cada respuesta.
            </p>
          </div>
        </div>

        <!-- CARGANDO ACTIVIDADES -->
        <div
          v-if="cargandoActividades"
          class="sin-actividades"
        >
          <p>
            Cargando actividades...
          </p>
        </div>

        <!-- ERROR ACTIVIDADES -->
        <div
          v-else-if="errorActividades"
          class="sin-actividades"
        >
          <p>
            No se pudieron cargar las actividades.
          </p>

          <button
            class="comenzar"
            @click="cargarActividades"
          >
            Reintentar
          </button>
        </div>

        <!-- ACTIVIDADES DISPONIBLES -->
        <button
          v-else-if="actividadesLeccion.length > 0"
          class="comenzar"
          @click="comenzarActividades"
        >
          Comenzar actividades →
        </button>

        <!-- SIN ACTIVIDADES -->
        <div
          v-else
          class="sin-actividades"
        >
          <p>
            Esta lección todavía no tiene actividades.
          </p>
        </div>
      </div>
    </div>

    <!-- LECCIÓN NO ENCONTRADA -->
    <div
      v-else
      class="error"
    >
      <h1>
        Lección no encontrada
      </h1>

      <p>
        La lección que estás buscando no existe o no está disponible.
      </p>

      <button
        class="comenzar"
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
  obtenerLeccion,
  obtenerActividadesPorLeccion
} from "../services/datos.js"

const route = useRoute()
const router = useRouter()

const leccion = ref(null)
const actividadesLeccion = ref([])

const cargando = ref(true)
const error = ref(false)

const cargandoActividades = ref(false)
const errorActividades = ref(false)

// =====================================
// CARGAR LECCIÓN
// =====================================

async function cargarLeccion() {
  try {
    cargando.value = true
    error.value = false

    const resultado =
      await obtenerLeccion(
        route.params.id
      )

    leccion.value = resultado

    if (resultado) {
      await cargarActividades()
    }
  } catch (e) {
    console.error(
      "Error al cargar la lección:",
      e
    )

    error.value = true
  } finally {
    cargando.value = false
  }
}

// =====================================
// CARGAR ACTIVIDADES
// =====================================

async function cargarActividades() {
  if (!leccion.value) {
    return
  }

  try {
    cargandoActividades.value = true
    errorActividades.value = false

    actividadesLeccion.value =
      await obtenerActividadesPorLeccion(
        leccion.value.id
      )
  } catch (e) {
    console.error(
      "Error al cargar las actividades:",
      e
    )

    errorActividades.value = true
    actividadesLeccion.value = []
  } finally {
    cargandoActividades.value = false
  }
}

// =====================================
// COMENZAR ACTIVIDADES
// =====================================

function comenzarActividades() {
  if (
    actividadesLeccion.value.length === 0
  ) {
    return
  }

  const primeraActividad =
    actividadesLeccion.value[0]

  router.push(
    `/actividad/${primeraActividad.id}`
  )
}

// =====================================
// VOLVER A LA UNIDAD
// =====================================

function volverAUnidad() {
  if (!leccion.value) {
    volverAlCurso()
    return
  }

  router.push(
    `/cursos/javascript/unidad/${leccion.value.unidadId}`
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
  cargarLeccion()
})
</script>

<style scoped>
.pagina {
  max-width: 900px;

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
  margin: 12px 0 18px;

  color: #f8fafc;

  font-size: 3rem;
  line-height: 1.15;
}

.explicacion {
  margin: 0;

  color: #94a3b8;

  font-size: 1.05rem;
  line-height: 1.9;
}

.ejemplo {
  margin-top: 40px;

  overflow: hidden;

  background: #020617;

  border: 1px solid #1e293b;
  border-radius: 15px;
}

.ejemplo-cabecera {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding: 12px 18px;

  background: #1e293b;

  color: #94a3b8;

  font-size: 0.7rem;
  font-weight: 700;

  letter-spacing: 1px;
}

pre {
  margin: 0;

  padding: 25px;

  overflow-x: auto;
}

code {
  color: #22c55e;

  font-family: "Courier New", monospace;

  font-size: 0.95rem;
  line-height: 1.8;
}

.actividades {
  margin-top: 60px;
}

.actividades-encabezado {
  margin-bottom: 25px;
}

.actividades-encabezado h2 {
  margin: 10px 0 8px;

  color: #f8fafc;

  font-size: 1.8rem;
}

.actividades-encabezado p {
  margin: 0;

  color: #94a3b8;

  font-size: 0.95rem;
}

.info-card {
  display: flex;

  align-items: flex-start;

  gap: 15px;

  padding: 20px;

  background: #1e293b;

  border: 1px solid #334155;
  border-radius: 14px;
}

.info-icono {
  flex-shrink: 0;

  width: 38px;
  height: 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(34, 197, 94, 0.12);

  border-radius: 9px;

  color: #22c55e;

  font-weight: 800;
}

.info-card h3 {
  margin: 0 0 6px;

  color: #f8fafc;

  font-size: 1rem;
}

.info-card p {
  margin: 0;

  color: #94a3b8;

  font-size: 0.9rem;
  line-height: 1.6;
}

.comenzar {
  margin-top: 22px;

  padding: 13px 21px;

  border: none;
  border-radius: 10px;

  background: #22c55e;
  color: #0f172a;

  font-size: 0.9rem;
  font-weight: 700;

  cursor: pointer;

  transition: 0.2s;
}

.comenzar:hover {
  background: #4ade80;
}

.sin-actividades {
  margin-top: 22px;

  padding: 25px;

  background: #1e293b;

  border: 1px solid #334155;
  border-radius: 14px;
}

.sin-actividades p {
  margin: 0;

  color: #94a3b8;
}

.error {
  padding: 80px 20px;

  text-align: center;
}

.error h1 {
  font-size: 2.3rem;
}

.error p {
  margin: 0 0 20px;

  color: #94a3b8;
}

.estado-pagina {
  padding: 80px 20px;

  text-align: center;
}

.estado-pagina h1 {
  font-size: 2.3rem;
}

.estado-pagina p {
  margin: 0 0 25px;

  color: #94a3b8;
}

@media (max-width: 600px) {
  .pagina {
    padding: 40px 5% 60px;
  }

  h1 {
    font-size: 2.3rem;
  }

  .explicacion {
    font-size: 0.95rem;
  }

  .ejemplo {
    margin-top: 30px;
  }

  pre {
    padding: 18px;
  }

  code {
    font-size: 0.8rem;
  }

  .actividades {
    margin-top: 45px;
  }

  .actividades-encabezado h2 {
    font-size: 1.5rem;
  }
}
</style>
