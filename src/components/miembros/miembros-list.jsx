"use client";
// Componente de Cliente
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Importamos nuestro hook personalizado que se encarga de obtener los datos del servidor (usando React Query)
import { useMiembros } from "@/hooks/use-miembros";

const ALL = "todos";

// Componente MiembrosList
// Muestra una tabla/lista con todos los miembros y permite filtrarlos.
export default function MiembrosList({ planes = [] }) {
  // router nos permite navegar a otras páginas programáticamente
  const router = useRouter();

  // Estados locales para controlar los filtros de búsqueda
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState(ALL);
  const [estado, setEstado] = useState(ALL);

  // Llamamos a nuestro hook pasando los filtros actuales.
  // Cuando cambien los estados, el hook volverá a hacer la petición (si es necesario).
  const {
    data: miembros,
    isLoading,
    isError,
    error,
  } = useMiembros({
    search: search.trim() || undefined,
    plan: plan === ALL ? undefined : plan,
    estado: estado === ALL ? undefined : estado,
  });

  return (
    <section className="pb-24">
      {/* Título principal de la página */}
      <h1 className="mb-6 text-2xl font-bold text-blanco-acro md:text-3xl lg:text-4xl">
        Miembros
      </h1>

      {/* Controles de Filtro: Barra de búsqueda y Selects */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* Contenedor relativo para posicionar el ícono de búsqueda de forma absoluta dentro del input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-acro-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o cédula"
            className="h-12 bg-gris-oscuro-acro pl-11"
          />
        </div>

        {/* Filtro por Plan usando componentes de Shadcn UI */}
        <Select value={plan} onValueChange={setPlan}>
          <SelectTrigger className="h-12 w-full bg-gris-oscuro-acro md:w-48">
            <SelectValue placeholder="Tipo de plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los planes</SelectItem>
            {planes.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por Estado */}
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="h-12 w-full bg-gris-oscuro-acro md:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los estados</SelectItem>
            <SelectItem value="Activo">Activo</SelectItem>
            <SelectItem value="Inactivo">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista/Tabla de miembros */}
      <div className="mt-5 overflow-x-auto rounded-2xl bg-gris-oscuro-acro">
        <div className="min-w-[600px]">
          {/* Cabecera de la tabla. Usamos grid de CSS para alinear las columnas */}
          <div className="grid grid-cols-[1.5fr_1fr_1fr_auto] gap-4 border-b border-border px-5 py-4 text-sm font-medium text-acro-muted">
            <span>Nombre</span>
            <span>Cédula</span>
            <span>Plan</span>
            <span>Estado</span>
          </div>

          {/* Manejo de estados de la UI: Cargando, Error, Vacío, o Mostrar Lista */}
          {isLoading ? (
            // Estado: Cargando (mostramos skeletons que son cajas que parpadean)
            <div className="flex flex-col gap-3 p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            // Estado: Error en la carga
            <div className="flex items-center gap-2 p-6 text-sm text-acro-danger">
              <AlertCircle className="size-5" />
              {error?.message ?? "No se pudieron cargar los miembros."}
            </div>
          ) : !miembros || miembros.length === 0 ? (
            // Estado: Lista vacía
            <p className="p-8 text-center text-sm text-acro-muted">
              No hay miembros que coincidan con la búsqueda.
            </p>
          ) : (
            // Estado: Datos recibidos correctamente
            <ul>
              {miembros.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    // Al hacer clic, navegamos a la página de detalles del miembro
                    onClick={() => router.push(`/miembros/${m.id}`)}
                    className="grid w-full grid-cols-[1.5fr_1fr_1fr_auto] items-center gap-4 border-b border-border px-5 py-4 text-left transition-colors last:border-0 hover:bg-gris-claro-acro/10"
                  >
                    <span className="truncate font-medium text-blanco-acro">
                      {m.nombre}
                    </span>
                    <span className="truncate text-acro-muted">
                      {m.cedula || "—"}
                    </span>
                    <span className="truncate text-acro-muted">
                      {m.planActual?.nombre ?? "—"}
                    </span>
                    {/* El componente Badge (Etiqueta) cambia de color según si está activo o no */}
                    <Badge
                      className={
                        m.estado === "Activo"
                          ? "bg-amarillo-acro text-negro-fondo-acro"
                          : "bg-muted text-acro-muted"
                      }
                    >
                      {m.estado}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Botón flotante de acción principal (FAB) para crear un nuevo miembro */}
      <Link
        href="/miembros/nuevo"
        aria-label="Registrar miembro"
        className="fixed bottom-6 right-6 z-20 flex size-16 items-center justify-center rounded-2xl bg-amarillo-acro text-negro-fondo-acro shadow-lg transition-transform hover:scale-105"
      >
        <Plus className="size-8" />
      </Link>
    </section>
  );
}
