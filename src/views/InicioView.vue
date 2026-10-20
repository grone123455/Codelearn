<template>
  <section class="pagina">
    <div class="hero">
      <div class="hero-contenido">
        <span class="etiqueta">
          PLATAFORMA DE APRENDIZAJE
        </span>

        <h1>
          Aprendé a programar.
          <span>Creá tu futuro.</span>
        </h1>

        <p>
          CodeLearn es una plataforma educativa diseñada
          para aprender programación mediante cursos,
          lecciones y actividades interactivas.
        </p>

        <div class="acciones">
          <button
            class="principal"
            @click="irACursos"
          >
            Explorar cursos →
          </button>

          <button
            class="secundario"
            @click="irAJavaScript"
          >
            Comenzar JavaScript
          </button>
        </div>
      </div>

      <div class="codigo">
        <div class="codigo-cabecera">
          <div class="puntos">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <span>
            ejemplo.js
          </span>
        </div>

        <pre><code><span class="palabra">const</span> <span class="variable">nombre</span> = <span class="texto">"CodeLearn"</span>;

<span class="palabra">function</span> <span class="funcion">aprender</span>() {
  <span class="palabra">return</span> <span class="texto">"Seguí aprendiendo"</span>;
}

<span class="funcion">console</span>.<span class="metodo">log</span>(
  <span class="funcion">aprender</span>()
);</code></pre>
      </div>
    </div>

    <div class="caracteristicas">
      <div class="seccion-encabezado">
        <span class="etiqueta">
          CODELEARN
        </span>

        <h2>
          Aprendé haciendo
        </h2>

        <p>
          Una forma simple de aprender programación,
          combinando teoría y práctica.
        </p>
      </div>

      <div class="caracteristicas-grid">
        <article class="caracteristica">
          <div class="icono">
            &lt;/&gt;
          </div>

          <h3>
            Cursos
          </h3>

          <p>
            Accedé a cursos organizados en unidades
            para aprender diferentes tecnologías.
          </p>
        </article>

        <article class="caracteristica">
          <div class="icono">
            ✓
          </div>

          <h3>
            Práctica
          </h3>

          <p>
            Resolvé actividades interactivas y
            comprobá cuánto aprendiste.
          </p>
        </article>

        <article class="caracteristica">
          <div class="icono">
            %
          </div>

          <h3>
            Progreso
          </h3>

          <p>
            Consultá tus resultados y avanzá
            progresivamente por cada unidad.
          </p>
        </article>
      </div>
    </div>

    <div class="llamada">
      <div>
        <span class="etiqueta">
          EMPEZÁ AHORA
        </span>

        <h2>
          Tu próximo programa empieza acá.
        </h2>

        <p>
          Elegí un curso y comenzá a aprender
          programación paso a paso.
        </p>
      </div>

      <button
        class="principal"
        @click="irACursos"
      >
        Ver cursos →
      </button>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router"

const router = useRouter()

function irACursos() {
  router.push("/cursos")
}

function irAJavaScript() {
  router.push("/cursos/javascript")
}
</script>

<style scoped>
.pagina {
  max-width: 1200px;

  margin: 0 auto;

  padding: 70px 7% 80px;
}

.hero {
  min-height: 500px;

  display: grid;

  grid-template-columns: 1.1fr 0.9fr;

  align-items: center;

  gap: 60px;

  padding: 50px 0 80px;
}

.hero-contenido {
  max-width: 650px;
}

.etiqueta {
  color: #22c55e;

  font-size: 0.75rem;
  font-weight: 700;

  letter-spacing: 2px;
}

h1 {
  margin: 15px 0 20px;

  color: #f8fafc;

  font-size: 4rem;
  line-height: 1.08;
  letter-spacing: -1.5px;
}

h1 span {
  display: block;

  color: #22c55e;
}

.hero-contenido > p {
  max-width: 600px;

  margin: 0;

  color: #94a3b8;

  font-size: 1.05rem;
  line-height: 1.8;
}

.acciones {
  display: flex;

  align-items: center;

  gap: 12px;

  margin-top: 30px;
}

