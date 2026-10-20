<template>
  <div id="app">
    <AppNavbar />

    <main>
      <RouterView :key="$route.fullPath" />
    </main>
  </div>
</template>

<script setup>
import AppNavbar from "./components/AppNavbar.vue"
</script>