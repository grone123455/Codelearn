
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
        { error: "Tenés que iniciar sesión para jugar." },
        401,
      );
    }

    const ctx = await withSupabase(req);

    const { data: usuarioData, error: usuarioError } =
      await ctx.supabase.auth.getUser();

    const usuario = usuarioData?.user;

    if (usuarioError || !usuario || usuario.is_anonymous) {
      return responder(
        {
          error:
            "Tenés que iniciar sesión con una cuenta para jugar en modo competitivo.",
        },
        401,
      );
    }

    // Comprobar si ya existe una partida en curso.
    const { data: partidaActiva, error: activaError } =
      await ctx.supabaseAdmin
        .from("desafio_partidas")
        .select("id")
        .eq("usuario_id", usuario.id)
        .eq("modo", "competitivo")
        .eq("estado", "en_curso")
        .limit(1)
        .maybeSingle();

    if (activaError) {
      console.error("Error al consultar la partida activa:", activaError);

      return responder(
        { error: "No se pudo comprobar el estado de tus partidas." },
        500,
      );
    }

    if (partidaActiva) {
      return responder(
        { error: "Ya tenés una partida competitiva en curso." },
        409,
      );
    }

    // Reutilizar una partida que todavía no comenzó.
    const { data: partidaPendiente, error: pendienteError } =
      await ctx.supabaseAdmin
        .from("desafio_partidas")
        .select("id")
        .eq("usuario_id", usuario.id)
        .eq("modo", "competitivo")
        .eq("estado", "preparando")
        .limit(1)
        .maybeSingle();

    if (pendienteError) {
      console.error(
        "Error al consultar la partida pendiente:",
        pendienteError,
      );

      return responder(
        { error: "No se pudo consultar la partida pendiente." },
        500,
      );
    }

    if (partidaPendiente) {
      return responder({
        correcto: true,
        partidaId: partidaPendiente.id,
      });
    }

    // Crear una nueva partida sin asignar todavía el grupo.
    const { data: partida, error: crearError } =
      await ctx.supabaseAdmin
        .from("desafio_partidas")
        .insert({
          usuario_id: usuario.id,
          modo: "competitivo",
          estado: "preparando",
          cantidad_preguntas: 20,
          puntaje: 0,
          grupo: null,
        })
        .select("id")
        .single();

    if (crearError || !partida) {
      console.error("Error al crear la partida:", crearError);

      return responder(
        { error: "No se pudo preparar la partida competitiva." },
        500,
      );
    }

    return responder({
      correcto: true,
      partidaId: partida.id,
    });
  } catch (error) {
    console.error("Error en crear-desafio:", error);

    return responder(
      { error: "Ocurrió un error al preparar el desafío." },
      500,
    );
  }
});
