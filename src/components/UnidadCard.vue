<template>
  <article
    class="unidad-card"
    :class="{ bloqueada: unidad.estado === 'bloqueada' }"
  >
    <div class="numero">
      {{ unidad.orden }}
    </div>

    <div class="contenido">
      <div class="encabezado">
        <div>
          <span class="etiqueta">
            UNIDAD {{ unidad.orden }}
          </span>

          <h2>
            {{ unidad.titulo }}
          </h2>
        </div>

        <span
          v-if="unidad.estado === 'bloqueada'"
          class="candado"
        >
          🔒
        </span>

        <span
          v-else
          class="disponible"
        >
          Disponible
        </span>
      </div>

      <p>
        {{ unidad.descripcion }}
      </p>

      <button
        v-if="unidad.estado !== 'bloqueada'"
        class="boton"
        @click="seleccionarUnidad"
      >
        Ver unidad →
      </button>

      <span
        v-else
        class="texto-bloqueada"
      >
        Esta unidad está bloqueada
      </span>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  unidad: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  "seleccionar"
])

function seleccionarUnidad() {
  emit("seleccionar", props.unidad)
}
</script>

<style scoped>
.unidad-card {
  display: flex;
  gap: 22px;

  padding: 25px;

  background: #1e293b;

  border: 1px solid #334155;
  border-radius: 16px;

  transition:
    transform 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
}

.unidad-card:not(.bloqueada):hover {
  transform: translateY(-3px);

  border-color: #22c55e;

  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.1);
}

.unidad-card.bloqueada {
  opacity: 0.55;
}

.numero {
  flex-shrink: 0;

  width: 52px;
  height: 52px;

  display: flex;

  align-items: center;
  justify-content: center;

  border: 1px solid #22c55e;
  border-radius: 12px;

  background: #0f172a;

  color: #22c55e;

  font-size: 1.2rem;
  font-weight: 800;
}

.contenido {
  flex: 1;

  min-width: 0;
}

.encabezado {
  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 20px;
}

.etiqueta {
  display: block;

  margin-bottom: 6px;

  color: #22c55e;

  font-size: 0.7rem;
  font-weight: 700;

  letter-spacing: 1.5px;
}

h2 {
  margin: 0;

  color: #f8fafc;

  font-size: 1.35rem;
  line-height: 1.3;
}

p {
  max-width: 700px;

  margin: 12px 0 20px;

  color: #94a3b8;

  font-size: 0.95rem;
  line-height: 1.7;
}

.disponible {
  flex-shrink: 0;

  padding: 5px 9px;

  border-radius: 6px;

  background: rgba(34, 197, 94, 0.12);

  color: #22c55e;

  font-size: 0.7rem;
  font-weight: 700;
}

.candado {
  font-size: 1.1rem;
}

.boton {
  padding: 10px 17px;

  border: none;
  border-radius: 9px;

  background: #22c55e;

  color: #0f172a;

  font-size: 0.85rem;
  font-weight: 700;

  cursor: pointer;

  transition: 0.2s;
}

.boton:hover {
  background: #4ade80;
}

.texto-bloqueada {
  color: #64748b;

  font-size: 0.85rem;
  font-weight: 600;
}

@media (max-width: 600px) {
  .unidad-card {
    gap: 15px;

    padding: 20px;
  }

  .numero {
    width: 42px;
    height: 42px;

    font-size: 1rem;
  }

  .encabezado {
    gap: 10px;
  }

  h2 {
    font-size: 1.15rem;
  }

  p {
    font-size: 0.9rem;
  }
}
</style>