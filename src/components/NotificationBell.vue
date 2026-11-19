
<template>
  <div class="notification-bell">
    <button
      class="notification-bell__trigger"
      type="button"
      aria-label="Notificaciones"
      :aria-expanded="abierto"
      @click="abierto = !abierto"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
        />
        <path d="M10 21h4" />
      </svg>

      <span v-if="noLeidas > 0" class="notification-bell__badge">
        {{ noLeidas > 99 ? "99+" : noLeidas }}
      </span>
    </button>

    <section
      v-if="abierto"
      class="notification-panel"
      aria-label="Lista de notificaciones"
    >
      <header class="notification-panel__header">
        <div>
          <h2>Notificaciones</h2>
          <p>
            {{ noLeidas }}
            {{ noLeidas === 1 ? "pendiente" : "pendientes" }}
          </p>
        </div>

        <button
          type="button"
          class="notification-panel__close"
          aria-label="Cerrar notificaciones"
          @click="abierto = false"
        >
          ×
        </button>
      </header>

      <div v-if="cargando" class="notification-panel__state">
        Cargando notificaciones...
      </div>

      <div
        v-else-if="error"
        class="notification-panel__state notification-panel__state--error"
      >
        {{ error }}
        <button type="button" @click="cargarNotificaciones">
          Reintentar
        </button>
      </div>

      <div
        v-else-if="notificaciones.length === 0"
        class="notification-panel__state"
      >
        No tenés notificaciones por el momento.
      </div>

      <div v-else class="notification-panel__list">
        <article
          v-for="notificacion in notificaciones"
          :key="notificacion.id"
          class="notification-item"
          :class="{ 'notification-item--unread': !notificacion.leida }"
        >
          <span class="notification-item__dot"></span>

          <div class="notification-item__content">
            <strong>{{ notificacion.titulo }}</strong>
            <p>{{ notificacion.mensaje }}</p>

            <time :datetime="notificacion.creado_en">
              {{ formatearFecha(notificacion.creado_en) }}
            </time>

            <button
              v-if="esNotificacionDesempate(notificacion)"
              type="button"
              class="notification-item__read"
              :disabled="marcandoId === notificacion.id"
              @click="abrirNotificacion(notificacion)"
            >
              {{ textoAccion(notificacion) }}
            </button>

            <button
              v-else-if="!notificacion.leida"
              type="button"
              class="notification-item__read"
              :disabled="marcandoId === notificacion.id"
              @click="marcarComoLeida(notificacion)"
            >
              {{
                marcandoId === notificacion.id
                  ? "Guardando..."
                  : "Marcar como leída"
              }}
            </button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue"
import { useRouter } from "vue-router"

import {
  obtenerNotificaciones,
  marcarNotificacionLeida
} from "../services/notificaciones.js"

import { supabase } from "../services/supabase.js"

const router = useRouter()

const abierto = ref(false)
const cargando = ref(false)
const error = ref("")
const notificaciones = ref([])
const marcandoId = ref(null)

const noLeidas = computed(() =>
  notificaciones.value.filter(n => !n.leida).length
)

let intervalo = null
let authSubscription = null

function esNotificacionDesempate(notificacion) {
  return Boolean(notificacion.desempate_id) &&
    ["nuevo_desempate", "resultado_desempate"].includes(notificacion.tipo)
}

function textoAccion(notificacion) {
  if (marcandoId.value === notificacion.id) {
    return "Abriendo..."
  }

  return notificacion.tipo === "nuevo_desempate"
    ? "Participar"
    : "Ver resultado"
}

async function cargarNotificaciones() {
  cargando.value = true
  error.value = ""

  try {
    notificaciones.value = await obtenerNotificaciones()
  } catch (err) {
    console.error("Error al cargar notificaciones:", err)
    error.value = "No se pudieron cargar las notificaciones."
  } finally {
    cargando.value = false
  }
}

async function marcarComoLeida(notificacion) {
  marcandoId.value = notificacion.id
  error.value = ""

  try {
    await marcarNotificacionLeida(notificacion.id)
    notificacion.leida = true
    return true
  } catch (err) {
    console.error("Error al marcar notificación:", err)
    error.value = "No se pudo actualizar la notificación."
    return false
  } finally {
    marcandoId.value = null
  }
}

async function abrirNotificacion(notificacion) {
  if (!esNotificacionDesempate(notificacion)) return

  if (!notificacion.leida) {
    const actualizada = await marcarComoLeida(notificacion)

    if (!actualizada) return
  }

  abierto.value = false

  const nombreRuta = notificacion.tipo === "nuevo_desempate"
    ? "juego-desempate"
    : "resultado-desempate"

  router.push({
    name: nombreRuta,
    query: {
      desempate: notificacion.desempate_id
    }
  })
}

function formatearFecha(fecha) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(fecha))
}

onMounted(() => {
  cargarNotificaciones()

  intervalo = window.setInterval(cargarNotificaciones, 60000)

  const { data } = supabase.auth.onAuthStateChange(() => {
    cargarNotificaciones()
  })

  authSubscription = data.subscription
})

onUnmounted(() => {
  if (intervalo) {
    window.clearInterval(intervalo)
  }

  authSubscription?.unsubscribe()
})
</script>
