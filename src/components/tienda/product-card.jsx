"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";

/**
 * Formatea un número a formato de moneda estadounidense ($0.00).
 * @param {number|string} n - Valor a formatear
 * @returns {string} Texto formateado con símbolo de dólar
 */
function money(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

/**
 * Control incremental de cantidad (+ y -).
 * Permite al usuario ajustar la cantidad de unidades deseadas para un producto.
 */
function Stepper({ value, onDecrement, onIncrement }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onDecrement}
        aria-label="Disminuir cantidad"
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
        aria-label="Aumentar cantidad"
        className="flex size-7 items-center justify-center rounded-full bg-gris-oscuro-acro text-blanco-acro hover:bg-gris-claro-acro transition-colors"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

/**
 * Verifica si un producto pertenece a la categoría especial de Alquiler.
 * Los productos de alquiler tienen una lógica fija de 1 unidad máxima por operación.
 * @param {Object} producto - Objeto del producto
 * @returns {boolean} True si es de alquiler
 */
export function esAlquiler(producto) {
  return (producto.categoria?.nombre ?? "").toLowerCase() === "alquiler";
}

/**
 * Componente de tarjeta de producto para el catálogo de la tienda.
 * Muestra el nombre, descripción, precio, control de cantidad y botón de agregar al carrito.
 *
 * @param {Object} props
 * @param {Object} props.producto - Datos del producto (id, nombre, precio, stock, categoria, etc.)
 * @param {Function} props.onAdd - Función callback ejecutada al hacer clic en agregar (recibe la cantidad)
 */
export default function ProductCard({ producto, onAdd }) {
  const [qty, setQty] = useState(1);
  const alquiler = esAlquiler(producto);

  return (
    <article className="flex flex-col justify-between gap-2 rounded-2xl bg-negro-fondo-acro border border-gris-claro-acro/20 p-4 shadow-xl">
      <div>
        <h3 className="font-semibold text-blanco-acro text-base truncate" title={producto.nombre}>
          {producto.nombre}
        </h3>
        <p className="line-clamp-2 text-xs text-acro-muted mt-0.5">
          {producto.descripcion || "Sin descripción disponible"}
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
          aria-label={`Agregar ${producto.nombre} al carrito`}
          className="flex size-9 items-center justify-center text-amarillo-acro transition-transform hover:scale-110 disabled:opacity-40 cursor-pointer"
        >
          <ShoppingCart className="size-6 stroke-[2.2]" />
        </button>
      </div>
    </article>
  );
}

export { Stepper, money };
