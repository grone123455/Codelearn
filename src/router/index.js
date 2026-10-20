import { createRouter, createWebHistory } from "vue-router"

import InicioView from "../views/InicioView.vue"
import CursosView from "../views/CursosView.vue"
import JavaScriptView from "../views/JavaScriptView.vue"
import UnidadView from "../views/UnidadView.vue"
import LeccionView from "../views/LeccionView.vue"
import ActividadView from "../views/ActividadView.vue"
import ResultadosView from "../views/ResultadosView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: "/",
      name: "inicio",
      component: InicioView
    },

    {
      path: "/cursos",
      name: "cursos",
      component: CursosView
    },

    {
      path: "/cursos/javascript",
      name: "javascript",
      component: JavaScriptView
    },

    {
      path: "/cursos/javascript/unidad/:id",
      name: "unidad",
      component: UnidadView
    },

    {
      path: "/cursos/javascript/leccion/:id",
      name: "leccion",
      component: LeccionView
    },

    {
      path: "/actividad/:id",
      name: "actividad",
      component: ActividadView
    },

    {
      path: "/resultados",
      name: "resultados",
      component: ResultadosView
    }
  ]
})

export default router