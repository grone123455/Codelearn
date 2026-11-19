
<script setup>
import { ref, onUnmounted } from "vue"
import { RouterLink } from "vue-router"
import { supabase } from "../services/supabase.js"

import {
  crearPartidaCompetitiva,
  iniciarDesafioCompetitivo,
  obtenerSiguientePregunta,
  responderPreguntaCompetitiva,
  finalizarDesafioCompetitivo
} from "../services/desafio.js"

const estado = ref("inicio")
const cargando = ref(false)
const enviandoRespuesta = ref(false)
const respuestaRegistrada = ref(false)
const mensajeError = ref("")
const cuentaRegresiva = ref(3)
const partidaId = ref(null)
const grupoAsignado = ref(null)
const preguntaActual = ref(null)
const opcionSeleccionadaId = ref(null)
const resultadoRespuesta = ref(null)
const resultadoFinal = ref(null)
const mostrarConfirmacionAbandono = ref(false)
const tiempoTranscurrido = ref(0)

let intervaloCronometro = null
let tokenSesion = null
let partidaActivaServidor = false
let solicitudCierreEnviada = false

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const { data: authListener } = supabase.auth.onAuthStateChange(
  (_evento, sesion) => {
    tokenSesion = sesion?.access_token ?? null
  }
)

async function actualizarTokenSesion() {
  const { data, error } = await supabase.auth.getSession()

  if (error) throw error

  tokenSesion = data.session?.access_token ?? null

  if (!tokenSesion) {
    throw new Error("No se pudo obtener la sesión del participante.")
  }
}

