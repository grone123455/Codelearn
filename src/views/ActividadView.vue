<template>
  <section class="pagina">
    <!-- CARGANDO -->
    <div
      v-if="cargando"
      class="estado-pagina"
    >
      <h1>Cargando actividad...</h1>
      <p>Estamos obteniendo la actividad desde la base de datos.</p>
    </div>

    <!-- ERROR -->
    <div
      v-else-if="error"
      class="estado-pagina"
    >
      <h1>No se pudo cargar la actividad</h1>
      <p>Ocurrió un error al obtener la actividad.</p>
      <button class="siguiente" @click="cargarActividad">
        Reintentar
      </button>
    </div>

    <!-- ACTIVIDAD -->
    <div
      v-else-if="actividad"
      class="contenido"
    >
      <div class="navegacion">
        <button class="volver" @click="volverALeccion">
          ← Volver a la lección
        </button>
        <span class="contador">
          Actividad {{ numeroActividad }} / {{ totalActividades }}
        </span>
      </div>

      <div class="barra">
        <div
          class="barra-progreso"
          :style="{ width: `${progreso}%` }"
        ></div>
      </div>

      <div class="encabezado">
        <span class="etiqueta">ACTIVIDAD</span>
        <h1>{{ actividad.pregunta }}</h1>
      </div>

      <div class="opciones">
        <button
          v-for="opcion in actividad.opciones"
          :key="opcion.id"
          class="opcion"
          :class="claseOpcion(opcion.id)"
          :disabled="respondida || verificando"
          @click="seleccionarOpcion(opcion.id)"
        >
          <span class="radio">
            <span
              v-if="respuestaSeleccionada === opcion.id"
              class="radio-seleccionado"
            ></span>
          </span>
          <span class="texto-opcion">{{ opcion.texto }}</span>
        </button>
      </div>

      <!-- ERROR DE VERIFICACIÓN -->
      <div
        v-if="errorVerificacion"
        class="feedback error-feedback"
      >
        <div class="feedback-icono">!</div>
        <div>
          <h2>No se pudo verificar la respuesta</h2>
          <p>
            No pudimos comprobar tu respuesta por un problema de conexión.
            Tu respuesta no fue marcada como correcta ni incorrecta.
          </p>
        </div>
      </div>

      <!-- RESULTADO -->
      <div
        v-if="respondida"
        class="feedback"
        :class="respuestaCorrecta ? 'correcto' : 'incorrecto'"
      >
        <div class="feedback-icono">
          {{ respuestaCorrecta ? "✓" : "✕" }}
        </div>
        <div>
          <h2>
            {{
              respuestaCorrecta
                ? "¡Respuesta correcta!"
                : "Respuesta incorrecta"
            }}
          </h2>
          <p>{{ actividad.explicacion }}</p>
        </div>
      </div>

      <div class="acciones">
        <!-- CONFIRMAR -->
        <button
          v-if="!respondida"
          class="confirmar"
          :disabled="!respuestaSeleccionada || verificando"
          @click="confirmarRespuesta"
        >
          {{
            verificando
              ? "Verificando..."
              : "Confirmar respuesta"
          }}
        </button>

        <!-- SIGUIENTE -->
        <button
          v-else
          class="siguiente"
          @click="siguienteActividad"
        >
          {{
            esUltimaActividad
              ? "Ver resultados"
              : "Siguiente actividad →"
          }}
        </button>

        <!-- REINTENTAR VERIFICACIÓN -->
        <button
          v-if="errorVerificacion"
          class="siguiente"
          @click="confirmarRespuesta"
        >
          Reintentar verificación
        </button>
      </div>
    </div>

    <!-- NO ENCONTRADA -->
    <div
      v-else
      class="error"
    >
      <h1>Actividad no encontrada</h1>
      <p>
        La actividad que estás buscando no existe o no está disponible.
      </p>
      <button class="siguiente" @click="volverAlCurso">
        Volver al curso
      </button>
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
  useRoute,
  useRouter
} from "vue-router"
import {
  obtenerActividad,
  obtenerActividadesPorLeccion
} from "../services/datos.js"
import { supabase } from "../services/supabase.js"

const route = useRoute()
const router = useRouter()

const actividad = ref(null)
const actividadesLeccion = ref([])
const cargando = ref(true)
const error = ref(false)
const verificando = ref(false)
const errorVerificacion = ref(false)
const respuestaSeleccionada = ref(null)
const respondida = ref(false)
const respuestaCorrecta = ref(false)
const intentoId = ref(null)

