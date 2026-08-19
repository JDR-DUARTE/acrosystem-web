"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Stepper, money } from "./product-card";

/**
 * Paso 2 del Asistente de Tienda: Detalle de Venta y Carrito.
 * Permite revisar los articulos seleccionados, ajustar cantidades de productos,
 * configurar fechas de activación para planes, eliminar items y ver el subtotal.

 */
export default function TiendaStepDetalle({
  cart = [],
  onSetQty,
  onSetPlanFechaInicio,
  onRemoveFromCart,
  totalItems = 0,
  subtotal = 0,
}) {
  // Estado local para controlar el modal de confirmación de eliminación
  const [itemToDelete, setItemToDelete] = useState(null);

  if (cart.length === 0) {
    return (
      <p className="py-12 text-center text-acro-muted">
        El carrito de compras está vacío. Regresa al catálogo para agregar productos o planes.
      </p>
    );
  }

  return (
    <div>
      {/* Cuadrícula de items en el carrito */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {cart.map((item) => (
          <article
            key={item.key}
            className="flex flex-col justify-between gap-2 rounded-2xl bg-negro-fondo-acro border border-gris-claro-acro/20 p-4 shadow-xl min-h-[140px]"
          >
            <div>
              <h3 className="font-semibold text-blanco-acro text-base truncate" title={item.nombre}>
                {item.nombre}
              </h3>
              <p className="line-clamp-2 text-xs text-acro-muted mt-0.5">
                {item.descripcion || (item.kind === "plan" ? "Plan de suscripción" : "Producto de tienda")}
              </p>
              <p className="text-xl font-bold text-blanco-acro mt-2">{money(item.precio)}</p>
            </div>

            {/* Botón para solicitar eliminación de este item */}
            <div className="mt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setItemToDelete(item)}
                aria-label={`Quitar ${item.nombre} del carrito`}
                className="flex size-9 items-center justify-center text-amarillo-acro transition-transform hover:scale-110 cursor-pointer"
              >
                <Trash2 className="size-6 stroke-[2.2]" />
              </button>
            </div>

            {/* Controles según el tipo de artículo (producto o plan) */}
            <div className="mt-3">
              {item.kind === "producto" ? (
                <div className="flex w-full">
                  <Stepper
                    value={item.cantidad}
                    onDecrement={() => onSetQty(item.key, item.cantidad - 1)}
                    onIncrement={() => onSetQty(item.key, item.cantidad + 1)}
                  />
                </div>
              ) : (
                /* Selector de fecha de inicio para planes */
                <div className="relative w-full">
                  <input
                    type="date"
                    value={item.fechaInicio || ""}
                    onChange={(e) => onSetPlanFechaInicio(item.key, e.target.value)}
                    className={`w-full bg-[#4E4E4E] text-sm rounded-lg pl-3 pr-8 py-2 border-none outline-none focus:ring-1 focus:ring-amarillo-acro appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer relative z-10 ${
                      item.fechaInicio ? "text-blanco-acro" : "text-transparent"
                    }`}
                    placeholder="Inicia hoy"
                  />
                  {/* Etiqueta visible cuando no se ha seleccionado fecha específica */}
                  {!item.fechaInicio && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-blanco-acro pointer-events-none z-20">
                      Inicia hoy
                    </span>
                  )}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-20 text-blanco-acro">
                    <svg
                      width="14"
                      height="10"
                      viewBox="0 0 14 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.38574 1.83838L6.88574 7.33838L12.3857 1.83838"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Barra de Subtotal */}
      <div className="mt-6 flex items-center justify-between border-t border-gris-claro-acro/30 pt-4 px-1">
        <span className="text-base text-acro-muted">Subtotal ({totalItems} items)</span>
        <span className="text-xl font-bold text-blanco-acro">{money(subtotal)}</span>
      </div>

      {/* Modal de confirmación para eliminar producto del carrito */}
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
                className="flex-1 rounded-xl bg-gris-oscuro-acro px-4 py-2.5 text-sm font-semibold text-blanco-acro transition-colors hover:bg-gris-claro-acro active:scale-95 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onRemoveFromCart(itemToDelete.key);
                  setItemToDelete(null);
                }}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-blanco-acro transition-transform hover:bg-red-500 active:scale-95 shadow-lg shadow-red-600/20 cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
