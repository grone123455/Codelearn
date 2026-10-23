
import { createRouter, createWebHistory } from "vue-router"
import { supabase } from "../services/supabase.js"

import InicioView from "../views/InicioView.vue"
import CursosView from "../views/CursosView.vue"
import JavaScriptView from "../views/JavaScriptView.vue"
import UnidadView from "../views/UnidadView.vue"
import LeccionView from "../views/LeccionView.vue"
import ActividadView from "../views/ActividadView.vue"
import ResultadosView from "../views/ResultadosView.vue"
import AccesoView from "../views/AccesoView.vue"
import IniciarSesionView from "../views/IniciarSesionView.vue"
import RegistroView from "../views/RegistroView.vue"
import PerfilView from "../views/PerfilView.vue"
import RecuperarContrasenaView from "../views/RecuperarContrasenaView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: "/",
      name: "inicio",
      component: InicioView
    },
    {
      path: "/acceso",
      name: "acceso",
      component: AccesoView
    },
    {
      path: "/iniciar-sesion",
      name: "iniciar-sesion",
      component: IniciarSesionView
    },
    {
      path: "/registro",
      name: "registro",
      component: RegistroView
    },
    {
      path: "/recuperar-contrasena",
      name: "recuperar-contrasena",
      component: RecuperarContrasenaView
    },
    {
      path: "/perfil",
      name: "perfil",
      component: PerfilView
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

const rutasPublicas = [
  "acceso",
  "iniciar-sesion",
  "registro",
  "recuperar-contrasena"
]

router.beforeEach(async (to) => {
  if (rutasPublicas.includes(to.name)) {
    return true
  }

  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    if (data.session) {
      return true
    }

    return {
      name: "acceso",
      query: { redirect: to.fullPath }
    }
  } catch {
    return { name: "acceso" }
  }
})

export default router
