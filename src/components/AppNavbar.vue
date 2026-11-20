
<template>
  <div class="app-navbar">
    <RouterLink to="/" class="app-brand" aria-label="CodeLearn, inicio">
      <span class="app-brand__mark">
        <img :src="logo" alt="" />
      </span>
      <span class="app-brand__name">Code<span>Learn</span></span>
    </RouterLink>

    <div class="app-navbar__actions">
      <NotificationBell
  :menu-abierto="menuAbierto"
  @abierto-change="menuAbierto = false"
/>

      <div class="app-navbar__menu">
        <button
          class="app-navbar__toggle"
          type="button"
          :aria-expanded="menuAbierto"
          aria-controls="menu-navegacion"
          @click="menuAbierto = !menuAbierto"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              v-if="!menuAbierto"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path v-else d="m6 6 12 12M18 6 6 18" />
          </svg>
          <span>Menú</span>
        </button>

        <Transition name="bubble">
          <nav
            v-if="menuAbierto"
            id="menu-navegacion"
            class="app-navbar__dropdown"
            aria-label="Navegación principal"
          >
            <RouterLink
              to="/"
              class="app-navbar__link"
              exact-active-class="is-active"
              @click="cerrarMenu"
            >
              Inicio
            </RouterLink>

            <RouterLink
              to="/cursos"
              class="app-navbar__link"
              :class="{
                'is-active': [
                  'cursos',
                  'javascript',
                  'unidad',
                  'leccion',
                  'actividad'
                ].includes(route.name)
              }"
              @click="cerrarMenu"
            >
              Cursos
            </RouterLink>

            <RouterLink
              to="/desafio"
              class="app-navbar__link"
              exact-active-class="is-active"
              @click="cerrarMenu"
            >
              Desafío
            </RouterLink>

            <RouterLink
              :to="{ name: 'juego-desempate', query: { modo: 'practica' } }"
              class="app-navbar__link"
              exact-active-class="is-active"
              @click="cerrarMenu"
            >
              Juego de desempate
            </RouterLink>

            <RouterLink
              to="/ranking"
              class="app-navbar__link"
              exact-active-class="is-active"
              @click="cerrarMenu"
            >
              Tabla de posiciones
            </RouterLink>

            <RouterLink
              to="/perfil"
              class="app-navbar__link"
              exact-active-class="is-active"
              @click="cerrarMenu"
            >
              Mi perfil
            </RouterLink>
          </nav>
        </Transition>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, watch } from "vue"
import { useRoute } from "vue-router"
import logo from "../assets/images/logo-codelearn.png"
import NotificationBell from "./NotificationBell.vue"

const route = useRoute()
const menuAbierto = ref(false)

function cerrarMenu() {
  menuAbierto.value = false
}

watch(
  () => route.fullPath,
  cerrarMenu
)
</script>
