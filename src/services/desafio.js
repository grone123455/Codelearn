
import { supabase } from "./supabase.js"

// ================================
// SESIÓN
// ================================

async function obtenerUsuarioActual() {
  const { data, error } = await supabase.auth.getUser()

  if (error) throw error

  return data.user
}

// ================================
// INICIAR PARTIDA COMPETITIVA
// ================================

export async function iniciarDesafioCompetitivo(partidaId) {
  const usuario = await obtenerUsuarioActual()

  if (!usuario || usuario.is_anonymous) {
    throw new Error(
      "Tenés que iniciar sesión con una cuenta para jugar en modo competitivo."
    )
  }

  const { data, error } = await supabase.functions.invoke(
    "iniciar-desafio",
    {
      body: { partidaId }
    }
  )

  if (error) {
    const mensaje = data?.error || error.message
    throw new Error(mensaje || "No se pudo iniciar el desafío.")
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  if (!data?.correcto || !data?.partidaId || !data?.grupo) {
    throw new Error(
      "El servidor no confirmó correctamente el inicio de la partida."
    )
  }

  return {
    partidaId: data.partidaId,
    grupo: data.grupo,
    iniciadaEn: data.iniciadaEn
  }
}


// ================================
// CREAR PARTIDA COMPETITIVA
// ================================

export async function crearPartidaCompetitiva() {
  const usuario = await obtenerUsuarioActual()

  if (!usuario || usuario.is_anonymous) {
    throw new Error(
      "Tenés que iniciar sesión con una cuenta para jugar en modo competitivo."
    )
  }

  const { data, error } = await supabase.functions.invoke(
    "crear-desafio",
    {
      body: {}
    }
  )

  if (error) {
    const mensaje = data?.error || error.message
    throw new Error(mensaje || "No se pudo preparar la partida.")
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  if (!data?.correcto || !data?.partidaId) {
    throw new Error(
      "El servidor no confirmó la creación de la partida."
    )
  }

  return data.partidaId
}

