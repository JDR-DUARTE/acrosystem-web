"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  AlertCircle,
  CalendarX,
  CalendarClock,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { buildWhatsappUrl } from "@/lib/whatsapp";

// Hook que consulta la información de los vencimientos
import { useVencimientos } from "@/hooks/use-vencimientos";

// Icono personalizado de WhatsApp usando un SVG para no importar librerías pesadas de íconos extras
function WhatsappIcon(props) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982L2 22l5.133-1.343c1.455.793 3.097 1.211 4.872 1.212h.005c5.505 0 9.987-4.478 9.988-9.985 0-2.667-1.038-5.175-2.926-7.062A9.923 9.923 0 0012.012 2zm0 18.232h-.004c-1.49 0-2.952-.401-4.227-1.157l-.303-.18-3.143.823.838-3.064-.198-.314A8.257 8.257 0 013.75 11.98c0-4.555 3.708-8.262 8.266-8.262 2.207 0 4.281.86 5.84 2.422a8.216 8.216 0 012.418 5.844c-.001 4.557-3.709 8.265-8.262 8.265zm4.532-6.191c-.248-.124-1.468-.724-1.696-.807-.227-.083-.393-.124-.559.124-.165.248-.641.807-.786.973-.145.165-.29.186-.538.062-.248-.124-1.048-.386-1.996-1.231-.738-.658-1.237-1.47-1.382-1.718-.145-.248-.015-.382.109-.505.111-.111.248-.29.372-.434.124-.145.165-.248.248-.414.083-.165.041-.31-.021-.434-.062-.124-.559-1.348-.765-1.844-.201-.485-.406-.419-.559-.427l-.476-.008c-.165 0-.434.062-.661.31-.227.248-.868.848-.868 2.068 0 1.22.889 2.398 1.013 2.563.124.165 1.75 2.672 4.239 3.747.592.256 1.055.409 1.416.524.595.189 1.136.162 1.564.098.478-.071 1.468-.6 1.674-1.179.207-.579.207-1.075.145-1.179-.062-.104-.227-.186-.475-.31z" />
    </svg>
  );
}

// Opciones de pestañas (Tabs)
const TABS = [
  { id: "proximos", label: "Próximos" },
  { id: "expirados", label: "Expirados" },
];

// Función utilitaria para formatear una fecha YYYY-MM-DD a DD/MM/YYYY
function formatDate(value) {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  return `${d}/${m}/${y}`;
}

