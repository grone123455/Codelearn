
import { withSupabase } from "../_shared/withSupabase.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

function respuesta(datos: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(datos), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  })
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return respuesta({ error: "Método no permitido." }, 405)
  }

  try {
    const authorization = req.headers.get("Authorization")

    if (!authorization) {
      return respuesta(
        { error: "No se recibió la autorización." },
        401
      )
    }

    const ctx = await withSupabase(req)

    const { data: usuarioData, error: usuarioError } =
      await ctx.supabase.auth.getUser()

    const usuario = usuarioData?.user

    if (usuarioError || !usuario || usuario.is_anonymous) {
      return respuesta(
        { error: "Tenés que iniciar sesión con una cuenta." },
        401
      )
    }

    let body: Record<string, unknown>

    try {
      body = await req.json()
    } catch {
      return respuesta(
        { error: "El cuerpo de la solicitud no es válido." },
        400
      )
    }

    const partidaId = body?.partidaId
    const abandonada = body?.abandonada ?? false

    if (
      typeof partidaId !== "string" ||
      !UUID_REGEX.test(partidaId)
    ) {
      return respuesta(
        { error: "El identificador de la partida no es válido." },
        400
      )
    }

    if (typeof abandonada !== "boolean") {
      return respuesta(
        { error: "El estado de abandono no es válido." },
        400
      )
    }

    const { data, error } = await ctx.supabase.rpc(
      "finalizar_desafio_competitivo",
      {
        p_partida_id: partidaId,
        p_abandonada: abandonada,
      }
    )

    if (error) {
      console.error("Error al finalizar el desafío:", error)

      return respuesta(
        {
          error: error.message || "No se pudo finalizar la partida.",
        },
        400
      )
    }

    if (
      !data ||
      data.finalizada !== true ||
      !["finalizada", "abandonada"].includes(data.estado) ||
      typeof data.puntaje !== "number" ||
      typeof data.tiempoSegundos !== "number"
    ) {
      console.error("Respuesta inesperada al finalizar:", data)

      return respuesta(
        { error: "El servidor devolvió un resultado inválido." },
        500
      )
    }

    return respuesta(data)
  } catch (error) {
    console.error("Error inesperado:", error)

    return respuesta(
      { error: "Ocurrió un error al finalizar el desafío." },
      500
    )
  }
})
