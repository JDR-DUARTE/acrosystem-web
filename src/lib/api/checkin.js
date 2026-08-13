import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentEmployee } from "@/lib/auth";

const MIEMBRO_SELECT = `
  id_persona,
  qr_codigo,
  fecha_nacimiento,
  personas!inner ( nombre_completo, cedula, deuda_acumulada ),
  categorias ( nombre ),
  suscripciones (
    id_suscripcion, estado, fecha_inicio, fecha_expiracion, pases_restantes,
    planes ( id_plan, nombre, pases_totales, requiere_agenda ),
    suscripcion_dias ( dia_semana )
  )
`;

function activeSubscription(subs) {
  const hoy = new Date().toISOString().slice(0, 10);
  return (subs ?? [])
    .filter((s) => s.estado === "Activo" && s.fecha_expiracion >= hoy)
    .sort((a, b) => b.fecha_expiracion.localeCompare(a.fecha_expiracion))[0];
}

async function findMiembro(supabase, query) {
  const term = String(query ?? "").trim();
  if (!term) return null;

  // 1) por código QR
  const byQr = await supabase
    .from("miembros")
    .select(MIEMBRO_SELECT)
    .eq("qr_codigo", term)
    .maybeSingle();
  if (byQr.data) return byQr.data;

  // 2) por cédula exacta (en personas)
  const persona = await supabase
    .from("personas")
    .select("id_persona")
    .eq("cedula", term)
    .maybeSingle();
  if (persona.data) {
    const byCedula = await supabase
      .from("miembros")
      .select(MIEMBRO_SELECT)
      .eq("id_persona", persona.data.id_persona)
      .maybeSingle();
    if (byCedula.data) return byCedula.data;
  }

  // 3) por coincidencia parcial en cédula o nombre
  const personaLike = await supabase
    .from("personas")
    .select("id_persona")
    .or(`cedula.ilike.%${term}%,nombre_completo.ilike.%${term}%`)
    .limit(1)
    .maybeSingle();
  if (personaLike.data) {
    const byLike = await supabase
      .from("miembros")
      .select(MIEMBRO_SELECT)
      .eq("id_persona", personaLike.data.id_persona)
      .maybeSingle();
    if (byLike.data) return byLike.data;
  }

  return null;
}

