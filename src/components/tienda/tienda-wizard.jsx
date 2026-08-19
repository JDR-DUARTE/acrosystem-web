"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Ticket,
  Handshake,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductos, useCrearVenta } from "@/hooks/use-tienda";

// Subcomponentes modulares de cada paso del flujo
import TiendaStepCatalogo from "./tienda-step-catalogo";
import TiendaStepDetalle from "./tienda-step-detalle";
import TiendaStepPago from "./tienda-step-pago";
import TiendaSuccess from "./tienda-success";
import { esAlquiler } from "./product-card";

// Constantes generales de la tienda
const STEPS = ["Tienda", "Detalle de venta", "Datos y pago"];
const PLANES_KEY = "planes";
const DRAFT_KEY = "tienda-draft";

/**
 * Componente Principal del Asistente de Tienda (TiendaWizard).
 * Orquesta el flujo de venta en 3 pasos:
 * 1. Catálogo interactivo (productos y planes).
 * 2. Detalle y revisión del carrito de compras.
 * 3. Configuración de datos del cliente, método de pago y confirmación.
 */
export default function TiendaWizard({
  categorias = [],
  categoriasPrecio = [],
  promos = [],
  planes = [],
  tasaVigente = true,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pestañas del carrusel: "Planes" fija al inicio + categorías dinámicas de productos
  const categoryCards = [
    { key: PLANES_KEY, nombre: "Planes", icon: Ticket },
    ...categorias.map((c) => ({ key: c.id, nombre: c.nombre, icon: Handshake })),
  ];

  // --------------------------------------------------------------------------
  // Estados del Flujo y Navegación
  // --------------------------------------------------------------------------
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryCards[0]?.key ?? PLANES_KEY);
  const [cart, setCart] = useState([]);

  // --------------------------------------------------------------------------
  // Estados del Formulario de Cobro (Paso 3)
  // --------------------------------------------------------------------------
  // La categoría por defecto toma la primera opción de la base de datos o "Regular"
  const defaultCategoriaNombre = categoriasPrecio[0]?.nombre || "Regular";
  const [categoriaPrecio, setCategoriaPrecio] = useState(defaultCategoriaNombre);
  const [miembro, setMiembro] = useState(null);
  const [moneda, setMoneda] = useState("USD");
  const [formaPago, setFormaPago] = useState("Efectivo");
  const [idPromo, setIdPromo] = useState("");
  const [montoPagado, setMontoPagado] = useState("");
  const [ventaOk, setVentaOk] = useState(null);

  // --------------------------------------------------------------------------
  // Restauración de Borrador (Draft) al regresar de "Registrar Miembro"
  // --------------------------------------------------------------------------
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const nuevoId = searchParams.get("nm");
    const nuevoNombre = searchParams.get("nmn");
    const restore = searchParams.get("restore");
    if (!nuevoId && !restore) return;

    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (Array.isArray(draft.cart)) setCart(draft.cart);
        if (draft.moneda) setMoneda(draft.moneda);
        if (draft.formaPago) setFormaPago(draft.formaPago);
        if (typeof draft.idPromo === "string") setIdPromo(draft.idPromo);
        if (draft.categoriaPrecio) setCategoriaPrecio(draft.categoriaPrecio);
      }
    } catch {
      // Ignorar si el borrador es inválido o no existe en sessionStorage
    }
    sessionStorage.removeItem(DRAFT_KEY);

    if (nuevoId) {
      setMiembro({ id: nuevoId, nombre: nuevoNombre || "Miembro" });
    }
    setStep(3);
    router.replace("/tienda");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /**
   * Guarda el estado actual en sessionStorage y redirige al formulario de alta de miembros.
   */
  function irACrearMiembro() {
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ cart, moneda, formaPago, idPromo, categoriaPrecio }),
      );
    } catch {
      // Continuar la navegación aún si falla el almacenamiento local
    }
    router.push("/miembros/nuevo?returnTo=tienda");
  }

  // --------------------------------------------------------------------------
  // Consultas y Mutaciones de Datos
  // --------------------------------------------------------------------------
  const isPlanes = selectedCategory === PLANES_KEY;
  const crearVenta = useCrearVenta();

  // Consulta de productos filtrados por búsqueda y categoría seleccionada
  const { data: productos, isLoading: isLoadingProductos } = useProductos({
    search: !isPlanes && search.trim() ? search.trim() : undefined,
    categoria: !isPlanes ? selectedCategory : undefined,
  });

  // Filtro reactivo en memoria para los planes
  const planesFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? planes.filter((p) => p.nombre.toLowerCase().includes(term)) : planes;
  }, [planes, search]);

  // --------------------------------------------------------------------------
  // Cálculos Financieros y Totales del Carrito
  // --------------------------------------------------------------------------
  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
    [cart],
  );

  const promo = promos.find((p) => String(p.id) === idPromo);
  const descuento = promo ? subtotal * (promo.valorDescuento / 100) : 0;
  const total = Math.max(0, subtotal - descuento);
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const hasPlan = cart.some((item) => item.kind === "plan");

  // --------------------------------------------------------------------------
  // Acciones sobre el Carrito de Compras
  // --------------------------------------------------------------------------
  /**
   * Agrega un producto al carrito o incrementa su cantidad.
   */
  function addProducto(producto, qty) {
    const key = `prod-${producto.id}`;
    const alquiler = esAlquiler(producto);

    setCart((prev) => {
      const found = prev.find((i) => i.key === key);
      if (found) {
        // Los alquileres no se pueden acumular más allá de 1 unidad
        if (alquiler) return prev;
        return prev.map((i) =>
          i.key === key
            ? { ...i, cantidad: Math.min(99, i.cantidad + qty) }
            : i,
        );
      }
      return [
        ...prev,
        {
          key,
          kind: alquiler ? "alquiler" : "producto",
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          stock: producto.stock,
          cantidad: alquiler ? 1 : qty,
        },
      ];
    });
    toast.success(`${producto.nombre} agregado al carrito.`);
  }

  /**
   * Agrega un plan de suscripción al carrito.
   */
  function addPlan(plan) {
    const key = `plan-${plan.id}`;
    setCart((prev) => {
      if (prev.some((i) => i.key === key)) return prev;
      return [
        ...prev,
        {
          key,
          kind: "plan",
          id: plan.id,
          nombre: plan.nombre,
          precio: plan.precio,
          cantidad: 1,
          requiereAgenda: Boolean(plan.requiereAgenda),
          dias: [],
        },
      ];
    });
    toast.success(`${plan.nombre} agregado al carrito.`);
  }

  /**
   * Actualiza la cantidad de un producto en el carrito.
   */
  function setQty(key, cantidad) {
    setCart((prev) =>
      prev.map((i) =>
        i.key === key
          ? {
              ...i,
              cantidad: Math.max(1, Math.min(i.kind === "plan" ? 1 : 99, cantidad)),
            }
          : i,
      ),
    );
  }

  /**
   * Asigna la fecha de inicio a un plan en el carrito.
   */
  function setPlanFechaInicio(key, fechaInicio) {
    setCart((prev) =>
      prev.map((i) => (i.key === key ? { ...i, fechaInicio } : i)),
    );
  }

  /**
   * Elimina un item del carrito según su identificador único.
   */
  function removeFromCart(key) {
    setCart((prev) => prev.filter((i) => i.key !== key));
  }

  /**
   * Alterna los días de asistencia para un plan con agenda.
   */
  function toggleDia(key, dia) {
    setCart((prev) =>
      prev.map((i) => {
        if (i.key !== key) return i;
        const dias = i.dias ?? [];
        return {
          ...i,
          dias: dias.includes(dia) ? dias.filter((d) => d !== dia) : [...dias, dia],
        };
      }),
    );
  }

  const planesConAgenda = cart.filter(
    (i) => i.kind === "plan" && i.requiereAgenda,
  );

  // --------------------------------------------------------------------------
  // Confirmación Final de la Venta
  // --------------------------------------------------------------------------
  async function confirmarVenta() {
    if (hasPlan && !miembro) {
      toast.error("Selecciona el miembro para vender un plan.");
      return;
    }

    const sinDias = planesConAgenda.find((i) => (i.dias ?? []).length === 0);
    if (sinDias) {
      toast.error(`Selecciona los días de asistencia para "${sinDias.nombre}".`);
      return;
    }

    try {
      const res = await crearVenta.mutateAsync({
        idMiembro: miembro?.id ?? null,
        moneda,
        formaPago,
        idPromo: idPromo ? Number(idPromo) : null,
        montoPagado: montoPagado !== "" ? Number(montoPagado) : total,
        items: cart.map((i) =>
          i.kind === "plan"
            ? {
                idPlan: i.id,
                cantidad: 1,
                ...(i.requiereAgenda ? { dias: i.dias ?? [] } : {}),
                fechaInicio: i.fechaInicio,
              }
            : { idProducto: i.id, cantidad: i.cantidad },
        ),
      });

      setVentaOk(res);
      (res.alertas ?? []).forEach((alerta) => toast.warning(alerta));
      setCart([]);
    } catch (err) {
      toast.error(err.message || "Error al registrar la venta.");
    }
  }

  /**
   * Reinicia todos los estados del asistente para iniciar una nueva venta.
   */
  function nuevaVenta() {
    setVentaOk(null);
    setStep(1);
    setMiembro(null);
    setIdPromo("");
    setMoneda("USD");
    setFormaPago("Efectivo");
    setMontoPagado("");
  }

  // Si la venta se procesó con éxito, mostramos la pantalla de éxito
  if (ventaOk) {
    return <TiendaSuccess ventaOk={ventaOk} onNuevaVenta={nuevaVenta} />;
  }

  return (
    <section className="mx-auto w-full max-w-4xl pb-24">
      {/* Encabezado del Asistente con botón de retroceso */}
      <header className="mb-4 flex items-center gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            aria-label="Volver al paso anterior"
            className="rounded-md p-1 text-blanco-acro hover:bg-gris-claro-acro/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-6" />
          </button>
        )}
        <h1 className="text-3xl font-bold text-blanco-acro lg:text-4xl">
          {STEPS[step - 1]}
        </h1>
      </header>

      {/* Alerta si la tasa de cambio del día no está registrada */}
      {!tasaVigente && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-acro-danger/40 bg-acro-danger/10 p-4 text-blanco-acro">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-acro-danger" />
          <p className="text-sm">
            La tasa de cambio de hoy no está registrada. Regístrala en el Panel
            para poder completar ventas (RN-RES-07).
          </p>
        </div>
      )}

      {/* Barra de progreso de los 3 pasos */}
      <ol className="mb-6 flex gap-2" aria-label="Progreso del asistente">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < step ? "bg-amarillo-acro" : "bg-gris-oscuro-acro",
            )}
          />
        ))}
      </ol>

      {/* Renderizado del Paso 1: Catálogo de Productos y Planes */}
      {step === 1 && (
        <TiendaStepCatalogo
          categoryCards={categoryCards}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          search={search}
          onSearchChange={setSearch}
          isPlanes={isPlanes}
          planesFiltrados={planesFiltrados}
          productos={productos}
          isLoading={isLoadingProductos}
          cart={cart}
          onAddProducto={addProducto}
          onAddPlan={addPlan}
        />
      )}

      {/* Renderizado del Paso 2: Detalle y Revisión del Carrito */}
      {step === 2 && (
        <TiendaStepDetalle
          cart={cart}
          onSetQty={setQty}
          onSetPlanFechaInicio={setPlanFechaInicio}
          onRemoveFromCart={removeFromCart}
          totalItems={totalItems}
          subtotal={subtotal}
        />
      )}

      {/* Renderizado del Paso 3: Datos, Moneda, Pago y Confirmación */}
      {step === 3 && (
        <TiendaStepPago
          categoriasPrecio={categoriasPrecio}
          categoriaPrecio={categoriaPrecio}
          onCategoriaPrecioChange={setCategoriaPrecio}
          miembro={miembro}
          onMiembroChange={setMiembro}
          hasPlan={hasPlan}
          onIrACrearMiembro={irACrearMiembro}
          planesConAgenda={planesConAgenda}
          onToggleDia={toggleDia}
          moneda={moneda}
          onMonedaChange={setMoneda}
          formaPago={formaPago}
          onFormaPagoChange={setFormaPago}
          promos={promos}
          idPromo={idPromo}
          onPromoChange={setIdPromo}
          montoPagado={montoPagado}
          onMontoPagadoChange={setMontoPagado}
          totalItems={totalItems}
          subtotal={subtotal}
          descuento={descuento}
          total={total}
          isSubmitting={crearVenta.isPending}
          tasaVigente={tasaVigente}
          onConfirmarVenta={confirmarVenta}
        />
      )}

      {/* Botón flotante para avanzar de paso (en pasos 1 y 2) */}
      {step < 3 && (
        <button
          type="button"
          disabled={cart.length === 0}
          onClick={() => setStep((s) => s + 1)}
          aria-label="Avanzar al siguiente paso"
          className="fixed bottom-8 right-8 z-50 flex size-14 items-center justify-center rounded-2xl bg-amarillo-acro text-negro-fondo-acro shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-40"
        >
          <ArrowRight className="size-7 stroke-[2.5]" />
        </button>
      )}
    </section>
  );
}