.principal,
.secundario {
  padding: 13px 20px;

  border-radius: 10px;

  font-size: 0.9rem;
  font-weight: 700;

  cursor: pointer;

  transition: 0.2s;
}

.principal {
  border: none;

  background: #22c55e;

  color: #0f172a;
}

.principal:hover {
  background: #4ade80;

  transform: translateY(-2px);
}

.secundario {
  border: 1px solid #334155;

  background: transparent;

  color: #94a3b8;
}

.secundario:hover {
  border-color: #22c55e;

  color: #22c55e;
}

.codigo {
  overflow: hidden;

  background: #020617;

  border: 1px solid #334155;

  border-radius: 16px;

  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
}

.codigo-cabecera {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding: 13px 18px;

  background: #1e293b;

  color: #64748b;

  font-size: 0.7rem;
}

.puntos {
  display: flex;

  gap: 6px;
}

.puntos span {
  width: 8px;
  height: 8px;

  border-radius: 50%;

  background: #475569;
}

pre {
  margin: 0;

  padding: 30px;

  overflow-x: auto;
}

code {
  color: #cbd5e1;

  font-family: "Courier New", monospace;

  font-size: 0.9rem;
  line-height: 2;
}

.palabra {
  color: #c084fc;
}

.variable {
  color: #38bdf8;
}

.texto {
  color: #4ade80;
}

.funcion {
  color: #60a5fa;
}

.metodo {
  color: #22c55e;
}

.caracteristicas {
  padding: 80px 0;
}

.seccion-encabezado {
  max-width: 650px;

  margin-bottom: 35px;
}

.seccion-encabezado h2 {
  margin: 10px 0 10px;

  color: #f8fafc;

  font-size: 2rem;
}

.seccion-encabezado p {
  margin: 0;

  color: #94a3b8;

  line-height: 1.7;
}

.caracteristicas-grid {
  display: grid;

  grid-template-columns: repeat(3, 1fr);

  gap: 20px;
}

.caracteristica {
  padding: 28px;

  background: #1e293b;

  border: 1px solid #334155;

  border-radius: 16px;

  transition:
    transform 0.2s,
    border-color 0.2s;
}

.caracteristica:hover {
  transform: translateY(-4px);

  border-color: #22c55e;
}

.icono {
  width: 45px;
  height: 45px;

  display: flex;

  align-items: center;
  justify-content: center;

  margin-bottom: 20px;

  background: rgba(34, 197, 94, 0.1);

  border: 1px solid rgba(34, 197, 94, 0.25);

  border-radius: 10px;

  color: #22c55e;

  font-size: 1rem;
  font-weight: 800;
}

.caracteristica h3 {
  margin: 0 0 9px;

  color: #f8fafc;

  font-size: 1.15rem;
}

.caracteristica p {
  margin: 0;

  color: #94a3b8;

  font-size: 0.9rem;
  line-height: 1.7;
}

.llamada {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 30px;

  padding: 35px;

  background: #1e293b;

  border: 1px solid #334155;

  border-radius: 18px;
}

.llamada h2 {
  margin: 9px 0 8px;

  color: #f8fafc;

  font-size: 1.7rem;
}

.llamada p {
  margin: 0;

  color: #94a3b8;

  font-size: 0.9rem;
}

.llamada .principal {
  flex-shrink: 0;
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;

    gap: 45px;
  }

  h1 {
    font-size: 3.2rem;
  }

  .caracteristicas-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .pagina {
    padding: 45px 5% 60px;
  }

  .hero {
    min-height: auto;

    padding: 30px 0 60px;
  }

  h1 {
    font-size: 2.5rem;
  }

  .hero-contenido > p {
    font-size: 0.95rem;
  }

  .acciones {
    flex-direction: column;

    align-items: stretch;
  }

  .principal,
  .secundario {
    width: 100%;
  }

  pre {
    padding: 20px;
  }

  code {
    font-size: 0.75rem;
  }

  .caracteristicas {
    padding: 50px 0;
  }

  .seccion-encabezado h2 {
    font-size: 1.7rem;
  }

  .llamada {
    flex-direction: column;

    align-items: stretch;

    padding: 25px;
  }

  .llamada h2 {
    font-size: 1.4rem;
  }
}
</style>