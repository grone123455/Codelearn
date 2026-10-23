
<template>
  <main class="pagina-acceso">
    <section class="tarjeta-acceso">
      <img
        src="/src/assets/images/logo-codelearn.png"
        alt="Logo de CodeLearn"
        class="logo"
      />

      <h1>Iniciar sesión</h1>

      <p class="descripcion">
        Ingresá a tu cuenta para continuar aprendiendo.
      </p>

      <div v-if="hayInvitado" class="aviso-invitado">
        <strong>Estás usando una cuenta de invitado.</strong>
        <p>
          Si iniciás sesión con otra cuenta, el historial del invitado
          no se combinará automáticamente con el de esa cuenta.
        </p>
      </div>

      <form @submit.prevent="iniciar">
        <label for="email">Correo electrónico</label>
        <input
          id="email"
          v-model.trim="email"
          type="email"
          placeholder="tu correo electrónico"
          autocomplete="email"
          required
        />

        <label for="password">Contraseña</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Tu contraseña"
          autocomplete="current-password"
          required
        />

        <button
          type="submit"
          class="boton boton-principal"
          :disabled="cargando"
        >
          {{ cargando ? "Ingresando..." : "Iniciar sesión" }}
        </button>
      </form>

      <button
        class="boton"
        type="button"
        @click="router.push('/recuperar-contrasena')"
      >
        Olvidé mi contraseña
      </button>

      <button
        class="boton"
        type="button"
        @click="router.push('/registro')"
      >
        Crear una cuenta
      </button>

      <button
        class="boton boton-secundario"
        type="button"
        @click="router.push('/acceso')"
      >
        Volver
      </button>

      <p v-if="mensaje" class="mensaje-exito">
        {{ mensaje }}
      </p>

      <p v-if="error" class="mensaje-error">
        {{ error }}
      </p>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import { iniciarSesion, obtenerSesion } from "../services/auth.js"

const router = useRouter()
const route = useRoute()

const email = ref("")
const password = ref("")
const cargando = ref(false)
const error = ref("")
const mensaje = ref("")
const hayInvitado = ref(false)

onMounted(async () => {
  try {
    const sesion = await obtenerSesion()
    hayInvitado.value = Boolean(sesion?.user?.is_anonymous)
  } catch {
    hayInvitado.value = false
  }
})

async function iniciar() {
  if (cargando.value) return

  error.value = ""
  mensaje.value = ""

  if (hayInvitado.value) {
    const continuar = window.confirm(
      "Estás usando una cuenta de invitado. " +
      "Si iniciás sesión con otra cuenta, el historial del invitado " +
      "no se combinará automáticamente. ¿Querés continuar?"
    )

    if (!continuar) return
  }

  cargando.value = true

  try {
    await iniciarSesion(email.value, password.value)

    mensaje.value = "¡Inicio de sesión correcto!"

    const destino = route.query.redirect
    const rutaDestino =
      typeof destino === "string" &&
      destino.startsWith("/") &&
      !destino.startsWith("//")
        ? destino
        : "/"

    await router.replace(rutaDestino)
  } catch (e) {
    error.value =
      e.message ||
      "No se pudo iniciar sesión. Revisá el correo y la contraseña."
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

.aviso-invitado {
  margin-bottom: 20px;
  padding: 14px;
  border: 1px solid rgba(255, 190, 60, 0.5);
  border-radius: 10px;
  background: rgba(255, 190, 60, 0.08);
  color: #ffe0a0;
  line-height: 1.5;
}

.aviso-invitado p {
  margin: 6px 0 0;
  font-size: 14px;
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

.boton-principal:hover:not(:disabled) {
  background: #2ee600;
}

.boton-secundario {
  background: transparent;
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