function esperar(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

function detenerCronometro() {
  if (intervaloCronometro) {
    clearInterval(intervaloCronometro)
    intervaloCronometro = null
  }
}

function finalizarAlCerrar() {
  if (
    !partidaId.value ||
    !partidaActivaServidor ||
    !tokenSesion ||
    solicitudCierreEnviada
  ) {
    return
  }

  solicitudCierreEnviada = true

  const abandonada = estado.value !== "finalizando"

  fetch(`${supabaseUrl}/functions/v1/finalizar-desafio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabasePublishableKey,
      "Authorization": `Bearer ${tokenSesion}`
    },
    body: JSON.stringify({
      partidaId: partidaId.value,
      abandonada
    }),
    keepalive: true
  }).catch(error => {
    console.error("No se pudo enviar la finalización al cerrar:", error)
  })
}

window.addEventListener("pagehide", finalizarAlCerrar)

function iniciarCronometro(iniciadaEn) {
  detenerCronometro()

  const inicio = new Date(iniciadaEn).getTime()

  function actualizar() {
    tiempoTranscurrido.value = Math.max(
      0,
      Math.floor((Date.now() - inicio) / 1000)
    )
  }

  actualizar()
  intervaloCronometro = setInterval(actualizar, 1000)
}

function formatoTiempo(segundos) {
  const minutos = Math.floor(segundos / 60)
  const restantes = segundos % 60

  return `${String(minutos).padStart(2, "0")}:${String(restantes).padStart(2, "0")}`
}

async function iniciarCuentaRegresiva() {
  estado.value = "cuenta-regresiva"

  for (let numero = 3; numero >= 1; numero--) {
    cuentaRegresiva.value = numero
    await esperar(1000)
  }

  cuentaRegresiva.value = 0
}

async function iniciarPartida() {
  if (cargando.value) return

  cargando.value = true
  mensajeError.value = ""

  try {
    await actualizarTokenSesion()

    partidaId.value = await crearPartidaCompetitiva()

    const resultado = await iniciarDesafioCompetitivo(
      partidaId.value
    )

    grupoAsignado.value = resultado.grupo
    partidaActivaServidor = true
    solicitudCierreEnviada = false

    await iniciarCuentaRegresiva()

    const resultadoPregunta = await obtenerSiguientePregunta(
      partidaId.value
    )

    if (resultadoPregunta.finalizado) {
      throw new Error(
        "No hay preguntas disponibles para esta partida."
      )
    }

    preguntaActual.value = resultadoPregunta.pregunta

    iniciarCronometro(resultadoPregunta.iniciadaEn)

    estado.value = "jugando"
  } catch (error) {
    console.error("Error al iniciar el desafío:", error)

    mensajeError.value =
      error.message || "No se pudo iniciar el desafío."

    estado.value = "inicio"
  } finally {
    cargando.value = false
  }
}

async function seleccionarOpcion(opcionId) {
  if (
    enviandoRespuesta.value ||
    respuestaRegistrada.value ||
    resultadoRespuesta.value !== null
  ) {
    return
  }

  opcionSeleccionadaId.value = opcionId
  await confirmarRespuesta()
}

async function finalizarPartidaCompleta() {
  estado.value = "finalizando"
  mensajeError.value = ""

  try {
    const resultado = await finalizarDesafioCompetitivo(
      partidaId.value,
      false
    )

    detenerCronometro()
    partidaActivaServidor = false
    resultadoFinal.value = resultado
    estado.value = "resultados"
  } catch (error) {
    console.error("Error al finalizar el desafío:", error)

    mensajeError.value =
      error.message || "No se pudo finalizar la partida."
  }
}

async function confirmarRespuesta() {
  if (
    enviandoRespuesta.value ||
    !preguntaActual.value ||
    !opcionSeleccionadaId.value
  ) {
    return
  }

  enviandoRespuesta.value = true
  mensajeError.value = ""

  try {
    const correcta = await responderPreguntaCompetitiva(
      partidaId.value,
      preguntaActual.value.id,
      opcionSeleccionadaId.value
    )

    respuestaRegistrada.value = true
    resultadoRespuesta.value = correcta

    await esperar(900)

    await avanzarPregunta()
  } catch (error) {
    console.error("Error al procesar la respuesta:", error)

    mensajeError.value =
      error.message || "No se pudo procesar la respuesta."
  } finally {
    enviandoRespuesta.value = false
  }
}

async function avanzarPregunta() {
  const resultadoPregunta = await obtenerSiguientePregunta(
    partidaId.value
  )

  if (resultadoPregunta.finalizado) {
    await finalizarPartidaCompleta()
    return
  }

  preguntaActual.value = resultadoPregunta.pregunta
  opcionSeleccionadaId.value = null
  respuestaRegistrada.value = false
  resultadoRespuesta.value = null
  mensajeError.value = ""
}

async function reintentarAvance() {
  if (!respuestaRegistrada.value || enviandoRespuesta.value) {
    return
  }

  enviandoRespuesta.value = true
  mensajeError.value = ""

  try {
    await avanzarPregunta()
  } catch (error) {
    console.error("Error al cargar la siguiente pregunta:", error)

    mensajeError.value =
      error.message || "No se pudo cargar la siguiente pregunta."
  } finally {
    enviandoRespuesta.value = false
  }
}

async function confirmarAbandono() {
  if (!partidaId.value || enviandoRespuesta.value || cargando.value) {
    return
  }

  enviandoRespuesta.value = true
  mensajeError.value = ""

  try {
    const resultado = await finalizarDesafioCompetitivo(
      partidaId.value,
      true
    )

    detenerCronometro()
    partidaActivaServidor = false
    resultadoFinal.value = resultado
    mostrarConfirmacionAbandono.value = false
    estado.value = "resultados"
  } catch (error) {
    console.error("Error al abandonar el desafío:", error)

    mensajeError.value =
      error.message || "No se pudo finalizar la partida. Intentá nuevamente."
  } finally {
    enviandoRespuesta.value = false
  }
}

async function reintentarFinalizacion() {
  if (enviandoRespuesta.value) return

  enviandoRespuesta.value = true

  await finalizarPartidaCompleta()

  enviandoRespuesta.value = false
}

function volverAlInicio() {
  detenerCronometro()

  partidaActivaServidor = false
  solicitudCierreEnviada = false
  estado.value = "inicio"
  cargando.value = false
  enviandoRespuesta.value = false
  respuestaRegistrada.value = false
  mensajeError.value = ""
  partidaId.value = null
  grupoAsignado.value = null
  preguntaActual.value = null
  opcionSeleccionadaId.value = null
  resultadoRespuesta.value = null
  resultadoFinal.value = null
  tiempoTranscurrido.value = 0
}

onUnmounted(() => {
  detenerCronometro()
  window.removeEventListener("pagehide", finalizarAlCerrar)
  authListener.subscription.unsubscribe()
})
</script>

<template>
  <section class="pagina desafio">
    <header class="desafio__encabezado">
      <span class="etiqueta">PONÉ A PRUEBA TUS CONOCIMIENTOS</span>

      <h1>Desafío<span>.</span></h1>

      <p>
        Demostrá lo que sabés de programación, resolvé problemas
        y competí para alcanzar el primer puesto.
      </p>
    </header>

    <section v-if="estado === 'inicio'">
      <section class="desafio__hero">
        <div class="desafio__hero-contenido">
          <span class="desafio__insignia">CODELEARN COMPETITIVO</span>

          <h2>¿Estás listo para el desafío?</h2>

          <p>
            Enfrentate a preguntas de HTML, CSS, JavaScript y lógica.
            Cada respuesta correcta suma puntos. ¡Superá tus propios
            límites y escalá en el ranking!
          </p>
        </div>

        <div class="desafio__icono" aria-hidden="true">&lt;/&gt;</div>
      </section>

      <section class="desafio__modos">
        <article class="desafio__modo">
          <span class="desafio__modo-icono">01</span>

          <h3>Modo competitivo</h3>

          <p>
            Participá con tu cuenta, acumulá puntos y competí
            por un lugar en el ranking general.
          </p>

          <ul>
            <li>20 preguntas por partida</li>
            <li>10 puntos por respuesta correcta</li>
            <li>Registro de tu mejor resultado</li>
          </ul>

          <button
            class="desafio__boton"
            type="button"
            :disabled="cargando"
            @click="iniciarPartida"
          >
            {{ cargando ? "Preparando desafío..." : "Iniciar desafío" }}
          </button>
        </article>

        <article class="desafio__modo">
          <span class="desafio__modo-icono desafio__modo-icono--azul">02</span>

          <h3>Modo práctica</h3>

          <p>
            Entrená tus conocimientos sin necesidad de registrarte
            y familiarizate con los desafíos.
          </p>

          <ul>
            <li>5 preguntas por partida</li>
            <li>Preguntas de distintas categorías</li>
            <li>Podés jugar todas las veces que quieras</li>
          </ul>
        </article>
      </section>
    </section>

    <section
      v-if="estado === 'cuenta-regresiva'"
      class="desafio__partida desafio__cuenta-contenedor"
    >
      <span class="etiqueta">PREPARATE</span>

      <h2>El desafío comienza en</h2>

      <strong class="desafio__cuenta">{{ cuentaRegresiva }}</strong>
    </section>

    <section
      v-if="estado === 'jugando' && preguntaActual"
      class="desafio__partida"
    >
      <div class="desafio__partida-encabezado">
        <div>
          <span class="etiqueta">DESAFÍO COMPETITIVO</span>

          <p class="desafio__grupo">
            Grupo {{ grupoAsignado }}
          </p>
        </div>

        <strong class="desafio__cronometro">
          {{ formatoTiempo(tiempoTranscurrido) }}
        </strong>
      </div>

      <h2>{{ preguntaActual.enunciado }}</h2>

      <pre
        v-if="preguntaActual.contenido"
        class="desafio__contenido"
      >{{ preguntaActual.contenido }}</pre>

      <div class="desafio__opciones">
        <button
          v-for="(opcion, indice) in preguntaActual.opciones"
          :key="opcion.id"
          type="button"
          class="desafio__opcion"
          :class="{
            'desafio__opcion--seleccionada':
              opcionSeleccionadaId === opcion.id &&
              resultadoRespuesta === null,
            'desafio__opcion--correcta':
              opcionSeleccionadaId === opcion.id &&
              resultadoRespuesta === true,
            'desafio__opcion--incorrecta':
              opcionSeleccionadaId === opcion.id &&
              resultadoRespuesta === false
          }"
          :disabled="enviandoRespuesta || respuestaRegistrada"
          @click="seleccionarOpcion(opcion.id)"
        >
          <strong>{{ String.fromCharCode(65 + indice) }}</strong>

          <span>{{ opcion.texto }}</span>
        </button>
      </div>

      <p
        v-if="resultadoRespuesta === true"
        class="desafio__ayuda desafio__ayuda--correcta"
      >
        ¡Respuesta correcta! +10 puntos.
      </p>

      <p
        v-else-if="resultadoRespuesta === false"
        class="desafio__ayuda desafio__ayuda--incorrecta"
      >
        Respuesta incorrecta. No sumaste puntos.
      </p>

      <p
        v-else-if="enviandoRespuesta && !respuestaRegistrada"
        class="desafio__ayuda"
      >
        Registrando respuesta...
      </p>

      <p v-else class="desafio__ayuda">
        Seleccioná una opción para responder. No podrás cambiarla después.
      </p>

      <button
        v-if="respuestaRegistrada && mensajeError"
        class="desafio__boton"
        type="button"
        :disabled="enviandoRespuesta"
        @click="reintentarAvance"
      >
        {{ enviandoRespuesta ? "Cargando..." : "Reintentar cargar pregunta" }}
      </button>

      <button
        class="boton-abandonar"
        type="button"
        :disabled="enviandoRespuesta || cargando"
        @click="mostrarConfirmacionAbandono = true"
      >
        Abandonar desafío
      </button>
    </section>

    <!-- Confirmación de abandono -->
    <div
      v-if="mostrarConfirmacionAbandono"
      class="desafio__modal-overlay"
      role="presentation"
    >
      <section
        class="desafio__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-abandono"
      >
        <span class="etiqueta">ABANDONAR PARTIDA</span>

        <h2 id="titulo-abandono">
          ¿Estás seguro?
        </h2>

        <p>
          ¿Estás seguro de que querés abandonar el desafío?
          Si salís, la partida se dará por finalizada, conservarás
          los puntos obtenidos y comenzará el período de espera
          de 30 minutos.
        </p>

        <p v-if="mensajeError" class="desafio__error">
          {{ mensajeError }}
        </p>

        <div class="desafio__modal-acciones">
          <button
            class="desafio__boton"
            type="button"
            :disabled="enviandoRespuesta"
            @click="mostrarConfirmacionAbandono = false"
          >
            Continuar jugando
          </button>

          <button
            class="boton-abandonar"
            type="button"
            :disabled="enviandoRespuesta"
            @click="confirmarAbandono"
          >
            {{
              enviandoRespuesta
                ? "Finalizando partida..."
                : "Abandonar desafío"
            }}
          </button>
        </div>
      </section>
    </div>

    <section
      v-if="estado === 'finalizando'"
      class="desafio__partida desafio__resultado"
    >
      <span class="etiqueta">DESAFÍO COMPLETADO</span>

      <h2>Registrando tu resultado...</h2>

      <p>Estamos guardando tu puntaje y tu tiempo.</p>

      <button
        class="desafio__boton"
        type="button"
        :disabled="enviandoRespuesta"
        @click="reintentarFinalizacion"
      >
        Reintentar finalización
      </button>
    </section>

    <section
      v-if="estado === 'resultados' && resultadoFinal"
      class="desafio__partida desafio__resultado"
    >
      <span class="etiqueta">
        {{ resultadoFinal.estado === "abandonada"
          ? "PARTIDA ABANDONADA"
          : "DESAFÍO COMPLETADO" }}
      </span>

      <h2>
        {{ resultadoFinal.estado === "abandonada"
          ? "Abandonaste la partida"
          : "¡Terminaste la partida!" }}
      </h2>

      <div class="desafio__resultado-grid">
        <article>
          <span>Puntaje obtenido</span>
          <strong>{{ resultadoFinal.puntaje }} / 200</strong>
        </article>

        <article>
          <span>Tiempo total</span>
          <strong>
            {{ formatoTiempo(resultadoFinal.tiempoSegundos) }}
          </strong>
        </article>
      </div>

      <p v-if="resultadoFinal.actualizoRanking">
        Tu resultado se registró o mejoró tu récord en el ranking.
      </p>

      <p v-else>
        Tu mejor resultado anterior se mantiene en el ranking.
      </p>

      <RouterLink
        to="/ranking"
        class="desafio__boton desafio__boton--ranking"
      >
        Ver tabla de posiciones
      </RouterLink>

      <button
        class="desafio__boton"
        type="button"
        @click="volverAlInicio"
      >
        Volver al desafío
      </button>
    </section>

    <p
      v-if="mensajeError && !mostrarConfirmacionAbandono"
      class="desafio__error"
    >
      {{ mensajeError }}
    </p>

    <section
      v-if="estado === 'inicio'"
      class="desafio__reglas"
    >
      <div>
        <span class="etiqueta">ANTES DE EMPEZAR</span>
        <h2>Reglas del desafío</h2>
      </div>

      <div class="desafio__reglas-grid">
        <article>
          <strong>01</strong>
          <div>
            <h3>Una respuesta definitiva</h3>
            <p>
              Una vez seleccionada, no podrás modificar tu respuesta
              ni volver a la pregunta anterior.
            </p>
          </div>
        </article>

        <article>
          <strong>02</strong>
          <div>
            <h3>Sin límite por pregunta</h3>
            <p>
              Podrás pensar el tiempo que necesites. El tiempo total
              de la partida quedará registrado.
            </p>
          </div>
        </article>

        <article>
          <strong>03</strong>
          <div>
            <h3>Partida no interrumpible</h3>
            <p>
              Si abandonás o perdés la conexión, la partida finalizará
              con los puntos acumulados.
            </p>
          </div>
        </article>

        <article>
          <strong>04</strong>
          <div>
            <h3>Empates</h3>
            <p>
              Si dos participantes igualan puntaje y tiempo,
              deberán resolver un desempate especial.
            </p>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>

<style scoped>
.desafio__encabezado {
  margin-bottom: 25px;
}

.desafio__encabezado .etiqueta,
.desafio__reglas .etiqueta {
  color: #7791a3;
}

.desafio__encabezado h1 {
  margin: 9px 0;
}

.desafio__encabezado h1 span {
  color: var(--color-accent);
}

.desafio__encabezado p {
  max-width: 650px;
  margin: 0;
  line-height: 1.7;
}

.desafio__hero {
  display: flex;
  min-height: 230px;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  padding: 30px 36px;
  border: 1px solid rgba(140, 230, 172, 0.2);
  border-radius: 17px;
  background:
    radial-gradient(circle at 85% 50%, rgba(85, 201, 130, 0.15), transparent 35%),
    linear-gradient(120deg, #112638, #0d1a29);
}

.desafio__hero-contenido {
  max-width: 650px;
}

.desafio__insignia {
  color: var(--color-accent);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 1.2px;
}

.desafio__hero h2 {
  margin: 13px 0 10px;
  font-size: clamp(1.6rem, 3vw, 2.3rem);
}

.desafio__hero p {
  margin: 0;
  color: #a3b5c0;
  line-height: 1.75;
}

.desafio__icono {
  display: grid;
  width: 125px;
  height: 125px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgba(140, 230, 172, 0.25);
  border-radius: 25px;
  background: rgba(140, 230, 172, 0.07);
  color: var(--color-accent);
  font-family: "Space Grotesk", sans-serif;
  font-size: 2.3rem;
  font-weight: 700;
}

.desafio__modos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 22px;
}

.desafio__modo {
  padding: 23px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: linear-gradient(145deg, #112235, #0d1a29);
}

.desafio__modo-icono {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid rgba(140, 230, 172, 0.25);
  border-radius: 10px;
  background: rgba(140, 230, 172, 0.08);
  color: var(--color-accent);
  font-size: 0.75rem;
  font-weight: 700;
}

.desafio__modo-icono--azul {
  border-color: rgba(139, 185, 231, 0.25);
  background: rgba(139, 185, 231, 0.08);
  color: var(--color-blue);
}

.desafio__modo h3 {
  margin: 16px 0 7px;
  font-size: 1.1rem;
}

.desafio__modo p,
.desafio__modo li {
  color: var(--color-muted);
  font-size: 0.83rem;
  line-height: 1.7;
}

.desafio__modo ul {
  display: grid;
  gap: 5px;
  margin: 15px 0 0;
  padding-left: 18px;
}

.desafio__reglas {
  margin-top: 35px;
}

.desafio__reglas h2 {
  margin: 7px 0 18px;
  font-size: 1.45rem;
}

.desafio__reglas-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.desafio__reglas-grid article {
  display: flex;
  gap: 14px;
  padding: 17px;
  border: 1px solid rgba(137, 163, 190, 0.15);
  border-radius: 12px;
  background: rgba(17, 34, 53, 0.65);
}

.desafio__reglas-grid article > strong {
  color: var(--color-accent);
  font-size: 0.8rem;
}

.desafio__reglas-grid h3 {
  margin: 0 0 5px;
  font-size: 0.88rem;
}

.desafio__reglas-grid p {
  margin: 0;
  font-size: 0.77rem;
  line-height: 1.6;
}

.desafio__nota {
  margin-top: 22px;
  font-size: 0.76rem;
  text-align: center;
}

.desafio__boton {
  width: 100%;
  margin-top: 20px;
  padding: 12px 18px;
  border: 0;
  border-radius: 9px;
  background: var(--color-accent);
  color: #10251b;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
}

.desafio__boton:hover:not(:disabled) {
  transform: translateY(-2px);
}

.desafio__boton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.desafio__boton--ranking {
  display: block;
  border: 1px solid rgba(140, 230, 172, 0.35);
  background: rgba(140, 230, 172, 0.08);
  color: var(--color-accent);
  text-align: center;
  text-decoration: none;
}

.desafio__partida {
  margin-top: 25px;
  padding: 30px;
  border: 1px solid var(--color-border);
  border-radius: 15px;
  background: linear-gradient(145deg, #112235, #0d1a29);
}

.desafio__partida-encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 25px;
}

.desafio__grupo {
  margin: 6px 0 0;
  color: var(--color-muted);
  font-size: 0.8rem;
}

.desafio__cronometro {
  color: var(--color-accent);
  font-variant-numeric: tabular-nums;
  font-size: 1.2rem;
}

.desafio__cuenta-contenedor {
  text-align: center;
}

.desafio__cuenta {
  display: block;
  margin-top: 20px;
  color: var(--color-accent);
  font-size: 6rem;
}

.desafio__partida h2 {
  margin: 15px 0;
  font-size: 1.4rem;
  line-height: 1.5;
}

.desafio__contenido {
  overflow-x: auto;
  margin: 20px 0;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: #091522;
  color: var(--color-accent);
  white-space: pre-wrap;
}

.desafio__opciones {
  display: grid;
  gap: 12px;
  margin-top: 25px;
}

.desafio__opcion {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: rgba(17, 34, 53, 0.7);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.desafio__opcion:hover:not(:disabled) {
  border-color: rgba(140, 230, 172, 0.55);
}

.desafio__opcion--seleccionada {
  border-color: var(--color-accent);
  background: rgba(140, 230, 172, 0.12);
}

.desafio__opcion--correcta {
  border-color: #36c978;
  background: rgba(54, 201, 120, 0.16);
  color: #7ce6a7;
}

.desafio__opcion--incorrecta {
  border-color: #ed5555;
  background: rgba(237, 85, 85, 0.16);
  color: #ff8585;
}

.desafio__ayuda--correcta {
  color: #7ce6a7;
}

.desafio__ayuda--incorrecta {
  color: #ff8585;
}

.desafio__opcion:disabled {
  cursor: not-allowed;
  opacity: 0.85;
}

.desafio__opcion strong {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 8px;
  background: rgba(140, 230, 172, 0.1);
  color: var(--color-accent);
}

.desafio__ayuda {
  margin: 18px 0 0;
  color: var(--color-muted);
  font-size: 0.8rem;
}

.desafio__boton--confirmar {
  margin-top: 16px;
}

/* Botón para abandonar el desafío */
.boton-abandonar {
  display: inline-flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
  padding: 12px 18px;
  border: 1px solid rgba(255, 100, 100, 0.3);
  border-radius: 9px;
  background: rgba(255, 100, 100, 0.07);
  color: #ff9999;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.boton-abandonar:hover:not(:disabled) {
  border-color: #ff7777;
  background: rgba(255, 100, 100, 0.15);
}

.boton-abandonar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Ventana de confirmación */
.desafio__modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(5, 12, 25, 0.78);
  backdrop-filter: blur(6px);
}

.desafio__modal {
  width: 100%;
  max-width: 480px;
  padding: 30px;
  border: 1px solid var(--color-border);
  border-radius: 15px;
  background: linear-gradient(145deg, #112235, #0d1a29);
  color: inherit;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.4);
}

.desafio__modal h2 {
  margin: 15px 0;
  font-size: 1.4rem;
}

.desafio__modal p {
  color: var(--color-muted);
  line-height: 1.7;
}

.desafio__modal-acciones {
  display: grid;
  gap: 10px;
  margin-top: 24px;
}

.desafio__modal-acciones .desafio__boton,
.desafio__modal-acciones .boton-abandonar {
  margin-top: 0;
}

.desafio__resultado {
  text-align: center;
}

.desafio__resultado-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin: 25px 0;
}

.desafio__resultado-grid article {
  display: grid;
  gap: 10px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: rgba(17, 34, 53, 0.7);
}

.desafio__resultado-grid span {
  color: var(--color-muted);
  font-size: 0.85rem;
}

.desafio__resultado-grid strong {
  color: var(--color-accent);
  font-size: 1.6rem;
  font-variant-numeric: tabular-nums;
}

.desafio__error {
  margin-top: 18px;
  padding: 12px;
  border: 1px solid rgba(255, 100, 100, 0.3);
  border-radius: 9px;
  color: #ff9999;
  text-align: center;
}

@media (max-width: 700px) {
  .desafio__hero {
    padding: 23px;
  }

  .desafio__icono {
    display: none;
  }

  .desafio__modos,
  .desafio__reglas-grid,
  .desafio__resultado-grid {
    grid-template-columns: 1fr;
  }

  .desafio__partida {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .desafio__modal {
    padding: 22px;
  }
}
</style>
