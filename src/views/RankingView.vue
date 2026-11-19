
<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "../services/supabase.js"

const ranking = ref([])
const cargando = ref(true)
const mensajeError = ref("")

function formatoTiempo(segundos) {
  const minutos = Math.floor(segundos / 60)
  const restantes = segundos % 60

  return `${String(minutos).padStart(2, "0")}:${String(restantes).padStart(2, "0")}`
}

async function cargarRanking() {
  cargando.value = true
  mensajeError.value = ""

  try {
    const { data, error } = await supabase.rpc(
      "obtener_ranking_desafio"
    )

    if (error) throw error

    ranking.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error al cargar el ranking:", error)

    mensajeError.value =
      error.message || "No se pudo cargar la tabla de posiciones."
  } finally {
    cargando.value = false
  }
}

onMounted(cargarRanking)
</script>

<template>
  <section class="pagina ranking">
    <header class="ranking__encabezado">
      <span class="etiqueta">CODELEARN COMPETITIVO</span>

      <h1>Tabla de posiciones<span>.</span></h1>

      <p>
        Los participantes con los mejores resultados del desafío
        competitivo.
      </p>
    </header>

    <section class="ranking__panel">
      <div class="ranking__panel-encabezado">
        <div>
          <span class="etiqueta">CLASIFICACIÓN GENERAL</span>
          <h2>Top 100 participantes</h2>
        </div>

        <button
          class="ranking__actualizar"
          type="button"
          :disabled="cargando"
          @click="cargarRanking"
        >
          {{ cargando ? "Actualizando..." : "Actualizar" }}
        </button>
      </div>

      <div v-if="cargando" class="ranking__estado">
        <span class="ranking__cargando"></span>
        <p>Cargando tabla de posiciones...</p>
      </div>

      <div v-else-if="mensajeError" class="ranking__estado ranking__estado--error">
        <p>{{ mensajeError }}</p>

        <button
          class="ranking__actualizar"
          type="button"
          @click="cargarRanking"
        >
          Reintentar
        </button>
      </div>

      <div v-else-if="ranking.length === 0" class="ranking__estado">
        <h3>Todavía no hay participantes</h3>
        <p>
          Cuando se registren los primeros resultados,
          aparecerán en esta tabla.
        </p>
      </div>

      <div v-else class="ranking__tabla-contenedor">
        <table class="ranking__tabla">
          <thead>
            <tr>
              <th>Posición</th>
              <th>Participante</th>
              <th>Puntaje</th>
              <th>Tiempo</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="participante in ranking"
              :key="participante.posicion"
              :class="{
                'ranking__fila--primero': participante.posicion === 1,
                'ranking__fila--segundo': participante.posicion === 2,
                'ranking__fila--tercero': participante.posicion === 3
              }"
            >
              <td>
                <span class="ranking__posicion">
                  {{ participante.posicion }}
                </span>
              </td>

              <td class="ranking__participante">
                {{ participante.alias }}
              </td>

              <td class="ranking__puntaje">
                {{ participante.puntaje }} pts
              </td>

              <td class="ranking__tiempo">
                {{ formatoTiempo(participante.tiempo_segundos) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="!cargando && !mensajeError && ranking.length > 0" class="ranking__nota">
        Se muestran los primeros {{ ranking.length }} participantes.
        Cada participante aparece con su mejor resultado.
      </p>
    </section>
  </section>
</template>

<style scoped>
.ranking__encabezado {
  margin-bottom: 25px;
}

.ranking__encabezado .etiqueta {
  color: #7791a3;
}

.ranking__encabezado h1 {
  margin: 9px 0;
}

.ranking__encabezado h1 span {
  color: var(--color-accent);
}

.ranking__encabezado p {
  max-width: 650px;
  margin: 0;
  line-height: 1.7;
  color: var(--color-muted);
}

.ranking__panel {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 15px;
  background: linear-gradient(145deg, #112235, #0d1a29);
}

.ranking__panel-encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 24px;
  border-bottom: 1px solid var(--color-border);
}

.ranking__panel-encabezado .etiqueta {
  color: #7791a3;
  font-size: 0.68rem;
}

.ranking__panel-encabezado h2 {
  margin: 8px 0 0;
  font-size: 1.25rem;
}

.ranking__actualizar {
  padding: 10px 16px;
  border: 1px solid rgba(140, 230, 172, 0.3);
  border-radius: 8px;
  background: rgba(140, 230, 172, 0.08);
  color: var(--color-accent);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.ranking__actualizar:hover:not(:disabled) {
  background: rgba(140, 230, 172, 0.15);
}

.ranking__actualizar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ranking__estado {
  display: grid;
  min-height: 220px;
  align-content: center;
  justify-items: center;
  gap: 12px;
  padding: 30px;
  text-align: center;
}

.ranking__estado h3,
.ranking__estado p {
  margin: 0;
}

.ranking__estado p {
  color: var(--color-muted);
  font-size: 0.85rem;
  line-height: 1.6;
}

.ranking__estado--error p {
  color: #ff9999;
}

.ranking__cargando {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(140, 230, 172, 0.2);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: ranking-girar 0.8s linear infinite;
}

@keyframes ranking-girar {
  to {
    transform: rotate(360deg);
  }
}

.ranking__tabla-contenedor {
  overflow-x: auto;
}

.ranking__tabla {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.ranking__tabla th,
.ranking__tabla td {
  padding: 16px 22px;
  border-bottom: 1px solid rgba(137, 163, 190, 0.12);
}

.ranking__tabla th {
  color: #8fa4b5;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  white-space: nowrap;
}

.ranking__tabla td {
  font-size: 0.85rem;
}

.ranking__tabla tbody tr:last-child td {
  border-bottom: 0;
}

.ranking__tabla tbody tr:hover {
  background: rgba(140, 230, 172, 0.035);
}

.ranking__posicion {
  display: inline-grid;
  min-width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 8px;
  background: rgba(137, 163, 190, 0.1);
  color: #a9bac8;
  font-weight: 700;
}

.ranking__fila--primero .ranking__posicion {
  background: rgba(255, 204, 92, 0.14);
  color: #ffcc5c;
}

.ranking__fila--segundo .ranking__posicion {
  background: rgba(192, 205, 220, 0.14);
  color: #c5d3e0;
}

.ranking__fila--tercero .ranking__posicion {
  background: rgba(205, 137, 91, 0.14);
  color: #d99a6b;
}

.ranking__participante {
  color: #e2eaf0;
  font-weight: 600;
}

.ranking__puntaje {
  color: var(--color-accent);
  font-weight: 700;
  white-space: nowrap;
}

.ranking__tiempo {
  color: #a8bac8;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.ranking__nota {
  margin: 0;
  padding: 15px 22px;
  border-top: 1px solid rgba(137, 163, 190, 0.12);
  color: var(--color-muted);
  font-size: 0.75rem;
}

@media (max-width: 600px) {
  .ranking__panel-encabezado {
    align-items: flex-start;
    flex-direction: column;
    padding: 20px;
  }

  .ranking__tabla th,
  .ranking__tabla td {
    padding: 13px 15px;
  }

  .ranking__tabla th {
    font-size: 0.65rem;
  }

  .ranking__tabla td {
    font-size: 0.8rem;
  }
}
</style>
