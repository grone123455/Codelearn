
<template>
  <section class="monkey-game">
    <header class="game-header">
      <div>
        <span class="game-eyebrow">CODELEARN ARCADE</span>
        <h1>Monkey Run: <span>Error Escape</span></h1>
        <p>Esquivá los errores. Sobreviví todo lo posible.</p>
      </div>

      <button
        v-if="estado === 'listo'"
        class="game-button"
        @click="iniciarJuego"
      >
        Comenzar partida
      </button>
    </header>

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
            {{ estado === 'terminado'
              ? 'GAME OVER'
              : estado === 'listo'
                ? 'Prepará tus reflejos'
                : 'Monkey Run'
            }}
          </h2>

          <p v-if="estado === 'listo'">
            El mono necesita tu ayuda para escapar de la jungla digital.
          </p>

          <template v-if="estado === 'terminado'">
            <p>Tu puntuación final</p>
            <strong class="final-score">{{ puntuacion }}</strong>
            <p>Tiempo sobrevivido: {{ tiempo }} segundos</p>
            <p class="return-hint">Podés volver a CodeLearn desde el menú.</p>
          </template>

          <button
            v-if="estado === 'listo'"
            class="game-button"
            @click="iniciarJuego"
          >
            Comenzar
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

import correrSrc from "../assets/monkey-run/correr/spritesheet_nuevo.png"
import saltarSrc from "../assets/monkey-run/saltar/spritesheet.png"
import deslizarSrc from "../assets/monkey-run/deslizar/spritesheet.png"
import danioSrc from "../assets/monkey-run/danio/spritesheet.png"
import derrotaSrc from "../assets/monkey-run/derrota/spritesheet.png"

const canvas = ref(null)

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

let ctx
let frameId = null
let ultimoFrame = 0
let tiempoAcumulado = 0
let tiempoAnimacion = 0
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
let saltoActivo = false
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

  return Promise.all(promesas)
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
  tiempoAnimacion = 0
  tiempoInvulnerable = 0
  tiempoAnimacionDanio = 0
  intervaloObstaculo = 0
  intervaloBanana = 0

  presionandoDeslizar = false
  saltoActivo = false
  juegoTerminado = false
}

function iniciarJuego() {
  if (cargando || estado.value === "jugando") return

  reiniciarEstado()
  estado.value = "jugando"

  ultimoFrame = performance.now()
  frameId = requestAnimationFrame(actualizar)
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
  const tipos = [
    { ancho: 54, alto: 65, tipo: "bug" },
    { ancho: 70, alto: 45, tipo: "error" },
    { ancho: 48, alto: 85, tipo: "virus" }
  ]

  const tipo = tipos[Math.floor(Math.random() * tipos.length)]

  obstaculos.push({
    x: 1000,
    y: ALTURA_SUELO - tipo.alto,
    ancho: tipo.ancho,
    alto: tipo.alto,
    tipo: tipo.tipo
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

  obstaculos = obstaculos.filter((objeto) => objeto.x + objeto.ancho > 0)
  bananas = bananas.filter((objeto) => objeto.x + objeto.radio > 0 && !objeto.recogida)
}

function terminarJuego() {
  juegoTerminado = true
  estado.value = "terminado"
  jugador.animacion = "derrota"
  jugador.frame = 0

  if (frameId) {
    cancelAnimationFrame(frameId)
    frameId = null
  }

  dibujar()
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

  const frecuenciaObstaculos = Math.max(0.85, 1.65 - tiempoAcumulado * 0.012)

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
  })

  bananas.forEach((banana) => {
    banana.x -= velocidad * dt
  })

  particulas.forEach((particula) => {
    particula.x += particula.vx * dt
    particula.y += particula.vy * dt
    particula.vida -= dt
  })

  particulas = particulas.filter((particula) => particula.vida > 0)

  actualizarJugador(dt)
  comprobarColisiones()
}

function dibujarFondo() {
  const gradiente = ctx.createLinearGradient(0, 0, 0, 420)
  gradiente.addColorStop(0, "#071c25")
  gradiente.addColorStop(1, "#102d29")

  ctx.fillStyle = gradiente
  ctx.fillRect(0, 0, 960, 420)

  for (let i = 0; i < 24; i++) {
    const x = (i * 83 - sueloOffset * 0.25 + 1200) % 1000
    const y = 35 + (i * 47) % 230

    ctx.fillStyle = "rgba(82, 220, 151, 0.12)"
    ctx.fillRect(x, y, 2, 28)
  }

  ctx.strokeStyle = "rgba(91, 234, 153, 0.12)"
  ctx.lineWidth = 1

  for (let x = -80; x < 1000; x += 80) {
    const posicion = x - sueloOffset

    ctx.beginPath()
    ctx.moveTo(posicion, ALTURA_SUELO)
    ctx.lineTo(posicion + 40, 420)
    ctx.stroke()
  }

  ctx.fillStyle = "#173b32"
  ctx.fillRect(0, ALTURA_SUELO, 960, 80)

  ctx.fillStyle = "#45db91"
  ctx.fillRect(0, ALTURA_SUELO, 960, 3)

  for (let x = -80; x < 1000; x += 80) {
    ctx.fillStyle = "rgba(76, 225, 143, 0.3)"
    ctx.fillRect(x - sueloOffset, ALTURA_SUELO + 18, 32, 3)
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

  if (tiempoInvulnerable > 0 && Math.floor(tiempoInvulnerable * 12) % 2 === 0) {
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

    ctx.shadowBlur = 15
    ctx.shadowColor = "#ff526b"

    if (obstaculo.tipo === "bug") {
      ctx.fillStyle = "#f05270"
      ctx.fillRect(obstaculo.x, obstaculo.y, obstaculo.ancho, obstaculo.alto)

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(obstaculo.x + 12, obstaculo.y + 18, 8, 8)
      ctx.fillRect(obstaculo.x + 34, obstaculo.y + 18, 8, 8)
    } else if (obstaculo.tipo === "error") {
      ctx.fillStyle = "#9d4058"
      ctx.fillRect(obstaculo.x, obstaculo.y, obstaculo.ancho, obstaculo.alto)

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 25px monospace"
      ctx.fillText("!", obstaculo.x + 25, obstaculo.y + 31)
    } else {
      ctx.fillStyle = "#9c55d6"
      ctx.beginPath()
      ctx.arc(
        obstaculo.x + obstaculo.ancho / 2,
        obstaculo.y + obstaculo.alto / 2,
        obstaculo.ancho / 2,
        0,
        Math.PI * 2
      )
      ctx.fill()

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 15px monospace"
      ctx.fillText("404", obstaculo.x + 7, obstaculo.y + 45)
    }

    ctx.restore()
  })
}

