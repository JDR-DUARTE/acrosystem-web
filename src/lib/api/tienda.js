import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentEmployee } from "@/lib/auth";
import { getTasaVigente } from "@/lib/api/tasas";

const PRODUCTO_SELECT = `
  id_producto,
  nombre,
  descripcion_detalle,
  precio_venta_usd,
  stock_sistema,
  categoria_producto ( id_categoria_producto, nombre )
`;

function mapProducto(row) {
  return {
    id: row.id_producto,
    nombre: row.nombre,
    descripcion: row.descripcion_detalle ?? "",
    precio: Number(row.precio_venta_usd ?? 0),
    stock: row.stock_sistema ?? 0,
    categoria: row.categoria_producto
      ? {
          id: row.categoria_producto.id_categoria_producto,
          nombre: row.categoria_producto.nombre,
        }
      : null,
  };
}

export async function listProductos({ search, categoria, stockBajo } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("productos")
    .select(PRODUCTO_SELECT)
    .order("nombre");
  if (categoria) query = query.eq("id_categoria_producto", categoria);
  if (search) query = query.ilike("nombre", `%${search}%`);
  if (stockBajo) query = query.lte("stock_sistema", 5);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapProducto);
}

export async function getProducto(id) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select(PRODUCTO_SELECT)
    .eq("id_producto", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapProducto(data);
}

export async function crearProducto(input) {
  const supabase = await createClient();
  const { employee } = await getCurrentEmployee();
  if (!employee) throw new Error("No autorizado.");

  const {
    nombre,
    descripcion,
    precio,
    stock,
    idCategoria,
    categoriaId,
    observaciones,
  } = input;
  if (!nombre || !nombre.trim()) throw new Error("El nombre es obligatorio.");

  const catId = idCategoria || categoriaId || null;
  const stockNum = Number(stock) || 0;

  const { data, error } = await supabase
    .from("productos")
    .insert({
      nombre: nombre.trim(),
      descripcion_detalle: descripcion?.trim() || null,
      precio_venta_usd: Number(precio) || 0,
      stock_sistema: stockNum,
      id_categoria_producto: catId ? Number(catId) : null,
    })
    .select(PRODUCTO_SELECT)
    .single();

  if (error) throw new Error(error.message);

  if (stockNum > 0) {
    const { error: movError } = await supabase
      .from("movimientos_inventario")
      .insert({
        id_producto: data.id_producto,
        id_empleado: employee.id_persona,
        tipo_movimiento: "Entrada",
        cantidad: stockNum,
        fecha_hora: new Date().toISOString(),
        observaciones:
          observaciones?.trim() || "Stock inicial al crear el producto",
      });
    if (movError) {
      console.error("Error al registrar movimiento inicial:", movError);
    }
  }

  return mapProducto(data);
}

export async function actualizarProducto(id, input) {
  const supabase = await createClient();
  const { employee } = await getCurrentEmployee();
  if (!employee) throw new Error("No autorizado.");

  const {
    nombre,
    descripcion,
    precio,
    stock,
    idCategoria,
    categoriaId,
    observaciones,
  } = input;
  if (!nombre || !nombre.trim()) throw new Error("El nombre es obligatorio.");

  const { data: currentProduct, error: fetchError } = await supabase
    .from("productos")
    .select("stock_sistema")
    .eq("id_producto", id)
    .single();

  if (fetchError) throw new Error("Producto no encontrado");

  const catId = idCategoria || categoriaId || null;
  const newStock = Number(stock) || 0;
  const oldStock = Number(currentProduct.stock_sistema) || 0;
  const stockDiff = newStock - oldStock;

  const { data, error } = await supabase
    .from("productos")
    .update({
      nombre: nombre.trim(),
      descripcion_detalle: descripcion?.trim() || null,
      precio_venta_usd: Number(precio) || 0,
      stock_sistema: newStock,
      id_categoria_producto: catId ? Number(catId) : null,
    })
    .eq("id_producto", id)
    .select(PRODUCTO_SELECT)
    .single();

  if (error) throw new Error(error.message);

  if (stockDiff !== 0) {
    const tipoMovimiento = stockDiff > 0 ? "Entrada" : "Merma";
    const { error: movError } = await supabase
      .from("movimientos_inventario")
      .insert({
        id_producto: id,
        id_empleado: employee.id_persona,
        tipo_movimiento: tipoMovimiento,
        cantidad: stockDiff,
        fecha_hora: new Date().toISOString(),
        observaciones:
          observaciones?.trim() ||
          "Ajuste manual de stock desde el detalle del producto",
      });
    if (movError) {
      console.error("Error registrando movimiento de inventario:", movError);
    }
  }

  return mapProducto(data);
}

