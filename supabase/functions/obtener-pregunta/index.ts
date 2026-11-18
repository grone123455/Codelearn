
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
        { error: "Tenés que iniciar sesión para jugar en modo competitivo." },
        401,
      );
    }

    const ctx = await withSupabase(req);

    // Verificar la identidad del participante.
    const { data: usuarioData, error: usuarioError } =
      await ctx.supabase.auth.getUser();

    const usuario = usuarioData?.user;

    if (usuarioError || !usuario || usuario.is_anonymous) {
      return responder(
        { error: "Tenés que iniciar sesión para jugar en modo competitivo." },
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

    // Solicitar la siguiente pregunta mediante la función SQL.
    const { data, error } = await ctx.supabase.rpc(
      "obtener_siguiente_pregunta_competitiva",
      {
        p_partida_id: partidaId,
      },
    );

    if (error) {
      console.error(
        "Error al obtener la pregunta:",
        error,
      );

      const mensaje = error.message || "";

      if (
        mensaje.includes("no existe") ||
        mensaje.includes("No tenés permiso") ||
        mensaje.includes("no está disponible") ||
        mensaje.includes("no tiene un grupo asignado")
      ) {
        return responder(
          { error: mensaje },
          400,
        );
      }

      return responder(
        { error: "No se pudo obtener la siguiente pregunta." },
        500,
      );
    }

    if (!data || typeof data !== "object") {
      return responder(
        { error: "El servidor no devolvió una respuesta válida." },
        500,
      );
    }

    // Informar si ya no quedan preguntas disponibles.
    if (data.finalizado === true) {
      return responder({
        correcto: true,
        finalizado: true,
      });
    }

    if (!data.pregunta || !data.iniciada_en) {
      return responder(
        { error: "La pregunta recibida está incompleta." },
        500,
      );
    }

    return responder({
      correcto: true,
      finalizado: false,
      pregunta: data.pregunta,
      iniciadaEn: data.iniciada_en,
    });
  } catch (error) {
    console.error(
      "Error en obtener-pregunta:",
      error,
    );

    return responder(
      { error: "Ocurrió un error al obtener la pregunta." },
      500,
    );
  }
});
