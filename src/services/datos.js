import { supabase } from "./supabase"

// ================================
// CURSOS
// ================================

export async function obtenerCursos() {
  const { data, error } = await supabase
    .from("cursos")
    .select("id, nombre, descripcion, estado")
    .eq("estado", "disponible")

  if (error) {
    console.error("Error al obtener cursos:", error)
    throw error
  }

  return data
}

export async function obtenerCurso(id) {
  const { data, error } = await supabase
    .from("cursos")
    .select("id, nombre, descripcion, estado")
    .eq("id", id)
    .eq("estado", "disponible")
    .maybeSingle()

  if (error) {
    console.error("Error al obtener curso:", error)
    throw error
  }

  return data
}

// ================================
// UNIDADES
// ================================

export async function obtenerUnidadesPorCurso(cursoId) {
  const { data, error } = await supabase
    .from("unidades")
    .select(
      "id, curso_id, orden, titulo, descripcion, estado"
    )
    .eq("curso_id", cursoId)
    .eq("estado", "publicada")
    .order("orden", {
      ascending: true
    })

  if (error) {
    console.error(
      "Error al obtener las unidades:",
      error
    )

    throw error
  }

  return data.map(unidad => ({
    id: unidad.id,
    cursoId: unidad.curso_id,
    orden: unidad.orden,
    titulo: unidad.titulo,
    descripcion: unidad.descripcion,
    estado: unidad.estado
  }))
}

export async function obtenerUnidad(id) {
  const { data, error } = await supabase
    .from("unidades")
    .select(
      "id, curso_id, orden, titulo, descripcion, estado"
    )
    .eq("id", id)
    .eq("estado", "publicada")
    .maybeSingle()

  if (error) {
    console.error(
      "Error al obtener la unidad:",
      error
    )

    throw error
  }

  if (!data) {
    return null
  }

  return {
    id: data.id,
    cursoId: data.curso_id,
    orden: data.orden,
    titulo: data.titulo,
    descripcion: data.descripcion,
    estado: data.estado
  }
}

// ================================
// LECCIONES
// ================================

export async function obtenerLeccionesPorUnidad(
  unidadId
) {
  const { data, error } = await supabase
    .from("lecciones")
    .select(
      "id, unidad_id, orden, titulo, explicacion, codigo"
    )
    .eq("unidad_id", unidadId)
    .order("orden", {
      ascending: true
    })

  if (error) {
    console.error(
      "Error al obtener las lecciones:",
      error
    )

    throw error
  }

  return data.map(leccion => ({
    id: leccion.id,
    unidadId: leccion.unidad_id,
    orden: leccion.orden,
    titulo: leccion.titulo,
    explicacion: leccion.explicacion,
    codigo: leccion.codigo
  }))
}

export async function obtenerLeccion(id) {
  const { data, error } = await supabase
    .from("lecciones")
    .select(
      "id, unidad_id, orden, titulo, explicacion, codigo"
    )
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error(
      "Error al obtener la lección:",
      error
    )

    throw error
  }

  if (!data) {
    return null
  }

  return {
    id: data.id,
    unidadId: data.unidad_id,
    orden: data.orden,
    titulo: data.titulo,
    explicacion: data.explicacion,
    codigo: data.codigo
  }
}

// ================================
// ACTIVIDADES
// ================================

export async function obtenerActividadesPorLeccion(
  leccionId
) {
  const {
    data: preguntas,
    error: errorPreguntas
  } = await supabase
    .from("preguntas")
    .select(
      "id, leccion_id, orden, enunciado, explicacion"
    )
    .eq("leccion_id", leccionId)
    .order("orden", {
      ascending: true
    })

  if (errorPreguntas) {
    console.error(
      "Error al obtener las preguntas:",
      errorPreguntas
    )

    throw errorPreguntas
  }

  if (!preguntas || preguntas.length === 0) {
    return []
  }

  const actividades = []

  for (const pregunta of preguntas) {
    const {
      data: opciones,
      error: errorOpciones
    } = await supabase
      .from("opciones")
      .select(
        "id, pregunta_id, texto"
      )
      .eq("pregunta_id", pregunta.id)

    if (errorOpciones) {
      console.error(
        "Error al obtener las opciones:",
        errorOpciones
      )

      throw errorOpciones
    }

    actividades.push({
      id: pregunta.id,
      leccionId: pregunta.leccion_id,
      pregunta: pregunta.enunciado,
      explicacion: pregunta.explicacion,
      opciones: opciones.map(opcion => ({
        id: opcion.id,
        texto: opcion.texto
      }))
    })
  }

  return actividades
}

export async function obtenerActividad(id) {
  const {
    data: pregunta,
    error: errorPregunta
  } = await supabase
    .from("preguntas")
    .select(
      "id, leccion_id, orden, enunciado, explicacion"
    )
    .eq("id", id)
    .maybeSingle()

  if (errorPregunta) {
    console.error(
      "Error al obtener la actividad:",
      errorPregunta
    )

    throw errorPregunta
  }

  if (!pregunta) {
    return null
  }

  const {
    data: opciones,
    error: errorOpciones
  } = await supabase
    .from("opciones")
    .select(
      "id, pregunta_id, texto"
    )
    .eq("pregunta_id", id)

  if (errorOpciones) {
    console.error(
      "Error al obtener las opciones:",
      errorOpciones
    )

    throw errorOpciones
  }

  return {
    id: pregunta.id,
    leccionId: pregunta.leccion_id,
    pregunta: pregunta.enunciado,
    explicacion: pregunta.explicacion,  
    opciones: opciones.map(opcion => ({
      id: opcion.id,
      texto: opcion.texto
    }))
  }
}