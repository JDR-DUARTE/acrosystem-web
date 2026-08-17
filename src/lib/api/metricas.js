import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentEmployee } from "@/lib/auth";

function formatFecha(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export async function getMetricasData() {
  const supabase = await createClient();
  const { employee } = await getCurrentEmployee();
  if (!employee) throw new Error("No autorizado.");

  // 1. Ingresos (Ventas)
  const { data: ventas, error: ventasError } = await supabase
    .from("ventas")
    .select(
      `
      id_venta,
      fecha_hora,
      total_usd,
      detalle_venta (
        id_detalle,
        cantidad,
        precio_unit_usd,
        producto:productos ( nombre ),
        plan:planes ( nombre )
      )
    `,
    )
    .order("fecha_hora", { ascending: false });

  if (ventasError)
    throw new Error("Error fetching ingresos: " + ventasError.message);

  const ingresos = [];

  ventas.forEach((v) => {
    const fecha = formatFecha(v.fecha_hora);

    if (v.detalle_venta && v.detalle_venta.length > 0) {
      v.detalle_venta.forEach((d) => {
        const nombreItem = d.producto?.nombre || d.plan?.nombre || "Ítem";
        const cantidad = d.cantidad || 1;
        const precioTotalItem = (cantidad * (d.precio_unit_usd || 0)).toFixed(
          2,
        );

        ingresos.push({
          id: d.id_detalle || `${v.id_venta}-${nombreItem}`,
          movimiento: nombreItem,
          cantidad: String(cantidad),
          fecha,
          monto: `${precioTotalItem} $`,
        });
      });
    } else {
      ingresos.push({
        id: v.id_venta,
        movimiento: "Venta sin detalle",
        cantidad: "—",
        fecha,
        monto: `${v.total_usd.toFixed(2)} $`,
      });
    }
  });

  // 2. Reporte de Stock (Movimientos)
  const { data: movimientos, error: movError } = await supabase
    .from("movimientos_inventario")
    .select(
      "id_movimiento, tipo_movimiento, cantidad, fecha_hora, productos(nombre)",
    )
    .order("fecha_hora", { ascending: false })
    .limit(10);

  if (movError) throw new Error("Error fetching stock: " + movError.message);

  const stock = movimientos.map((m) => {
    const fecha = formatFecha(m.fecha_hora);
    const productoNombre = m.productos?.nombre || "Producto desconocido";
    const qty = m.cantidad > 0 ? `+${m.cantidad}` : `${m.cantidad}`;
    return {
      id: m.id_movimiento,
      movimiento: `${m.tipo_movimiento}: ${productoNombre}`,
      fecha,
      monto: qty,
    };
  });

  // 3. Afluencia (Check-ins por día)
  // Get last 7 days of check_ins
  const hace7dias = new Date();
  hace7dias.setDate(hace7dias.getDate() - 7);
  const { data: checkins, error: checkinError } = await supabase
    .from("check_in")
    .select("fecha_hora")
    .gte("fecha_hora", hace7dias.toISOString());

  if (checkinError)
    throw new Error("Error fetching afluencia: " + checkinError.message);

  // Group by day of week
  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const dayCounts = { Dom: 0, Lun: 0, Mar: 0, Mié: 0, Jue: 0, Vie: 0, Sáb: 0 };

  checkins.forEach((c) => {
    const d = new Date(c.fecha_hora);
    const dayName = daysOfWeek[d.getDay()];
    dayCounts[dayName]++;
  });

  // Create an array sorted by typical week (Monday to Sunday)
  const afluencia = [
    { day: "Lun", count: dayCounts["Lun"] },
    { day: "Mar", count: dayCounts["Mar"] },
    { day: "Mié", count: dayCounts["Mié"] },
    { day: "Jue", count: dayCounts["Jue"] },
    { day: "Vie", count: dayCounts["Vie"] },
    { day: "Sáb", count: dayCounts["Sáb"] },
    { day: "Dom", count: dayCounts["Dom"] },
  ];

  return { ingresos, stock, afluencia };
}
