<template>
  <header class="navbar">
    <RouterLink to="/" class="logo">
      <div class="logo-mascota">
        <img
          :src="logo"
          alt="Logo de CodeLearn"
        />
      </div>

      <div class="logo-text">
        <span class="nombre">
          CodeLearn
        </span>

        <span class="subtitulo">
          Aprendé. Programá. Creá.
        </span>
      </div>
    </RouterLink>

    <nav>
      <RouterLink to="/">
        Inicio
      </RouterLink>

      <RouterLink to="/cursos">
        Cursos
      </RouterLink>
    </nav>
  </header>
</template>

<script setup>
import logo from "../assets/images/logo-codelearn.png"
</script>

<style scoped>
.navbar {
  min-height: 76px;

  padding: 0 7%;

  display: flex;

  align-items: center;
  justify-content: space-between;

  background: #0f172a;

  border-bottom: 1px solid #1e293b;
}

.logo {
  display: flex;

  align-items: center;

  gap: 12px;

  color: #f8fafc;

  text-decoration: none;
}

.logo-mascota {
  width: 48px;
  height: 48px;

  display: flex;

  align-items: center;
  justify-content: center;

  background: #1e293b;

  border: 1px solid #22c55e;

  border-radius: 12px;

  overflow: hidden;
}

.logo-mascota img {
  width: 100%;
  height: 100%;

  object-fit: contain;
}

.logo-text {
  display: flex;

  flex-direction: column;
}

.nombre {
  color: #f8fafc;

  font-size: 1.25rem;
  font-weight: 800;

  line-height: 1.1;
}

.subtitulo {
  margin-top: 3px;

  color: #64748b;

  font-size: 0.65rem;

  letter-spacing: 0.5px;
}

nav {
  display: flex;

  align-items: center;

  gap: 30px;
}

nav a {
  position: relative;

  padding: 8px 0;

  color: #94a3b8;

  text-decoration: none;

  font-size: 0.95rem;
  font-weight: 600;

  transition: 0.2s;
}

nav a:hover,
nav a.router-link-active {
  color: #22c55e;
}

nav a.router-link-active::after {
  content: "";

  position: absolute;

  left: 0;
  right: 0;
  bottom: 0;

  height: 2px;

  background: #22c55e;

  border-radius: 5px;
}

@media (max-width: 600px) {
  .navbar {
    padding: 0 5%;
  }

  .subtitulo {
    display: none;
  }

  nav {
    gap: 16px;
  }

  nav a {
    font-size: 0.85rem;
  }

  .logo-mascota {
    width: 42px;
    height: 42px;
  }

  .nombre {
    font-size: 1.1rem;
  }
}
</style>