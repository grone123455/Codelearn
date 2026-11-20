

<template>
  <section class="monkey-game">
    <header class="game-header">
      <div>
        <span class="game-eyebrow">CODELEARN ARCADE</span>
        <h1>Monkey Run: <span>Error Escape</span></h1>
        <p>Esquivá los errores. Sobreviví todo lo posible.</p>
      </div>

      <button
        v-if="estado === 'listo' && !errorEnfrentamiento && !cargandoEnfrentamiento"
        class="game-button"
        :disabled="iniciandoIntento"
        @click="iniciarJuego"
      >
        {{ iniciandoIntento ? "Iniciando..." : "Comenzar partida" }}
      </button>
    </header>

    <div
      v-if="modoCompetitivo && cargandoEnfrentamiento"
      class="game-message"
    >
      Cargando enfrentamiento...
    </div>

    <div v-if="errorEnfrentamiento" class="game-message error">
      {{ errorEnfrentamiento }}
    </div>

    <div
      v-if="modoCompetitivo && enfrentamiento && !errorEnfrentamiento"
      class="game-message"
    >
      <strong>Modo competitivo</strong>
      <span>Puntaje en disputa: {{ enfrentamiento.puntaje_empatado }}</span>
    </div>

    <div class="game-hud">
      <div class="hud-item">
        <small>PUNTUACIÓN</small>
        <strong>{{ puntuacion }}</strong>
      </div>

      <div class="hud-item">
        <small>TIEMPO</small>
        <strong>{{ tiempo }}s</strong>
      </div>

      <div class="hud-item lives">
        <small>VIDAS</small>
        <div class="life-list">
          <span
            v-for="vida in vidas"
            :key="vida.nombre"
            :class="{ lost: !vida.activa }"
          >
            {{ vida.nombre }}
          </span>
        </div>
      </div>
    </div>

    <div class="game-board">
      <canvas
        ref="canvas"
        width="960"
        height="420"
        aria-label="Escenario de Monkey Run"
      />

      <div v-if="estado !== 'jugando'" class="game-overlay">
        <div class="overlay-content">
          <span class="overlay-icon">
            {{ estado === 'terminado' ? '×' : '🍌' }}
          </span>

          <h2>
            {{
              estado === 'terminado'
                ? 'GAME OVER'
                : estado === 'listo'
                  ? 'Prepará tus reflejos'
                  : 'Monkey Run'
            }}
          </h2>

          <p v-if="estado === 'listo' && !errorEnfrentamiento">
            El mono necesita tu ayuda para escapar de la jungla digital.
          </p>

          <p v-if="cargandoEnfrentamiento">
            Verificando tu participación...
          </p>

          <template v-if="estado === 'terminado'">
            <p>Tu puntuación final</p>
            <strong class="final-score">{{ puntuacion }}</strong>
            <p>Tiempo sobrevivido: {{ tiempo }} segundos</p>

            <template v-if="modoCompetitivo">
              <p v-if="guardandoResultado">
                Guardando tu resultado...
              </p>

              <p v-else-if="resultadoGuardado" class="save-success">
                Resultado registrado correctamente.
              </p>

              <template v-else>
                <p class="save-error">
                  {{ errorGuardado || "No se pudo guardar tu resultado." }}
                </p>

                <button
                  class="game-button"
                  :disabled="guardandoResultado"
                  @click="guardarResultado"
                >
                  Reintentar guardado
                </button>
              </template>
            </template>

            <button
              v-if="!modoCompetitivo"
              class="game-button"
              @click="volverAJugar"
            >
              Volver a jugar
            </button>

            <p class="return-hint">
              Podés volver a CodeLearn desde el menú.
            </p>
          </template>

          <button
            v-if="estado === 'listo' && !errorEnfrentamiento && !cargandoEnfrentamiento"
            class="game-button"
            :disabled="iniciandoIntento"
            @click="iniciarJuego"
          >
            {{ iniciandoIntento ? "Iniciando..." : "Comenzar" }}
          </button>
        </div>
      </div>
    </div>

    <div class="game-controls">
      <p>
        <strong>PC:</strong> ESPACIO / ↑ para saltar · ↓ para deslizarse
      </p>

      <div class="touch-controls">
        <button
          class="control-button"
          :disabled="estado !== 'jugando'"
          @pointerdown.prevent="saltar"
        >
          <span>↑</span>
          SALTAR
        </button>

        <button
          class="control-button"
          :disabled="estado !== 'jugando'"
          @pointerdown.prevent="iniciarDeslizamiento"
          @pointerup.prevent="detenerDeslizamiento"
          @pointerleave="detenerDeslizamiento"
          @pointercancel="detenerDeslizamiento"
        >
          <span>↓</span>
          DESLIZAR
        </button>
      </div>
    </div>

    <div class="game-rules">
      <span>🍌 Verde +10</span>
      <span>🍌 Azul +20</span>
      <span>🍌 Violeta +30</span>
      <span>🍌 Dorada +50</span>
      <span>+1 por segundo</span>
    </div>
  </section>