export async function eliminarProducto(id) {
  const supabase = await createClient();
  const { employee } = await getCurrentEmployee();
  if (!employee) throw new Error("No autorizado.");

  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id_producto", id);

  if (error) throw new Error(error.message);
  return true;
}

export async function listPlanes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("planes")
    .select(
      "id_plan, nombre, precio_usd, pases_totales, duracion_dias, requiere_agenda",
    )
    .order("precio_usd");
  if (error) throw new Error(error.message);
  return (data ?? []).map((p) => ({
    id: p.id_plan,
    nombre: p.nombre,
    precio: Number(p.precio_usd ?? 0),
    pasesTotales: p.pases_totales ?? 0,
    duracionDias: p.duracion_dias ?? 0,
    requiereAgenda: Boolean(p.requiere_agenda),
  }));
}

export async function listCategoriasProducto() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categoria_producto")
    .select("id_categoria_producto, nombre")
    .order("nombre");
  if (error) throw new Error(error.message);
  return (data ?? []).map((c) => ({
    id: c.id_categoria_producto,
    nombre: c.nombre,
  }));
}

export async function listPromos() {
  const supabase = await createClient();
  const hoy = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("promos_eventos")
    .select(
      "id_evento, nombre, tipo, valor_descuento, fecha_inicio, fecha_fin",
    );
  if (error) throw new Error(error.message);
  return (data ?? [])
    .filter(
      (p) =>
        (!p.fecha_inicio || p.fecha_inicio <= hoy) &&
        (!p.fecha_fin || p.fecha_fin >= hoy),
    )
    .map((p) => ({
      id: p.id_evento,
      nombre: p.nombre,
      tipo: p.tipo,
      valorDescuento: Number(p.valor_descuento ?? 0),
    }));
}

