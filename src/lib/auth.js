import { createClient } from "@/lib/supabase/server";

const ADMIN_ROLE = "Administrativo";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentEmployee() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, employee: null, isAdmin: false };
  }

  const { data: employee } = await supabase
    .from("empleados")
    .select("id_persona, id_rol, personas(nombre_completo), roles(nombre)")
    .eq("auth_uuid", user.id)
    .maybeSingle();

  const isAdmin = employee?.roles?.nombre === ADMIN_ROLE;

  return { user, employee: employee ?? null, isAdmin };
}