</template>


<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import { useRoute } from "vue-router"
import { supabase } from "../services/supabase.js"

import {
  obtenerDesempate,
  iniciarDesempate,
  finalizarDesempate,
  abandonarDesempate
} from "../services/desempates.js"

import correrSrc from "../assets/monkey-run/correr/spritesheet_nuevo.png"
import saltarSrc from "../assets/monkey-run/saltar/spritesheet.png"
import deslizarSrc from "../assets/monkey-run/deslizar/spritesheet.png"
import danioSrc from "../assets/monkey-run/danio/spritesheet.png"
import derrotaSrc from "../assets/monkey-run/derrota/spritesheet.png"
import robotSrc from "../assets/monkey-run/robot/idle_izquierda.png"
import robotVirusSrc from "../assets/monkey-run/robot/virus.png"
import fondoSrc from "../assets/monkey-run/fondo/selva_tecnologica.png"
import bananaVerdeSrc from "../assets/monkey-run/bananas/banana_verde.png"
import bananaAzulSrc from "../assets/monkey-run/bananas/banana_azul.png"
import bananaVioletaSrc from "../assets/monkey-run/bananas/banana_violeta.png"
import bananaDoradaSrc from "../assets/monkey-run/bananas/banana_dorada.png"

const route = useRoute()
const canvas = ref(null)

// El modo debe estar definido explícitamente en la URL.
const modo = route.query.modo
const modoValido = modo === "practica" || modo === "competitivo"

const modoCompetitivo = ref(modo === "competitivo")

// En modo práctica se ignora cualquier identificador de desempate.
const desempateId = modoCompetitivo.value
  ? typeof route.query.desempate === "string"
    ? route.query.desempate
    : null
  : null

const enfrentamiento = ref(null)

const cargandoEnfrentamiento = ref(
  modoCompetitivo.value && Boolean(desempateId)
)

const errorEnfrentamiento = ref(
  !modoValido
    ? "El modo de juego no es válido. Accedé desde el menú o desde una notificación."
    : modoCompetitivo.value && !desempateId
      ? "Falta el identificador del enfrentamiento."
      : ""
)

const resultadoGuardado = ref(false)
const guardandoResultado = ref(false)
const errorGuardado = ref("")
const iniciandoIntento = ref(false)
const intentoIniciado = ref(false)

const estado = ref("listo")
const puntuacion = ref(0)
const tiempo = ref(0)

const vidas = ref([
  { nombre: "HTML", activa: true },
  { nombre: "JS", activa: true },
  { nombre: "CSS", activa: true }
])

const imagenes = {}

const animaciones = {
  correr: { src: correrSrc, cuadros: 8, ancho: 192, alto: 312 },
  saltar: { src: saltarSrc, cuadros: 4, ancho: 128, alto: 210 },
  deslizar: { src: deslizarSrc, cuadros: 2, ancho: 256, alto: 224 },
  danio: { src: danioSrc, cuadros: 3, ancho: 256, alto: 224 },
  derrota: { src: derrotaSrc, cuadros: 3, ancho: 256, alto: 224 }
}

const animacionRobot = {
  src: robotSrc,
  cuadros: 7,
  ancho: 110,
  alto: 416,
  recorteX: 15,
  recorteY: 46,
  recorteAncho: 85,
  recorteAlto: 325,
  fps: 8
}

let ctx
let frameId = null
let ultimoFrame = 0
let tiempoAcumulado = 0
let tiempoInvulnerable = 0
let tiempoAnimacionDanio = 0
let intervaloObstaculo = 0
let intervaloBanana = 0

let obstaculos = []
let bananas = []
let particulas = []

let sueloOffset = 0
let velocidad = 360
let presionandoDeslizar = false
let cargando = true
let juegoTerminado = false

const jugador = {
  x: 130,
  y: 0,
  ancho: 94,
  alto: 110,
  velocidadY: 0,
  enSuelo: true,
  deslizando: false,
  recibiendoDanio: false,
  frame: 0,
  animacion: "correr"
}

