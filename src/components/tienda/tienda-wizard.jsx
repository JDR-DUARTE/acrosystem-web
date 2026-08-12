"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  ShoppingCart,
  Minus,
  Plus,
  CheckCircle2,
  Loader2,
  Handshake,
  Ticket,
  UserPlus,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useProductos, useCrearVenta } from "@/hooks/use-tienda";
import MemberCombobox from "@/components/tienda/member-combobox";

const MONEDAS = ["COP", "VES", "USD", "EUR", "USDT"];
const FORMAS_PAGO = ["Efectivo", "Transferencia", "Pago móvil", "Tarjeta", "Zelle"];
const CATEGORIAS_PRECIO = ["Regular", "Miembro", "Empleado"];
const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const STEPS = ["Tienda", "Detalle de venta", "Datos y pago"];
const PLANES_KEY = "planes";
const DRAFT_KEY = "tienda-draft";

function money(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function Stepper({ value, onDecrement, onIncrement }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onDecrement}
        aria-label="Disminuir"
        className="flex size-7 items-center justify-center rounded-full bg-gris-oscuro-acro text-blanco-acro hover:bg-gris-claro-acro transition-colors"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="flex h-7 w-8 items-center justify-center rounded-md border border-gris-claro-acro bg-negro-fondo-acro text-xs font-semibold text-blanco-acro">
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Aumentar"
        className="flex size-7 items-center justify-center rounded-full bg-gris-oscuro-acro text-blanco-acro hover:bg-gris-claro-acro transition-colors"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

function esAlquiler(producto) {
  return (producto.categoria?.nombre ?? "").toLowerCase() === "alquiler";
}

function ProductCard({ producto, onAdd }) {
  const [qty, setQty] = useState(1);
  const alquiler = esAlquiler(producto);
  const sinStock = !alquiler && producto.stock <= 0;
  return (
    <article className="flex flex-col justify-between gap-2 rounded-2xl bg-negro-fondo-acro border border-gris-claro-acro/20 p-4 shadow-xl">
      <div>
        <h3 className="font-semibold text-blanco-acro text-base truncate">{producto.nombre}</h3>
        <p className="line-clamp-2 text-xs text-acro-muted mt-0.5">
          {producto.descripcion || "Texto descripción"}
        </p>
        <p className="text-xl font-bold text-blanco-acro mt-2">{money(producto.precio)}</p>
      </div>
      <div className="mt-3 flex items-center justify-between pt-1">
        {alquiler ? (
          <span className="text-xs text-acro-muted">1 unidad</span>
        ) : (
          <Stepper
            value={qty}
            onDecrement={() => setQty((q) => Math.max(1, q - 1))}
            onIncrement={() => setQty((q) => Math.min(99, q + 1))}
          />
        )}
        <button
          type="button"
          onClick={() => onAdd(alquiler ? 1 : qty)}
          aria-label={`Agregar ${producto.nombre}`}
          className="flex size-9 items-center justify-center text-amarillo-acro transition-transform hover:scale-110 disabled:opacity-40"
        >
          <ShoppingCart className="size-6 stroke-[2.2]" />
        </button>
      </div>
    </article>
  );
}

function PlanCard({ plan, onAdd, added }) {
  return (
    <article className="flex flex-col justify-between gap-2 rounded-2xl bg-negro-fondo-acro border border-gris-claro-acro/20 p-4 shadow-xl">
      <div>
        <h3 className="font-semibold text-blanco-acro text-base truncate">{plan.nombre}</h3>
        <p className="text-xs text-acro-muted mt-0.5">
          {plan.pasesTotales > 0 ? `${plan.pasesTotales} pases · ` : ""}
          {plan.duracionDias} días
        </p>
        <p className="text-xl font-bold text-blanco-acro mt-2">{money(plan.precio)}</p>
      </div>
      <div className="mt-3 flex items-center justify-end pt-1">
        <button
          type="button"
          disabled={added}
          onClick={onAdd}
          aria-label={`Agregar ${plan.nombre}`}
          className="flex size-9 items-center justify-center text-amarillo-acro transition-transform hover:scale-110 disabled:opacity-40"
        >
          <ShoppingCart className="size-6 stroke-[2.2]" />
        </button>
      </div>
    </article>
  );
}

export default function TiendaWizard({
  categorias = [],
  promos = [],
  planes = [],
  tasaVigente = true,
}) {
  const cards = [
    { key: PLANES_KEY, nombre: "Planes", icon: Ticket },
    ...categorias.map((c) => ({ key: c.id, nombre: c.nombre, icon: Handshake })),
  ];

  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(cards[0]?.key ?? PLANES_KEY);
  const [cart, setCart] = useState([]);

  const [categoriaPrecio, setCategoriaPrecio] = useState("Regular");
  const [miembro, setMiembro] = useState(null);
  const [moneda, setMoneda] = useState("USD");
  const [formaPago, setFormaPago] = useState("Efectivo");
  const [idPromo, setIdPromo] = useState("");
  const [montoPagado, setMontoPagado] = useState("");
  const [ventaOk, setVentaOk] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const carouselRef = useRef(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -220, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 220, behavior: "smooth" });
    }
  };

  const router = useRouter();
  const searchParams = useSearchParams();

  // Al volver desde "Agregar miembro" se restaura el carrito y, si se creó un
  // miembro, queda seleccionado en el paso de pago. Es una hidratación puntual
  // desde sessionStorage/URL al montar, por eso se ejecuta dentro del efecto.
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
      // Borrador inválido: se ignora.
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

  function irACrearMiembro() {
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ cart, moneda, formaPago, idPromo, categoriaPrecio }),
      );
    } catch {
      // Sin sessionStorage no se persiste el borrador, pero igual se navega.
    }
    router.push("/miembros/nuevo?returnTo=tienda");
  }

  const isPlanes = selected === PLANES_KEY;
  const crearVenta = useCrearVenta();
  const { data: productos, isLoading } = useProductos({
    search: !isPlanes && search.trim() ? search.trim() : undefined,
    categoria: !isPlanes ? selected : undefined,
  });

  const planesFiltrados = useMemo(() => {
    const t = search.trim().toLowerCase();
    return t ? planes.filter((p) => p.nombre.toLowerCase().includes(t)) : planes;
  }, [planes, search]);

  const subtotal = useMemo(
    () => cart.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
    [cart],
  );
  const promo = promos.find((p) => String(p.id) === idPromo);
  const descuento = promo ? subtotal * (promo.valorDescuento / 100) : 0;
  const total = Math.max(0, subtotal - descuento);
  const totalItems = cart.reduce((acc, i) => acc + i.cantidad, 0);
  const hasPlan = cart.some((i) => i.kind === "plan");

  function addProducto(producto, qty) {
    const key = `prod-${producto.id}`;
    const alquiler = esAlquiler(producto);
    setCart((prev) => {
      const found = prev.find((i) => i.key === key);
      if (found) {
        // Un alquiler siempre queda en 1 unidad.
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
    toast.success(`${producto.nombre} agregado.`);
  }

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
    toast.success(`${plan.nombre} agregado.`);
  }

  function setQty(key, cantidad) {
    setCart((prev) =>
      prev.map((i) =>
        i.key === key
          ? {
              ...i,
              cantidad: Math.max(
                1,
                Math.min(i.kind === "plan" ? 1 : 99, cantidad),
              ),
            }
          : i,
      ),
    );
  }

  function removeFromCart(key) {
    setCart((prev) => prev.filter((i) => i.key !== key));
  }

  function toggleDia(key, dia) {
    setCart((prev) =>
      prev.map((i) => {
        if (i.key !== key) return i;
        const dias = i.dias ?? [];
        return {
          ...i,
          dias: dias.includes(dia)
            ? dias.filter((d) => d !== dia)
            : [...dias, dia],
        };
      }),
    );
  }

  const planesConAgenda = cart.filter(
    (i) => i.kind === "plan" && i.requiereAgenda,
  );

  async function confirmar() {
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
              }
            : { idProducto: i.id, cantidad: i.cantidad },
        ),
      });
      setVentaOk(res);
      (res.alertas ?? []).forEach((a) => toast.warning(a));
      setCart([]);
    } catch (err) {
      toast.error(err.message);
    }
  }

  function nuevaVenta() {
    setVentaOk(null);
    setStep(1);
    setMiembro(null);
    setIdPromo("");
    setMoneda("USD");
    setFormaPago("Efectivo");
  }

  if (ventaOk) {
    return (
      <section className="mx-auto flex w-full max-w-md flex-col items-center gap-4 py-16 text-center">
        <CheckCircle2 className="size-16 text-amarillo-acro" />
        <h1 className="text-2xl font-bold text-blanco-acro">Venta registrada</h1>
        <p className="text-acro-muted">
          {ventaOk.items} artículo(s) · Total {money(ventaOk.total)}
        </p>
        <button
          type="button"
          onClick={nuevaVenta}
          className="mt-2 rounded-xl bg-amarillo-acro px-6 py-3 font-semibold text-negro-fondo-acro hover:scale-[1.02]"
        >
          Nueva venta
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl pb-24">
      <header className="mb-4 flex items-center gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            aria-label="Volver"
            className="rounded-md p-1 text-blanco-acro hover:bg-gris-claro-acro/10"
          >
            <ArrowLeft className="size-6" />
          </button>
        )}
        <h1 className="text-3xl font-bold text-blanco-acro lg:text-4xl">
          {STEPS[step - 1]}
        </h1>
      </header>

      {!tasaVigente && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-acro-danger/40 bg-acro-danger/10 p-4 text-blanco-acro">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-acro-danger" />
          <p className="text-sm">
            La tasa de cambio de hoy no está registrada. Regístrala en el Panel
            para poder completar ventas (RN-RES-07).
          </p>
        </div>
      )}

      <ol className="mb-6 flex gap-2" aria-label="Progreso">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i < step ? "bg-amarillo-acro" : "bg-gris-oscuro-acro",
            )}
          />
        ))}
      </ol>

      {step === 1 && (
        <div>
          {/* Carousel for categories */}
          <div className="relative group my-2">
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Anterior categoría"
              className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 size-9 items-center justify-center rounded-full bg-gris-oscuro-acro border border-gris-claro-acro/30 text-blanco-acro shadow-xl transition-all hover:bg-white/10 hover:scale-110 md:flex"
            >
              <ChevronLeft className="size-5" />
            </button>

            <div
              ref={carouselRef}
              className="flex items-center gap-3 overflow-x-auto py-2 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {cards.map((c) => {
                const Icon = c.icon;
                const active = selected === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setSelected(c.key)}
                    aria-pressed={active}
                    className={cn(
                      "flex h-28 w-36 sm:w-40 shrink-0 snap-start flex-col justify-between rounded-2xl border p-4 text-left transition-all",
                      active
                        ? "border-transparent bg-amarillo-acro text-negro-fondo-acro shadow-md scale-[1.02]"
                        : "border-border bg-gris-oscuro-acro text-blanco-acro hover:bg-gris-claro-acro/10",
                    )}
                  >
                    <span className="text-base sm:text-lg font-semibold truncate">{c.nombre}</span>
                    <Icon
                      className={cn(
                        "size-9 self-end shrink-0",
                        active ? "text-negro-fondo-acro" : "text-acro-muted",
                      )}
                    />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={scrollRight}
              aria-label="Siguiente categoría"
              className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 size-9 items-center justify-center rounded-full bg-gris-oscuro-acro border border-gris-claro-acro/30 text-blanco-acro shadow-xl transition-all hover:bg-white/10 hover:scale-110 md:flex"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div className="relative my-4">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-acro-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isPlanes ? "Buscar plan" : "Buscar producto"}
              className="h-12 bg-gris-oscuro-acro pl-11"
            />
          </div>

          {isPlanes ? (
            planesFiltrados.length === 0 ? (
              <p className="py-8 text-center text-acro-muted">Sin planes.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {planesFiltrados.map((p) => (
                  <PlanCard
                    key={p.id}
                    plan={p}
                    added={cart.some((i) => i.key === `plan-${p.id}`)}
                    onAdd={() => addPlan(p)}
                  />
                ))}
              </div>
            )
          ) : isLoading ? (
            <p className="py-8 text-center text-acro-muted">Cargando…</p>
          ) : !productos || productos.length === 0 ? (
            <p className="py-8 text-center text-acro-muted">Sin productos.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {productos.map((p) => (
                <ProductCard
                  key={p.id}
                  producto={p}
                  onAdd={(qty) => addProducto(p, qty)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          {cart.length === 0 ? (
            <p className="py-8 text-center text-acro-muted">
              El carrito está vacío.
            </p>
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {cart.map((i) => (
                  <article
                    key={i.key}
                    className="flex flex-col justify-between gap-2 rounded-2xl bg-negro-fondo-acro border border-gris-claro-acro/20 p-4 shadow-xl min-h-[140px]"
                  >
                    <div>
                      <h3 className="font-semibold text-blanco-acro text-base truncate">
                        {i.nombre}
                      </h3>
                      <p className="line-clamp-2 text-xs text-acro-muted mt-0.5">
                        {i.descripcion || "Texto descripción"}
                      </p>
                      <p className="text-xl font-bold text-blanco-acro mt-2">{money(i.precio)}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-1">
                      {i.kind === "producto" ? (
                        <Stepper
                          value={i.cantidad}
                          onDecrement={() => setQty(i.key, i.cantidad - 1)}
                          onIncrement={() => setQty(i.key, i.cantidad + 1)}
                        />
                      ) : i.requiereAgenda ? (
                        <select
                          value={i.dias?.[0] || ""}
                          onChange={(e) => toggleDia(i.key, e.target.value)}
                          className="bg-gris-oscuro-acro text-blanco-acro text-xs rounded-lg px-2.5 py-1.5 border border-gris-claro-acro outline-none cursor-pointer"
                        >
                          <option value="">Inicio</option>
                          {DIAS_SEMANA.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-acro-muted">Plan</span>
                      )}

                      <button
                        type="button"
                        onClick={() => setItemToDelete(i)}
                        aria-label={`Quitar ${i.nombre}`}
                        className="flex size-9 items-center justify-center text-amarillo-acro transition-transform hover:scale-110"
                      >
                        <Trash2 className="size-6 stroke-[2.2]" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-gris-claro-acro/30 pt-4 px-1">
                <span className="text-base text-acro-muted">Subtotal ({totalItems} items)</span>
                <span className="text-xl font-bold text-blanco-acro">{money(subtotal)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            confirmar();
          }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-6 md:gap-y-5"
        >
          <div className="flex flex-col gap-2">
            <Label className="text-base text-blanco-acro">Categoría</Label>
            <Select value={categoriaPrecio} onValueChange={setCategoriaPrecio}>
              <SelectTrigger className="h-12 w-full bg-gris-oscuro-acro">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS_PRECIO.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-base text-blanco-acro">
              Nombre y Apellido{" "}
              {hasPlan && <span className="text-amarillo-acro">*</span>}
            </Label>
            <MemberCombobox value={miembro} onChange={setMiembro} />
            {!miembro && (
              <button
                type="button"
                onClick={irACrearMiembro}
                className="flex items-center gap-1.5 self-start text-sm font-medium text-amarillo-acro hover:underline"
              >
                <UserPlus className="size-4" />
                ¿No está registrado? Agregar miembro
              </button>
            )}
          </div>

          {planesConAgenda.map((i) => (
            <fieldset
              key={i.key}
              className="rounded-xl border border-border p-4 md:col-span-2"
            >
              <legend className="px-1 text-base font-semibold text-blanco-acro">
                Días de asistencia · {i.nombre}
              </legend>
              <div className="flex flex-wrap gap-2">
                {DIAS_SEMANA.map((dia) => {
                  const activo = (i.dias ?? []).includes(dia);
                  return (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => toggleDia(i.key, dia)}
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        activo
                          ? "bg-amarillo-acro text-negro-fondo-acro"
                          : "bg-negro-fondo-acro text-blanco-acro hover:bg-white/10",
                      )}
                    >
                      {dia}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <fieldset className="rounded-xl border border-border p-4 md:col-span-2">
            <legend className="px-1 text-base font-semibold text-blanco-acro">
              Moneda
            </legend>
            <div className="flex flex-wrap gap-4">
              {MONEDAS.map((m) => (
                <label
                  key={m}
                  className="flex cursor-pointer items-center gap-2 text-blanco-acro"
                >
                  <input
                    type="radio"
                    name="moneda"
                    value={m}
                    checked={moneda === m}
                    onChange={() => setMoneda(m)}
                    className="accent-amarillo-acro"
                  />
                  {m}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <Label className="text-base font-semibold text-blanco-acro">
              Forma de pago
            </Label>
            <Select value={formaPago} onValueChange={setFormaPago}>
              <SelectTrigger className="h-12 w-full bg-gris-oscuro-acro">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAS_PAGO.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-base font-semibold text-blanco-acro">
              Promoción
            </Label>
            <Select
              value={idPromo || "none"}
              onValueChange={(v) => setIdPromo(v === "none" ? "" : v)}
            >
              <SelectTrigger className="h-12 w-full bg-gris-oscuro-acro">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin promoción</SelectItem>
                {promos.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.nombre} ({p.valorDescuento}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <dl className="rounded-2xl border border-border p-4 text-blanco-acro">
            <div className="flex justify-between">
              <dt className="text-acro-muted">Items ({totalItems})</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-acro-muted">Descuento</dt>
              <dd>{money(descuento)}</dd>
            </div>
            <div className="mt-1 flex justify-between text-lg font-bold">
              <dt>Total a pagar</dt>
              <dd>{money(total)}</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-2">
            <Label className="text-base font-semibold text-blanco-acro">
              Monto que abona el cliente
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder={`Total: ${total.toFixed(2)}`}
              value={montoPagado}
              onChange={(e) => setMontoPagado(e.target.value)}
              className="h-12 w-full bg-gris-oscuro-acro text-lg text-blanco-acro"
            />
            {montoPagado !== "" && Number(montoPagado) < total && (
              <p className="text-sm text-acro-danger">
                Deuda a generar: {money(total - Number(montoPagado))}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={crearVenta.isPending || cart.length === 0 || !tasaVigente}
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-amarillo-acro text-lg font-semibold text-negro-fondo-acro hover:scale-[1.01] disabled:opacity-60 md:col-span-2"
          >
            {crearVenta.isPending ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              "Confirmar"
            )}
          </button>
        </form>
      )}

      {step < 3 && (
        <button
          type="button"
          disabled={cart.length === 0}
          onClick={() => setStep((s) => s + 1)}
          aria-label="Siguiente"
          className="fixed bottom-8 right-8 z-50 flex size-14 items-center justify-center rounded-2xl bg-amarillo-acro text-negro-fondo-acro shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-40"
        >
          <ArrowRight className="size-7 stroke-[2.5]" />
        </button>
      )}

      {/* Modal de confirmación para eliminar producto en Detalle de Venta */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-negro-fondo-acro border border-gris-oscuro-acro p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertTriangle className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-blanco-acro mb-2">
              ¿Eliminar producto?
            </h3>
            <p className="text-sm text-acro-muted mb-6">
              ¿Estás seguro de que deseas eliminar{" "}
              <span className="font-semibold text-blanco-acro">
                {`"${itemToDelete.nombre}"`}
              </span>{" "}
              de la venta?
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 rounded-xl bg-gris-oscuro-acro px-4 py-2.5 text-sm font-semibold text-blanco-acro transition-colors hover:bg-gris-claro-acro active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  removeFromCart(itemToDelete.key);
                  setItemToDelete(null);
                }}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-blanco-acro transition-transform hover:bg-red-500 active:scale-95 shadow-lg shadow-red-600/20"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
