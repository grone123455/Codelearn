<template>
  <div :class="['app-shell', { 'app-shell--public': !showNavigation }]">
    <AppNavbar v-if="showNavigation" />

    <div class="app-content">
      <header v-if="showNavigation" class="app-topbar">
        <div class="app-topbar__breadcrumb" aria-label="Ubicación actual">
          <span>CodeLearn</span>
          <span class="app-topbar__separator" aria-hidden="true">/</span>
          <strong>{{ pageTitle }}</strong>
        </div>
        <RouterLink to="/perfil" class="app-topbar__profile">
          <span class="app-topbar__avatar" aria-hidden="true">CL</span>
          <span>Mi perfil</span>
        </RouterLink>
      </header>

      <main class="app-route-content">
        <RouterView :key="$route.fullPath" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useRoute } from "vue-router"
import AppNavbar from "./components/AppNavbar.vue"

const route = useRoute()
const publicRoutes = new Set([
  "acceso",
  "iniciar-sesion",
  "registro",
  "recuperar-contrasena"
])

const showNavigation = computed(() => !publicRoutes.has(route.name))
const pageTitles = {
  inicio: "Inicio",
  cursos: "Cursos",
  javascript: "Mi recorrido",
  unidad: "Unidad",
  leccion: "Lección",
  actividad: "Práctica",
  resultados: "Resultados",
  perfil: "Mi perfil"
}
const pageTitle = computed(() => pageTitles[route.name] || "Aprendizaje")
</script>
