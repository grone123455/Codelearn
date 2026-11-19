
<template>
  <main class="resultado-page">
    <section class="resultado-container">
      <div v-if="cargando" class="estado">
        Cargando resultados...
      </div>

      <div v-else-if="error" class="estado estado--error">
        <h2>No se pudieron cargar los resultados</h2>
        <p>{{ error }}</p>
        <button @click="cargarResultado">Reintentar</button>
      </div>

      <div v-else-if="!desempate" class="estado">
        <h2>Enfrentamiento no encontrado</h2>
        <p>Verificá el enlace de la notificación.</p>
      </div>

      <template v-else>
        <header class="resultado-header">
          <span class="etiqueta">CODELEARN · MONKEY RUN</span>

          <template v-if="desempate.estado === 'resuelto'">
            <h1>
              {{ desempate.es_empate ? "¡Empate absoluto!" : "Enfrentamiento finalizado" }}
            </h1>
            <p>
              {{ desempate.es_empate
                ? "Los participantes consiguieron exactamente el mismo resultado."
                : "Ya se determinaron los resultados del desempate." }}
            </p>
          </template>

          <template v-else>
            <h1>Desempate en curso</h1>
            <p>
              Los resultados definitivos estarán disponibles cuando todos
              los participantes hayan terminado.
            </p>
          </template>
        </header>

        <section class="resultado-info">
          <div>
            <span>Puntaje que generó el empate</span>
            <strong>{{ desempate.puntaje_empatado }} puntos</strong>
          </div>

          <div>
            <span>Estado</span>
            <strong>
              {{ desempate.estado === "resuelto" ? "Finalizado" : "En curso" }}
            </strong>
          </div>
        </section>

        <section class="participantes">
          <h2>Resultados de los participantes</h2>

          <article
            v-for="participante in participantes"
            :key="participante.usuario_id"
            class="participante"
            :class="{
              'participante--ganador':
                desempate.estado === 'resuelto' && participante.es_ganador
            }"
          >
            <div class="participante__encabezado">
              <div>
                <h3>{{ participante.alias || "Participante" }}</h3>

                <span
                  class="participante__estado"
                  :class="`participante__estado--${participante.estado}`"
                >
                  {{ textoEstado(participante.estado) }}
                </span>
              </div>

              <span
                v-if="desempate.estado === 'resuelto' && participante.es_ganador"
                class="ganador"
              >
                GANADOR
              </span>
            </div>

            <div
              v-if="desempate.estado === 'resuelto' && participante.estado === 'completado'"
              class="estadisticas"
            >
              <div>
                <span>Puntaje</span>
                <strong>{{ participante.puntaje_obtenido ?? 0 }}</strong>
              </div>

              <div>
                <span>Supervivencia</span>
                <strong>{{ formatearTiempo(participante.tiempo_supervivencia_segundos) }}</strong>
              </div>
            </div>

            <p
              v-else-if="participante.estado === 'no_completado'"
              class="participante__detalle"
            >
              El participante abandonó el enfrentamiento.
            </p>

            <p
              v-else-if="desempate.estado !== 'resuelto'"
              class="participante__detalle"
            >
              Resultado pendiente.
            </p>
          </article>
        </section>

        <section
          v-if="desempate.estado === 'resuelto'"
          class="resultado-final"
        >
          <template v-if="desempate.es_empate">
            <h2>¡Victoria compartida!</h2>
            <p>
              Los participantes con el mejor resultado comparten la victoria.
            </p>
          </template>

          <template v-else-if="ganadores.length > 0">
            <h2>
              {{ ganadores.length === 1 ? "¡Tenemos un ganador!" : "¡Tenemos ganadores!" }}
            </h2>

            <p>
              {{ ganadores.map(p => p.alias || "Participante").join(", ") }}
            </p>
          </template>

          <template v-else>
            <h2>Sin ganador</h2>
            <p>Todos los participantes abandonaron el enfrentamiento.</p>
          </template>

          <div v-if="ganadores.length > 0" class="premio">
            <strong>Premio CodeLearn</strong>
            <p>
              {{ ganadores.length === 1 ? "El ganador tiene" : "Los ganadores tienen" }}
              pendiente la entrega de su llavero CodeLearn durante la exposición.
            </p>
          </div>
        </section>

        <footer class="acciones">
          <button @click="volverAlRanking">
            Volver al ranking
          </button>
        </footer>
      </template>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

import { obtenerDesempate } from "../services/desempates.js"

