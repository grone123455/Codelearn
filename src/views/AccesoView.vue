
<template>
  <main class="acceso">
    <section class="acceso__tarjeta">
      <img
        src="/src/assets/images/logo-codelearn.png"
        alt="Logo de CodeLearn"
        class="acceso__logo"
      />

      <h1>Bienvenido a CodeLearn</h1>

      <p class="acceso__descripcion">
        Aprendé programación paso a paso, a tu ritmo.
      </p>

      <button
        class="acceso__boton acceso__boton--principal"
        @click="entrarComoInvitado"
        :disabled="cargando"
      >
        {{ cargando ? "Ingresando..." : "Continuar como invitado" }}
      </button>

      <button
        class="acceso__boton"
        @click="irAIniciarSesion"
        :disabled="cargando"
      >
        Iniciar sesión
      </button>

      <button
        class="acceso__boton"
        @click="irARegistro"
        :disabled="cargando"
      >
        Crear una cuenta
      </button>

      <p v-if="error" class="acceso__error">
        {{ error }}
      </p>
    </section>
  </main>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { iniciarComoInvitado } from "../services/auth.js"

const router = useRouter()
const cargando = ref(false)
const error = ref("")

async function entrarComoInvitado() {
  cargando.value = true
  error.value = ""

  try {
    await iniciarComoInvitado()
    router.push("/")
  } catch (e) {
    error.value = e.message || "No se pudo ingresar como invitado."
  } finally {
    cargando.value = false
  }
}

function irAIniciarSesion() {
  router.push("/iniciar-sesion")
}

function irARegistro() {
  router.push("/registro")
}
</script>

<style scoped>
.acceso {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}

.acceso__tarjeta {
  width: 100%;
  max-width: 440px;
  padding: 32px;
  border: 1px solid rgba(57, 255, 20, 0.2);
  border-radius: 20px;
  background: #101010;
  text-align: center;
}

.acceso__logo {
  width: 90px;
  height: 90px;
  object-fit: contain;
  margin-bottom: 16px;
}

.acceso h1 {
  color: #ffffff;
  font-size: 28px;
  margin: 0 0 12px;
}

.acceso__descripcion {
  color: #b5b5b5;
  margin-bottom: 28px;
  line-height: 1.5;
}

.acceso__boton {
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

.acceso__boton:hover:not(:disabled) {
  border-color: #39ff14;
}

.acceso__boton--principal {
  background: #39ff14;
  border-color: #39ff14;
  color: #080808;
  font-weight: bold;
}

.acceso__boton--principal:hover:not(:disabled) {
  background: #2ee600;
}

.acceso__boton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.acceso__error {
  margin-top: 20px;
  color: #ff6b6b;
  font-size: 14px;
}
</style>
