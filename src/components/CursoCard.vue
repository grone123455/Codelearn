<template>
  <article
    class="curso-card"
    :class="{ bloqueado: curso.estado !== 'disponible' }"
  >
    <div class="icono-container">
      <img
        v-if="curso.icono"
        :src="curso.icono"
        :alt="`Icono de ${curso.nombre}`"
      />

      <span v-else class="icono-placeholder">
        &lt;/&gt;
      </span>
    </div>

    <div class="contenido">
      <div class="encabezado">
        <h2>
          {{ curso.nombre }}
        </h2>

        <span
          class="estado"
          :class="curso.estado"
        >
          {{ textoEstado }}
        </span>
      </div>

      <p>
        {{ curso.descripcion }}
      </p>

      <button
        v-if="curso.estado === 'disponible'"
        class="boton"
        @click="seleccionarCurso"
      >
        Comenzar curso →
      </button>

      <span
        v-else
        class="proximamente"
      >
        Próximamente
      </span>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  curso: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  "seleccionar"
])

const textoEstado = computed(() => {
  if (props.curso.estado === "disponible") {
    return "Disponible"
  }

  return "Próximamente"
})

function seleccionarCurso() {
  emit("seleccionar", props.curso)
}
</script>

<style scoped>
.curso-card {
  display: flex;
  flex-direction: column;

  min-height: 340px;
  padding: 28px;

  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 18px;

  transition:
    transform 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
}

.curso-card:not(.bloqueado):hover {
  transform: translateY(-5px);

  border-color: #22c55e;

  box-shadow: 0 10px 30px rgba(34, 197, 94, 0.12);
}

.curso-card.bloqueado {
  opacity: 0.65;
}

.icono-container {
  width: 64px;
  height: 64px;

  margin-bottom: 25px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 14px;
}

.icono-container img {
  width: 42px;
  height: 42px;
  object-fit: contain;
}

.icono-placeholder {
  color: #22c55e;
  font-size: 1.4rem;
  font-weight: 800;
}

.contenido {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.encabezado {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}

h2 {
  margin: 0;

  color: #f8fafc;

  font-size: 1.4rem;
  line-height: 1.2;
}

.estado {
  flex-shrink: 0;

  padding: 5px 9px;

  border-radius: 6px;

  font-size: 0.7rem;
  font-weight: 700;
}

.estado.disponible {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}

.estado.proximamente {
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
}

p {
  margin: 16px 0 25px;

  color: #94a3b8;

  font-size: 0.95rem;
  line-height: 1.7;
}

.boton {
  align-self: flex-start;

  margin-top: auto;
  padding: 11px 17px;

  border: none;
  border-radius: 9px;

  background: #22c55e;
  color: #0f172a;

  font-size: 0.9rem;
  font-weight: 700;

  transition: 0.2s;
}

.boton:hover {
  background: #4ade80;
}

.proximamente {
  align-self: flex-start;

  margin-top: auto;

  color: #64748b;

  font-size: 0.85rem;
  font-weight: 600;
}

@media (max-width: 600px) {
  .curso-card {
    min-height: auto;
    padding: 22px;
  }

  .encabezado {
    flex-direction: column;
    gap: 10px;
  }

  h2 {
    font-size: 1.25rem;
  }
}
</style>