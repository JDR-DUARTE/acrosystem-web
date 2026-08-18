"use client";

import { useState } from "react";
import {
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertCircle,
  X,
  CreditCard,
  User,
  ShoppingBag,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePagos } from "@/hooks/use-pagos";
import { useProductos } from "@/hooks/use-tienda";
import { useConfiguracion } from "@/hooks/use-configuracion";

export default function PagosView() {
  const [search, setSearch] = useState("");
  const [producto, setProducto] = useState("ALL");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Selected payment for detail modal
  const [selectedPago, setSelectedPago] = useState(null);

  // Pagination / Scroll state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch productos to populate filter options
  const { data: productos } = useProductos();
  const { data: configData } = useConfiguracion();

  // Query pagos
  const {
    data: pagos,
    isLoading,
    isError,
    error,
  } = usePagos({
    search: search.trim() || undefined,
    producto: producto !== "ALL" ? producto : undefined,
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
  });

  // Unique list of product/plan names for dropdown
  const planesNombres = configData?.planes?.map((p) => p.nombre) || [];
  const productOptions = Array.from(
    new Set((productos || []).map((p) => p.nombre).concat(planesNombres)),
  ).sort();

  // Formatting date for display (DD/MM/YYYY)
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // Pagination logic
  const totalItems = pagos ? pagos.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const pageIndex = Math.min(currentPage, totalPages);
  const paginatedPagos = (pagos || []).slice(
    (pageIndex - 1) * itemsPerPage,
    pageIndex * itemsPerPage,
  );

  return (
    <section className="relative min-h-[calc(100vh-100px)] pb-20">
      {/* Title & Subtitle */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blanco-acro md:text-4xl">
          Pagos
        </h1>
        <p className="mt-1 text-base text-acro-muted">
          Historial de transacciones
        </p>
      </div>

      {/* Filters Container */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-acro-muted" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar..."
            className="h-12 w-full rounded-xl bg-gris-claro-acro border-none pl-11 pr-4 text-base text-blanco-acro placeholder:text-acro-muted focus-visible:ring-1 focus-visible:ring-amarillo-acro"
          />
        </div>

        {/* Producto Select Dropdown */}
        <div className="relative w-full">
          <select
            value={producto}
            onChange={(e) => {
              setProducto(e.target.value);
              setCurrentPage(1);
            }}
            className="h-12 w-full appearance-none rounded-xl bg-gris-claro-acro px-4 pr-10 text-base text-blanco-acro border-none focus:outline-none focus:ring-1 focus:ring-amarillo-acro cursor-pointer"
          >
            <option
              value="ALL"
              className="bg-negro-fondo-acro text-blanco-acro"
            >
              Producto
            </option>
            {productOptions.map((opt) => (
              <option
                key={opt}
                value={opt}
                className="bg-negro-fondo-acro text-blanco-acro"
              >
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-acro-muted" />
        </div>

        {/* Fecha Desde */}
        <div className="relative w-full">
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => {
              setFechaDesde(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Desde"
            className="h-12 w-full rounded-xl bg-gris-claro-acro px-4 pr-10 text-base text-blanco-acro border-none focus:outline-none focus:ring-1 focus:ring-amarillo-acro cursor-pointer [color-scheme:dark]"
          />
          <Calendar className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-acro-muted" />
        </div>

        {/* Fecha Hasta */}
        <div className="relative w-full">
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => {
              setFechaHasta(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Hasta"
            className="h-12 w-full rounded-xl bg-gris-claro-acro px-4 pr-10 text-base text-blanco-acro border-none focus:outline-none focus:ring-1 focus:ring-amarillo-acro cursor-pointer [color-scheme:dark]"
          />
          <Calendar className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-acro-muted" />
        </div>
      </div>

      {/* Table / List View */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-gris-oscuro-acro border border-gris-claro-acro/20">
          <Loader2 className="size-8 animate-spin text-amarillo-acro" />
        </div>
      ) : isError ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl bg-gris-oscuro-acro p-6 text-center text-acro-danger border border-gris-claro-acro/20">
          <AlertCircle className="size-8" />
          <p>{error?.message || "Error al cargar el historial de pagos."}</p>
        </div>
      ) : !pagos || pagos.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-2xl bg-gris-oscuro-acro p-6 text-center text-acro-muted border border-gris-claro-acro/20">
          <p className="text-lg font-medium text-blanco-acro">
            No se encontraron transacciones
          </p>
          <p className="text-sm">
            Prueba ajustando los filtros de búsqueda o fechas.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-gris-oscuro-acro border border-gris-claro-acro/30 shadow-xl">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-gris-oscuro-acro/90 px-4 py-3.5 text-base font-semibold text-blanco-acro sm:px-6">
            <div className="col-span-5 sm:col-span-5">Nombre</div>
            <div className="col-span-4 text-center sm:col-span-4">Fecha</div>
            <div className="col-span-3 text-right sm:col-span-3">Monto</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
            {(pagos || []).map((p) => {
              const compradorNombre =
                p.comprador?.nombreCompleto || "Cliente Ocasional";
              const itemsResumen =
                p.items.map((i) => i.nombre).join(", ") || "Venta";

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPago(p)}
                  className="grid grid-cols-12 items-center px-4 py-4 text-base transition-colors hover:bg-gris-claro-acro/10 cursor-pointer sm:px-6"
                >
                  {/* Nombre / Comprador */}
                  <div className="col-span-5 pr-2">
                    <p className="font-semibold text-blanco-acro truncate">
                      {compradorNombre}
                    </p>
                    <p className="text-xs text-acro-muted truncate">
                      {itemsResumen}
                    </p>
                  </div>

                  {/* Fecha */}
                  <div className="col-span-4 text-center text-acro-muted">
                    {formatDate(p.fechaHora)}
                  </div>

                  {/* Monto */}
                  <div className="col-span-3 text-right font-bold text-blanco-acro">
                    {p.totalUsd.toFixed(2)} $
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedPago && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-gris-oscuro-acro p-6 shadow-2xl border border-gris-claro-acro/30 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gris-claro-acro/30 pb-4">
              <div>
                <h3 className="text-xl font-bold text-blanco-acro flex items-center gap-2">
                  <FileText className="size-5 text-amarillo-acro" />
                  Detalle de Transacción
                </h3>
                <p className="mt-0.5 text-xs text-acro-muted font-mono">
                  ID: {selectedPago.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPago(null)}
                className="rounded-lg p-1 text-acro-muted hover:bg-white/10 hover:text-blanco-acro"
              >
                <X className="size-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="mt-4 flex flex-col gap-4">
              {/* Buyer & Info */}
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-negro-fondo-acro p-3.5 text-sm">
                <div>
                  <span className="flex items-center gap-1.5 text-xs text-acro-muted font-medium">
                    <User className="size-3.5" /> Comprador
                  </span>
                  <p className="mt-0.5 font-bold text-blanco-acro">
                    {selectedPago.comprador?.nombreCompleto ||
                      "Cliente Ocasional"}
                  </p>
                  {selectedPago.comprador?.cedula && (
                    <p className="text-xs text-acro-muted">
                      C.I: {selectedPago.comprador.cedula}
                    </p>
                  )}
                </div>

                <div>
                  <span className="flex items-center gap-1.5 text-xs text-acro-muted font-medium">
                    <Calendar className="size-3.5" /> Fecha y Hora
                  </span>
                  <p className="mt-0.5 font-bold text-blanco-acro">
                    {formatDate(selectedPago.fechaHora)}
                  </p>
                  <p className="text-xs text-acro-muted">
                    {selectedPago.fechaHora
                      ? new Date(selectedPago.fechaHora).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : ""}
                  </p>
                </div>
              </div>

              {/* Items Purchased */}
              <div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-acro-muted uppercase tracking-wider mb-2">
                  <ShoppingBag className="size-3.5 text-amarillo-acro" /> Ítems
                  adquiridos
                </span>
                <div className="divide-y divide-white/5 rounded-xl bg-negro-fondo-acro p-3">
                  {selectedPago.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 text-sm first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="font-semibold text-blanco-acro">
                          {item.nombre}
                        </p>
                        <p className="text-xs text-acro-muted">
                          {item.cantidad} x ${item.precioUnitario.toFixed(2)} (
                          {item.tipoItem})
                        </p>
                      </div>
                      <span className="font-bold text-blanco-acro">
                        ${(item.cantidad * item.precioUnitario).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details Footer */}
              <div className="rounded-xl bg-negro-fondo-acro p-3.5 text-sm flex flex-col gap-2">
                <div className="flex items-center justify-between text-acro-muted">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="size-4" /> Método de Pago
                  </span>
                  <span className="font-bold text-blanco-acro">
                    {selectedPago.formaPago}
                  </span>
                </div>

                {selectedPago.deudaGenerada > 0 && (
                  <div className="flex items-center justify-between text-amarillo-acro">
                    <span>Deuda Generada</span>
                    <span className="font-bold">
                      +${selectedPago.deudaGenerada.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gris-claro-acro/30 pt-2 text-base font-bold text-blanco-acro">
                  <span>Total Pagado</span>
                  <span className="text-xl text-amarillo-acro">
                    ${selectedPago.totalUsd.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedPago(null)}
                  className="rounded-xl bg-amarillo-acro px-6 py-2.5 text-base font-bold text-negro-fondo-acro transition-transform hover:scale-[1.02]"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