// Crea una venta con su detalle, descuenta stock y registra el movimiento.
export async function crearVenta(input) {
  const supabase = await createClient();
  const { employee } = await getCurrentEmployee();
  if (!employee) throw new Error("No autorizado.");

  const items = Array.isArray(input.items) ? input.items : [];
  if (items.length === 0) throw new Error("El carrito está vacío.");

  // RN-RES-07: no se puede operar sin la tasa de cambio del día.
  const tasaInfo = await getTasaVigente();
  if (!tasaInfo.vigente) {
    throw new Error(
      "La tasa de cambio no está actualizada. Registra la tasa del día para operar.",
    );
  }

  let id_tasa = null;
  if (input.moneda !== "USD") {
    const { data: tasaData, error: tasaError } = await supabase
      .from("tasas_cambio")
      .select("id_tasa")
      .eq("fecha_tasa", tasaInfo.hoy)
      .eq("moneda", input.moneda)
      .maybeSingle();

    if (tasaError) throw new Error(tasaError.message);
    if (!tasaData) {
      throw new Error(
        `No hay tasa de cambio registrada para ${input.moneda} en el día de hoy.`,
      );
    }
    id_tasa = tasaData.id_tasa;
  }

  const productItems = items.filter((i) => i.idProducto);
  const planItems = items.filter((i) => i.idPlan);

  // Un plan debe asignarse a un miembro (se le crea la suscripción).
  if (planItems.length > 0 && !input.idMiembro) {
    throw new Error("Selecciona el miembro para vender un plan.");
  }

  // RN-RES-03: para suscribir (vender un plan) el miembro necesita documento de
  // asunción de riesgos y contacto de emergencia registrados.
  if (planItems.length > 0) {
    const { data: docs, error: docsError } = await supabase
      .from("miembros")
      .select("num_asuncion_riesgos, contacto_emergencia")
      .eq("id_persona", input.idMiembro)
      .maybeSingle();
    if (docsError) throw new Error(docsError.message);
    if (
      !docs ||
      !String(docs.num_asuncion_riesgos ?? "").trim() ||
      !String(docs.contacto_emergencia ?? "").trim()
    ) {
      throw new Error(
        "El miembro requiere documento de asunción de riesgos y contacto de emergencia antes de suscribirse.",
      );
    }
  }

  // Cargar productos reales para validar precio y stock (no confiar en el cliente).
  const productoIds = productItems.map((i) => i.idProducto);
  let productos = [];
  if (productoIds.length > 0) {
    const { data, error: prodError } = await supabase
      .from("productos")
      .select(
        "id_producto, nombre, precio_venta_usd, stock_sistema, categoria_producto ( nombre )",
      )
      .in("id_producto", productoIds);
    if (prodError) throw new Error(prodError.message);
    productos = data ?? [];
  }

  const byId = new Map(productos.map((p) => [p.id_producto, p]));
  const detalle = [];
  const alertas = [];
  let subtotal = 0;
  for (const item of productItems) {
    const prod = byId.get(item.idProducto);
    if (!prod) throw new Error("Un producto del carrito ya no existe.");
    // Un alquiler no descuenta stock y siempre es una sola unidad por producto.
    const esAlquiler =
      (prod.categoria_producto?.nombre ?? "").toLowerCase() === "alquiler";
    const cantidad = esAlquiler ? 1 : Math.max(1, Number(item.cantidad) || 1);
    // RN-EXT-03: se permite vender aunque el stock sea 0; el stock queda en
    // negativo y se emite una alerta hasta que se registre una reposición.
    if (!esAlquiler && prod.stock_sistema - cantidad < 0) {
      alertas.push(
        `Stock negativo de "${prod.nombre}": queda en ${prod.stock_sistema - cantidad}.`,
      );
    }
    const precio = Number(prod.precio_venta_usd);
    subtotal += precio * cantidad;
    detalle.push({ prod, cantidad, precio, esAlquiler });
  }

  // Cargar planes reales.
  const planIds = planItems.map((i) => i.idPlan);
  let planes = [];
  if (planIds.length > 0) {
    const { data, error: planError } = await supabase
      .from("planes")
      .select(
        "id_plan, nombre, precio_usd, pases_totales, duracion_dias, requiere_agenda, cupo_maximo",
      )
      .in("id_plan", planIds);
    if (planError) throw new Error(planError.message);
    planes = data ?? [];
  }
  const planById = new Map(planes.map((p) => [p.id_plan, p]));
  const detallePlanes = [];
  for (const item of planItems) {
    const plan = planById.get(item.idPlan);
    if (!plan) throw new Error("Un plan del carrito ya no existe.");
    const precio = Number(plan.precio_usd);
    subtotal += precio;
    // Para planes de niños se agendan los días de asistencia en la semana.
    const dias =
      plan.requiere_agenda && Array.isArray(item.dias)
        ? item.dias.filter((d) => typeof d === "string" && d.trim())
        : [];
    if (plan.requiere_agenda && dias.length === 0) {
      throw new Error(
        `Selecciona los días de asistencia para "${plan.nombre}".`,
      );
    }
    detallePlanes.push({ plan, precio, dias, fechaInicio: item.fechaInicio });
  }

  // RN-RES-05: no exceder el cupo_maximo del plan por día de agenda.
  for (const dp of detallePlanes) {
    if (
      !dp.plan.requiere_agenda ||
      dp.plan.cupo_maximo == null ||
      dp.dias.length === 0
    ) {
      continue;
    }
    for (const dia of dp.dias) {
      const { count, error: cupoError } = await supabase
        .from("suscripcion_dias")
        .select("id_agenda, suscripciones!inner(id_plan, estado)", {
          count: "exact",
          head: true,
        })
        .eq("dia_semana", dia)
        .eq("suscripciones.id_plan", dp.plan.id_plan)
        .eq("suscripciones.estado", "Activo");
      if (cupoError) throw new Error(cupoError.message);
      if ((count ?? 0) + 1 > dp.plan.cupo_maximo) {
        throw new Error(
          `Cupo lleno para "${dp.plan.nombre}" el ${dia} (máximo ${dp.plan.cupo_maximo}).`,
        );
      }
    }
  }

  // Promoción (descuento porcentual sobre el subtotal).
  let descuento = 0;
  if (input.idPromo) {
    const { data: promo } = await supabase
      .from("promos_eventos")
      .select("valor_descuento")
      .eq("id_evento", input.idPromo)
      .maybeSingle();
    if (promo) {
      descuento = subtotal * (Number(promo.valor_descuento) / 100);
    }
  }
  const total = Math.max(0, subtotal - descuento);

  // Lógica de Deuda (RN-OPE-04)
  const montoPagado =
    typeof input.montoPagado === "number"
      ? Math.max(0, input.montoPagado)
      : total;
  const deudaGenerada = Math.max(0, total - montoPagado);

  if (deudaGenerada > 0 && !input.idMiembro) {
    throw new Error("Se requiere seleccionar un miembro para generar deuda.");
  }

  let nuevaDeudaAcumulada = 0;
  if (input.idMiembro) {
    const { data: persona, error: pError } = await supabase
      .from("personas")
      .select("deuda_acumulada")
      .eq("id_persona", input.idMiembro)
      .single();

    if (pError) throw new Error(pError.message);
    const deudaActual = Number(persona.deuda_acumulada ?? 0);
    nuevaDeudaAcumulada = deudaActual + deudaGenerada;

    if (nuevaDeudaAcumulada > 10) {
      throw new Error(
        `La transacción superaría el límite de deuda de $10 (Deuda actual: $${deudaActual.toFixed(2)}, A generar: $${deudaGenerada.toFixed(2)}).`,
      );
    }
  }

  // Cabecera de la venta.
  const { data: venta, error: ventaError } = await supabase
    .from("ventas")
    .insert({
      id_comprador: input.idMiembro || null,
      id_vendedor: employee.id_persona,
      id_tasa: id_tasa,
      id_evento: input.idPromo || null,
      forma_pago: input.formaPago || null,
      moneda: input.moneda || "USD",
      total_usd: total,
      deuda_generada: deudaGenerada,
      estado: "Completada",
    })
    .select("id_venta")
    .single();
  if (ventaError) throw new Error(ventaError.message);

  // Detalle de productos + movimientos de inventario + descuento de stock.
  for (const d of detalle) {
    const { error: detError } = await supabase.from("detalle_venta").insert({
      id_venta: venta.id_venta,
      id_producto: d.prod.id_producto,
      cantidad: d.cantidad,
      precio_unit_usd: d.precio,
      tipo_item: d.esAlquiler ? "Alquiler" : "Producto",
    });
    if (detError) {
      throw new Error(`Error guardando detalle de venta: ${detError.message}`);
    }

    // Los alquileres no afectan el stock (el producto se devuelve).
    if (!d.esAlquiler) {
      const { error: stockError } = await supabase
        .from("productos")
        .update({ stock_sistema: d.prod.stock_sistema - d.cantidad })
        .eq("id_producto", d.prod.id_producto);
      if (stockError) {
        throw new Error(
          `Error actualizando stock de producto: ${stockError.message}`,
        );
      }

      const { error: movError } = await supabase
        .from("movimientos_inventario")
        .insert({
          id_producto: d.prod.id_producto,
          id_empleado: employee.id_persona,
          tipo_movimiento: "Venta",
          cantidad: -d.cantidad,
          id_venta_relacionada: venta.id_venta,
        });
      if (movError) {
        throw new Error(
          `Error registrando movimiento de inventario: ${movError.message}`,
        );
      }
    }
  }

  // Detalle de planes + creación de la suscripción del miembro.
  for (const dp of detallePlanes) {
    const { error: detPlanError } = await supabase
      .from("detalle_venta")
      .insert({
        id_venta: venta.id_venta,
        id_plan: dp.plan.id_plan,
        cantidad: 1,
        precio_unit_usd: dp.precio,
        tipo_item: "Plan",
      });
    if (detPlanError) {
      throw new Error(
        `Error guardando detalle de plan: ${detPlanError.message}`,
      );
    }

    // Use user selected date or default to today
    const hoyStr = new Date().toISOString().slice(0, 10);
    const inicioStr = dp.fechaInicio || hoyStr;
    const inicio = new Date(inicioStr + "T00:00:00");
    const expira = new Date(inicio);
    expira.setDate(expira.getDate() + (dp.plan.duracion_dias ?? 0));
    const expiraStr = expira.toISOString().slice(0, 10);

    const { data: suscripcion, error: subError } = await supabase
      .from("suscripciones")
      .insert({
        id_miembro: input.idMiembro,
        id_plan: dp.plan.id_plan,
        fecha_inicio: inicioStr,
        fecha_expiracion: expiraStr,
        pases_restantes: dp.plan.pases_totales ?? 0,
        estado: "Activo",
      })
      .select("id_suscripcion")
      .single();
    if (subError) throw new Error(subError.message);

    if (dp.dias.length > 0 && suscripcion) {
      const { error: diasError } = await supabase
        .from("suscripcion_dias")
        .insert(
          dp.dias.map((dia) => ({
            id_suscripcion: suscripcion.id_suscripcion,
            dia_semana: dia,
            tipo_dia: "Fijo",
          })),
        );
      if (diasError) {
        throw new Error(`Error guardando días de agenda: ${diasError.message}`);
      }
    }
  }

  // Actualizar deuda acumulada del miembro si corresponde
  if (input.idMiembro && deudaGenerada > 0) {
    const { error: updateError } = await supabase
      .from("personas")
      .update({ deuda_acumulada: nuevaDeudaAcumulada })
      .eq("id_persona", input.idMiembro);

    if (updateError) throw new Error(updateError.message);
  }

  return {
    id: venta.id_venta,
    subtotal,
    descuento,
    total,
    items: detalle.length + detallePlanes.length,
    alertas,
  };
}

