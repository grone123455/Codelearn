
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

// ================================
// OBTENER SIGUIENTE PREGUNTA
// ================================

export async function obtenerSiguientePregunta(partidaId) {
  const usuario = await obtenerUsuarioActual()

  if (!usuario || usuario.is_anonymous) {
    throw new Error(
      "Tenés que iniciar sesión con una cuenta para jugar en modo competitivo."
    )
  }

  const { data, error } = await supabase.functions.invoke(
    "obtener-pregunta",
    {
      body: { partidaId }
    }
  )

  if (error) {
    const mensaje = data?.error || error.message

    throw new Error(
      mensaje || "No se pudo obtener la siguiente pregunta."
    )
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  if (!data?.correcto) {
    throw new Error(
      "El servidor no confirmó la entrega de la pregunta."
    )
  }

  if (data.finalizado) {
    return {
      finalizado: true,
      pregunta: null,
      iniciadaEn: null
    }
  }

  if (!data.pregunta || !data.iniciadaEn) {
    throw new Error(
      "El servidor devolvió una pregunta incompleta."
    )
  }

  return {
    finalizado: false,
    pregunta: data.pregunta,
    iniciadaEn: data.iniciadaEn
  }
}

// ================================
// RESPONDER PREGUNTA COMPETITIVA
// ================================

export async function responderPreguntaCompetitiva(
  partidaId,
  preguntaId,
  opcionSeleccionadaId = null
) {
  const usuario = await obtenerUsuarioActual()

  if (!usuario || usuario.is_anonymous) {
    throw new Error(
      "Tenés que iniciar sesión con una cuenta para jugar en modo competitivo."
    )
  }

  const { data, error } = await supabase.functions.invoke(
    "responder-pregunta",
    {
      body: {
        partidaId,
        preguntaId,
        opcionSeleccionadaId
      }
    }
  )

  if (error) {
    const mensaje = data?.error || error.message

    throw new Error(
      mensaje || "No se pudo registrar la respuesta."
    )
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  if (!data?.correcto || !data?.respondida) {
    throw new Error(
      "El servidor no confirmó correctamente el registro de la respuesta."
    )
  }

  return true
}

// ================================
// FINALIZAR PARTIDA COMPETITIVA
// ================================



export async function finalizarDesafioCompetitivo(
  partidaId,
  abandonada = false
) {
  const usuario = await obtenerUsuarioActual()

  if (!usuario || usuario.is_anonymous) {
    throw new Error(
      "Tenés que iniciar sesión con una cuenta para finalizar el desafío."
    )
  }

  const { data, error } = await supabase.functions.invoke(
    "finalizar-desafio",
    {
      body: {
        partidaId,
        abandonada
      }
    }
  )

  if (error) {
    const mensaje = data?.error || error.message

    throw new Error(
      mensaje || "No se pudo finalizar la partida."
    )
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  if (
    !data ||
    data.finalizada !== true ||
    !["finalizada", "abandonada"].includes(data.estado) ||
    typeof data.puntaje !== "number" ||
    !Number.isFinite(data.puntaje) ||
    typeof data.tiempoSegundos !== "number" ||
    !Number.isFinite(data.tiempoSegundos) ||
    typeof data.actualizoRanking !== "boolean"
  ) {
    throw new Error(
      "El servidor devolvió un resultado de finalización inválido."
    )
  }

  return {
    estado: data.estado,
    puntaje: data.puntaje,
    tiempoSegundos: data.tiempoSegundos,
    cooldownHasta: data.cooldownHasta,
    actualizoRanking: data.actualizoRanking
  }
}
