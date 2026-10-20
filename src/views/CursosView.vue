<template>
  <section class="pagina">
    <div class="encabezado">
      <span class="etiqueta">APRENDIZAJE</span>

      <h1>Cursos</h1>

      <p>
        Elegí un curso y comenzá a aprender programación desde cero.
      </p>
    </div>

    <div v-if="cargando" class="sin-cursos">
      <h2>Cargando cursos...</h2>

      <p>
        Estamos obteniendo los cursos desde la base de datos.
      </p>
    </div>

    <div v-else-if="error" class="sin-cursos">
      <h2>No se pudieron cargar los cursos</h2>

      <p>
        Ocurrió un error al conectar con la base de datos.
      </p>

      <button class="boton" @click="cargarCursos">
        Reintentar
      </button>
    </div>

    <div v-else-if="cursos.length > 0" class="cursos-grid">
      <CursoCard
        v-for="curso in cursos"
        :key="curso.id"
        :curso="curso"
        @seleccionar="seleccionarCurso"
      />
    </div>

    <div v-else class="sin-cursos">
      <h2>No hay cursos disponibles</h2>

      <p>
        Todavía no hay cursos para mostrar.
      </p>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"

import CursoCard from "../components/CursoCard.vue"
import { obtenerCursos } from "../services/datos.js"

const router = useRouter()

const cursos = ref([])
const cargando = ref(true)
const error = ref(false)

async function cargarCursos() {
  try {
    cargando.value = true
    error.value = false
    cursos.value = await obtenerCursos()
  } catch (e) {
    console.error("Error al cargar los cursos:", e)
    error.value = true
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarCursos()
})

function seleccionarCurso(curso) {
  if (curso.id === "curso-js") {
    router.push("/cursos/javascript")
  }
}
</script>

<style scoped>
.pagina {
  max-width: 1200px;
  margin: 0 auto;
  padding: 70px 7%;
}

.encabezado {
  margin-bottom: 45px;
}

.etiqueta {
  color: #22c55e;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 2px;
}

h1 {
  margin: 12px 0 10px;
  color: #f8fafc;
  font-size: 3rem;
  line-height: 1.1;
}

.encabezado p {
  max-width: 650px;
  margin: 0;
  color: #94a3b8;
  font-size: 1.05rem;
  line-height: 1.7;
}

.cursos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.sin-cursos {
  padding: 50px;
  text-align: center;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
}

.sin-cursos h2 {
  margin: 0 0 10px;
  color: #f8fafc;
}

.sin-cursos p {
  margin: 0;
  color: #94a3b8;
}

.sin-cursos .boton {
  margin-top: 20px;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  background: #22c55e;
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.sin-cursos .boton:hover {
  background: #4ade80;
}

@media (max-width: 900px) {
  .cursos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .pagina {
    padding: 50px 5%;
  }

  h1 {
    font-size: 2.2rem;
  }

  .encabezado p {
    font-size: 0.95rem;
  }

  .cursos-grid {
    grid-template-columns: 1fr;
  }
}
</style>