const GRAVEDAD = 1800
const FUERZA_SALTO = -680
const ALTURA_SUELO = 340

const coloresBananas = [
  { color: "#55e68b", puntos: 10 },
  { color: "#55c9ff", puntos: 20 },
  { color: "#bd78ff", puntos: 30 },
  { color: "#ffd45c", puntos: 50 }
]

// Validar el acceso al enfrentamiento competitivo.
async function cargarEnfrentamiento() {
  if (!modoCompetitivo.value || !desempateId) return

  try {
    cargandoEnfrentamiento.value = true
    errorEnfrentamiento.value = ""

    const datos = await obtenerDesempate(desempateId)

    if (!datos) {
      throw new Error("No se encontró el enfrentamiento.")
    }

    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    const usuarioId = data.session?.user?.id

    if (!usuarioId) {
      throw new Error("Tenés que iniciar sesión.")
    }

    const participante = datos.participantes?.find(
      (p) => p.usuario_id === usuarioId
    )

    if (!participante) {
      throw new Error("No participás en este enfrentamiento.")
    }

    if (datos.estado === "resuelto") {
      throw new Error("Este enfrentamiento ya fue resuelto.")
    }

    if (participante.estado !== "pendiente") {
      throw new Error("Ya utilizaste tu intento en este enfrentamiento.")
    }

    enfrentamiento.value = datos
  } catch (error) {
    errorEnfrentamiento.value =
      error.message || "No se pudo cargar el enfrentamiento."
  } finally {
    cargandoEnfrentamiento.value = false
  }
}

function cargarImagenes() {
  const promesas = Object.entries(animaciones).map(([nombre, datos]) => {
    return new Promise((resolve) => {
      const imagen = new Image()

      imagen.onload = () => {
        imagenes[nombre] = imagen
        resolve()
      }

      imagen.onerror = () => {
        console.error(`No se pudo cargar la animación: ${nombre}`)
        resolve()
      }

      imagen.src = datos.src
    })
  })

  const promesaRobot = new Promise((resolve) => {
    const imagen = new Image()

    imagen.onload = () => {
      imagenes.robot = imagen
      resolve()
    }

    imagen.onerror = () => {
      console.error("No se pudo cargar el spritesheet del robot")
      resolve()
    }

    imagen.src = animacionRobot.src
  })

  const promesaRobotVirus = new Promise((resolve) => {
    const imagen = new Image()

    imagen.onload = () => {
      imagenes.robotVirus = imagen
      resolve()
    }

    imagen.onerror = () => {
      console.error("No se pudo cargar el robot virus")
      resolve()
    }

    imagen.src = robotVirusSrc
  })

  const promesaFondo = new Promise((resolve) => {
    const imagen = new Image()

    imagen.onload = () => {
      imagenes.fondo = imagen
      resolve()
    }

    imagen.onerror = () => {
      console.error("No se pudo cargar el fondo de la selva tecnológica")
      resolve()
    }

    imagen.src = fondoSrc
  })

  const promesasBananas = [
    ["bananaVerde", bananaVerdeSrc],
    ["bananaAzul", bananaAzulSrc],
    ["bananaVioleta", bananaVioletaSrc],
    ["bananaDorada", bananaDoradaSrc]
  ].map(([nombre, src]) => {
    return new Promise((resolve) => {
      const imagen = new Image()

      imagen.onload = () => {
        imagenes[nombre] = imagen
        resolve()
      }

      imagen.onerror = () => {
        console.error(`No se pudo cargar la imagen: ${nombre}`)
        resolve()
      }

      imagen.src = src
    })
  })

  return Promise.all([
    ...promesas,
    promesaRobot,
    promesaRobotVirus,
    promesaFondo,
    ...promesasBananas
  ])
}

function reiniciarEstado() {
  puntuacion.value = 0
  tiempo.value = 0

  vidas.value.forEach((vida) => {
    vida.activa = true
  })

  jugador.y = ALTURA_SUELO - jugador.alto
  jugador.velocidadY = 0
  jugador.enSuelo = true
  jugador.deslizando = false
  jugador.recibiendoDanio = false
  jugador.frame = 0
  jugador.animacion = "correr"

  obstaculos = []
  bananas = []
  particulas = []

  velocidad = 360
  sueloOffset = 0
  tiempoAcumulado = 0
  tiempoInvulnerable = 0
  tiempoAnimacionDanio = 0
  intervaloObstaculo = 0
  intervaloBanana = 0

  presionandoDeslizar = false
  juegoTerminado = false
}

