<template>
  <section class="pagina dashboard-home">
    <header class="dashboard-heading">
      <div>
        <span class="etiqueta">TU ESPACIO DE APRENDIZAJE</span>
        <h1>Hola, aprendiz<span>.</span></h1>
        <p>Un poco de práctica hoy te acerca a lo que querés construir mañana.</p>
      </div>
    </header>

    <section class="hero" aria-label="Empezá a aprender programación">
      <div class="hero-contenido">
        <span class="hero-kicker"><span class="hero-kicker__dot"></span> APRENDÉ A TU RITMO</span>
        <h2>Las ideas toman forma <span>cuando las programás.</span></h2>
        <p>Explorá JavaScript, practicá con actividades interactivas y construí tus conocimientos paso a paso.</p>
        <div class="acciones">
          <button class="principal" @click="irAJavaScript">
            Explorar JavaScript <span aria-hidden="true">→</span>
          </button>
          <button class="secundario" @click="irACursos">Ver todos los cursos</button>
        </div>
      </div>

      <div class="codigo" aria-label="Ejemplo de código JavaScript">
        <div class="codigo-cabecera">
          <div class="codigo-cabecera__archivo"><span class="codigo-cabecera__punto"></span> primer-paso.js</div>
          <span class="codigo-cabecera__lenguaje">JavaScript</span>
        </div>
        <pre><code><span class="linea">01</span> <span class="palabra">const</span> idea = <span class="texto">"puedo hacerlo"</span>;
<span class="linea">02</span>
<span class="linea">03</span> <span class="palabra">function</span> <span class="funcion">darElSiguientePaso</span>() {
<span class="linea">04</span>   <span class="palabra">return</span> idea + <span class="texto">".step()"</span>;
<span class="linea">05</span> }</code></pre>
        <div class="codigo-pie"><span>main · sin errores</span><span><i></i> Listo para empezar</span></div>
      </div>
    </section>

    <section class="home-learning" aria-labelledby="learning-title">
      <div class="section-heading">
        <div>
          <span class="etiqueta">TU PRÓXIMO PASO</span>
          <h2 id="learning-title">Aprendé creando</h2>
          <p>Elegí una ruta y avanzá con lecciones cortas y práctica real.</p>
        </div>
        <button class="text-link" @click="irACursos">Explorar cursos <span aria-hidden="true">→</span></button>
      </div>

      <div class="learning-grid">
        <article class="learning-card learning-card--featured">
          <div class="learning-card__top">
            <span class="learning-card__icon">JS</span>
            <span class="estado disponible">Ruta de aprendizaje</span>
          </div>
          <div>
            <h3>JavaScript desde cero</h3>
            <p>Conocé los fundamentos del lenguaje y ponelos en práctica con actividades.</p>
          </div>
          <button class="learning-card__link" @click="irAJavaScript">Ver el recorrido <span aria-hidden="true">→</span></button>
        </article>

        <article class="learning-card">
          <div class="learning-card__icon learning-card__icon--blue">&lt;/&gt;</div>
          <h3>Lecciones claras</h3>
          <p>Aprendé conceptos paso a paso, con ejemplos de código pensados para practicar.</p>
          <button class="learning-card__link" @click="irAJavaScript">Conocer las lecciones <span aria-hidden="true">→</span></button>
        </article>

        <article class="learning-card">
          <div class="learning-card__icon learning-card__icon--gold">✓</div>
          <h3>Práctica interactiva</h3>
          <p>Resolvé ejercicios y consultá tus resultados al terminar cada lección.</p>
          <button class="learning-card__link" @click="irACursos">Elegir un curso <span aria-hidden="true">→</span></button>
        </article>
      </div>
    </section>
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
