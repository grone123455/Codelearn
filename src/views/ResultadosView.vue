
<template>
  <section class="pagina">
    <!-- CARGANDO -->
    <div
      v-if="cargando"
      class="estado-pagina"
    >
      <h1>Cargando resultados...</h1>

      <p>
        Estamos obteniendo el resultado de la lección.
      </p>
    </div>

    <!-- ERROR -->
    <div
      v-else-if="error"
      class="estado-pagina"
    >
      <h1>No se pudieron cargar los resultados</h1>

      <p>
        Ocurrió un error al obtener la información.
      </p>

      <button
        class="principal"
        @click="cargarResultados"
      >
        Reintentar
      </button>
    </div>

    <!-- SIN RESULTADOS -->
    <div
      v-else-if="!leccionId"
      class="estado-pagina"
    >
      <h1>Todavía no hay resultados</h1>

      <p>
        Primero tenés que realizar las actividades de una lección
        para poder consultar tus resultados.
      </p>

      <button
        class="principal"
        @click="volverAlCurso"
      >
        Volver al curso
      </button>
    </div>

    <!-- RESULTADOS -->
    <div
      v-else
      class="resultado"
    >
      <span class="etiqueta">
        RESULTADOS
      </span>

      <div
        class="icono"
        :class="
          !completa
            ? 'incompleta'
            : aprobado
              ? 'aprobado'
              : 'no-aprobado'
        "
      >
        {{ !completa ? "…" : aprobado ? "✓" : "!" }}
      </div>

      <h1>
        {{
          !completa
            ? "Lección incompleta"
            : aprobado
              ? "¡Lección aprobada!"
              : "Lección no aprobada"
        }}
      </h1>

      <p class="mensaje">
        {{ mensaje }}
      </p>

      <div class="estadisticas">
        <div class="estadistica">
          <span class="numero">
            {{ total }}
          </span>

          <span class="nombre">
            Total
          </span>
        </div>

        <div class="estadistica correcta">
          <span class="numero">
            {{ correctas }}
          </span>

          <span class="nombre">
            Correctas
          </span>
        </div>

        <div class="estadistica incorrecta">
          <span class="numero">
            {{ incorrectas }}
          </span>

          <span class="nombre">
            Incorrectas
          </span>
        </div>
      </div>

      <div class="resumen-respondidas">
        Actividades respondidas:
        <strong>{{ respondidas }} de {{ total }}</strong>
      </div>

      <div class="porcentaje">
        <div class="porcentaje-info">
          <span>
            Porcentaje de respuestas correctas
          </span>

          <strong>
            {{ porcentaje }}%
          </strong>
        </div>

        <div class="barra">
          <div
            class="barra-progreso"
            :style="{ width: `${porcentaje}%` }"
          ></div>
        </div>
      </div>

      <div class="regla">
        <strong>
          Regla de aprobación
        </strong>

        <p>
          Necesitás responder las 3 actividades y tener al menos
          2 respuestas correctas para aprobar la lección.
        </p>
      </div>

      <div class="acciones">
        <button
          class="secundario"
          @click="volverAUnidad"
        >
          Volver a la unidad
        </button>

        <button
          class="principal"
          @click="volverAIntentar"
        >
          Volver a intentar
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"

import {
  obtenerActividadesPorLeccion,
  obtenerLeccion
} from "../services/datos.js"

const router = useRouter()

const leccion = ref(null)
const actividades = ref([])

const cargando = ref(true)
const error = ref(false)

// =====================================
// RESULTADOS GUARDADOS
// =====================================

const resultados = ref([])

function leerResultados() {
  try {
    const datos = JSON.parse(
      sessionStorage.getItem("codelearn_resultados") || "[]"
    )

    resultados.value = Array.isArray(datos) ? datos : []
  } catch {
    resultados.value = []
  }
}

