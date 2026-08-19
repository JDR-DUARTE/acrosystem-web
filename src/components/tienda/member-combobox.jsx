"use client";
import { useState } from "react";
import { Search, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

// Hook que consulta a la API los miembros usando React Query
import { useMiembros } from "@/hooks/use-miembros";

// Componente MemberCombobox
//buscador  para encontrar y seleccionar un miembro
//Usado en 3er paso de tienda
export default function MemberCombobox({ value, onChange }) {
  // Estado texto escrito en el buscador
  const [term, setTerm] = useState("");
  // Estado para saber si menu desplegabe esta aberto
  const [open, setOpen] = useState(false);

  // Consultamos los miembros
  const { data: miembros, isFetching } = useMiembros(
    term.trim() ? { search: term.trim() } : {},
  );

  //si hay miembro seleccionado
  // mostralo o descartarlo
  if (value) {
    return (
      <div className="flex items-center justify-between rounded-md border border-border bg-gris-oscuro-acro px-3 py-2.5">
        <span className="text-blanco-acro">{value.nombre}</span>
        <button
          type="button"
          onClick={() => onChange(null)} // para limpiar          aria-label="Quitar miembro"
          className="text-acro-muted hover:text-blanco-acro"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  // Buscador activo
  const results = miembros ?? [];

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-acro-muted" />
      {/* Input de texto para buscar */}
      <Input
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true); // Abrir el menú
        }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar miembro por nombre o cédula"
        className="h-12 bg-gris-oscuro-acro pl-11"
      />

      {/* Menú Desplegable con resultados*/}
      {open && term.trim() && (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-negro-fondo-acro py-1 shadow-lg">
          {/*si la petición está en curso y aún no hay resultados viejos */}
          {isFetching && results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-acro-muted">Buscando…</li>
          ) : results.length === 0 ? (
            /* si no se encontró nadie */
            <li className="px-3 py-2 text-sm text-acro-muted">
              Sin resultados.
            </li>
          ) : (
            /* Lista de resultados */
            results.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => {
                    // Actualizar el valor y cerrar el buscador, si se tiene miembro
                    onChange({ id: m.id, nombre: m.nombre });
                    setOpen(false);
                    setTerm("");
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-blanco-acro hover:bg-gris-claro-acro/10"
                >
                  {/* Nombre y cédula */}
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
