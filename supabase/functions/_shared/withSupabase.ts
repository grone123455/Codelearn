
    import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

    export async function withSupabase(req: Request) {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
        throw new Error("Faltan variables de entorno de Supabase.");
    }

    const authorization = req.headers.get("Authorization");

    if (!authorization) {
        throw new Error("Falta el encabezado de autorización.");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
        headers: {
            Authorization: authorization,
        },
        },
    });

    const supabaseAdmin = createClient(
        supabaseUrl,
        supabaseServiceRoleKey
    );

    return {
        supabase,
        supabaseAdmin,
    };
    }
