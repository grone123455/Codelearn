
import { supabase } from "./supabase.js"

// Obtener información del enfrentamiento.
export async function obtenerDesempate(desempateId) {
  const { data, error } = await supabase.rpc(
    "obtener_desempate",
    { p_desempate_id: desempateId }
  )

  if (error) throw error
  return data
}

// Iniciar el único intento.
export async function iniciarDesempate(desempateId) {
  const { data, error } = await supabase.rpc(
    "iniciar_desempate",
    { p_desempate_id: desempateId }
  )

  if (error) throw error
  return data
}

// Guardar el resultado de Monkey Run.
export async function finalizarDesempate(
  desempateId,
  puntaje,
  tiempoSupervivencia
) {
  const { data, error } = await supabase.rpc(
    "finalizar_desempate",
    {
      p_desempate_id: desempateId,
      p_puntaje: puntaje,
      p_tiempo_supervivencia_segundos: tiempoSupervivencia
    }
  )

  if (error) throw error
  return data
}

// Registrar abandono.
export async function abandonarDesempate(desempateId) {
  const { data, error } = await supabase.rpc(
    "abandonar_desempate",
    { p_desempate_id: desempateId }
  )

  if (error) throw error
  return data
}
