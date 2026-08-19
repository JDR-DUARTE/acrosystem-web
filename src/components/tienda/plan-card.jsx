"use client";

import { ShoppingCart } from "lucide-react";
import { money } from "./product-card";

/**
 * Componente de tarjeta de Plan de Entrenamiento / Suscripción.
 * Permite a los usuarios seleccionar planes (con pases o ilimitados por días).
 *
 * @param {Object} props
 * @param {Object} props.plan - Datos del plan (id, nombre, precio, pasesTotales, duracionDias, etc.)
 * @param {Function} props.onAdd - Callback ejecutado al presionar el botón de agregar
 * @param {boolean} props.added - Indica si el plan ya se encuentra presente en el carrito
 */
export default function PlanCard({ plan, onAdd, added }) {
  return (
    <article className="flex flex-col justify-between gap-2 rounded-2xl bg-negro-fondo-acro border border-gris-claro-acro/20 p-4 shadow-xl">
      <div>
        <h3 className="font-semibold text-blanco-acro text-base truncate" title={plan.nombre}>
          {plan.nombre}
        </h3>
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
          aria-label={`Agregar plan ${plan.nombre} al carrito`}
          className="flex size-9 items-center justify-center text-amarillo-acro transition-transform hover:scale-110 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
        >
          <ShoppingCart className="size-6 stroke-[2.2]" />
        </button>
      </div>
    </article>
  );
}
