
import { withSupabase } from "../_shared/withSupabase.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

function respuesta(
  datos: Record<string, unknown>,
  status = 200
) {
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
    return respuesta(
      { error: "Método no permitido." },
      405
    )
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

    const body = await req.json()

    const partidaId = body?.partidaId
    const preguntaId = body?.preguntaId
    const opcionSeleccionadaId =
      body?.opcionSeleccionadaId ?? null

    if (
      typeof partidaId !== "string" ||
      !UUID_REGEX.test(partidaId) ||
      typeof preguntaId !== "string" ||
      !UUID_REGEX.test(preguntaId)
    ) {
      return respuesta(
        { error: "Los identificadores de la partida o pregunta no son válidos." },
        400
      )
    }

    if (
      opcionSeleccionadaId !== null &&
      (
        typeof opcionSeleccionadaId !== "string" ||
        !UUID_REGEX.test(opcionSeleccionadaId)
      )
    ) {
      return respuesta(
        { error: "La opción seleccionada no es válida." },
        400
      )
    }

    const { data, error } = await ctx.supabase.rpc(
      "responder_pregunta_competitiva",
      {
        p_partida_id: partidaId,
        p_pregunta_id: preguntaId,
        p_opcion_seleccionada_id: opcionSeleccionadaId,
      }
    )

    if (error) {
      console.error("Error al registrar la respuesta:", error)

      return respuesta(
        { error: error.message || "No se pudo registrar la respuesta." },
        400
      )
    }

    if (
      !data?.respondida ||
      typeof data.correcta !== "boolean"
    ) {
      return respuesta(
        { error: "El servidor no devolvió un resultado válido para la respuesta." },
        500
      )
    }

    return respuesta({
      correcto: true,
      respondida: true,
      correcta: data.correcta,
    })
  } catch (error) {
    console.error("Error en responder-pregunta:", error)

    return respuesta(
      { error: "Ocurrió un error al procesar la respuesta." },
      500
    )
  }
})