// =====================================
// CARGAR ACTIVIDAD
// =====================================
async function cargarActividad() {
  try {
    cargando.value = true
    error.value = false
    reiniciarActividad()

    const resultado = await obtenerActividad(route.params.id)
    actividad.value = resultado

    if (!resultado) {
      actividadesLeccion.value = []
      return
    }

    actividadesLeccion.value =
      await obtenerActividadesPorLeccion(resultado.leccionId)

    // Recuperar o crear el intento actual de esta lección.
    const claveIntento =
      `codelearn_intento_actual_${resultado.leccionId}`

    let intentoGuardado = sessionStorage.getItem(claveIntento)

    if (!intentoGuardado) {
      intentoGuardado = crypto.randomUUID()

      sessionStorage.setItem(
        claveIntento,
        intentoGuardado
      )
    }

    intentoId.value = intentoGuardado
  } catch (e) {
    console.error("Error al cargar la actividad:", e)
    error.value = true
    actividad.value = null
    actividadesLeccion.value = []
  } finally {
    cargando.value = false
  }
}

// =====================================
// NÚMERO DE ACTIVIDAD
// =====================================
const numeroActividad = computed(() => {
  if (!actividad.value) return 0

  const indice = actividadesLeccion.value.findIndex(
    actividadActual => actividadActual.id === actividad.value.id
  )

  return indice + 1
})

// =====================================
// TOTAL
// =====================================
const totalActividades = computed(() => {
  return actividadesLeccion.value.length
})

// =====================================
// PROGRESO
// =====================================
const progreso = computed(() => {
  if (totalActividades.value === 0) return 0

  return (
    (numeroActividad.value / totalActividades.value) * 100
  )
})

// =====================================
// ÚLTIMA ACTIVIDAD
// =====================================
const esUltimaActividad = computed(() => {
  return numeroActividad.value === totalActividades.value
})

// =====================================
// REINICIAR
// =====================================
function reiniciarActividad() {
  respuestaSeleccionada.value = null
  respondida.value = false
  respuestaCorrecta.value = false
  verificando.value = false
  errorVerificacion.value = false
}

// =====================================
// SELECCIONAR OPCIÓN
// =====================================
function seleccionarOpcion(opcionId) {
  if (respondida.value || verificando.value) return

  respuestaSeleccionada.value = opcionId
}

// =====================================
// CONFIRMAR RESPUESTA
// =====================================
async function confirmarRespuesta() {
  if (
    !respuestaSeleccionada.value ||
    respondida.value ||
    verificando.value ||
    !actividad.value
  ) {
    return
  }

  try {
    verificando.value = true
    errorVerificacion.value = false

    const { data, error: errorFuncion } =
      await supabase.functions.invoke(
        "verificar-respuesta",
        {
          body: {
            preguntaId: actividad.value.id,
            opcionId: respuestaSeleccionada.value,
            intentoId: intentoId.value,
            leccionId: actividad.value.leccionId
          }
        }
      )

    if (errorFuncion) {
      throw errorFuncion
    }

    if (!data || typeof data.correcta !== "boolean") {
      throw new Error("Respuesta inválida del servidor.")
    }

    respuestaCorrecta.value = data.correcta
    respondida.value = true

    // Guardar el ID del intento confirmado por el servidor.
    if (data.intentoId) {
      intentoId.value = data.intentoId
    }

    guardarResultado()
  } catch (e) {
    console.error("Error al verificar la respuesta:", e)
    errorVerificacion.value = true
  } finally {
    verificando.value = false
  }
}

// =====================================
// GUARDAR RESULTADO TEMPORAL
// =====================================
function guardarResultado() {
  if (!actividad.value) return

  const resultadosGuardados = JSON.parse(
    sessionStorage.getItem("codelearn_resultados") || "[]"
  )

  const resultadosActualizados = resultadosGuardados.filter(
    resultado => resultado.actividadId !== actividad.value.id
  )

  resultadosActualizados.push({
    actividadId: actividad.value.id,
    leccionId: actividad.value.leccionId,
    intentoId: intentoId.value,
    respuestaSeleccionada: respuestaSeleccionada.value,
    correcta: respuestaCorrecta.value
  })

  sessionStorage.setItem(
    "codelearn_resultados",
    JSON.stringify(resultadosActualizados)
  )
}

// =====================================
// SIGUIENTE ACTIVIDAD
// =====================================
function siguienteActividad() {
  if (!actividad.value) return

  const indiceActual = actividadesLeccion.value.findIndex(
    actividadActual => actividadActual.id === actividad.value.id
  )

  const siguiente = actividadesLeccion.value[indiceActual + 1]

  if (!siguiente) {
    // Identificar el intento que acaba de terminar.
    sessionStorage.setItem(
      "codelearn_ultimo_intento",
      JSON.stringify({
        intentoId: intentoId.value,
        leccionId: actividad.value.leccionId
      })
    )

    sessionStorage.removeItem(
      `codelearn_intento_actual_${actividad.value.leccionId}`
    )

    router.push("/resultados")
    return
  }

  router.push(`/actividad/${siguiente.id}`)
}