// Valida y registra un check-in. Devuelve un objeto con el resultado.
export async function registrarCheckin({ query }) {
  const supabase = await createClient();
  const miembro = await findMiembro(supabase, query);

  if (!miembro) {
    return {
      resultado: "no_encontrado",
      mensaje: "No se encontró ningún miembro con ese QR o cédula.",
    };
  }

  const base = {
    miembro: {
      id: miembro.id_persona,
      nombre: miembro.personas?.nombre_completo ?? "",
      cedula: miembro.personas?.cedula ?? "",
      categoria: miembro.categorias?.nombre ?? null,
    },
  };

  // RN-EXT-01: deuda acumulada >= 10 bloquea el check-in.
  const deuda = Number(miembro.personas?.deuda_acumulada ?? 0);
  if (deuda >= 10) {
    return {
      ...base,
      resultado: "denegado",
      mensaje: `Check-in bloqueado por deuda acumulada ($${deuda.toFixed(2)}).`,
    };
  }

  const sub = activeSubscription(miembro.suscripciones);
  if (!sub) {
    return {
      ...base,
      resultado: "denegado",
      mensaje: "El miembro no tiene un plan activo o está vencido.",
    };
  }

  // RN-RES-04: Restricción de horario por edad (7-12 años)
  if (miembro.fecha_nacimiento) {
    const nacimiento = new Date(miembro.fecha_nacimiento);
    const ahora = new Date();
    const edad = ahora.getFullYear() - nacimiento.getFullYear();
    if (edad >= 7 && edad <= 12) {
      if (sub.planes?.requiere_agenda) {
        // En lugar de una hora fija que no está definida, validamos que esté agendado para hoy
        const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const diaHoy = diasSemana[ahora.getDay()];
        const agendadoHoy = (sub.suscripcion_dias || []).some(d => d.dia_semana === diaHoy);
        
        if (!agendadoHoy) {
          return {
            ...base,
            resultado: "denegado",
            mensaje: `El acceso de infantil (7-12 años) requiere estar agendado para hoy (${diaHoy}).`,
          };
        }
      }
    }
  }

  const hoyStr = new Date().toISOString().slice(0, 10);
  const { data: checkinsHoy } = await supabase
    .from("check_in")
    .select("id_checkin")
    .eq("id_miembro", miembro.id_persona)
    .gte("fecha_hora", `${hoyStr}T00:00:00`);

  let fechaExpiracionFormateada = "—";
  if (sub.fecha_expiracion) {
    const parts = sub.fecha_expiracion.split("-");
    if (parts.length === 3) {
      fechaExpiracionFormateada = `${parts[2]}/${parts[1]}/${parts[0]}`;
    } else {
      fechaExpiracionFormateada = sub.fecha_expiracion;
    }
  }

  const usaPases = (sub.planes?.pases_totales ?? 0) > 0 || sub.pases_restantes !== null;

  if (checkinsHoy && checkinsHoy.length > 0) {
    return {
      ...base,
      resultado: "advertencia",
      mensaje: "Ya se registró su ingreso el día de hoy.",
      plan: sub.planes?.nombre ?? "—",
      fechaExpiracion: fechaExpiracionFormateada,
      usaPases,
      pasesRestantes: usaPases ? sub.pases_restantes : null,
    };
  }

  if (usaPases && (sub.pases_restantes ?? 0) <= 0) {
    return {
      ...base,
      resultado: "denegado",
      mensaje: "El plan no tiene días / pases disponibles.",
      plan: sub.planes?.nombre ?? "—",
      fechaExpiracion: fechaExpiracionFormateada,
      usaPases,
      pasesRestantes: 0,
    };
  }

  const { error: insertError } = await supabase.from("check_in").insert({
    id_miembro: miembro.id_persona,
    id_suscripcion: sub.id_suscripcion,
  });
  if (insertError) throw new Error(insertError.message);

  let pasesRestantes = sub.pases_restantes;
  if (usaPases && sub.pases_restantes !== null) {
    pasesRestantes = Math.max(0, sub.pases_restantes - 1);
    const { error: updError } = await supabase
      .from("suscripciones")
      .update({ pases_restantes: pasesRestantes })
      .eq("id_suscripcion", sub.id_suscripcion);
    if (updError) throw new Error(updError.message);
  }

  return {
    ...base,
    resultado: "permitido",
    mensaje: "Acceso permitido.",
    plan: sub.planes?.nombre ?? "—",
    fechaExpiracion: fechaExpiracionFormateada,
    usaPases,
    pasesRestantes: usaPases ? pasesRestantes : null,
  };
}

