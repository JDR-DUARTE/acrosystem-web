"use client";

import { useState } from "react";
import {
  Search,
  Calendar,
  ChevronDown,
  Loader2,
  AlertCircle,
  X,
  User,
  Clock,
  Ticket,
} from "lucide-react";

import { useHistorico } from "@/hooks/use-historico";

const PLAN_OPTIONS = [
  "Básico",
  "Acrofobia",
  "Atleta",
  "Estudiante",
  "Pases",
  "Plan Pareja",
];

// Componente HistoricoView
// Muestra una tabla con el registro histórico de los check-ins (asistencias) al gimnasio.
export default function HistoricoView() {
  // Estados para los filtros de búsqueda
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("ALL");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Estado para el modal de detalles
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Consulta los datos a la API usando React Query
  // Cada vez que cambian los filtros, React Query hace una nueva petición en automático
  const {
    data: historico,
    isLoading,
    isError,
    error,
  } = useHistorico({
    search: search.trim() || undefined,
    plan: plan === "ALL" ? undefined : plan,
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
  });

  return (
    <section className="pb-24">
      <h1 className="mb-6 text-2xl font-bold text-blanco-acro md:text-3xl lg:text-4xl">
        Histórico de Check-ins
      </h1>

      {/* Contenedor de Filtros (Buscador, Dropdown de Plan, Fechas) */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Barra de Búsqueda */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-acro-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="h-12 w-full rounded-xl bg-gris-claro-acro pl-11 pr-4 text-base text-blanco-acro border-none focus:outline-none focus:ring-1 focus:ring-amarillo-acro"
          />
        </div>

        {/* Filtro por Plan */}
        <div className="relative w-full">
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="h-12 w-full appearance-none rounded-xl bg-gris-claro-acro pl-4 pr-10 text-base text-blanco-acro border-none focus:outline-none focus:ring-1 focus:ring-amarillo-acro cursor-pointer"
          >
            <option
              value="ALL"
              className="bg-negro-fondo-acro text-blanco-acro"
            >
              Tipo de plan
            </option>
            {PLAN_OPTIONS.map((p) => (
              <option
                key={p}
                value={p}
                className="bg-negro-fondo-acro text-blanco-acro"
              >
                {p}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-acro-muted" />
        </div>

        {/* Filtro Fecha Desde */}
        <div className="relative w-full">
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            placeholder="Desde"
            className="h-12 w-full rounded-xl bg-gris-claro-acro px-4 pr-10 text-base text-blanco-acro border-none focus:outline-none focus:ring-1 focus:ring-amarillo-acro cursor-pointer [color-scheme:dark]"
          />
          <Calendar className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-acro-muted" />
        </div>

        {/* Filtro Fecha Hasta */}
        <div className="relative w-full">
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            placeholder="Hasta"
            className="h-12 w-full rounded-xl bg-gris-claro-acro px-4 pr-10 text-base text-blanco-acro border-none focus:outline-none focus:ring-1 focus:ring-amarillo-acro cursor-pointer [color-scheme:dark]"
          />
          <Calendar className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-acro-muted" />
        </div>
      </div>

      {/* Contenido Dinámico de la Tabla */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-gris-oscuro-acro border border-gris-claro-acro/20">
          <Loader2 className="size-8 animate-spin text-amarillo-acro" />
        </div>
      ) : isError ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl bg-gris-oscuro-acro p-6 text-center text-acro-danger border border-gris-claro-acro/20">
          <AlertCircle className="size-8" />
          <p>
            {error?.message || "Error al cargar el historial de check-ins."}
          </p>
        </div>
      ) : !historico || historico.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-2xl bg-gris-oscuro-acro p-6 text-center text-acro-muted border border-gris-claro-acro/20">
          <p className="text-lg font-medium text-blanco-acro">
            No se encontraron registros de acceso
          </p>
          <p className="text-sm">
            Prueba ajustando la búsqueda o el rango de fechas.
          </p>
        </div>
      ) : (
        /* Estructura de Tabla usando Flex/Grid */
        <div className="overflow-hidden rounded-2xl bg-gris-oscuro-acro border border-gris-claro-acro/30 shadow-xl">
          {/* Cabecera (Encabezados de columnas) */}
          <div className="grid grid-cols-12 bg-gris-oscuro-acro/90 px-4 py-3.5 text-base font-semibold text-blanco-acro sm:px-6">
            <div className="col-span-4">Nombre</div>
            <div className="col-span-3">Plan</div>
            <div className="col-span-3 text-center">Fecha</div>
            <div className="col-span-2 text-right">Hora</div>
          </div>

          {/* Filas (Scrolleables si hay muchas) */}
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
            {historico.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedRecord(item)} // Abre el modal de detalle al hacer clic
                className="grid grid-cols-12 items-center px-4 py-4 text-base transition-colors hover:bg-gris-claro-acro/10 cursor-pointer sm:px-6"
              >
                <div className="col-span-4 pr-2 font-semibold text-blanco-acro truncate">
                  {item.nombre}
                </div>
                <div className="col-span-3 pr-2 text-acro-muted text-sm truncate">
                  {item.plan || "-"}
                </div>
                <div className="col-span-3 text-center text-acro-muted font-mono text-sm">
                  {item.fecha}
                </div>
                <div className="col-span-2 text-right font-mono font-semibold text-blanco-acro text-sm">
                  {item.hora}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Detalle completo de un Registro */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-gris-oscuro-acro p-6 shadow-2xl border border-gris-claro-acro/30 animate-in fade-in zoom-in-95 duration-200">
            {/* Cabecera del Modal */}
            <div className="flex items-start justify-between border-b border-gris-claro-acro/30 pb-4">
              <div>
                <h3 className="text-xl font-bold text-blanco-acro flex items-center gap-2">
                  <User className="size-5 text-amarillo-acro" />
                  Registro de Acceso
                </h3>
                <p className="mt-0.5 text-xs text-acro-muted font-mono">
                  ID: {selectedRecord.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg p-1 text-acro-muted hover:bg-white/10 hover:text-blanco-acro"
              >
                <X className="size-6" />
              </button>
            </div>

            {/* Cuerpo del Modal con tarjetas informativas */}
            <div className="mt-4 flex flex-col gap-3.5 text-sm">
              <div className="rounded-xl bg-negro-fondo-acro p-3.5">
                <span className="text-xs text-acro-muted uppercase font-medium tracking-wider">
                  Miembro
                </span>
                <p className="mt-1 text-lg font-bold text-blanco-acro">
                  {selectedRecord.nombre}
                </p>
                {selectedRecord.cedula && (
                  <p className="text-xs text-acro-muted">
                    C.I: {selectedRecord.cedula}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-negro-fondo-acro p-3.5">
                  <span className="flex items-center gap-1.5 text-xs text-acro-muted font-medium">
                    <Calendar className="size-3.5 text-amarillo-acro" /> Fecha
                  </span>
                  <p className="mt-1 font-bold font-mono text-blanco-acro">
                    {selectedRecord.fecha}
                  </p>
                </div>
                <div className="rounded-xl bg-negro-fondo-acro p-3.5">
                  <span className="flex items-center gap-1.5 text-xs text-acro-muted font-medium">
                    <Clock className="size-3.5 text-amarillo-acro" /> Hora
                  </span>
                  <p className="mt-1 font-bold font-mono text-blanco-acro">
                    {selectedRecord.hora}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-negro-fondo-acro p-3.5">
                <span className="flex items-center gap-1.5 text-xs text-acro-muted font-medium">
                  <Ticket className="size-3.5 text-amarillo-acro" /> Plan
                </span>
                <p className="mt-1 font-bold text-blanco-acro">
                  {selectedRecord.plan}
                </p>
              </div>

              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
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
