"use client";

import { useState } from "react";
import { Search, Loader2, Paintbrush, AlertCircle } from "lucide-react";
import { useConsultaPlan } from "@/hooks/use-checkin";

export default function ConsultaPlanView() {
  const [cedula, setCedula] = useState("");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const consultaPlan = useConsultaPlan();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const query = cedula.trim();
    if (!query) return;

    setErrorMsg(null);
    try {
      const res = await consultaPlan.mutateAsync(query);
      if (!res.encontrado) {
        setErrorMsg(res.mensaje || "Miembro no encontrado.");
        setResult(null);
      } else {
        setResult(res);
      }
    } catch (err) {
      setErrorMsg(err.message || "Error al consultar el plan.");
      setResult(null);
    }
  };

  const handleClear = () => {
    setCedula("");
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <section className="relative min-h-[calc(100vh-100px)] pb-28">
      {/* Título de la vista */}
      <h1 className="mb-8 text-2xl font-bold text-blanco-acro sm:text-3xl lg:text-4xl">
        Consulta tu Plan
      </h1>

      {/* Contenedor central */}
      <div className="mx-auto flex w-full max-w-sm sm:max-w-md flex-col items-center pt-4 sm:pt-8">
        <form onSubmit={handleSearch} className="flex w-full flex-col gap-3">
          {/* Campo de búsqueda con borde amarillo */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-acro-muted" />
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              placeholder="Ingresa tu cédula"
              className="h-12 w-full rounded-xl bg-negro-fondo-acro pl-11 pr-4 text-base text-blanco-acro border border-amarillo-acro focus:border-amarillo-acro focus:outline-none focus:ring-1 focus:ring-amarillo-acro transition-colors placeholder:text-acro-muted"
            />
          </div>

          {/* Botón Buscar */}
          <button
            type="submit"
            disabled={consultaPlan.isPending || !cedula.trim()}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amarillo-acro text-base font-bold text-negro-fondo-acro shadow-lg transition-transform hover:brightness-105 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {consultaPlan.isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <Search className="size-5 sm:hidden" />
                <span>Buscar</span>
              </>
            )}
          </button>
        </form>

        {/* Mensaje de error si no se encuentra */}
        {errorMsg && (
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-gris-oscuro-acro p-4 text-sm text-acro-danger border border-acro-danger/30 w-full">
            <AlertCircle className="size-5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Tarjeta de Resultado del Plan */}
        {result && (
          <div className="mt-6 w-full rounded-2xl bg-gris-oscuro-acro border border-border/10 p-6 sm:p-8 text-center shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-blanco-acro">
              {result.nombre}
            </h2>

            <p
              className={`mt-1 text-base sm:text-lg font-semibold ${
                result.esActivo ? "text-emerald-500" : "text-acro-danger"
              }`}
            >
              {result.estado}
            </p>

            <p className="mt-2 text-lg sm:text-xl font-medium text-blanco-acro">
              {result.plan}
            </p>

            {/* Si es plan de pases / 10 días, muestra los días restantes */}
            {result.usaPases && result.pasesRestantes !== null && result.pasesRestantes !== undefined && (
              <p className="mt-2 text-base font-semibold text-amarillo-acro">
                Días restantes: {result.pasesRestantes}
              </p>
            )}

            <div className="mt-4">
              <span className="inline-block rounded-full bg-amarillo-acro px-6 py-2.5 text-sm sm:text-base font-bold text-negro-fondo-acro shadow-md">
                {result.pillText}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Botón Flotante Limpiar (FAB) con icono de brocha/limpieza */}
      <button
        type="button"
        onClick={handleClear}
        aria-label="Limpiar consulta"
        className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-2xl bg-amarillo-acro text-negro-fondo-acro shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer sm:bottom-8 sm:right-8 sm:size-16"
      >
        <Paintbrush className="size-8 stroke-[2.2]" />
      </button>
    </section>
  );
}
