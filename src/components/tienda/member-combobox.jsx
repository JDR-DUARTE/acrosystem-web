//Componente para elegir un miembro en la fase 3 de venta
"use client";
import { useState } from "react";
import { Search, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

import { useMiembros } from "@/hooks/use-miembros";

// Componente MemberCombobox
export default function MemberCombobox({ value, onChange }) {
  // Estado de text en el buscador
  const [term, setTerm] = useState("");
  // estado del menu desplegado o no
  const [open, setOpen] = useState(false);
  const { data: miembros, isFetching } = useMiembros(
    term.trim() ? { search: term.trim() } : {},
  );

  // componente con nombre y opcion de deseleccionar
  if (value) {
    return (
      <div className="flex items-center justify-between rounded-md border border-border bg-gris-oscuro-acro px-3 py-2.5">
        <span className="text-blanco-acro">{value.nombre}</span>
        <button
          type="button"
          onClick={() => onChange(null)} // Al hacer click en la X, limpiamos la selección
          aria-label="Quitar miembro"
          className="text-acro-muted hover:text-blanco-acro"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  // Buscador
  const results = miembros ?? [];

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-acro-muted" />

      {/* Input de texto para buscar */}
      <Input
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true); // Abrir menu
        }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar miembro por nombre o cédula"
        className="h-12 bg-gris-oscuro-acro pl-11"
      />

      {/* Menú Desplegable con los resultados */}
      {open && term.trim() && (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-negro-fondo-acro py-1 shadow-lg">
          {/* si la petición está en curso y aún no hay resultados viejos */}
          {isFetching && results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-acro-muted">Buscando…</li>
          ) : results.length === 0 ? (
            /*No se encontró nadie */
            <li className="px-3 py-2 text-sm text-acro-muted">
              Sin resultados.
            </li>
          ) : (
            /* Lista de miembros */
            results.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => {
                    // Al seleccionar un miembro, actualizamos el valor y cerramos el buscador
                    onChange({ id: m.id, nombre: m.nombre });
                    setOpen(false);
                    setTerm("");
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-blanco-acro hover:bg-gris-claro-acro/10"
                >
                  {/* Nombre y cédula  */}
                  <span>
                    {m.nombre}
                    {m.cedula ? (
                      <span className="ml-2 text-xs text-acro-muted">
                        {m.cedula}
                      </span>
                    ) : null}
                  </span>
                  <Check className="size-4 opacity-0" />
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
