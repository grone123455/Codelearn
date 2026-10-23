
import { supabase } from "./supabase.js"

// Iniciar sesión como invitado
export async function iniciarComoInvitado() {
  const { data, error } = await supabase.auth.signInAnonymously()

  if (error) throw error

  return data
}

// Convertir una cuenta de invitado en permanente
export async function convertirInvitado(email, password, alias) {
  const emailLimpio = email.trim()
  const aliasLimpio = alias.trim()

  if (aliasLimpio.length < 3 || aliasLimpio.length > 30) {
    throw new Error("El alias debe tener entre 3 y 30 caracteres.")
  }

  const { data: sesionData, error: sesionError } =
    await supabase.auth.getSession()

  if (sesionError) throw sesionError

  const usuario = sesionData.session?.user

  if (!usuario) {
    throw new Error("No hay una sesión activa.")
  }

  if (!usuario.is_anonymous) {
    throw new Error("La sesión actual no es de un invitado.")
  }

  const { data, error } = await supabase.auth.updateUser({
    email: emailLimpio,
    password,
    data: {
      ...usuario.user_metadata,
      alias: aliasLimpio
    }
  })

  if (error) throw error

  const { error: errorPerfil } = await supabase
    .from("perfiles")
    .upsert(
      {
        id: usuario.id,
        alias: aliasLimpio,
        actualizado_en: new Date().toISOString()
      },
      { onConflict: "id" }
    )

  if (errorPerfil) {
    throw new Error(
      "La cuenta se actualizó, pero no se pudo guardar el alias."
    )
  }

  return data
}

// Registrar una cuenta nueva
export async function registrarUsuario(email, password, alias) {
  const aliasLimpio = alias.trim()

  if (aliasLimpio.length < 3 || aliasLimpio.length > 30) {
    throw new Error("El alias debe tener entre 3 y 30 caracteres.")
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        alias: aliasLimpio
      }
    }
  })

  if (error) throw error

  if (data.user && data.session) {
    const { error: errorPerfil } = await supabase
      .from("perfiles")
      .upsert(
        {
          id: data.user.id,
          alias: aliasLimpio,
          actualizado_en: new Date().toISOString()
        },
        { onConflict: "id" }
      )

    if (errorPerfil) {
      throw new Error(
        "La cuenta se creó, pero no se pudo guardar el alias."
      )
    }
  }

  return data
}

// Iniciar sesión con una cuenta existente
export async function iniciarSesion(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password
  })

  if (error) throw error

  return data
}

// Cerrar sesión
export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut()

  if (error) throw error
}

// Obtener la sesión actual
export async function obtenerSesion() {
  const { data, error } = await supabase.auth.getSession()

  if (error) throw error

  return data.session
}

// Escuchar cambios en la sesión
export function escucharCambiosSesion(callback) {
  return supabase.auth.onAuthStateChange((evento, sesion) => {
    callback(evento, sesion)
  })
}

// Enviar correo para recuperar la contraseña
export async function recuperarContrasena(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    email.trim(),
    {
      redirectTo: `${window.location.origin}/recuperar-contrasena`
    }
  )

  if (error) throw error

  return data
}

// Guardar una contraseña nueva después de recuperar la cuenta
export async function actualizarContrasena(password) {
  const { data, error } = await supabase.auth.updateUser({
    password
  })

  if (error) throw error

  return data
}
