
<template>
  <section class="pagina desafio">
    <header class="desafio__encabezado">
      <span class="etiqueta">PONÉ A PRUEBA TUS CONOCIMIENTOS</span>
      <h1>Desafío<span>.</span></h1>
      <p>
        Demostrá lo que sabés de programación, resolvé problemas
        y competí para alcanzar el primer puesto.
      </p>
    </header>

    <section class="desafio__hero">
      <div class="desafio__hero-contenido">
        <span class="desafio__insignia">CODELEARN COMPETITIVO</span>
        <h2>¿Estás listo para el desafío?</h2>
        <p>
          Enfrentate a preguntas de HTML, CSS, JavaScript y lógica.
          Cada respuesta correcta suma puntos. ¡Superá tus propios
          límites y escalá en el ranking!
        </p>
      </div>
      <div class="desafio__icono" aria-hidden="true">&lt;/&gt;</div>
    </section>

    <section class="desafio__modos">
      <article class="desafio__modo">
        <span class="desafio__modo-icono">01</span>
        <h3>Modo competitivo</h3>
        <p>
          Participá con tu cuenta, acumulá puntos y competí
          por un lugar en el ranking general.
        </p>
        <ul>
          <li>20 preguntas por partida</li>
          <li>10 puntos por respuesta correcta</li>
          <li>Registro de tu mejor resultado</li>
        </ul>
      </article>

      <article class="desafio__modo">
        <span class="desafio__modo-icono desafio__modo-icono--azul">02</span>
        <h3>Modo práctica</h3>
        <p>
          Entrená tus conocimientos sin necesidad de registrarte
          y familiarizate con los desafíos.
        </p>
        <ul>
          <li>5 preguntas por partida</li>
          <li>Preguntas de distintas categorías</li>
          <li>Podés jugar todas las veces que quieras</li>
        </ul>
      </article>
    </section>

    <section class="desafio__reglas">
      <div>
        <span class="etiqueta">ANTES DE EMPEZAR</span>
        <h2>Reglas del desafío</h2>
      </div>

      <div class="desafio__reglas-grid">
        <article>
          <strong>01</strong>
          <div>
            <h3>Una respuesta definitiva</h3>
            <p>Una vez confirmada, no podrás modificar tu respuesta ni volver a la pregunta anterior.</p>
          </div>
        </article>

        <article>
          <strong>02</strong>
          <div>
            <h3>Sin límite por pregunta</h3>
            <p>Podrás pensar el tiempo que necesites. El tiempo total de la partida quedará registrado.</p>
          </div>
        </article>

        <article>
          <strong>03</strong>
          <div>
            <h3>Partida no interrumpible</h3>
            <p>Si abandonás o perdés la conexión, la partida finalizará con los puntos acumulados.</p>
          </div>
        </article>

        <article>
          <strong>04</strong>
          <div>
            <h3>Empates</h3>
            <p>Si dos participantes igualan puntaje y tiempo, deberán resolver un desempate especial.</p>
          </div>
        </article>
      </div>
    </section>

    <p class="desafio__nota">
      El modo de juego y el inicio de las partidas se habilitarán
      cuando terminemos de conectar el desafío.
    </p>
  </section>
</template>

<style scoped>
.desafio__encabezado {
  margin-bottom: 25px;
}

.desafio__encabezado .etiqueta,
.desafio__reglas .etiqueta {
  color: #7791a3;
}

.desafio__encabezado h1 {
  margin: 9px 0;
}

.desafio__encabezado h1 span {
  color: var(--color-accent);
}

.desafio__encabezado p {
  max-width: 650px;
  margin: 0;
  line-height: 1.7;
}

.desafio__hero {
  display: flex;
  min-height: 230px;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  padding: 30px 36px;
  border: 1px solid rgba(140, 230, 172, 0.2);
  border-radius: 17px;
  background:
    radial-gradient(circle at 85% 50%, rgba(85, 201, 130, 0.15), transparent 35%),
    linear-gradient(120deg, #112638, #0d1a29);
}

.desafio__hero-contenido {
  max-width: 650px;
}

.desafio__insignia {
  color: var(--color-accent);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 1.2px;
}

.desafio__hero h2 {
  margin: 13px 0 10px;
  font-size: clamp(1.6rem, 3vw, 2.3rem);
}

.desafio__hero p {
  margin: 0;
  color: #a3b5c0;
  line-height: 1.75;
}

.desafio__icono {
  display: grid;
  width: 125px;
  height: 125px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgba(140, 230, 172, 0.25);
  border-radius: 25px;
  background: rgba(140, 230, 172, 0.07);
  color: var(--color-accent);
  font-family: "Space Grotesk", sans-serif;
  font-size: 2.3rem;
  font-weight: 700;
}

.desafio__modos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 22px;
}

.desafio__modo {
  padding: 23px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: linear-gradient(145deg, #112235, #0d1a29);
}

.desafio__modo-icono {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid rgba(140, 230, 172, 0.25);
  border-radius: 10px;
  background: rgba(140, 230, 172, 0.08);
  color: var(--color-accent);
  font-size: 0.75rem;
  font-weight: 700;
}

.desafio__modo-icono--azul {
  border-color: rgba(139, 185, 231, 0.25);
  background: rgba(139, 185, 231, 0.08);
  color: var(--color-blue);
}

.desafio__modo h3 {
  margin: 16px 0 7px;
  font-size: 1.1rem;
}

.desafio__modo p,
.desafio__modo li {
  color: var(--color-muted);
  font-size: 0.83rem;
  line-height: 1.7;
}

.desafio__modo ul {
  display: grid;
  gap: 5px;
  margin: 15px 0 0;
  padding-left: 18px;
}

.desafio__reglas {
  margin-top: 35px;
}

.desafio__reglas h2 {
  margin: 7px 0 18px;
  font-size: 1.45rem;
}

.desafio__reglas-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.desafio__reglas-grid article {
  display: flex;
  gap: 14px;
  padding: 17px;
  border: 1px solid rgba(137, 163, 190, 0.15);
  border-radius: 12px;
  background: rgba(17, 34, 53, 0.65);
}

.desafio__reglas-grid article > strong {
  color: var(--color-accent);
  font-size: 0.8rem;
}

.desafio__reglas-grid h3 {
  margin: 0 0 5px;
  font-size: 0.88rem;
}

.desafio__reglas-grid p {
  margin: 0;
  font-size: 0.77rem;
  line-height: 1.6;
}

.desafio__nota {
  margin-top: 22px;
  font-size: 0.76rem;
  text-align: center;
}

@media (max-width: 700px) {
  .desafio__hero {
    padding: 23px;
  }

  .desafio__icono {
    display: none;
  }

  .desafio__modos,
  .desafio__reglas-grid {
    grid-template-columns: 1fr;
  }
}
</style>
