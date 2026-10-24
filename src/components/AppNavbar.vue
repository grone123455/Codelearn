<template>
  <aside class="app-sidebar" aria-label="Navegación del espacio de aprendizaje">
    <RouterLink to="/" class="app-brand" aria-label="CodeLearn, ir al inicio">
      <span class="app-brand__mark">
        <img :src="logo" alt="" />
      </span>
      <span class="app-brand__name">Code<span>Learn</span></span>
    </RouterLink>

    <p class="app-sidebar__label">Aprendizaje</p>
    <nav class="app-nav" aria-label="Navegación principal">
      <RouterLink to="/" class="app-nav__link" exact-active-class="is-active">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3.5 10 8.5-7 8.5 7v9.5a1 1 0 0 1-1 1h-5v-7h-5v7h-5a1 1 0 0 1-1-1z" /></svg>
        <span>Inicio</span>
      </RouterLink>
      <RouterLink
        to="/cursos"
        class="app-nav__link"
        :class="{ 'is-active': ['cursos', 'javascript', 'unidad', 'leccion', 'actividad'].includes(route.name) }"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" /><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 10h6" /></svg>
        <span>Cursos</span>
      </RouterLink>
    </nav>

    <div class="app-sidebar__footer">
      <div class="sidebar-note">
        <span class="sidebar-note__mark" aria-hidden="true">&lt;/&gt;</span>
        <p>Aprendé haciendo.<br /><strong>Avanzá a tu ritmo.</strong></p>
      </div>
      <RouterLink to="/perfil" class="sidebar-profile" exact-active-class="is-active">
        <span class="sidebar-profile__avatar" aria-hidden="true">CL</span>
        <span class="sidebar-profile__copy"><strong>Mi espacio</strong><small>Cuenta y progreso</small></span>
        <span class="sidebar-profile__arrow" aria-hidden="true">→</span>
      </RouterLink>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from "vue-router"
import logo from "../assets/images/logo-codelearn.png"

const route = useRoute()
</script>