// =====================================
// VOLVER A LECCIÓN
// =====================================
function volverALeccion() {
  if (!actividad.value) {
    volverAlCurso()
    return
  }

  router.push(
    `/cursos/javascript/leccion/${actividad.value.leccionId}`
  )
}

// =====================================
// VOLVER AL CURSO
// =====================================
function volverAlCurso() {
  router.push("/cursos/javascript")
}

// =====================================
// ESTILO DE OPCIÓN
// =====================================
function claseOpcion(opcionId) {
  if (!respondida.value) {
    return respuestaSeleccionada.value === opcionId
      ? "seleccionada"
      : ""
  }

  // No se revela cuál era la solución correcta.
  if (opcionId === respuestaSeleccionada.value) {
    return respuestaCorrecta.value
      ? "correcta"
      : "incorrecta"
  }

  return ""
}

// =====================================
// INICIO
// =====================================
onMounted(() => {
  cargarActividad()
})
</script>

<style scoped>
.pagina {
  max-width: 850px;
  margin: 0 auto;
  padding: 50px 7% 80px;
}
.navegacion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 15px;
}
.volver {
  padding: 8px 0;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.volver:hover {
  color: #22c55e;
}
.contador {
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 700;
}
.barra {
  width: 100%;
  height: 7px;
  margin-bottom: 55px;
  overflow: hidden;
  background: #1e293b;
  border-radius: 20px;
}
.barra-progreso {
  height: 100%;
  background: #22c55e;
  border-radius: 20px;
  transition: width 0.3s ease;
}
.encabezado {
  margin-bottom: 35px;
}
.etiqueta {
  color: #22c55e;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 2px;
}
h1 {
  margin: 12px 0 0;
  color: #f8fafc;
  font-size: 2.3rem;
  line-height: 1.35;
}
.opciones {
  display: flex;
  flex-direction: column;
  gap: 13px;
}
.opcion {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 17px 20px;
  text-align: left;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  color: #f8fafc;
  font-size: 0.95rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.opcion:not(:disabled):hover {
  border-color: #22c55e;
}
.opcion.seleccionada {
  background: rgba(34, 197, 94, 0.08);
  border-color: #22c55e;
}
.opcion.correcta {
  background: rgba(34, 197, 94, 0.12);
  border-color: #22c55e;
}
.opcion.incorrecta {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}
.radio {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #64748b;
  border-radius: 50%;
}
.seleccionada .radio {
  border-color: #22c55e;
}
.radio-seleccionado {
  width: 10px;
  height: 10px;
  background: #22c55e;
  border-radius: 50%;
}
.texto-opcion {
  line-height: 1.5;
}
.feedback {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-top: 25px;
  padding: 20px;
  border-radius: 14px;
}
.feedback.correcto {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.35);
}
.feedback.incorrecto {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.35);
}
.error-feedback {
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.35);
}
.feedback-icono {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 800;
}
.correcto .feedback-icono {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}
.incorrecto .feedback-icono {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}
.error-feedback .feedback-icono {
  background: rgba(234, 179, 8, 0.15);
  color: #eab308;
}
.feedback h2 {
  margin: 0 0 6px;
  color: #f8fafc;
  font-size: 1rem;
}
.feedback p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.6;
}
.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 25px;
}
.confirmar,
.siguiente {
  padding: 13px 21px;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}
.confirmar {
  background: #22c55e;
  color: #0f172a;
}
.confirmar:hover:not(:disabled) {
  background: #4ade80;
}
.confirmar:disabled {
  background: #334155;
  color: #64748b;
  cursor: not-allowed;
}
.siguiente {
  background: #22c55e;
  color: #0f172a;
}
.siguiente:hover {
  background: #4ade80;
}
.error {
  padding: 80px 20px;
  text-align: center;
}
.error h1 {
  font-size: 2.3rem;
}
.error p {
  margin: 15px 0 25px;
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
  margin: 15px 0 25px;
  color: #94a3b8;
}
@media (max-width: 600px) {
  .pagina {
    padding: 40px 5% 60px;
  }
  .navegacion {
    align-items: flex-start;
    flex-direction: column;
  }
  .barra {
    margin-bottom: 40px;
  }
  h1 {
    font-size: 1.8rem;
  }
  .opcion {
    padding: 15px;
  }
  .acciones {
    flex-direction: column;
    justify-content: stretch;
  }
  .confirmar,
  .siguiente {
    width: 100%;
  }
}
</style>