function dibujarBananas() {
  bananas.forEach((banana) => {
    ctx.save()

    ctx.shadowBlur = 15
    ctx.shadowColor = banana.color
    ctx.fillStyle = banana.color

    ctx.beginPath()
    ctx.arc(banana.x, banana.y, banana.radio, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#071c25"
    ctx.font = "bold 10px monospace"
    ctx.textAlign = "center"
    ctx.fillText(banana.puntos.toString(), banana.x, banana.y + 4)

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

  await cargarImagenes()
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
})
</script>


<style scoped>
.monkey-game {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  color: #edf5f2;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.game-eyebrow {
  color: #65d995;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2px;
}

.game-header h1 {
  margin: 7px 0;
  font-size: clamp(25px, 4vw, 36px);
  letter-spacing: -1.5px;
}

.game-header h1 span {
  color: #75e7a3;
}

.game-header p {
  margin: 0;
  color: #8ba0b2;
  font-size: 14px;
}

.game-button {
  border: 0;
  border-radius: 10px;
  padding: 13px 22px;
  background: #55c982;
  color: #071a14;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.game-button:hover {
  background: #83e6a8;
  transform: translateY(-2px);
}

.game-hud {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 12px;
  margin-bottom: 12px;
}

.hud-item {
  min-height: 68px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  padding: 10px 16px;
  border: 1px solid #203d42;
  border-radius: 11px;
  background: #0d1a29;
}

.hud-item small {
  color: #8ba0b2;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}

.hud-item strong {
  color: #75e7a3;
  font-size: 22px;
}

.life-list {
  display: flex;
  gap: 9px;
  flex-wrap: wrap;
}

.life-list span {
  color: #75e7a3;
  font-size: 13px;
  font-weight: 900;
}

.life-list span.lost {
  color: #53636d;
  text-decoration: line-through;
  opacity: 0.5;
}

.game-board {
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 960 / 420;
  border: 1px solid #275b4a;
  border-radius: 15px;
  background: #071c25;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.2);
}

.game-board canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.game-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(4, 15, 22, 0.82);
  backdrop-filter: blur(5px);
  text-align: center;
}

.overlay-content {
  max-width: 430px;
}

.overlay-icon {
  display: block;
  margin-bottom: 12px;
  color: #75e7a3;
  font-size: 48px;
  font-weight: 900;
}

.overlay-content h2 {
  margin: 0 0 10px;
  font-size: clamp(24px, 4vw, 36px);
}

.overlay-content p {
  color: #a9bdc8;
  font-size: 14px;
  line-height: 1.6;
}

.final-score {
  display: block;
  margin: 10px 0;
  color: #75e7a3;
  font-size: 42px;
}

.return-hint {
  margin-top: 20px;
  font-size: 12px !important;
}

.game-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 17px;
}

.game-controls p {
  color: #8ba0b2;
  font-size: 12px;
}

.game-controls strong {
  color: #75e7a3;
}

.touch-controls {
  display: flex;
  gap: 10px;
}

.control-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border: 1px solid #315a4c;
  border-radius: 9px;
  background: #102b27;
  color: #75e7a3;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
  touch-action: none;
}

.control-button span {
  font-size: 20px;
}

.control-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.game-rules {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-top: 18px;
  padding: 14px 0;
  border-top: 1px solid #20364b;
  color: #9db1bc;
  font-size: 12px;
}

@media (max-width: 680px) {
  .game-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .game-hud {
    grid-template-columns: 1fr 1fr;
  }

  .hud-item.lives {
    grid-column: 1 / -1;
  }

  .game-controls {
    align-items: stretch;
    flex-direction: column;
  }

  .game-controls p {
    text-align: center;
  }

  .touch-controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .control-button {
    justify-content: center;
    min-height: 55px;
  }

  .game-overlay {
    padding: 10px;
  }

  .overlay-icon {
    margin-bottom: 3px;
    font-size: 30px;
  }

  .overlay-content p {
    margin: 5px 0;
    font-size: 11px;
  }

  .overlay-content .game-button {
    padding: 9px 15px;
  }
}
</style>