const route = useRoute()
const router = useRouter()

const desempate = ref(null)
const cargando = ref(true)
const error = ref("")

const participantes = computed(() =>
  desempate.value?.participantes || []
)

const ganadores = computed(() =>
  participantes.value.filter(p => p.es_ganador)
)

async function cargarResultado() {
  const desempateId = route.query.desempate

  if (!desempateId) {
    error.value = "No se recibió el identificador del enfrentamiento."
    desempate.value = null
    cargando.value = false
    return
  }

  cargando.value = true
  error.value = ""

  try {
    const datos = await obtenerDesempate(desempateId)

    desempate.value = Array.isArray(datos) ? datos[0] : datos

    if (!desempate.value) {
      throw new Error("No se encontró el enfrentamiento solicitado.")
    }
  } catch (err) {
    console.error("Error al obtener resultados:", err)
    error.value = err.message || "Ocurrió un error al consultar el enfrentamiento."
    desempate.value = null
  } finally {
    cargando.value = false
  }
}

function textoEstado(estado) {
  const estados = {
    pendiente: "Pendiente",
    en_curso: "Jugando",
    completado: "Finalizado",
    no_completado: "Abandonó"
  }

  return estados[estado] || estado
}

function formatearTiempo(segundos) {
  const total = Number(segundos || 0)
  const minutos = Math.floor(total / 60)
  const segundosRestantes = total % 60

  return `${minutos}:${String(segundosRestantes).padStart(2, "0")}`
}

function volverAlRanking() {
  router.push({ name: "ranking" })
}

onMounted(cargarResultado)

watch(
  () => route.query.desempate,
  () => cargarResultado()
)
</script>

<style scoped>
.resultado-page {
  min-height: 100vh;
  padding: 48px 20px;
  background: var(--color-fondo, #07130f);
  color: var(--color-texto, #f0fdf4);
}

.resultado-container {
  width: min(100%, 850px);
  margin: 0 auto;
}

.resultado-header {
  margin-bottom: 30px;
}

.etiqueta {
  color: #4ade80;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 2px;
}

.resultado-header h1 {
  margin: 12px 0;
  font-size: clamp(1.8rem, 5vw, 2.7rem);
}

.resultado-header p,
.resultado-final p {
  color: #a7b8ae;
  line-height: 1.6;
}

.resultado-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 32px;
}

.resultado-info > div,
.participante,
.resultado-final {
  padding: 20px;
  border: 1px solid #263d32;
  border-radius: 14px;
  background: #102019;
}

.resultado-info span,
.estadisticas span {
  display: block;
  margin-bottom: 8px;
  color: #9aafa2;
  font-size: 0.85rem;
}

.resultado-info strong {
  font-size: 1.2rem;
}

.participantes h2 {
  margin-bottom: 16px;
  font-size: 1.25rem;
}

.participante {
  margin-bottom: 12px;
}

.participante--ganador {
  border-color: #4ade80;
}

.participante__encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.participante__encabezado h3 {
  margin: 0 0 8px;
}

.participante__estado {
  color: #a7b8ae;
  font-size: 0.8rem;
}

.participante__estado--completado {
  color: #4ade80;
}

.participante__estado--no_completado {
  color: #fb7185;
}

.ganador {
  color: #4ade80;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 1px;
}

.estadisticas {
  display: flex;
  gap: 48px;
  margin-top: 22px;
}

.estadisticas strong {
  font-size: 1.35rem;
}

.participante__detalle {
  margin: 16px 0 0;
  color: #9aafa2;
  font-size: 0.9rem;
}

.resultado-final {
  margin-top: 28px;
  border-color: #315a40;
}

.resultado-final h2 {
  margin-top: 0;
}

.premio {
  margin-top: 20px;
  padding: 16px;
  border-radius: 10px;
  background: #193326;
}

.premio strong {
  color: #4ade80;
}

.premio p {
  margin-bottom: 0;
}

.acciones {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.acciones button,
.estado button {
  padding: 12px 22px;
  border: 0;
  border-radius: 9px;
  background: #22c55e;
  color: #062010;
  font-weight: 800;
  cursor: pointer;
}

.estado {
  padding: 60px 20px;
  text-align: center;
}

.estado--error {
  color: #fca5a5;
}

@media (max-width: 600px) {
  .resultado-page {
    padding: 28px 14px;
  }

  .resultado-info {
    grid-template-columns: 1fr;
  }

  .estadisticas {
    gap: 28px;
  }
}
</style>
