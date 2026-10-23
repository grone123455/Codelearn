
<template>
  <main class="pagina-acceso">
    <section class="tarjeta-acceso">
      <img
        src="/src/assets/images/logo-codelearn.png"
        alt="Logo de CodeLearn"
        class="logo"
      />

      <h1>
        {{ modoRestablecer ? "Nueva contraseña" : "Recuperar contraseña" }}
      </h1>

      <p class="descripcion">
        {{
          modoRestablecer
            ? "Ingresá y confirmá tu nueva contraseña."
            : "Te enviaremos un enlace a tu correo para recuperar el acceso."
        }}
      </p>

      <form v-if="!modoRestablecer" @submit.prevent="enviarCorreo">
        <label for="email">Correo electrónico</label>
        <input
          id="email"
          v-model.trim="email"
          type="email"
          autocomplete="email"
          placeholder="tu correo electrónico"
          required
        />

        <button
          class="boton boton-principal"
          type="submit"
          :disabled="cargando"
        >
          {{ cargando ? "Enviando..." : "Enviar enlace" }}
        </button>
      </form>

      <form v-else @submit.prevent="guardarContrasena">
        <label for="password">Nueva contraseña</label>
        <input
          id="password"
          v-model="password"
          type="password"
          minlength="6"
          autocomplete="new-password"
          placeholder="Mínimo 6 caracteres"
          required
        />

        <label for="confirmacion">Confirmar contraseña</label>
        <input
          id="confirmacion"
          v-model="confirmacion"
          type="password"
          minlength="6"
          autocomplete="new-password"
          placeholder="Repetí la contraseña"
          required
        />

        <button
          class="boton boton-principal"
          type="submit"
          :disabled="cargando"
        >
          {{ cargando ? "Guardando..." : "Guardar contraseña" }}
        </button>
      </form>

      <p v-if="mensaje" class="mensaje-exito">
        {{ mensaje }}
      </p>

      <p v-if="error" class="mensaje-error">
        {{ error }}
      </p>

      <button
        class="boton"
        type="button"
        @click="router.push('/iniciar-sesion')"
      >
        Volver a iniciar sesión
      </button>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import {
  recuperarContrasena,
  actualizarContrasena
} from "../services/auth.js"
import { supabase } from "../services/supabase.js"

const router = useRouter()

const email = ref("")
const password = ref("")
const confirmacion = ref("")
const modoRestablecer = ref(false)
const cargando = ref(false)
const mensaje = ref("")
const error = ref("")

let suscripcion = null

onMounted(async () => {
  const hash = window.location.hash
  const parametros = new URLSearchParams(hash.replace(/^#/, ""))

  if (parametros.get("type") === "recovery") {
    modoRestablecer.value = true
  }

  const { data } = supabase.auth.onAuthStateChange((evento) => {
    if (evento === "PASSWORD_RECOVERY") {
      modoRestablecer.value = true
      mensaje.value = ""
      error.value = ""
    }
  })

  suscripcion = data.subscription
})

onUnmounted(() => {
  suscripcion?.unsubscribe()
})

async function enviarCorreo() {
  if (cargando.value) return

  cargando.value = true
  error.value = ""
  mensaje.value = ""

  try {
    await recuperarContrasena(email.value)

    mensaje.value =
      "Si la dirección está registrada, recibirás un correo con instrucciones para recuperar el acceso."
  } catch (e) {
    error.value =
      e.message || "No se pudo enviar el correo de recuperación."
  } finally {
    cargando.value = false
  }
}

async function guardarContrasena() {
  if (cargando.value) return

  error.value = ""
  mensaje.value = ""

  if (password.value.length < 6) {
    error.value = "La contraseña debe tener al menos 6 caracteres."
    return
  }

  if (password.value !== confirmacion.value) {
    error.value = "Las contraseñas no coinciden."
    return
  }

  cargando.value = true

  try {
    await actualizarContrasena(password.value)

    password.value = ""
    confirmacion.value = ""
    mensaje.value = "Contraseña actualizada. Ya podés iniciar sesión."

    await supabase.auth.signOut()
  } catch (e) {
    error.value =
      e.message ||
      "No se pudo actualizar la contraseña. Solicitá un enlace nuevo si venció."
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.pagina-acceso {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}

.tarjeta-acceso {
  box-sizing: border-box;
  width: 100%;
  max-width: 440px;
  padding: 32px;
  border: 1px solid rgba(57, 255, 20, 0.2);
  border-radius: 20px;
  background: #101010;
  color: #ffffff;
}

.logo {
  display: block;
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin: 0 auto 16px;
}

h1 {
  margin: 0 0 12px;
  text-align: center;
  font-size: 28px;
}

.descripcion {
  margin-bottom: 24px;
  text-align: center;
  color: #b5b5b5;
  line-height: 1.5;
}

label {
  display: block;
  margin: 16px 0 8px;
  font-size: 14px;
  color: #dddddd;
}

input {
  box-sizing: border-box;
  width: 100%;
  padding: 13px;
  border: 1px solid #333333;
  border-radius: 10px;
  background: #191919;
  color: #ffffff;
  font-size: 15px;
}

input:focus {
  outline: 1px solid #39ff14;
  border-color: #39ff14;
}

.boton {
  width: 100%;
  padding: 13px 16px;
  margin-top: 12px;
  border: 1px solid #333333;
  border-radius: 10px;
  background: #191919;
  color: #ffffff;
  font-size: 15px;
  cursor: pointer;
}

.boton:hover:not(:disabled) {
  border-color: #39ff14;
}

.boton-principal {
  margin-top: 24px;
  background: #39ff14;
  border-color: #39ff14;
  color: #080808;
  font-weight: bold;
}

.boton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mensaje-error,
.mensaje-exito {
  margin-top: 16px;
  font-size: 14px;
  text-align: center;
  overflow-wrap: anywhere;
}

.mensaje-error {
  color: #ff6b6b;
}

.mensaje-exito {
  color: #39ff14;
}
</style>
