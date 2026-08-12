"use client";
import { useState } from "react";
import { Search, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

// Hook que consulta a la API los miembros usando React Query
import { useMiembros } from "@/hooks/use-miembros";

// Componente MemberCombobox
// Es un selector (dropdown) con buscador integrado para encontrar y seleccionar un miembro (cliente)
// a la hora de hacer una venta en la tienda.
// Recibe como props: 
// - value: El miembro actualmente seleccionado (null si no hay ninguno)
// - onChange: Función que se ejecuta cuando se selecciona o deselecciona un miembro
export default function MemberCombobox({ value, onChange }) {
  // Estado para el texto que el usuario escribe en el buscador
  const [term, setTerm] = useState("");
  // Estado para saber si el menú desplegable (lista de resultados) está abierto
  const [open, setOpen] = useState(false);

  // Consultamos los miembros a la API pasándole el término de búsqueda
  // React Query se encarga de manejar el loading y cachear la respuesta
  const { data: miembros, isFetching } = useMiembros(
    term.trim() ? { search: term.trim() } : {},
  );

  // MODO 1: Ya hay un miembro seleccionado
  // Si tenemos un valor, mostramos una "pastilla" con el nombre y una X para borrarlo
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

  // MODO 2: Buscador activo
  const results = miembros ?? [];

  return (
    <div className="relative">
      {/* Ícono de lupa absoluto */}
      <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-acro-muted" />
      
      {/* Input de texto para buscar */}
      <Input
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true); // Abrimos el menú al escribir
        }}
        onFocus={() => setOpen(true)} // Abrimos el menú al hacer foco (click) en el input
        placeholder="Buscar miembro por nombre o cédula"
        className="h-12 bg-gris-oscuro-acro pl-11"
      />

      {/* Menú Desplegable con los resultados: Solo se muestra si está abierto y hay texto escrito */}
      {open && term.trim() && (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-negro-fondo-acro py-1 shadow-lg">
          {/* Mostramos "Buscando..." si la petición está en curso y aún no hay resultados viejos */}
          {isFetching && results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-acro-muted">Buscando…</li>
          ) : results.length === 0 ? (
            /* Mensaje de vacío si no se encontró nadie */
            <li className="px-3 py-2 text-sm text-acro-muted">
              Sin resultados.
            </li>
          ) : (
            /* Lista de resultados (miembros) */
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
                  {/* Nombre y cédula (en pequeño) */}
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
