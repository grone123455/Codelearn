
<template>
  <main class="perfil">
    <section class="perfil__tarjeta">
      <h1>Mi perfil</h1>

      <p class="perfil__descripcion">
        Administrá tu cuenta de CodeLearn.
      </p>

      <div v-if="cargando" class="perfil__estado">
        Cargando perfil...
      </div>

      <template v-else-if="usuario">
        <div class="perfil__dato">
          <span class="perfil__etiqueta">Alias</span>
          <strong>{{ alias || "Sin alias" }}</strong>
        </div>

        <div class="perfil__dato">
          <span class="perfil__etiqueta">Tipo de cuenta</span>
          <strong>
            {{ esInvitado ? "Invitado" : "Cuenta registrada" }}
          </strong>
        </div>

        <div v-if="esInvitado" class="perfil__conversion">
          <h2>Guardá tu cuenta</h2>

          <p>
            Creá una cuenta permanente para poder volver a iniciar sesión.
          </p>

          <form @submit.prevent="convertirCuenta">
            <label for="alias">Alias</label>
            <input
              id="alias"
              v-model="formulario.alias"
              type="text"
              minlength="3"
              maxlength="30"
              required
              autocomplete="nickname"
              placeholder="Tu alias"
            />

            <label for="email">Correo electrónico</label>
            <input
              id="email"
              v-model="formulario.email"
              type="email"
              required
              autocomplete="email"
              placeholder="tu@correo.com"
            />

            <label for="password">Contraseña</label>
            <input
              id="password"
              v-model="formulario.password"
              type="password"
              minlength="6"
              required
              autocomplete="new-password"
              placeholder="Creá una contraseña"
            />

            <button
              class="perfil__boton perfil__boton--principal"
              type="submit"
              :disabled="guardando"
            >
              {{ guardando ? "Guardando..." : "Crear cuenta permanente" }}
            </button>
          </form>
        </div>

        <p v-else class="perfil__mensaje">
          Tu cuenta ya está registrada.
        </p>
      </template>

      <p v-if="mensaje" class="perfil__mensaje">
        {{ mensaje }}
      </p>

      <p v-if="error" class="perfil__error">
        {{ error }}
      </p>

      <button
        class="perfil__boton"
        type="button"
        @click="volver"
      >
        Volver al inicio
      </button>

      <button
        class="perfil__boton"
        type="button"
        :disabled="cerrandoSesion"
        @click="salirDeLaCuenta"
      >
        {{ cerrandoSesion ? "Cerrando sesión..." : "Cerrar sesión" }}
      </button>
    </section>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue"
import { useRouter } from "vue-router"
import {
  obtenerSesion,
  convertirInvitado,
  cerrarSesion
} from "../services/auth.js"
import { supabase } from "../services/supabase.js"

const router = useRouter()

const usuario = ref(null)
const alias = ref("")
const esInvitado = ref(false)
const cargando = ref(true)
const guardando = ref(false)
const cerrandoSesion = ref(false)
const mensaje = ref("")
const error = ref("")

const formulario = reactive({
  alias: "",
  email: "",
  password: ""
})

async function cargarPerfil() {
  cargando.value = true
  error.value = ""

  try {
    const { data, error: errorUsuario } =
      await supabase.auth.getUser()

    if (errorUsuario) throw errorUsuario

    const usuarioActual = data.user

    if (!usuarioActual) {
      await router.replace("/acceso")
      return
    }

    usuario.value = usuarioActual
    esInvitado.value = Boolean(usuarioActual.is_anonymous)

    const { data: perfil, error: errorPerfil } = await supabase
      .from("perfiles")
      .select("alias")
      .eq("id", usuarioActual.id)
      .maybeSingle()

    if (errorPerfil) throw errorPerfil

    alias.value =
      perfil?.alias || usuarioActual.user_metadata?.alias || ""

    formulario.alias = alias.value
  } catch (e) {
    error.value = e.message || "No se pudo cargar el perfil."
  } finally {
    cargando.value = false
  }
}

async function convertirCuenta() {
  guardando.value = true
  error.value = ""
  mensaje.value = ""

  try {
    await convertirInvitado(
      formulario.email,
      formulario.password,
      formulario.alias
    )

    formulario.password = ""

    await cargarPerfil()

    if (esInvitado.value) {
      mensaje.value =
        "Revisá tu correo si Supabase te pidió confirmar la dirección."
    } else {
      mensaje.value = "¡Tu cuenta permanente está creada!"
    }
  } catch (e) {
    error.value = e.message || "No se pudo convertir la cuenta."
  } finally {
    guardando.value = false
  }
}

function volver() {
  router.push("/")
}

async function salirDeLaCuenta() {
  if (cerrandoSesion.value) return

  cerrandoSesion.value = true
  error.value = ""
  mensaje.value = ""

  try {
    await cerrarSesion()
    await router.replace("/acceso")
  } catch (e) {
    error.value = e.message || "No se pudo cerrar la sesión."
  } finally {
    cerrandoSesion.value = false
  }
}

onMounted(cargarPerfil)
</script>

<style scoped>
.perfil {
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 16px;
}

.perfil__tarjeta {
  width: 100%;
  max-width: 480px;
  padding: 32px;
  border: 1px solid rgba(57, 255, 20, 0.2);
  border-radius: 20px;
  background: #101010;
  color: #ffffff;
}

.perfil h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.perfil__descripcion,
.perfil__conversion p {
  color: #b5b5b5;
  line-height: 1.5;
}

.perfil__dato {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 0;
  border-bottom: 1px solid #292929;
}

.perfil__etiqueta {
  color: #a0a0a0;
  font-size: 13px;
}

.perfil__conversion {
  margin-top: 24px;
}

.perfil__conversion h2 {
  font-size: 20px;
}

.perfil form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.perfil label {
  margin-top: 8px;
  font-size: 14px;
}

.perfil input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid #333333;
  border-radius: 9px;
  background: #191919;
  color: #ffffff;
  font: inherit;
}

.perfil input:focus {
  outline: 1px solid #39ff14;
  border-color: #39ff14;
}

.perfil__boton {
  width: 100%;
  margin-top: 14px;
  padding: 13px 16px;
  border: 1px solid #333333;
  border-radius: 10px;
  background: #191919;
  color: #ffffff;
  font-size: 15px;
  cursor: pointer;
}

.perfil__boton--principal {
  background: #39ff14;
  border-color: #39ff14;
  color: #080808;
  font-weight: bold;
}

.perfil__boton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.perfil__mensaje {
  color: #39ff14;
  overflow-wrap: anywhere;
}

.perfil__error {
  color: #ff6b6b;
  overflow-wrap: anywhere;
}
</style>
