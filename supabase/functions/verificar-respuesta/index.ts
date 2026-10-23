
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
    const ctx = await withSupabase(req);

    const {
      preguntaId,
      opcionId,
      intentoId,
      leccionId,
    } = await req.json();

    if (!preguntaId || !opcionId || !intentoId || !leccionId) {
      return responder(
        { error: "Faltan datos para verificar la respuesta." },
        400,
      );
    }

    const { data: usuarioData, error: usuarioError } =
      await ctx.supabase.auth.getUser();

    const usuario = usuarioData?.user;

    if (usuarioError || !usuario) {
      return responder(
        { error: "Tenés que iniciar sesión para responder." },
        401,
      );
    }

    // Comprobar que la pregunta pertenece a la lección indicada.
    const { data: pregunta, error: preguntaError } =
      await ctx.supabase
        .from("preguntas")
        .select("id, leccion_id, explicacion")
        .eq("id", preguntaId)
        .eq("leccion_id", leccionId)
        .maybeSingle();

    if (preguntaError || !pregunta) {
      console.error("Error al consultar la pregunta:", preguntaError);

      return responder(
        { error: "La pregunta no pertenece a esta lección." },
        400,
      );
    }

    // Comprobar que la opción pertenece a la pregunta.
    const { data: opcion, error: opcionError } =
      await ctx.supabase
        .from("opciones")
        .select("id, pregunta_id")
        .eq("id", opcionId)
        .eq("pregunta_id", preguntaId)
        .maybeSingle();

    if (opcionError || !opcion) {
      console.error("Error al consultar la opción:", opcionError);

      return responder(
        { error: "La opción seleccionada no es válida." },
        400,
      );
    }

    // Consultar la solución solamente desde el servidor.
    const { data: solucion, error: solucionError } =
      await ctx.supabaseAdmin
        .from("soluciones")
        .select("opcion_correcta_id")
        .eq("pregunta_id", preguntaId)
        .maybeSingle();

    if (solucionError || !solucion) {
      console.error(
        "Error al consultar la solución:",
        solucionError,
      );

      return responder(
        { error: "No se pudo verificar la respuesta." },
        500,
      );
    }

    const correcta =
      solucion.opcion_correcta_id === opcionId;

    // Buscar el intento del usuario.
    const { data: intentoExistente, error: intentoConsultaError } =
      await ctx.supabase
        .from("intentos_leccion")
        .select("id")
        .eq("id", intentoId)
        .eq("usuario_id", usuario.id)
        .maybeSingle();

    if (intentoConsultaError) {
      console.error(
        "Error al consultar el intento:",
        intentoConsultaError,
      );

      return responder(
        { error: "No se pudo guardar el intento." },
        500,
      );
    }

    // Crear el intento si todavía no existe.
    if (!intentoExistente) {
      const { error: crearIntentoError } =
        await ctx.supabase
          .from("intentos_leccion")
          .insert({
            id: intentoId,
            usuario_id: usuario.id,
            leccion_id: leccionId,
          });

      if (crearIntentoError) {
        console.error(
          "Error al crear el intento:",
          crearIntentoError,
        );

        return responder(
          { error: "No se pudo crear el intento de la lección." },
          500,
        );
      }
    }

    // Guardar o actualizar la respuesta seleccionada.
    const { error: guardarRespuestaError } =
      await ctx.supabase
        .from("respuestas_intento")
        .upsert(
          {
            intento_id: intentoId,
            pregunta_id: preguntaId,
            opcion_seleccionada_id: opcionId,
            correcta,
          },
          {
            onConflict: "intento_id,pregunta_id",
          },
        );

    if (guardarRespuestaError) {
      console.error(
        "Error al guardar la respuesta:",
        guardarRespuestaError,
      );

      return responder(
        { error: "No se pudo guardar la respuesta." },
        500,
      );
    }

    // Devolver el resultado con los encabezados CORS.
    return responder({
      correcta,
      explicacion: pregunta.explicacion,
      intentoId,
    });
  } catch (error) {
    console.error("Error en verificar-respuesta:", error);

    return responder(
      { error: "Ocurrió un error al verificar la respuesta." },
      500,
    );
  }
});
