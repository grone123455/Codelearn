
import { supabase } from "./supabase.js"

// Obtener las notificaciones del usuario actual.
export async function obtenerNotificaciones() {
  const { data, error } = await supabase.auth.getSession()

  if (error) throw error

  const usuario = data.session?.user

  if (!usuario || usuario.is_anonymous) {
    return []
  }

  const { data: notificaciones, error: errorConsulta } = await supabase
    .from("notificaciones")
    .select(`
      id,
      desempate_id,
      tipo,
      titulo,
      mensaje,
      leida,
      creado_en
    `)
    .eq("usuario_id", usuario.id)
    .order("creado_en", { ascending: false })

  if (errorConsulta) throw errorConsulta

  return notificaciones || []
}

// Marcar una notificación como leída.
export async function marcarNotificacionLeida(notificacionId) {
  const { data, error } = await supabase.auth.getSession()

  if (error) throw error

  const usuario = data.session?.user

  if (!usuario || usuario.is_anonymous) {
    throw new Error("Tenés que iniciar sesión.")
  }

  const { error: errorActualizacion } = await supabase
    .from("notificaciones")
    .update({ leida: true })
    .eq("id", notificacionId)
    .eq("usuario_id", usuario.id)

  if (errorActualizacion) throw errorActualizacion
}
