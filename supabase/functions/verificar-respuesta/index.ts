
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

    if (
      !preguntaId ||
      !opcionId ||
      !intentoId ||
      !leccionId
    ) {
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

    // Comprobar que la pregunta pertenece a la lección.
    const { data: pregunta, error: preguntaError } =
      await ctx.supabase
        .from("preguntas")
        .select("id, leccion_id, explicacion")
        .eq("id", preguntaId)
        .eq("leccion_id", leccionId)
        .maybeSingle();

    if (preguntaError || !pregunta) {
      console.error(
        "Error al consultar la pregunta:",
        preguntaError,
      );

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
      console.error(
        "Error al consultar la opción:",
        opcionError,
      );

      return responder(
        { error: "La opción seleccionada no es válida." },
        400,
      );
    }

    // Consultar la solución únicamente desde el servidor.
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

    // Buscar el intento y comprobar su propietario y lección.
    const {
      data: intentoExistente,
      error: intentoConsultaError,
    } = await ctx.supabase
      .from("intentos_leccion")
      .select("id, leccion_id, finalizado, finalizado_en")
      .eq("id", intentoId)
      .eq("usuario_id", usuario.id)
      .maybeSingle();

    if (intentoConsultaError) {
      console.error(
        "Error al consultar el intento:",
        intentoConsultaError,
      );

      return responder(
        { error: "No se pudo consultar el intento." },
        500,
      );
    }

    if (
      intentoExistente &&
      intentoExistente.leccion_id !== leccionId
    ) {
      return responder(
        { error: "El intento no corresponde a esta lección." },
        400,
      );
    }

    // Impedir que se modifique un intento ya finalizado.
    if (intentoExistente?.finalizado) {
      return responder(
        { error: "Este intento ya está finalizado." },
        409,
      );
    }

    // Crear el intento si todavía no existe.
    if (!intentoExistente) {
    const { error: crearIntentoError } =
      await ctx.supabaseAdmin
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

    // Guardar o actualizar la respuesta.
    const { error: guardarRespuestaError } =
      await ctx.supabaseAdmin
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

    // Obtener todas las preguntas de la lección.
    const { data: preguntas, error: preguntasError } =
      await ctx.supabase
        .from("preguntas")
        .select("id")
        .eq("leccion_id", leccionId);

    if (preguntasError || !preguntas) {
      console.error(
        "Error al consultar las preguntas de la lección:",
        preguntasError,
      );

      return responder(
        { error: "No se pudo calcular el resultado de la lección." },
        500,
      );
    }

    // Obtener las respuestas guardadas para este intento.
    const { data: respuestas, error: respuestasError } =
      await ctx.supabase
        .from("respuestas_intento")
        .select("pregunta_id, correcta")
        .eq("intento_id", intentoId);

    if (respuestasError || !respuestas) {
      console.error(
        "Error al consultar las respuestas del intento:",
        respuestasError,
      );

      return responder(
        { error: "No se pudo calcular el resultado del intento." },
        500,
      );
    }

    const idsPreguntas = new Set(
      preguntas.map((p) => p.id),
    );

    const respuestasLeccion = respuestas.filter(
      (r) => idsPreguntas.has(r.pregunta_id),
    );

    const totalPreguntas = preguntas.length;
    const respondidas = respuestasLeccion.length;

    const respuestasCorrectas = respuestasLeccion.filter(
      (r) => r.correcta,
    ).length;

    const respuestasIncorrectas =
      respondidas - respuestasCorrectas;

    const porcentaje =
      totalPreguntas > 0
        ? Math.round(
            (respuestasCorrectas / totalPreguntas) * 100,
          )
        : 0;

    const finalizado =
      totalPreguntas > 0 &&
      respondidas === totalPreguntas;

    // Mantener el criterio acordado: al menos dos tercios correctos.
    const minimoAprobacion =
      Math.ceil((totalPreguntas * 2) / 3);

    const aprobado =
      finalizado &&
      respuestasCorrectas >= minimoAprobacion;

    // Preservar la fecha original de finalización si ya estaba finalizado.
    const finalizadoEn = finalizado
      ? intentoExistente?.finalizado_en ??
        new Date().toISOString()
      : null;

    // Guardar los resultados calculados exclusivamente en el servidor.
    const { error: actualizarIntentoError } =
      await ctx.supabaseAdmin
        .from("intentos_leccion")
        .update({
          total_preguntas: totalPreguntas,
          respuestas_correctas: respuestasCorrectas,
          respuestas_incorrectas: respuestasIncorrectas,
          porcentaje,
          aprobado,
          finalizado,
          finalizado_en: finalizadoEn,
        })
        .eq("id", intentoId)
        .eq("usuario_id", usuario.id);

    if (actualizarIntentoError) {
      console.error(
        "Error al guardar los resultados del intento:",
        actualizarIntentoError,
      );

      return responder(
        {
          error:
            "La respuesta se guardó, pero no se pudo actualizar el resultado.",
        },
        500,
      );
    }

    return responder({
      correcta,
      explicacion: pregunta.explicacion,
      intentoId,
      totalPreguntas,
      respondidas,
      respuestasCorrectas,
      respuestasIncorrectas,
      porcentaje,
      aprobado,
      finalizado,
      finalizadoEn,
    });
  } catch (error) {
    console.error("Error en verificar-respuesta:", error);

    return responder(
      { error: "Ocurrió un error al verificar la respuesta." },
      500,
    );
  }
});
