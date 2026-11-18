
import { withSupabase } from "../_shared/withSupabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function responder(
  datos: Record<string, unknown>,
  status = 200,
) {
  return new Response(JSON.stringify(datos), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return responder(
      { error: "Método no permitido." },
      405,
    );
  }

  try {
    // Comprobar que exista el encabezado de autorización.
    if (!req.headers.get("Authorization")) {
      return responder(
        { error: "Tenés que iniciar sesión para comenzar el desafío." },
        401,
      );
    }

    const ctx = await withSupabase(req);

    // Verificar la identidad del participante.
    const { data: usuarioData, error: usuarioError } =
      await ctx.supabase.auth.getUser();

    const usuario = usuarioData?.user;

    if (usuarioError || !usuario) {
      return responder(
        { error: "Tenés que iniciar sesión para comenzar el desafío." },
        401,
      );
    }

    // Obtener y validar el identificador de la partida.
    const cuerpo = await req.json().catch(() => null);
    const partidaId = cuerpo?.partidaId;

    if (
      typeof partidaId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(partidaId)
    ) {
      return responder(
        { error: "El identificador de la partida no es válido." },
        400,
      );
    }

    // Iniciar la partida mediante la función RPC.
    const { data, error } = await ctx.supabase.rpc(
      "iniciar_desafio_competitivo",
      {
        p_partida_id: partidaId,
      },
    );

    if (error) {
      console.error(
        "Error al iniciar el desafío:",
        error,
      );

      const mensaje = error.message || "";

      if (
        mensaje.includes("período de espera") ||
        mensaje.includes("otra partida competitiva")
      ) {
        return responder(
          { error: mensaje },
          409,
        );
      }

      if (
        mensaje.includes("no existe") ||
        mensaje.includes("No tenés permiso") ||
        mensaje.includes("no está disponible") ||
        mensaje.includes("solo inicia")
      ) {
        return responder(
          { error: mensaje },
          400,
        );
      }

      return responder(
        { error: "No se pudo iniciar el desafío." },
        500,
      );
    }

    const resultado = Array.isArray(data)
      ? data[0]
      : data;

    if (!resultado) {
      return responder(
        { error: "No se recibió la confirmación del inicio." },
        500,
      );
    }

    return responder({
      correcto: true,
      partidaId: resultado.partida_id,
      grupo: resultado.grupo_asignado,
      iniciadaEn: resultado.iniciada_en,
    });
  } catch (error) {
    console.error(
      "Error en iniciar-desafio:",
      error,
    );

    return responder(
      { error: "Ocurrió un error al iniciar el desafío." },
      500,
    );
  }
});