const ultimoResultado = computed(() => {
  return resultados.value.length > 0
    ? resultados.value[resultados.value.length - 1]
    : null
})

const leccionId = computed(() => {
  return ultimoResultado.value?.leccionId || null
})

// =====================================
// RESULTADOS DE LA LECCIÓN
// =====================================

const resultadosLeccion = computed(() => {
  const resultadosFiltrados = resultados.value.filter(
    resultado => resultado.leccionId === leccionId.value
  )

  // Si una actividad tiene varios registros, se conserva
  // solamente el último para evitar contarla más de una vez.
  const resultadosUnicos = new Map()

  for (const resultado of resultadosFiltrados) {
    if (resultado.actividadId) {
      resultadosUnicos.set(
        resultado.actividadId,
        resultado
      )
    }
  }

  return [...resultadosUnicos.values()]
})

const resultadosValidos = computed(() => {
  const idsActividades = new Set(
    actividades.value.map(actividad => actividad.id)
  )

  return resultadosLeccion.value.filter(
    resultado => idsActividades.has(resultado.actividadId)
  )
})

const total = computed(() => {
  return actividades.value.length
})

const respondidas = computed(() => {
  return resultadosValidos.value.length
})

const correctas = computed(() => {
  return resultadosValidos.value.filter(
    resultado => resultado.correcta === true
  ).length
})

const incorrectas = computed(() => {
  return resultadosValidos.value.filter(
    resultado => resultado.correcta === false
  ).length
})

const completa = computed(() => {
  return total.value > 0 && respondidas.value === total.value
})

const porcentaje = computed(() => {
  if (total.value === 0) {
    return 0
  }

  return Math.round(
    (correctas.value / total.value) * 100
  )
})

const aprobado = computed(() => {
  return completa.value && correctas.value >= 2
})

const mensaje = computed(() => {
  if (!completa.value) {
    return `Todavía no completaste todas las actividades. Respondidas: ${respondidas.value} de ${total.value}. Terminá las que faltan para conocer el resultado final.`
  }

  if (aprobado.value) {
    return "Completaste las actividades y conseguiste al menos 2 respuestas correctas. Podés continuar con la siguiente lección."
  }

  return "Completaste las actividades, pero necesitás al menos 2 respuestas correctas para aprobar. Podés volver a intentarlo."
})

// =====================================
// CARGAR DATOS
// =====================================

async function cargarResultados() {
  try {
    cargando.value = true
    error.value = false

    leerResultados()

    leccion.value = null
    actividades.value = []

    if (!leccionId.value) {
      return
    }

    leccion.value = await obtenerLeccion(
      leccionId.value
    )

    if (!leccion.value) {
      throw new Error("No se encontró la lección.")
    }

    actividades.value = await obtenerActividadesPorLeccion(
      leccionId.value
    )

    if (!Array.isArray(actividades.value)) {
      actividades.value = []
    }
  } catch (e) {
    console.error(
      "Error al cargar los resultados:",
      e
    )

    error.value = true
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarResultados()
})

// =====================================
// VOLVER A INTENTAR
// =====================================

function volverAIntentar() {
  const resultadosActuales = JSON.parse(
    sessionStorage.getItem("codelearn_resultados") || "[]"
  )

  const resultadosOtros = resultadosActuales.filter(
    resultado => resultado.leccionId !== leccionId.value
  )

  sessionStorage.setItem(
    "codelearn_resultados",
    JSON.stringify(resultadosOtros)
  )

  if (actividades.value.length === 0) {
    volverAlCurso()
    return
  }

  router.push(
    `/actividad/${actividades.value[0].id}`
  )
}

// =====================================
// NAVEGACIÓN
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

function volverAlCurso() {
  router.push("/cursos/javascript")
}
</script>

<style scoped>
.pagina {
  min-height: calc(100vh - 76px);
  display: flex;
  justify-content: center;
  padding: 60px 7% 80px;
}