// Iniciar el intento en Supabase antes de comenzar el juego.
async function iniciarJuego() {
  if (
    cargando ||
    estado.value === "jugando" ||
    cargandoEnfrentamiento.value ||
    errorEnfrentamiento.value ||
    iniciandoIntento.value
  ) return

  iniciandoIntento.value = true

  try {
    if (modoCompetitivo.value) {
      await iniciarDesempate(desempateId)
      intentoIniciado.value = true
    }

    reiniciarEstado()
    estado.value = "jugando"

    ultimoFrame = performance.now()
    frameId = requestAnimationFrame(actualizar)
  } catch (error) {
    errorEnfrentamiento.value =
      error.message || "No se pudo iniciar el enfrentamiento."
  } finally {
    iniciandoIntento.value = false
  }
}


// Reiniciar la partida únicamente en modo práctica.
function volverAJugar() {
  if (
    modoCompetitivo.value ||
    estado.value !== "terminado" ||
    cargando
  ) return

  reiniciarEstado()

  estado.value = "jugando"

  ultimoFrame = performance.now()
  frameId = requestAnimationFrame(actualizar)
}


// Comprobar si Supabase ya registró el resultado.
// Esto evita duplicar el envío si se perdió la respuesta de la primera RPC.
async function comprobarResultadoGuardado() {
  const datos = await obtenerDesempate(desempateId)

  const { data, error } = await supabase.auth.getSession()

  if (error) throw error

  const usuarioId = data.session?.user?.id

  if (!usuarioId) {
    throw new Error("No se pudo verificar la sesión del usuario.")
  }

  const participante = datos.participantes?.find(
    (p) => p.usuario_id === usuarioId
  )

  if (!participante) {
    throw new Error("No se encontró tu participación en el enfrentamiento.")
  }

  return participante.estado === "completado"
}

// Guardar el resultado competitivo al finalizar el juego.
async function guardarResultado() {
  if (
    !modoCompetitivo.value ||
    !desempateId ||
    !intentoIniciado.value ||
    resultadoGuardado.value ||
    guardandoResultado.value
  ) return

  guardandoResultado.value = true
  errorGuardado.value = ""

  try {
    await finalizarDesempate(
      desempateId,
      puntuacion.value,
      tiempo.value
    )

    resultadoGuardado.value = true
    intentoIniciado.value = false
  } catch (error) {
    // La RPC pudo haberse ejecutado aunque la respuesta no haya llegado.
    try {
      const yaGuardado = await comprobarResultadoGuardado()

      if (yaGuardado) {
        resultadoGuardado.value = true
        intentoIniciado.value = false
        return
      }
    } catch (errorVerificacion) {
      console.error(
        "No se pudo verificar el resultado:",
        errorVerificacion
      )
    }

    errorGuardado.value =
      error.message || "No se pudo registrar el resultado."
  } finally {
    guardandoResultado.value = false
  }
}

function saltar() {
  if (
    estado.value !== "jugando" ||
    !jugador.enSuelo
  ) return

  jugador.velocidadY = FUERZA_SALTO
  jugador.enSuelo = false
  jugador.deslizando = false
  jugador.animacion = "saltar"
  jugador.frame = 0
}

function iniciarDeslizamiento() {
  if (estado.value !== "jugando" || !jugador.enSuelo) return

  presionandoDeslizar = true
  jugador.deslizando = true
  jugador.animacion = "deslizar"
}

function detenerDeslizamiento() {
  presionandoDeslizar = false

  if (jugador.deslizando) {
    jugador.deslizando = false
    jugador.animacion = "correr"
    jugador.frame = 0
  }
}

function cambiarAnimacion(nombre) {
  if (jugador.animacion === nombre) return

  jugador.animacion = nombre
  jugador.frame = 0
}

function actualizarJugador(dt) {
  if (!jugador.enSuelo) {
    jugador.velocidadY += GRAVEDAD * dt
    jugador.y += jugador.velocidadY * dt

    if (jugador.y >= ALTURA_SUELO - jugador.alto) {
      jugador.y = ALTURA_SUELO - jugador.alto
      jugador.velocidadY = 0
      jugador.enSuelo = true
    }
  }

  if (tiempoAnimacionDanio > 0) {
    tiempoAnimacionDanio -= dt

    if (tiempoAnimacionDanio <= 0) {
      tiempoAnimacionDanio = 0
      jugador.recibiendoDanio = false
    }
  }

  if (tiempoInvulnerable > 0) {
    tiempoInvulnerable -= dt

    if (tiempoInvulnerable < 0) {
      tiempoInvulnerable = 0
    }
  }

  if (jugador.recibiendoDanio) {
    cambiarAnimacion("danio")
  } else if (!jugador.enSuelo) {
    cambiarAnimacion("saltar")
  } else if (presionandoDeslizar && jugador.deslizando) {
    cambiarAnimacion("deslizar")
  } else {
    jugador.deslizando = false
    cambiarAnimacion("correr")
  }

  const datos = animaciones[jugador.animacion]
  const velocidadAnimacion = jugador.animacion === "correr" ? 12 : 8

  jugador.frame += velocidadAnimacion * dt

  if (jugador.frame >= datos.cuadros) {
    jugador.frame = 0
  }
}