export async function listPagos({
  search,
  producto,
  fechaDesde,
  fechaHasta,
} = {}) {
  const supabase = await createClient();
  const { employee } = await getCurrentEmployee();
  if (!employee) throw new Error("No autorizado.");

  let query = supabase
    .from("ventas")
    .select(
      `
      id_venta,
      fecha_hora,
      total_usd,
      deuda_generada,
      forma_pago,
      moneda,
      estado,
      comprador:personas!ventas_id_comprador_fkey ( id_persona, nombre_completo, cedula ),
      vendedor:empleados ( personas ( nombre_completo ) ),
      detalle_venta (
        id_detalle,
        cantidad,
        precio_unit_usd,
        tipo_item,
        producto:productos ( id_producto, nombre ),
        plan:planes ( id_plan, nombre )
      )
    `,
    )
    .order("fecha_hora", { ascending: false });

  if (fechaDesde) {
    query = query.gte("fecha_hora", `${fechaDesde}T00:00:00`);
  }
  if (fechaHasta) {
    query = query.lte("fecha_hora", `${fechaHasta}T23:59:59`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let results = (data ?? []).map((v) => ({
    id: v.id_venta,
    fechaHora: v.fecha_hora,
    totalUsd: Number(v.total_usd) || 0,
    deudaGenerada: Number(v.deuda_generada) || 0,
    formaPago: v.forma_pago || "Efectivo",
    moneda: v.moneda || "USD",
    estado: v.estado || "Completada",
    comprador: v.comprador
      ? {
          id: v.comprador.id_persona,
          nombreCompleto: v.comprador.nombre_completo,
          cedula: v.comprador.cedula,
        }
      : null,
    vendedor: v.vendedor?.personas?.nombre_completo || "Sistema",
    items: (v.detalle_venta ?? []).map((d) => ({
      id: d.id_detalle,
      cantidad: d.cantidad,
      precioUnitario: Number(d.precio_unit_usd) || 0,
      tipoItem: d.tipo_item,
      nombre: d.producto?.nombre || d.plan?.nombre || "Ítem de venta",
      idProducto: d.producto?.id_producto || null,
      idPlan: d.plan?.id_plan || null,
    })),
  }));

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    results = results.filter((v) => {
      const compradorName = v.comprador?.nombreCompleto?.toLowerCase() || "";
      const compradorCedula = v.comprador?.cedula?.toLowerCase() || "";
      const itemsStr = v.items.map((i) => i.nombre.toLowerCase()).join(" ");
      return (
        compradorName.includes(q) ||
        compradorCedula.includes(q) ||
        itemsStr.includes(q)
      );
    });
  }

  if (producto && producto !== "ALL") {
    const prodFilter = producto.toLowerCase().trim();
    results = results.filter((v) =>
      v.items.some(
        (i) =>
          i.nombre.toLowerCase() === prodFilter ||
          String(i.idProducto) === producto ||
          String(i.idPlan) === producto,
      ),
    );
  }

  return results;
}
