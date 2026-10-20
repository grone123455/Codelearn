// Function: verificar-respuesta
//
// Recibe el identificador de una pregunta y el de la opción seleccionada,
// y devuelve si la respuesta es correcta y su explicación.
//
// La tabla `soluciones` no tiene políticas de lectura para el rol público,
// por eso esta función la consulta desde el servidor con service role
// (ctx.supabaseAdmin). El cliente nunca descarga el conjunto de soluciones.

import "@supabase/functions-js/edge-runtime.d.ts"
import { withSupabase } from "@supabase/server"

const encabezados = {
  "Content-Type": "application/json"
}

function respuestaError(status, mensaje) {
  return Response.json(
    { error: mensaje },
    { status, headers: encabezados }
  )
}

export default {
  fetch: withSupabase(
    { auth: ["publishable", "secret"] },

    async (req, ctx) => {
      if (req.method !== "POST") {
        return respuestaError(
          405,
          "Método no permitido. Utilizá POST."
        )
      }

      let cuerpo = null

      try {
        cuerpo = await req.json()
      } catch {
        return respuestaError(
          400,
          "El cuerpo de la petición no es un JSON válido."
        )
      }

      const { preguntaId, opcionId } =
        cuerpo || {}

      if (
        typeof preguntaId !== "string" ||
        typeof opcionId !== "string" ||
        preguntaId.length === 0 ||
        opcionId.length === 0
      ) {
        return respuestaError(
          400,
          "Se requieren los campos preguntaId y opcionId."
        )
      }

      // 1) La pregunta debe existir y estar disponible:
      //    su unidad debe estar publicada y su curso disponible.

      const {
        data: pregunta,
        error: errorPregunta
      } = await ctx.supabaseAdmin
        .from("preguntas")
        .select(
          `
          id,
          explicacion,
          lecciones (
            id,
            unidades (
              estado,
              cursos ( estado )
            )
          )
        `
        )
        .eq("id", preguntaId)
        .maybeSingle()

      if (errorPregunta) {
        console.error(
          "Error al consultar la pregunta:",
          errorPregunta
        )

        return respuestaError(
          500,
          "No se pudo consultar la pregunta."
        )
      }

      if (!pregunta) {
        return respuestaError(
          404,
          "La pregunta solicitada no existe."
        )
      }

      const unidad =
        pregunta.lecciones?.unidades

      const disponible =
        unidad?.estado === "publicada" &&
        unidad?.cursos?.estado === "disponible"

      if (!disponible) {
        return respuestaError(
          404,
          "La pregunta solicitada no está disponible."
        )
      }

      // 2) La opción seleccionada debe pertenecer a esa pregunta.

      const {
        data: opcion,
        error: errorOpcion
      } = await ctx.supabaseAdmin
        .from("opciones")
        .select("id")
        .eq("id", opcionId)
        .eq("pregunta_id", preguntaId)
        .maybeSingle()

      if (errorOpcion) {
        console.error(
          "Error al consultar la opción:",
          errorOpcion
        )

        return respuestaError(
          500,
          "No se pudo consultar la opción seleccionada."
        )
      }

      if (!opcion) {
        return respuestaError(
          404,
          "La opción seleccionada no pertenece a esta pregunta."
        )
      }

      // 3) Se obtiene la solución almacenada (solo desde el servidor).

      const {
        data: solucion,
        error: errorSolucion
      } = await ctx.supabaseAdmin
        .from("soluciones")
        .select("opcion_correcta_id")
        .eq("pregunta_id", preguntaId)
        .maybeSingle()

      if (errorSolucion) {
        console.error(
          "Error al consultar la solución:",
          errorSolucion
        )

        return respuestaError(
          500,
          "No se pudo consultar la solución."
        )
      }

      if (!solucion) {
        return respuestaError(
          500,
          "Esta pregunta todavía no tiene una solución registrada."
        )
      }

      // 4) Se compara la selección con la solución.

      const correcta =
        solucion.opcion_correcta_id ===
        opcionId

      return Response.json(
        {
          correcta,
          explicacion: pregunta.explicacion
        },
        { headers: encabezados }
      )
    }
  )
}