.resultado {
  width: 100%;
  max-width: 750px;
  text-align: center;
}

.etiqueta {
  color: #22c55e;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 2px;
}

.icono {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 25px auto 20px;
  border-radius: 50%;
  font-size: 2rem;
  font-weight: 800;
}

.icono.aprobado {
  background: rgba(34, 197, 94, 0.12);
  border: 2px solid #22c55e;
  color: #22c55e;
}

.icono.no-aprobado {
  background: rgba(239, 68, 68, 0.12);
  border: 2px solid #ef4444;
  color: #ef4444;
}

.icono.incompleta {
  background: rgba(234, 179, 8, 0.12);
  border: 2px solid #eab308;
  color: #eab308;
}

h1 {
  margin: 0;
  color: #f8fafc;
  font-size: 2.5rem;
}

.mensaje {
  max-width: 600px;
  margin: 15px auto 40px;
  color: #94a3b8;
  font-size: 1rem;
  line-height: 1.7;
}

.estadisticas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 18px;
}

.estadistica {
  padding: 22px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
}

.estadistica .numero {
  display: block;
  color: #f8fafc;
  font-size: 2rem;
  font-weight: 800;
}

.estadistica .nombre {
  display: block;
  margin-top: 5px;
  color: #94a3b8;
  font-size: 0.8rem;
}

.estadistica.correcta {
  border-color: rgba(34, 197, 94, 0.35);
}

.estadistica.correcta .numero {
  color: #22c55e;
}

.estadistica.incorrecta {
  border-color: rgba(239, 68, 68, 0.35);
}

.estadistica.incorrecta .numero {
  color: #ef4444;
}

.resumen-respondidas {
  margin-bottom: 20px;
  color: #94a3b8;
  font-size: 0.9rem;
}

.resumen-respondidas strong {
  color: #f8fafc;
}

.porcentaje {
  padding: 22px;
  text-align: left;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
}

.porcentaje-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.porcentaje-info span {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 600;
}

.porcentaje-info strong {
  color: #22c55e;
  font-size: 1rem;
}

.barra {
  width: 100%;
  height: 9px;
  overflow: hidden;
  background: #0f172a;
  border-radius: 20px;
}

.barra-progreso {
  height: 100%;
  background: #22c55e;
  border-radius: 20px;
  transition: width 0.5s ease;
}

.regla {
  margin-top: 20px;
  padding: 18px;
  text-align: left;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
}

.regla strong {
  color: #f8fafc;
  font-size: 0.85rem;
}

.regla p {
  margin: 7px 0 0;
  color: #64748b;
  font-size: 0.8rem;
  line-height: 1.6;
}

.acciones {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 30px;
}

.principal,
.secundario {
  padding: 13px 21px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.principal {
  border: none;
  background: #22c55e;
  color: #0f172a;
}

.principal:hover {
  background: #4ade80;
}

.secundario {
  border: 1px solid #334155;
  background: transparent;
  color: #94a3b8;
}

.secundario:hover {
  border-color: #22c55e;
  color: #22c55e;
}

.estado-pagina {
  width: 100%;
  max-width: 750px;
  padding: 80px 20px;
  text-align: center;
}

.estado-pagina h1 {
  font-size: 2.3rem;
}

.estado-pagina p {
  margin: 15px 0 25px;
  color: #94a3b8;
}

@media (max-width: 600px) {
  .pagina {
    padding: 45px 5% 60px;
  }

  h1 {
    font-size: 2rem;
  }

  .estadisticas {
    gap: 8px;
  }

  .estadistica {
    padding: 16px 10px;
  }

  .estadistica .numero {
    font-size: 1.6rem;
  }

  .estadistica .nombre {
    font-size: 0.7rem;
  }

  .porcentaje-info {
    align-items: flex-start;
  }

  .acciones {
    flex-direction: column-reverse;
  }

  .principal,
  .secundario {
    width: 100%;
  }
}
</style>