function crearObstaculo() {
  const esError = Math.random() < 0.5

  const obstaculo = esError
    ? {
        ancho: 35,
        alto: 95,
        tipo: "error"
      }
    : {
        ancho: 21,
        alto: 95,
        tipo: "robot"
      }

  obstaculos.push({
    x: 1000,
    y: ALTURA_SUELO - obstaculo.alto,
    ...obstaculo,
    frame: 0,
    tiempoAnimacion: 0
  })
}

function crearBanana() {
  const seleccion = coloresBananas[
    Math.floor(Math.random() * coloresBananas.length)
  ]

  bananas.push({
    x: 1000,
    y: ALTURA_SUELO - 90 - Math.random() * 110,
    radio: 15,
    color: seleccion.color,
    puntos: seleccion.puntos,
    recogida: false
  })
}

function crearParticulas(x, y, color) {
  for (let i = 0; i < 10; i++) {
    particulas.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 220,
      vy: (Math.random() - 0.5) * 220,
      vida: 0.5,
      color
    })
  }
}

function detectarColision(a, b) {
  return (
    a.x < b.x + b.ancho &&
    a.x + a.ancho > b.x &&
    a.y < b.y + b.alto &&
    a.y + a.alto > b.y
  )
}

function recibirDanio() {
  if (tiempoInvulnerable > 0 || juegoTerminado) return

  const vidaDisponible = vidas.value.find((vida) => vida.activa)

  if (!vidaDisponible) return

  vidaDisponible.activa = false

  tiempoInvulnerable = 1.5
  tiempoAnimacionDanio = 0.4
  jugador.recibiendoDanio = true

  cambiarAnimacion("danio")

  crearParticulas(jugador.x + 40, jugador.y + 50, "#ff6262")

  if (!vidas.value.some((vida) => vida.activa)) {
    terminarJuego()
  }
}

function comprobarColisiones() {
  const alturaJugador = jugador.deslizando ? 58 : jugador.alto

  const cajaJugador = {
    x: jugador.x + 15,
    y: jugador.y + (jugador.deslizando ? 52 : 12),
    ancho: jugador.ancho - 30,
    alto: alturaJugador - 18
  }

  obstaculos.forEach((obstaculo) => {
    if (detectarColision(cajaJugador, obstaculo)) {
      recibirDanio()
    }
  })

  bananas.forEach((banana) => {
    const dx = jugador.x + jugador.ancho / 2 - banana.x
    const dy = jugador.y + jugador.alto / 2 - banana.y

    if (Math.sqrt(dx * dx + dy * dy) < 48 && !banana.recogida) {
      banana.recogida = true
      puntuacion.value += banana.puntos

      crearParticulas(banana.x, banana.y, banana.color)
    }
  })

  obstaculos = obstaculos.filter(
    (objeto) => objeto.x + objeto.ancho > 0
  )

  bananas = bananas.filter(
    (objeto) => objeto.x + objeto.radio > 0 && !objeto.recogida
  )
}

// Terminar el juego y registrar el resultado si es competitivo.
function terminarJuego() {
  if (juegoTerminado) return

  juegoTerminado = true
  estado.value = "terminado"
  jugador.animacion = "derrota"
  jugador.frame = 0

  if (frameId) {
    cancelAnimationFrame(frameId)
    frameId = null
  }

  dibujar()

  if (modoCompetitivo.value) {
    guardarResultado()
  }
}

