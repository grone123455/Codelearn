import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
)

supabase.auth.getSession().then(({ data }) => {
  const token = data.session?.access_token

  if (!token) {
    console.log("CodeLearn: no hay una sesión activa")
    return
  }

  const payload = JSON.parse(
    atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
  )

  console.log("Rol del token:", payload.role)
})