// Componente VencimientosView
// Muestra una lista de miembros cuyos planes están por vencerse o ya se vencieron.
// Permite contactarlos rápidamente vía WhatsApp.
export default function VencimientosView() {
  const router = useRouter();
  
  // Estado para saber qué pestaña está activa (Próximos o Expirados)
  const [tab, setTab] = useState("proximos");
  // Estado para la barra de búsqueda
  const [search, setSearch] = useState("");

  // Petición al servidor (React Query) basada en la pestaña actual y la búsqueda
  const { data, isLoading, isError, error } = useVencimientos({
    tipo: tab,
    search: search.trim() || undefined,
  });

  // Constantes derivadas para cambiar textos e iconos según la pestaña
  const esExpirados = tab === "expirados";
  const HeaderIcon = esExpirados ? CalendarX : CalendarClock;
  const headerLabel = esExpirados
    ? "Clientes con planes vencidos"
    : "Clientes próximos a vencer";
  const fechaLabel = esExpirados ? "Venció" : "Vence";

  // Función constructora del mensaje predeterminado de WhatsApp
  function buildMensaje(v) {
    const fecha = formatDate(v.fechaExpiracion);
    if (esExpirados) {
      return `Hola ${v.nombre}, esperamos te encuentres muy bien. Te escribimos de Acrofobia para recordarte que tu plan se venció el: ${fecha}. ¡Te esperamos para renovar y seguir escalando juntos!`;
    }
    return `Hola ${v.nombre}, esperamos te encuentres muy bien. Te escribimos de Acrofobia para recordarte que tu plan está próximo a vencer el ${fecha}. ¡Aprovecha para renovar y seguir escalando al máximo!`;
  }

  // Notificación de error en caso de que el cliente no tenga teléfono
  function sinTelefono(e, nombre) {
    e.stopPropagation(); // Evita que al hacer clic en el botón también se haga clic en la tarjeta
    toast.error(`${nombre} no tiene un teléfono registrado.`);
  }

  return (
    <section className="pb-24">
      {/* Título de la página */}
      <h1 className="mb-6 text-2xl font-bold text-blanco-acro md:text-3xl lg:text-4xl">
        Vista de Vencimientos
      </h1>

      {/* Contenedores de Búsqueda y Pestañas */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        
        {/* Barra de Búsqueda */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-acro-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o cédula"
            className="h-12 bg-gris-oscuro-acro pl-11"
          />
        </div>
        
        {/* Pestañas (Tabs): Botones para cambiar entre Próximos y Expirados */}
        <div className="grid w-full max-w-xs grid-cols-2 gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              // className dinámico: amarillo si está activo, gris oscuro si no
              className={cn(
                "rounded-xl py-2.5 text-base font-medium transition-colors",
                tab === t.id
                  ? "bg-amarillo-acro text-negro-fondo-acro"
                  : "bg-gris-oscuro-acro text-blanco-acro hover:bg-gris-claro-acro/10",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjeta Principal donde se lista la información */}
      <div className="rounded-2xl bg-gris-oscuro-acro p-4">
        {/* Encabezado de la lista */}
        <div className="mb-3 flex items-center gap-3">
          <HeaderIcon className="size-6 text-amarillo-acro" />
          <h2 className="text-lg font-semibold text-blanco-acro">
            {headerLabel}
          </h2>
        </div>

        {/* Manejo de estados de carga, error, vacío o éxito */}
        {isLoading ? (
          // Estado: Cargando (Skeletons)
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          // Estado: Error en la petición
          <div className="flex items-center gap-2 py-6 text-sm text-acro-danger">
            <AlertCircle className="size-5" />
            {error?.message ?? "No se pudieron cargar los vencimientos."}
          </div>
        ) : !data || data.length === 0 ? (
          // Estado: Array vacío (Todo está al día)
          <p className="py-8 text-center text-sm text-acro-muted">
            {esExpirados
              ? "No hay planes vencidos."
              : "No hay planes próximos a vencer."}
          </p>
        ) : (
          // Estado: Mostrar Lista
          <ul className="flex flex-col gap-3">
            {data.map((v) => (
              <li key={v.id}>
                {/* Elemento de Lista Clickable: 
                    Si le das clic a la tarjeta (no al botón de whatsapp)
                    te envía al perfil del miembro. */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/miembros/${v.miembroId}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") router.push(`/miembros/${v.miembroId}`);
                  }}
                  className="flex items-center justify-between gap-3 rounded-xl bg-negro-fondo-acro px-4 py-3 transition-colors hover:bg-gris-claro-acro/10"
                >
                  
                  {/* Datos del miembro */}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-blanco-acro">
                      {v.nombre}
                    </p>
                    <p className="text-sm text-acro-muted">
                      {fechaLabel}: {formatDate(v.fechaExpiracion)}
                    </p>
                  </div>
                  
                  {/* Botón de Whatsapp Dinámico */}
                  {buildWhatsappUrl(v.telefono, buildMensaje(v)) ? (
                    // Si TIENE teléfono y la URL es válida, mostramos un link (a) real
                    <a
                      href={buildWhatsappUrl(v.telefono, buildMensaje(v))}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()} // Evita que se abra el perfil al clicar el link
                      className="flex shrink-0 items-center gap-2 rounded-lg border border-[#25D366] px-3 py-2 text-sm font-medium text-[#25D366] transition-colors hover:bg-[#25D366]/10"
                    >
                      <WhatsappIcon className="size-4 text-[#25D366]" />
                      Aviso
                    </a>
                  ) : (
                    // Si NO TIENE teléfono, mostramos un botón falso que da error
                    <button
                      type="button"
                      onClick={(e) => sinTelefono(e, v.nombre)}
                      className="flex shrink-0 items-center gap-2 rounded-lg border border-[#25D366] px-3 py-2 text-sm font-medium text-[#25D366] transition-colors hover:bg-[#25D366]/10"
                    >
                      <WhatsappIcon className="size-4 text-[#25D366]" />
                      Aviso
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