function actualizarPartida(dt) {
  tiempoAcumulado += dt
  tiempo.value = Math.floor(tiempoAcumulado)

  if (Math.floor(tiempoAcumulado) > Math.floor(tiempoAcumulado - dt)) {
    puntuacion.value += 1
  }

  velocidad = Math.min(360 + tiempoAcumulado * 7, 650)

  sueloOffset = (sueloOffset + velocidad * dt) % 80

  intervaloObstaculo += dt
  intervaloBanana += dt

  const frecuenciaObstaculos = Math.max(
    0.85,
    1.65 - tiempoAcumulado * 0.012
  )

  if (intervaloObstaculo >= frecuenciaObstaculos) {
    intervaloObstaculo = 0
    crearObstaculo()
  }

  if (intervaloBanana >= 1.7) {
    intervaloBanana = 0
    crearBanana()
  }

  obstaculos.forEach((obstaculo) => {
    obstaculo.x -= velocidad * dt

    if (obstaculo.tipo === "robot") {
      obstaculo.tiempoAnimacion += dt

      obstaculo.frame = Math.floor(
        obstaculo.tiempoAnimacion * animacionRobot.fps
      ) % animacionRobot.cuadros
    }
  })

  bananas.forEach((banana) => {
    banana.x -= velocidad * dt
  })

  particulas.forEach((particula) => {
    particula.x += particula.vx * dt
    particula.y += particula.vy * dt
    particula.vida -= dt
  })

  particulas = particulas.filter(
    (particula) => particula.vida > 0
  )

  actualizarJugador(dt)
  comprobarColisiones()
}

function dibujarFondo() {
  const imagen = imagenes.fondo

  if (imagen) {
    const escala = Math.max(
      960 / imagen.width,
      420 / imagen.height
    )

    const ancho = imagen.width * escala
    const alto = imagen.height * escala

    const x = (960 - ancho) / 2
    const y = (420 - alto) / 2

    ctx.drawImage(imagen, x, y, ancho, alto)

    // Oscurecimiento suave para mejorar la visibilidad
    // de los personajes y obstáculos.
    ctx.fillStyle = "rgba(3, 15, 20, 0.18)"
    ctx.fillRect(0, 0, 960, 420)
  } else {
    ctx.fillStyle = "#102d29"
    ctx.fillRect(0, 0, 960, 420)
  }

  // Suelo
  ctx.fillStyle = "#173b32"
  ctx.fillRect(0, ALTURA_SUELO, 960, 80)

  // Borde superior del suelo
  ctx.fillStyle = "#45db91"
  ctx.fillRect(0, ALTURA_SUELO, 960, 3)

  // Detalles del suelo en movimiento
  for (let x = -80; x < 1000; x += 80) {
    ctx.fillStyle = "rgba(76, 225, 143, 0.3)"
    ctx.fillRect(
      x - sueloOffset,
      ALTURA_SUELO + 18,
      32,
      3
    )
  }
}

function dibujarJugador() {
  const nombre = jugador.animacion
  const imagen = imagenes[nombre]

  if (!imagen) return

  const datos = animaciones[nombre]

  const cuadro = Math.min(
    Math.floor(jugador.frame),
    datos.cuadros - 1
  )

  let x = jugador.x
  let y = jugador.y
  let ancho = 104
  let alto = 110

  ctx.save()

  if (
    tiempoInvulnerable > 0 &&
    Math.floor(tiempoInvulnerable * 12) % 2 === 0
  ) {
    ctx.globalAlpha = 0.35
  }

  if (nombre === "correr") {
    ancho = 80
    alto = 130

    x += (jugador.ancho - ancho) / 2
    y = ALTURA_SUELO - alto * (305 / 312)

    ctx.drawImage(
      imagen,
      cuadro * datos.ancho,
      0,
      datos.ancho,
      datos.alto,
      x,
      y,
      ancho,
      alto
    )
  } else {
    if (nombre === "deslizar") {
      y += 35
    }

    ctx.drawImage(
      imagen,
      cuadro * datos.ancho,
      0,
      datos.ancho,
      datos.alto,
      x,
      y,
      ancho,
      alto
    )
  }

  ctx.restore()
}

function dibujarObstaculos() {
  obstaculos.forEach((obstaculo) => {
    ctx.save()

    if (obstaculo.tipo === "robot") {
      const imagen = imagenes.robot

      if (imagen) {
        const frame = obstaculo.frame || 0

        ctx.shadowBlur = 18
        ctx.shadowColor = "#ff334f"

        ctx.drawImage(
          imagen,
          frame * 110 + animacionRobot.recorteX,
          animacionRobot.recorteY,
          animacionRobot.recorteAncho,
          animacionRobot.recorteAlto,
          obstaculo.x,
          obstaculo.y,
          obstaculo.ancho,
          obstaculo.alto
        )
      }
    } else if (obstaculo.tipo === "error") {
      const imagen = imagenes.robotVirus

      if (imagen) {
        ctx.shadowBlur = 18
        ctx.shadowColor = "#ff526b"

        ctx.drawImage(
          imagen,
          obstaculo.x,
          obstaculo.y,
          obstaculo.ancho,
          obstaculo.alto
        )
      }
    }

    ctx.restore()
  })
}

