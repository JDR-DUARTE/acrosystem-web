"use client";

import { CheckCircle2 } from "lucide-react";
import { money } from "./product-card";

/**
 * Pantalla de confirmación de venta exitosa.

 */
export default function TiendaSuccess({ ventaOk, onNuevaVenta }) {
  if (!ventaOk) return null;

  return (
    <section className="mx-auto flex w-full max-w-md flex-col items-center gap-4 py-16 text-center">
      <CheckCircle2 className="size-16 text-amarillo-acro" />
      <h1 className="text-2xl font-bold text-blanco-acro">Venta registrada</h1>
      <p className="text-acro-muted">
        {ventaOk.items} artículo(s) · Total {money(ventaOk.total)}
      </p>
      <button
        type="button"
        onClick={onNuevaVenta}
        className="mt-2 rounded-xl bg-amarillo-acro px-6 py-3 font-semibold text-negro-fondo-acro hover:scale-[1.02] active:scale-95 transition-transform cursor-pointer shadow-lg"
      >
        Nueva venta
      </button>
    </section>
  );
}
