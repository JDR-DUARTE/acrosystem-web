"use client";
//Tasas de cambio
import { useState } from "react";
import { toast } from "sonner"; // Para mostrar notificaciones (toasts)
import { DollarSign, Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Hook que maneja la mutación (guardado) de las tasas de cambio mediante React Query
import { useGuardarTasas } from "@/hooks/use-tasas";

// Definimos la configuración de los campos que vamos a mostrar
const CAMPOS = [
  { key: "BCV", label: "Bolívares (BCV)", suffix: "Bs/USD" },
  { key: "COP", label: "Pesos (COP)", suffix: "COP/USD" },
  { key: "BINANCE", label: "Binance", suffix: "Bs/USD" },
];

// Utilidad para asegurar que el valor inicial sea un string manejable por el <input>
function toInput(v) {
  return v === null || v === undefined ? "" : String(v);
}

// Componente TasasPanel
export default function TasasPanel({ initial }) {
  const guardar = useGuardarTasas();

  // Estado local para los valores de los 3 campos, inicializados con los datos actuales
  const [values, setValues] = useState({
    BCV: toInput(initial?.BCV),
    COP: toInput(initial?.COP),
    BINANCE: toInput(initial?.BINANCE),
  });

  // Manejador del envío del formulario
  async function handleSubmit(event) {
    event.preventDefault(); //para que la página no se recargue por defecto
    try {
      // Intentamos guardar los datos usando el hook
      await guardar.mutateAsync(values);
      toast.success("Tasas del día guardadas."); // Notificación de éxito
    } catch (error) {
      toast.error(error.message); // Notificación de error
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-2xl bg-gris-oscuro-acro p-4"
    >
      {/* Título del panel con un ícono */}
      <div className="mb-3 flex items-center gap-2">
        <DollarSign className="size-5 text-amarillo-acro" />
        <h2 className="text-lg font-semibold text-blanco-acro">
          Tasa de cambio del día
        </h2>
      </div>

      {/* Contenedor de los inputs de tasas y el botón */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        {/* Recorremos el arreglo de configuración para generar los inputs dinámicamente */}
        {CAMPOS.map((c) => (
          <div key={c.key} className="flex flex-1 flex-col gap-1.5">
            <Label
              htmlFor={`tasa-${c.key}`}
              className="text-sm text-acro-muted"
            >
              {c.label}
            </Label>
            <Input
              id={`tasa-${c.key}`}
              type="number" // Restringe el teclado en móviles a números
              inputMode="decimal"
              step="0.0001" // Permite decimales finos para tasas de cambio
              min="0"
              value={values[c.key]}
              // Actualizamos el estado solo de la llave (key) que se esté editando
              onChange={(e) =>
                setValues((v) => ({ ...v, [c.key]: e.target.value }))
              }
              placeholder={c.suffix}
              className="h-11 bg-negro-fondo-acro"
            />
          </div>
        ))}

        {/* Botón de guardado */}
        <button
          type="submit"
          disabled={guardar.isPending} // Se desactiva si está en medio de una petición
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-amarillo-acro px-5 font-semibold text-negro-fondo-acro transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {/* Si está guardando muestra un spinner, sino el icono de disco */}
          {guardar.isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Save className="size-5" />
          )}
          Guardar
        </button>
      </div>
    </form>
  );
}