function dibujarBananas() {
  bananas.forEach((banana) => {
    let imagen

    if (banana.puntos === 10) imagen = imagenes.bananaVerde
    else if (banana.puntos === 20) imagen = imagenes.bananaAzul
    else if (banana.puntos === 30) imagen = imagenes.bananaVioleta
    else if (banana.puntos === 50) imagen = imagenes.bananaDorada

    if (!imagen) return

    const ancho = 34
    const alto = 52

    ctx.save()

    ctx.shadowBlur = 12
    ctx.shadowColor = banana.color

    ctx.drawImage(
      imagen,
      banana.x - ancho / 2,
      banana.y - alto / 2,
      ancho,
      alto
    )

    ctx.restore()
  })
}

function dibujarParticulas() {
  particulas.forEach((particula) => {
    ctx.globalAlpha = Math.max(0, particula.vida * 2)
    ctx.fillStyle = particula.color
    ctx.fillRect(particula.x, particula.y, 4, 4)
  })

  ctx.globalAlpha = 1
}

function dibujar() {
  if (!ctx) return

  dibujarFondo()
  dibujarBananas()
  dibujarObstaculos()
  dibujarJugador()
  dibujarParticulas()
}

function actualizar(timestamp) {
  if (estado.value !== "jugando") return

  const dt = Math.min((timestamp - ultimoFrame) / 1000, 0.04)
  ultimoFrame = timestamp

  actualizarPartida(dt)
  dibujar()

  if (estado.value === "jugando") {
    frameId = requestAnimationFrame(actualizar)
  }
}

function manejarTeclado(evento) {
  if (evento.code === "Space" || evento.code === "ArrowUp") {
    evento.preventDefault()

    if (estado.value === "jugando") {
      saltar()
    }
  }

  if (evento.code === "ArrowDown") {
    evento.preventDefault()

    if (estado.value === "jugando") {
      iniciarDeslizamiento()
    }
  }
}

function soltarTecla(evento) {
  if (evento.code === "ArrowDown") {
    detenerDeslizamiento()
  }
}

onMounted(async () => {
  ctx = canvas.value.getContext("2d")

  await Promise.all([
    cargarImagenes(),
    cargarEnfrentamiento()
  ])

  cargando = false

  jugador.y = ALTURA_SUELO - jugador.alto

  dibujar()

  window.addEventListener("keydown", manejarTeclado)
  window.addEventListener("keyup", soltarTecla)
})

onUnmounted(() => {
  if (frameId) {
    cancelAnimationFrame(frameId)
  }

  window.removeEventListener("keydown", manejarTeclado)
  window.removeEventListener("keyup", soltarTecla)

  // Registrar abandono si sale de la vista mientras juega.
  if (
    modoCompetitivo.value &&
    intentoIniciado.value &&
    !resultadoGuardado.value &&
    estado.value === "jugando"
  ) {
    abandonarDesempate(desempateId).catch((error) => {
      console.error("No se pudo registrar el abandono:", error)
    })
  }
})
</script>



