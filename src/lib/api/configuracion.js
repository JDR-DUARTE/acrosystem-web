import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentEmployee } from "@/lib/auth";

/**
 * Obtiene la información general necesaria para la vista de configuración:
 * planes, promociones/eventos, personal/empleados registrados y roles disponibles.
 */
export async function getConfiguracionData() {
  const supabase = await createClient();
  const { employee } = await getCurrentEmployee();
  if (!employee) throw new Error("No autorizado.");

  // Consultas en paralelo a las tablas correspondientes en Supabase
  const [planesRes, promosRes, personalRes, rolesRes] = await Promise.all([
    supabase.from("planes").select("*").order("id_plan"),
    supabase.from("promos_eventos").select("*").order("id_evento"),
    supabase
      .from("empleados")
      .select("*, personas(*), roles(nombre)")
      .order("id_persona"),
    supabase.from("roles").select("*").order("id_rol"),
  ]);

  if (planesRes.error) throw new Error(planesRes.error.message);
  if (promosRes.error) throw new Error(promosRes.error.message);
  if (personalRes.error) throw new Error(personalRes.error.message);

  return {
    planes: planesRes.data || [],
    promos: promosRes.data || [],
    personal: personalRes.data || [],
    roles: rolesRes.data || [],
  };
}

/**
 * Inserta un nuevo plan en la base de datos Supabase.
 */
export async function addPlan(planData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("planes")
    .insert({
      nombre: planData.nombre,
      pases_totales: planData.pases_totales,
      duracion_dias: planData.duracion_dias,
      incluye_equipo: planData.incluye_equipo,
      cupo_maximo: planData.cupo_maximo,
      requiere_agenda: planData.requiere_agenda,
      precio_usd: planData.precio_usd,
    })
    .select();
  if (error) throw new Error(error.message);
  return data[0];
}

/**
 * Inserta una nueva promoción o evento especial en la base de datos Supabase.
 */
export async function addPromo(promoData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promos_eventos")
    .insert({
      nombre: promoData.nombre,
      tipo: promoData.tipo,
      fecha_inicio: promoData.fecha_inicio || null,
      fecha_fin: promoData.fecha_fin || null,
      valor_descuento: promoData.valor_descuento,
    })
    .select();
  if (error) throw new Error(error.message);
  return data[0];
}

/**
 * Registra a una persona con perfil 'empleado' dentro de la tabla de empleados asignándole un rol.
 */
export async function addPersonal(personalData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empleados")
    .insert({
      id_persona: personalData.id_persona,
      id_rol: personalData.id_rol,
    })
    .select();
  if (error) throw new Error(error.message);
  return data[0];
}
