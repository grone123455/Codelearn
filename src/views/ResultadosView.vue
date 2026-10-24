<template>
  <main class="pagina">
    <section v-if="cargando" class="estado-pagina">
      <h1>Cargando resultados...</h1>
      <p>Estamos recuperando tus resultados.</p>
    </section>

    <section v-else-if="error" class="estado-pagina">
      <h1>No se pudieron cargar los resultados</h1>
      <p>Ocurrió un problema al recuperar tu intento. Volvé a intentarlo.</p>
      <button class="principal" @click="cargarResultados">
        Reintentar
      </button>
    </section>

    <section v-else-if="!leccionId" class="estado-pagina">
      <h1>No hay resultados para mostrar</h1>
      <p>Completá una actividad para consultar tus resultados.</p>
      <button class="principal" @click="volverACursos">
        Volver a cursos
      </button>
    </section>

    <section v-else class="resultado">
      <span class="etiqueta">RESULTADOS DE LA LECCIÓN</span>

      <div
        class="icono"
        :class="{
          aprobado: aprobado,
          'no-aprobado': completa && !aprobado,
          incompleta: !completa
        }"
      >
        {{ aprobado ? '✓' : completa ? '✕' : '…' }}
      </div>

      <h1>
        {{
          aprobado
            ? '¡Lección aprobada!'
            : completa
              ? 'Lección no aprobada'
              : 'Lección incompleta'
        }}
      </h1>

      <p class="mensaje">{{ mensaje }}</p>

      <div class="estadisticas">
        <div class="estadistica">
          <span class="numero">{{ total }}</span>
          <span class="nombre">Actividades</span>
        </div>

        <div class="estadistica correcta">
          <span class="numero">{{ correctas }}</span>
          <span class="nombre">Correctas</span>
        </div>

        <div class="estadistica incorrecta">
          <span class="numero">{{ incorrectas }}</span>
          <span class="nombre">Incorrectas</span>
        </div>
      </div>

      <p class="resumen-respondidas">
        Respondidas: <strong>{{ respondidas }} de {{ total }}</strong>
      </p>

      <div class="porcentaje">
        <div class="porcentaje-info">
          <span>Tu resultado</span>
          <strong>{{ porcentaje }}%</strong>
        </div>

        <div class="barra">
          <div
            class="barra-progreso"
            :style="{ width: `${porcentaje}%` }"
          ></div>
        </div>
      </div>

      <div class="regla">
        <strong>¿Cómo se aprueba?</strong>
        <p>
          Necesitás responder correctamente al menos 2 de cada 3 actividades
          para aprobar la lección.
        </p>
      </div>

      <div class="acciones">
        <button class="secundario" @click="volverAUnidad">
          Volver a la unidad
        </button>

        <button class="principal" @click="volverAIntentar">
          Volver a intentar
        </button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  obtenerActividadesPorLeccion,
  obtenerLeccion,
  obtenerIntentosPorLeccion,
  obtenerUltimoIntento
} from '../services/datos'

const router = useRouter()

const leccion = ref(null)
const actividades = ref([])
const respuestasIntento = ref([])
const intentoActual = ref(null)

const cargando = ref(true)
const error = ref(false)
const leccionId = ref(null)

const resultadosValidos = computed(() => {
  const preguntasDeLaLeccion = new Set(
    actividades.value.map((actividad) => actividad.id)
  )

  return respuestasIntento.value.filter((respuesta) =>
    preguntasDeLaLeccion.has(respuesta.pregunta_id)
  )
})

const total = computed(() => actividades.value.length)

const respondidas = computed(() => resultadosValidos.value.length)

const correctas = computed(
  () => resultadosValidos.value.filter((respuesta) => respuesta.correcta).length
)

const incorrectas = computed(() => respondidas.value - correctas.value)

const completa = computed(
  () => total.value > 0 && respondidas.value >= total.value
)

const porcentaje = computed(() => {
  if (respondidas.value === 0) return 0

  return Math.round((correctas.value / total.value) * 100)
})

const aprobado = computed(() => {
  if (!completa.value || total.value === 0) return false

  return correctas.value >= Math.ceil((total.value * 2) / 3)
})

const mensaje = computed(() => {
  if (!completa.value) {
    return 'Todavía no respondiste todas las actividades. Podés continuar para completar la lección.'
  }

  if (aprobado.value) {
    return '¡Buen trabajo! Alcanzaste el puntaje necesario para aprobar esta lección.'
  }

  return 'Todavía no alcanzaste el puntaje necesario. Podés volver a intentarlo para mejorar tu resultado.'
})

async function cargarResultados() {
  cargando.value = true
  error.value = false
  leccion.value = null
  actividades.value = []
  respuestasIntento.value = []
  intentoActual.value = null
  leccionId.value = null

  try {
    let intento = null

    // Primero buscamos el intento que acaba de finalizar.
    const ultimoIntentoGuardado = sessionStorage.getItem(
      'codelearn_ultimo_intento'
    )

    if (ultimoIntentoGuardado) {
      try {
        const datosGuardados = JSON.parse(ultimoIntentoGuardado)

        if (datosGuardados.intentoId && datosGuardados.leccionId) {
          const intentos = await obtenerIntentosPorLeccion(
            datosGuardados.leccionId
          )

          intento =
            intentos.find(
              (item) => item.id === datosGuardados.intentoId
            ) || null
        }
      } catch (e) {
        console.error('No se pudo recuperar el intento reciente:', e)
      }
    }

    // Si no encontramos el intento reciente, consultamos el último del usuario.
    if (!intento) {
      intento = await obtenerUltimoIntento()
    }

    if (!intento) {
      return
    }

    intentoActual.value = intento
    leccionId.value = intento.leccion_id

    respuestasIntento.value = intento.respuestas || []

    leccion.value = await obtenerLeccion(intento.leccion_id)

    actividades.value =
      (await obtenerActividadesPorLeccion(intento.leccion_id)) || []
  } catch (e) {
    console.error('Error al cargar los resultados:', e)
    error.value = true
  } finally {
    cargando.value = false
  }
}

function volverAUnidad() {
  if (!leccion.value) return

  router.push(`/cursos/javascript/unidad/${leccion.value.unidadId || leccion.value.unidad_id}`)
}

function volverAIntentar() {
  if (!leccionId.value) return

  if (actividades.value.length > 0) {
    router.push(`/actividad/${actividades.value[0].id}`)
  }
}

function volverACursos() {
  router.push('/cursos')
}

onMounted(cargarResultados)
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