<style scoped>
.monkey-game {


  width: 100%;
  min-height: 100dvh;
  box-sizing: border-box;
  padding: clamp(12px, 2.5vw, 28px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(10px, 1.8vh, 20px);
  overflow-x: hidden;
  color: #fff;
  background:
    radial-gradient(ellipse at top, rgba(30, 90, 57, 0.25), transparent 65%),
    var(--game-dark);
}

.monkey-game *,
.monkey-game *::before,
.monkey-game *::after {
  box-sizing: border-box;
}

/* ENCABEZADO */
.game-header {
  width: min(100%, 960px);
  text-align: center;
}

.game-eyebrow {
  margin: 0 0 5px;
  color: var(--game-green);
  font-size: clamp(10px, 1.5vw, 13px);
  font-weight: 800;
  letter-spacing: 0.22em;
}

.game-title {
  margin: 0;
  font-size: clamp(24px, 5vw, 42px);
  line-height: 1.1;
  font-weight: 900;
}

.game-description {
  margin: 7px 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: clamp(11px, 1.8vw, 15px);
}

/* HUD */
.game-hud {
  width: min(100%, 960px);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(6px, 1.5vw, 14px);
}

.game-stat {
  min-width: 0;
  padding: clamp(8px, 1.5vw, 14px);
  border: 1px solid rgba(139, 227, 107, 0.2);
  border-radius: 12px;
  background: var(--game-panel);
  text-align: center;
}

.game-stat-label {
  display: block;
  color: rgba(255, 255, 255, 0.65);
  font-size: clamp(9px, 1.5vw, 12px);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.game-stat-value {
  display: block;
  margin-top: 3px;
  color: var(--game-green);
  font-size: clamp(17px, 3vw, 25px);
  font-weight: 900;
  line-height: 1.1;
}

/* ESCENARIO */
.game-board {
  position: relative;
  width: min(100%, 960px, calc((100dvh - 270px) * 16 / 7));
  aspect-ratio: 960 / 420;
  max-height: none;
  margin: auto;
  overflow: hidden;
  border: 2px solid rgba(139, 227, 107, 0.4);
  border-radius: clamp(8px, 1.5vw, 16px);
  background: #10251b;
  box-shadow:
    0 0 25px rgba(69, 190, 91, 0.12),
    0 12px 35px rgba(0, 0, 0, 0.35);
}

.game-board canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/* OVERLAY */
.game-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(6px, 1.5vh, 14px);
  padding: clamp(10px, 3vw, 28px);
  background: rgba(3, 12, 8, 0.82);
  text-align: center;
}

.game-overlay h2 {
  margin: 0;
  color: var(--game-green);
  font-size: clamp(22px, 5vw, 42px);
  font-weight: 900;
}

.game-overlay p {
  margin: 0;
  font-size: clamp(12px, 2vw, 17px);
}

.game-overlay .game-result {
  font-size: clamp(14px, 2.5vw, 21px);
  font-weight: 800;
}

/* BOTONES */
.game-button {
  max-width: 100%;
  padding: clamp(9px, 1.5vw, 13px) clamp(16px, 3vw, 26px);
  border: 0;
  border-radius: 9px;
  color: #07130f;
  background: var(--game-green);
  font-size: clamp(12px, 1.8vw, 15px);
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.2s, filter 0.2s;
}

.game-button:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
}

.game-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* MENSAJES Y CONTROLES */
.game-message {
  width: min(100%, 960px);
  margin: 0;
  color: rgba(255, 255, 255, 0.75);
  font-size: clamp(11px, 1.7vw, 14px);
  text-align: center;
}

.game-controls {
  width: min(100%, 960px);
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.game-return-hint {
  margin: 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: clamp(10px, 1.5vw, 12px);
  text-align: center;
}

/* ESTADOS */
.game-loading,
.game-error {
  width: min(100%, 960px);
  padding: 18px;
  border: 1px solid rgba(139, 227, 107, 0.2);
  border-radius: 12px;
  background: var(--game-panel);
  text-align: center;
}

/* TABLETS */
@media (max-width: 700px) {
  .monkey-game {
    gap: 12px;
    padding: 12px;
  }

  .game-board {
    width: min(100%, calc((100dvh - 240px) * 16 / 7));
  }

  .game-stat {
    border-radius: 9px;
  }
}

/* CELULARES */
@media (max-width: 420px) {
  .monkey-game {
    padding: 8px;
    gap: 9px;
  }

  .game-board {
    width: min(100%, calc((100dvh - 220px) * 16 / 7));
    border-width: 1px;
  }

  .game-hud {
    gap: 5px;
  }

  .game-stat {
    padding: 7px 4px;
  }

  .game-overlay {
    gap: 5px;
  }
}

/* PANTALLAS BAJAS, ESPECIALMENTE MÓVILES HORIZONTALES */
@media (max-height: 600px) {
  .monkey-game {
    min-height: 100dvh;
    padding-block: 6px;
    gap: 6px;
  }

  .game-header {
    flex-shrink: 0;
  }

  .game-title {
    font-size: clamp(19px, 4vh, 28px);
  }

  .game-description {
    margin-top: 3px;
  }

  .game-board {
    width: min(100%, calc((100dvh - 155px) * 16 / 7));
  }

  .game-stat {
    padding-block: 5px;
  }

  .game-stat-value {
    font-size: clamp(15px, 3vh, 21px);
  }

  .game-return-hint {
    font-size: 10px;
  }
}

@media (max-height: 420px) {
  .game-description {
    display: none;
  }

  .game-board {
    width: min(100%, calc((100dvh - 125px) * 16 / 7));
  }

  .game-overlay h2 {
    font-size: clamp(18px, 6vh, 28px);
  }
}
</style>


