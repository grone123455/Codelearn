
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
    if (!req.headers.get("Authorization")) {
      return responder(
        { error: "Tenés que iniciar sesión para jugar en modo competitivo." },
        401,
      );
    }

    const ctx = await withSupabase(req);

    const { data: usuarioData, error: usuarioError } =
      await ctx.supabase.auth.getUser();

    const usuario = usuarioData?.user;

    if (usuarioError || !usuario || usuario.is_anonymous) {
      return responder(
        { error: "Tenés que iniciar sesión para jugar en modo competitivo." },
        401,
      );
    }

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

    const { data, error } = await ctx.supabase.rpc(
      "iniciar_desafio_competitivo",
      {
        p_partida_id: partidaId,
      },
    );

    if (error) {
      console.error("Error al iniciar el desafío:", error);

      if (error.message === "COOLDOWN_ACTIVO" && error.details) {
        return responder(
          {
            codigo: "COOLDOWN_ACTIVO",
            cooldownHasta: error.details,
            error: "Todavía estás dentro del período de espera.",
          },
          400,
        );
      }

      return responder(
        { error: error.message || "No se pudo iniciar el desafío." },
        400,
      );
    }

    const resultado = Array.isArray(data) ? data[0] : data;

    if (
      !resultado ||
      typeof resultado !== "object" ||
      !resultado.grupo_asignado
    ) {
      return responder(
        { error: "El servidor no devolvió los datos esperados al iniciar la partida." },
        500,
      );
    }

    return responder({
      correcto: true,
      partidaId: resultado.partida_id ?? partidaId,
      grupo: resultado.grupo_asignado,
      iniciadaEn: resultado.iniciada_en ?? null,
    });
  } catch (error) {
    console.error("Error en iniciar-desafio:", error);

    return responder(
      { error: "Ocurrió un error al iniciar el desafío." },
      500,
    );
  }
});
