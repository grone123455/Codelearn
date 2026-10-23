
<template>
  <main class="pagina-acceso">
    <section class="tarjeta-acceso">
      <img
        src="/src/assets/images/logo-codelearn.png"
        alt="Logo de CodeLearn"
        class="logo"
      />

      <h1>Crear una cuenta</h1>
      <p class="descripcion">
        Registrate para comenzar tu experiencia en CodeLearn.
      </p>

      <form @submit.prevent="registrar">
        <label for="alias">Alias</label>
        <input
          id="alias"
          v-model.trim="alias"
          type="text"
          placeholder="Cómo querés que te llamemos"
          autocomplete="nickname"
          minlength="3"
          maxlength="30"
          required
        />

        <label for="email">Correo electrónico</label>
        <input
          id="email"
          v-model.trim="email"
          type="email"
          placeholder="Tu correo electrónico"
          autocomplete="email"
          required
        />

        <label for="password">Contraseña</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          autocomplete="new-password"
          minlength="8"
          required
        />

        <label for="confirmar">Confirmar contraseña</label>
        <input
          id="confirmar"
          v-model="confirmar"
          type="password"
          placeholder="Repetí la contraseña"
          autocomplete="new-password"
          minlength="8"
          required
        />

        <button
          type="submit"
          class="boton boton-principal"
          :disabled="cargando"
        >
          {{ cargando ? "Creando cuenta..." : "Crear cuenta" }}
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
        Ya tengo una cuenta
      </button>

      <button
        class="boton boton-secundario"
        type="button"
        @click="router.push('/acceso')"
      >
        Volver
      </button>
    </section>
  </main>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { registrarUsuario } from "../services/auth.js"

const router = useRouter()

const alias = ref("")
const email = ref("")
const password = ref("")
const confirmar = ref("")
const cargando = ref(false)
const error = ref("")
const mensaje = ref("")

async function registrar() {
  error.value = ""
  mensaje.value = ""

  if (alias.value.trim().length < 3 || alias.value.trim().length > 30) {
    error.value = "El alias debe tener entre 3 y 30 caracteres."
    return
  }

  if (password.value.length < 8) {
    error.value = "La contraseña debe tener al menos 8 caracteres."
    return
  }

  if (password.value !== confirmar.value) {
    error.value = "Las contraseñas no coinciden."
    return
  }

  cargando.value = true

  try {
    const data = await registrarUsuario(
      email.value,
      password.value,
      alias.value
    )

    if (data.user && !data.session) {
      mensaje.value =
        "Cuenta creada. Revisá tu correo para confirmar el registro."
      return
    }

    mensaje.value = "¡Cuenta creada correctamente!"
    await router.push("/")
  } catch (e) {
    error.value =
      e.message || "No se pudo crear la cuenta. Revisá los datos."
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
}

.mensaje-error {
  color: #ff6b6b;
}

.mensaje-exito {
  color: #39ff14;
}
</style>
    