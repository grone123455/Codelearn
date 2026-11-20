
<template>
  <div class="notification-bell">
    <button
      class="notification-bell__trigger"
      type="button"
      aria-label="Notificaciones"
      :aria-expanded="abierto"
      @click="alternarPanel"
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

    <Transition name="bubble">
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
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue"
import { useRouter } from "vue-router"

import {
  obtenerNotificaciones,
  marcarNotificacionLeida
} from "../services/notificaciones.js"

import { supabase } from "../services/supabase.js"

const router = useRouter()

const props = defineProps({
  menuAbierto: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(["abierto-change"])

const abierto = ref(false)

watch(
  () => props.menuAbierto,
  (estaAbierto) => {
    if (estaAbierto) {
      abierto.value = false
    }
  }
)

function alternarPanel() {
  if (!abierto.value) {
    emit("abierto-change")
  }

  abierto.value = !abierto.value
}

const cargando = ref(false)
const error = ref("")
const notificaciones = ref([])
const marcandoId = ref(null)

const noLeidas = computed(() =>
  notificaciones.value.filter(n => !n.leida).length
)

let canalRealtime = null
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

  if (notificacion.tipo === "nuevo_desempate") {
    router.push({
      name: "juego-desempate",
      query: {
        modo: "competitivo",
        desempate: notificacion.desempate_id
      }
    })

    return
  }

  router.push({
    name: "resultado-desempate",
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

async function configurarRealtime(usuario) {
  if (canalRealtime) {
    await supabase.removeChannel(canalRealtime)
    canalRealtime = null
  }

  if (!usuario || usuario.is_anonymous) {
    notificaciones.value = []
    return
  }

  canalRealtime = supabase
    .channel(`notificaciones-${usuario.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notificaciones",
        filter: `usuario_id=eq.${usuario.id}`
      },
      () => {
        cargarNotificaciones()
      }
    )
    .subscribe((estado) => {
      if (estado === "CHANNEL_ERROR") {
        console.error("Error en la suscripción de notificaciones.")
      }
    })
}

onMounted(async () => {
  const { data } = supabase.auth.onAuthStateChange((evento, session) => {
    if (["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(evento)) {
      Promise.resolve().then(async () => {
        await configurarRealtime(session?.user)
        await cargarNotificaciones()
      })
    }
  })

  authSubscription = data.subscription

  const { data: sesion, error: errorSesion } =
    await supabase.auth.getSession()

  if (errorSesion) {
    console.error("Error al obtener la sesión:", errorSesion)
    return
  }

  await configurarRealtime(sesion.session?.user)
  await cargarNotificaciones()
})

onUnmounted(async () => {
  authSubscription?.unsubscribe()

  if (canalRealtime) {
    await supabase.removeChannel(canalRealtime)
    canalRealtime = null
  }
})
</script>