export async function listHistoricoCheckin({ search, plan, fechaDesde, fechaHasta } = {}) {
  const supabase = await createClient();
  const { employee } = await getCurrentEmployee();
  if (!employee) throw new Error("No autorizado.");

  let query = supabase
    .from("check_in")
    .select(`
      id_checkin,
      fecha_hora,
      miembros!inner (
        id_persona,
        personas!inner ( nombre_completo, cedula ),
        suscripciones (
          id_suscripcion,
          planes ( id_plan, nombre )
        )
      ),
      suscripciones (
        id_suscripcion,
        planes ( id_plan, nombre )
      )
    `)
    .order("fecha_hora", { ascending: false });

  if (fechaDesde) {
    query = query.gte("fecha_hora", `${fechaDesde}T00:00:00`);
  }
  if (fechaHasta) {
    query = query.lte("fecha_hora", `${fechaHasta}T23:59:59`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let results = (data ?? []).map((c) => {
    const persona = c.miembros?.personas;
    const planDirecto = c.suscripciones?.planes?.nombre;
    const planMiembro = c.miembros?.suscripciones?.[0]?.planes?.nombre;
    const planNombre = planDirecto || planMiembro || "Plan General";

    const fechaObj = new Date(c.fecha_hora);
    const day = String(fechaObj.getDate()).padStart(2, "0");
    const month = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const year = fechaObj.getFullYear();
    const hours = String(fechaObj.getHours()).padStart(2, "0");
    const minutes = String(fechaObj.getMinutes()).padStart(2, "0");

    return {
      id: c.id_checkin,
      nombre: persona?.nombre_completo || "Desconocido",
      cedula: persona?.cedula || "",
      plan: planNombre,
      fechaHora: c.fecha_hora,
      fecha: `${day}/${month}/${year}`,
      hora: `${hours}:${minutes}`,
    };
  });

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    results = results.filter(
      (r) =>
        r.nombre.toLowerCase().includes(q) ||
        r.cedula.toLowerCase().includes(q) ||
        r.plan.toLowerCase().includes(q)
    );
  }

  if (plan && plan !== "ALL") {
    const planFilter = plan.toLowerCase().trim();
    results = results.filter((r) => r.plan.toLowerCase() === planFilter);
  }

  return results;
}

export async function consultarPlan({ query }) {
  const supabase = await createClient();
  const miembro = await findMiembro(supabase, query);

  if (!miembro) {
    return {
      encontrado: false,
      mensaje: "No se encontró ningún miembro con la cédula o datos ingresados.",
    };
  }

  const nombre = miembro.personas?.nombre_completo ?? "Miembro";
  const cedula = miembro.personas?.cedula ?? "";
  const hoy = new Date().toISOString().slice(0, 10);
  const subs = miembro.suscripciones ?? [];

  // Buscar suscripción activa no vencida
  const subActiva = subs
    .filter((s) => s.estado === "Activo" && s.fecha_expiracion >= hoy)
    .sort((a, b) => (b.fecha_expiracion || "").localeCompare(a.fecha_expiracion || ""))[0];

  if (subActiva) {
    let fechaFormateada = "";
    if (subActiva.fecha_expiracion) {
      const parts = subActiva.fecha_expiracion.split("-");
      if (parts.length === 3) {
        fechaFormateada = `${parts[2]}/${parts[1]}/${parts[0]}`;
      } else {
        fechaFormateada = subActiva.fecha_expiracion;
      }
    }
    const usaPases = (subActiva.planes?.pases_totales ?? 0) > 0 || subActiva.pases_restantes !== null;
    const pasesRestantes = usaPases ? subActiva.pases_restantes : null;

    return {
      encontrado: true,
      nombre,
      cedula,
      estado: "Activo",
      plan: subActiva.planes?.nombre ?? "Plan Activo",
      fechaExpiracion: fechaFormateada,
      usaPases,
      pasesRestantes,
      pillText: fechaFormateada ? `Vence ${fechaFormateada}` : "Plan Activo",
      esActivo: true,
    };
  }

  // Si no hay activa, buscar la más reciente (vencida)
  const subMasReciente = subs
    .sort((a, b) => (b.fecha_expiracion || "").localeCompare(a.fecha_expiracion || ""))[0];

  if (subMasReciente) {
    let fechaFormateada = "";
    if (subMasReciente.fecha_expiracion) {
      const parts = subMasReciente.fecha_expiracion.split("-");
      if (parts.length === 3) {
        fechaFormateada = `${parts[2]}/${parts[1]}/${parts[0]}`;
      } else {
        fechaFormateada = subMasReciente.fecha_expiracion;
      }
    }
    const usaPases = (subMasReciente.planes?.pases_totales ?? 0) > 0 || subMasReciente.pases_restantes !== null;

    return {
      encontrado: true,
      nombre,
      cedula,
      estado: "Vencido",
      plan: subMasReciente.planes?.nombre ?? "Plan Anterior",
      fechaExpiracion: fechaFormateada,
      usaPases,
      pasesRestantes: subMasReciente.pases_restantes ?? 0,
      pillText: fechaFormateada ? `Vence ${fechaFormateada}` : "Plan Vencido",
      esActivo: false,
    };
  }

  return {
    encontrado: true,
    nombre,
    cedula,
    estado: "Inactivo",
    plan: "Sin plan registrado",
    fechaExpiracion: null,
    usaPases: false,
    pasesRestantes: null,
    pillText: "Sin suscripción activa",
    esActivo: false,
  };
}


