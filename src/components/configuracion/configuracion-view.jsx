"use client";

// Importación de hooks de React y llamadas a la API de configuración y miembros
import { useState } from "react";
import {
  useConfiguracion,
  useAddConfiguracion,
  useDeleteConfiguracion,
} from "@/hooks/use-configuracion";
import { useMiembros } from "@/hooks/use-miembros";
import { Loader2, AlertCircle, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Componente principal para la vista de Configuración del sistema Acrosystem.
 * Permite gestionar Planes, Promociones/Eventos y Personal administrativo/staff.
 */
export default function ConfiguracionView() {
  // Carga de datos generales de configuración y mutación para agregar registros
  const { data, isLoading, isError, error } = useConfiguracion();
  const { mutateAsync: addConfig, isPending: isAdding } = useAddConfiguracion();
  const { mutateAsync: deleteConfig } = useDeleteConfiguracion();

  // Estado del formulario para la creación de Planes
  const [planNombre, setPlanNombre] = useState("");
  const [planPases, setPlanPases] = useState("");
  const [planDuracion, setPlanDuracion] = useState("");
  const [planEquipo, setPlanEquipo] = useState("No");
  const [planCupo, setPlanCupo] = useState("");
  const [planAgenda, setPlanAgenda] = useState("No");
  const [planPrecio, setPlanPrecio] = useState("");

  // Estado del formulario para la creación de Promociones / Eventos
  const [promoNombre, setPromoNombre] = useState("");
  const [promoTipo, setPromoTipo] = useState("");
  const [promoDesde, setPromoDesde] = useState("");
  const [promoHasta, setPromoHasta] = useState("");
  const [promoValor, setPromoValor] = useState("");

  // Estado del formulario para la asignación de Personal
  const [personalSelectedId, setPersonalSelectedId] = useState("");
  const [personalRolId, setPersonalRolId] = useState("");

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const requirePassword = (actionFn) => {
    setPendingAction(() => actionFn);
    setPassword("");
    setPasswordError("");
    setShowPasswordModal(true);
  };

  // Consulta de miembros registrados para filtrar a aquellos con categoría 'empleado'
  const { data: miembros = [], isLoading: isLoadingMiembros } = useMiembros();
  const empleadosCandidatos = miembros.filter(
    (m) => m.categoria?.nombre?.toLowerCase() === "empleado",
  );

  // Pantalla de carga mientras se obtienen los datos
  if (isLoading || isLoadingMiembros) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-amarillo-acro" />
      </div>
    );
  }

  // Pantalla de error si falla la comunicación con la API
  if (isError) {
    return (
      <div className="flex h-[calc(100vh-100px)] flex-col items-center justify-center gap-4 text-center text-acro-danger">
        <AlertCircle className="size-12" />
        <p className="text-lg">
          {error?.message || "Error al cargar configuración."}
        </p>
      </div>
    );
  }

  // Extracción de datos del servidor
  const { planes = [], promos = [], personal = [], roles = [] } = data || {};

  /**
   * Manejador para agregar un nuevo Plan al sistema
   */
  const handleAddPlan = async () => {
    if (!planNombre || !planPrecio) return;
    try {
      await addConfig({
        type: "PLAN",
        data: {
          nombre: planNombre,
          pases_totales: planPases ? parseInt(planPases) : null,
          duracion_dias: planDuracion ? parseInt(planDuracion) : null,
          incluye_equipo: planEquipo === "Si",
          cupo_maximo:
            planCupo && planCupo.toLowerCase() !== "no"
              ? parseInt(planCupo)
              : null,
          requiere_agenda: planAgenda === "Si",
          precio_usd: parseFloat(planPrecio),
        },
      });
      // Limpiar formulario tras guardar exitosamente
      setPlanNombre("");
      setPlanPases("");
      setPlanDuracion("");
      setPlanEquipo("No");
      setPlanCupo("");
      setPlanAgenda("No");
      setPlanPrecio("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddPromo = async () => {
    if (!promoNombre || !promoValor) return;
    try {
      await addConfig({
        type: "PROMO",
        data: {
          nombre: promoNombre,
          tipo: promoTipo,
          fecha_inicio: promoDesde || null,
          fecha_fin: promoHasta || null,
          valor_descuento: parseFloat(promoValor),
        },
      });
      setPromoNombre("");
      setPromoTipo("");
      setPromoDesde("");
      setPromoHasta("");
      setPromoValor("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddPersonal = async () => {
    if (!personalSelectedId || !personalRolId) return;
    try {
      await addConfig({
        type: "PERSONAL",
        data: {
          id_persona: personalSelectedId,
          id_rol: parseInt(personalRolId),
        },
      });
      setPersonalSelectedId("");
      setPersonalRolId("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAction = async (type, id) => {
    try {
      await deleteConfig({ type, id });
      toast.success("Elemento eliminado exitosamente.");
    } catch (e) {
      toast.error(e.message || "Error al eliminar el elemento.");
    }
  };

  // Date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <section className="relative min-h-[calc(100vh-100px)] pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blanco-acro md:text-4xl">
          Configuración
        </h1>
      </div>

      <div className="flex flex-col gap-10">
        {/* Planes */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-blanco-acro">
            Planes
          </h2>
          <div className="overflow-x-auto rounded-2xl bg-negro-fondo-acro border border-gris-claro-acro/20 shadow-xl">
            <div className="min-w-[800px]">
              {/* Table Header */}
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_40px] gap-2 px-4 py-3 text-xs font-semibold text-acro-muted">
                <div className="col-span-1">Nombre</div>
                <div className="col-span-1 text-center">Pases</div>
                <div className="col-span-1 text-center">Duración</div>
                <div className="col-span-1 text-center">Equipo</div>
                <div className="col-span-1 text-center">Cupo máximo</div>
                <div className="col-span-1 text-center">Agenda</div>
                <div className="col-span-1 text-right pr-4">Precio</div>
                <div className="col-span-1"></div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-white/5 border-b border-gris-claro-acro/20">
                {planes.map((p) => (
                  <div
                    key={p.id_plan}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_40px] gap-2 items-center px-4 py-3.5 text-sm transition-colors hover:bg-gris-claro-acro/10 group"
                  >
                    <div className="col-span-1 font-medium text-blanco-acro truncate">
                      {p.nombre}
                    </div>
                    <div className="col-span-1 text-center text-acro-muted">
                      {p.pases_totales || "-"}
                    </div>
                    <div className="col-span-1 text-center text-acro-muted">
                      {p.duracion_dias || "-"}
                    </div>
                    <div className="col-span-1 text-center text-acro-muted">
                      {p.incluye_equipo ? "Si" : "No"}
                    </div>
                    <div className="col-span-1 text-center text-acro-muted">
                      {p.cupo_maximo || "No"}
                    </div>
                    <div className="col-span-1 text-center text-acro-muted">
                      {p.requiere_agenda ? "Si" : "No"}
                    </div>
                    <div className="col-span-1 text-right font-medium text-blanco-acro pr-4">
                      {p.precio_usd}
                    </div>
                    <div className="col-span-1 flex justify-end pr-2">
                      <button
                        onClick={() =>
                          requirePassword(() =>
                            handleDeleteAction("PLAN", p.id_plan),
                          )
                        }
                        className="text-acro-muted hover:text-red-500 opacity-80 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Agregar Plan */}
              <div className="p-4 bg-negro-fondo-acro/80">
                <p className="mb-2 text-xs font-medium text-blanco-acro">
                  Agregar:
                </p>
                <div className="grid grid-cols-7 gap-2 text-sm text-acro-muted items-center mb-1">
                  <div className="col-span-1">Nombre</div>
                  <div className="col-span-1 text-center">Pases</div>
                  <div className="col-span-1 text-center">Duración</div>
                  <div className="col-span-1 text-center">Equipo</div>
                  <div className="col-span-1 text-center">Cupo máximo</div>
                  <div className="col-span-1 text-center">Agenda</div>
                  <div className="col-span-1 text-right pr-4">Precio</div>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 items-center relative pb-12">
                  <div className="col-span-1">
                    <input
                      type="text"
                      value={planNombre}
                      onChange={(e) => setPlanNombre(e.target.value)}
                      placeholder="Nombre..."
                      className="w-full bg-gris-oscuro-acro text-blanco-acro rounded-lg px-3 py-2 text-sm border-none focus:ring-1 focus:ring-amarillo-acro outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="text"
                      value={planPases}
                      onChange={(e) => setPlanPases(e.target.value)}
                      placeholder="Cant. pases"
                      className="w-full bg-gris-oscuro-acro text-blanco-acro rounded-lg px-3 py-2 text-sm text-center border-none focus:ring-1 focus:ring-amarillo-acro outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="text"
                      value={planDuracion}
                      onChange={(e) => setPlanDuracion(e.target.value)}
                      placeholder="Dias"
                      className="w-full bg-gris-oscuro-acro text-blanco-acro rounded-lg px-3 py-2 text-sm text-center border-none focus:ring-1 focus:ring-amarillo-acro outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <select
                      value={planEquipo}
                      onChange={(e) => setPlanEquipo(e.target.value)}
                      className="w-full bg-gris-oscuro-acro text-blanco-acro rounded-lg px-3 py-2 text-sm text-center border-none focus:ring-1 focus:ring-amarillo-acro outline-none cursor-pointer"
                    >
                      <option value="No">No</option>
                      <option value="Si">Si</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <input
                      type="text"
                      value={planCupo}
                      onChange={(e) => setPlanCupo(e.target.value)}
                      placeholder="No/cantidad"
                      className="w-full bg-gris-oscuro-acro text-blanco-acro rounded-lg px-3 py-2 text-sm text-center border-none focus:ring-1 focus:ring-amarillo-acro outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <select
                      value={planAgenda}
                      onChange={(e) => setPlanAgenda(e.target.value)}
                      className="w-full bg-gris-oscuro-acro text-blanco-acro rounded-lg px-3 py-2 text-sm text-center border-none focus:ring-1 focus:ring-amarillo-acro outline-none cursor-pointer"
                    >
                      <option value="No">No</option>
                      <option value="Si">Si</option>
                    </select>
                  </div>
                  <div className="col-span-1 pr-4">
                    <input
                      type="text"
                      value={planPrecio}
                      onChange={(e) => setPlanPrecio(e.target.value)}
                      placeholder="USD"
                      className="w-full bg-gris-oscuro-acro text-blanco-acro rounded-lg px-3 py-2 text-sm text-right border-none focus:ring-1 focus:ring-amarillo-acro outline-none"
                    />
                  </div>

                  <button
                    onClick={() => requirePassword(handleAddPlan)}
                    disabled={isAdding}
                    className="absolute bottom-0 right-4 rounded-xl bg-amarillo-acro px-6 py-2 text-sm font-bold text-negro-fondo-acro transition-transform hover:scale-[1.02] disabled:opacity-50"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Promociones / Eventos */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-blanco-acro">
            Promociones / Eventos
          </h2>
          <div className="overflow-x-auto rounded-2xl bg-negro-fondo-acro border border-gris-claro-acro/20 shadow-xl">
            <div className="min-w-[650px]">
              {/* Table Header */}
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_40px] gap-2 px-4 py-3 text-xs font-semibold text-acro-muted">
                <div className="col-span-1">Nombre</div>
                <div className="col-span-1 text-center">Tipo</div>
                <div className="col-span-1 text-center">Desde</div>
                <div className="col-span-1 text-center">Hasta</div>
                <div className="col-span-1 text-right pr-4">
                  Valor/Descuento
                </div>
                <div className="col-span-1"></div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-white/5 border-b border-gris-claro-acro/20">
                {promos.map((pr) => (
                  <div
                    key={pr.id_evento}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_40px] gap-2 items-center px-4 py-3.5 text-sm transition-colors hover:bg-gris-claro-acro/10 group"
                  >
                    <div className="col-span-1 font-medium text-blanco-acro truncate">
                      {pr.nombre}
                    </div>
                    <div className="col-span-1 text-center text-acro-muted">
                      {pr.tipo || "-"}
                    </div>
                    <div className="col-span-1 text-center text-acro-muted">
                      {formatDate(pr.fecha_inicio)}
                    </div>
                    <div className="col-span-1 text-center text-acro-muted">
                      {formatDate(pr.fecha_fin)}
                    </div>
                    <div className="col-span-1 text-right font-medium text-blanco-acro pr-4">
                      {pr.valor_descuento}
                    </div>
                    <div className="col-span-1 flex justify-end pr-2">
                      <button
                        onClick={() =>
                          requirePassword(() =>
                            handleDeleteAction("PROMO", pr.id_evento),
                          )
                        }
                        className="text-acro-muted hover:text-red-500 opacity-80 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Agregar Promo */}
              <div className="p-4 bg-negro-fondo-acro/80">
                <p className="mb-2 text-xs font-medium text-blanco-acro">
                  Agregar:
                </p>
                <div className="grid grid-cols-5 gap-2 text-sm text-acro-muted items-center mb-1">
                  <div className="col-span-1">Nombre</div>
                  <div className="col-span-1 text-center">Tipo</div>
                  <div className="col-span-1 text-center">Desde</div>
                  <div className="col-span-1 text-center">Hasta</div>
                  <div className="col-span-1 text-right pr-4">
                    Valor/Descuento
                  </div>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 items-center relative pb-12">
                  <div className="col-span-1">
                    <input
                      type="text"
                      value={promoNombre}
                      onChange={(e) => setPromoNombre(e.target.value)}
                      placeholder="Nombre..."
                      className="w-full bg-gris-oscuro-acro text-blanco-acro rounded-lg px-3 py-2 text-sm border-none focus:ring-1 focus:ring-amarillo-acro outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="text"
                      value={promoTipo}
                      onChange={(e) => setPromoTipo(e.target.value)}
                      placeholder="Promoción/Evento"
                      className="w-full bg-gris-oscuro-acro text-blanco-acro rounded-lg px-3 py-2 text-sm text-center border-none focus:ring-1 focus:ring-amarillo-acro outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="date"
                      value={promoDesde}
                      onChange={(e) => setPromoDesde(e.target.value)}
                      className="w-full bg-gris-oscuro-acro text-blanco-acro rounded-lg px-3 py-2 text-sm text-center border-none focus:ring-1 focus:ring-amarillo-acro outline-none [color-scheme:dark]"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="date"
                      value={promoHasta}
                      onChange={(e) => setPromoHasta(e.target.value)}
                      className="w-full bg-gris-oscuro-acro text-blanco-acro rounded-lg px-3 py-2 text-sm text-center border-none focus:ring-1 focus:ring-amarillo-acro outline-none [color-scheme:dark]"
                    />
                  </div>
                  <div className="col-span-1 pr-4">
                    <input
                      type="text"
                      value={promoValor}
                      onChange={(e) => setPromoValor(e.target.value)}
                      placeholder="USD..."
                      className="w-full bg-gris-oscuro-acro text-blanco-acro rounded-lg px-3 py-2 text-sm text-right border-none focus:ring-1 focus:ring-amarillo-acro outline-none"
                    />
                  </div>

                  <button
                    onClick={() => requirePassword(handleAddPromo)}
                    disabled={isAdding}
                    className="absolute bottom-0 right-4 rounded-xl bg-amarillo-acro px-6 py-2 text-sm font-bold text-negro-fondo-acro transition-transform hover:scale-[1.02] disabled:opacity-50"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-blanco-acro">
            Personal
          </h2>
          <div className="overflow-x-auto rounded-2xl bg-negro-fondo-acro border border-gris-claro-acro/20 shadow-xl">
            <div className="min-w-[500px]">
              {/* Table Header */}
              <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_40px] gap-2 px-4 py-3 text-xs font-semibold text-acro-muted">
                <div className="col-span-1">Nombre</div>
                <div className="col-span-1 text-center">Teléfono</div>
                <div className="col-span-1 text-right pr-4">Rol</div>
                <div className="col-span-1"></div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-white/5 border-b border-gris-claro-acro/20">
                {personal.map((emp) => {
                  const memberInfo = miembros.find(
                    (m) => m.id === emp.id_persona,
                  );
                  const telefono =
                    memberInfo?.telefono || emp.personas?.telefono || "-";
                  return (
                    <div
                      key={emp.id_persona}
                      className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_40px] gap-2 items-center px-4 py-3.5 text-sm transition-colors hover:bg-gris-claro-acro/10 group"
                    >
                      <div className="col-span-1 font-medium text-blanco-acro truncate">
                        {emp.personas?.nombre_completo || "Desconocido"}
                      </div>
                      <div className="col-span-1 text-center text-acro-muted truncate">
                        {telefono}
                      </div>
                      <div className="col-span-1 text-right text-acro-muted pr-4 truncate">
                        {emp.roles?.nombre || "Sin Rol"}
                      </div>
                      <div className="col-span-1 flex justify-end pr-2">
                        <button
                          onClick={() =>
                            requirePassword(() =>
                              handleDeleteAction("PERSONAL", emp.id_persona),
                            )
                          }
                          className="text-acro-muted hover:text-red-500 opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Agregar Personal */}
              <div className="p-4 bg-negro-fondo-acro/80">
                <p className="mb-2 text-xs font-medium text-blanco-acro">
                  Agregar:
                </p>
                <div className="grid grid-cols-3 gap-2 text-sm text-acro-muted items-center mb-1">
                  <div className="col-span-1">Empleado (miembro)</div>
                  <div className="col-span-1 text-center">Teléfono</div>
                  <div className="col-span-1 text-right pr-4">Rol</div>
                </div>
                <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 items-center relative pb-12">
                  <div className="col-span-1">
                    <select
                      value={personalSelectedId}
                      onChange={(e) => setPersonalSelectedId(e.target.value)}
                      className="w-full bg-gris-oscuro-acro text-blanco-acro rounded-lg px-3 py-2 text-sm border-none focus:ring-1 focus:ring-amarillo-acro outline-none cursor-pointer"
                    >
                      <option value="">Seleccionar empleado...</option>
                      {empleadosCandidatos.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1 text-center">
                    <input
                      type="text"
                      value={
                        empleadosCandidatos.find(
                          (e) => String(e.id) === String(personalSelectedId),
                        )?.telefono || ""
                      }
                      disabled
                      placeholder="Auto-completado"
                      className="w-full bg-gris-oscuro-acro text-acro-muted rounded-lg px-3 py-2 text-sm text-center border-none outline-none opacity-70"
                    />
                  </div>
                  <div className="col-span-1 pr-4">
                    <select
                      value={personalRolId}
                      onChange={(e) => setPersonalRolId(e.target.value)}
                      className="w-full bg-gris-oscuro-acro text-blanco-acro rounded-lg px-3 py-2 text-sm text-right border-none focus:ring-1 focus:ring-amarillo-acro outline-none cursor-pointer"
                    >
                      <option value="">Seleccionar rol...</option>
                      {roles.map((r) => (
                        <option key={r.id_rol} value={r.id_rol}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => requirePassword(handleAddPersonal)}
                    disabled={isAdding}
                    className="absolute bottom-0 right-4 rounded-xl bg-amarillo-acro px-6 py-2 text-sm font-bold text-negro-fondo-acro transition-transform hover:scale-[1.02] disabled:opacity-50"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-negro-fondo-acro border border-gris-claro-acro/20 p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold text-blanco-acro">
              Autenticación requerida
            </h3>
            <p className="mb-4 text-sm text-acro-muted">
              Por favor ingresa tu contraseña para confirmar esta acción.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full bg-gris-oscuro-acro text-blanco-acro rounded-lg px-3 py-2 text-sm border-none focus:ring-1 focus:ring-amarillo-acro outline-none mb-2"
              autoFocus
            />
            {passwordError && (
              <p className="mb-4 text-xs font-semibold text-red-500">
                {passwordError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="rounded-xl bg-[#4E4E4E] px-4 py-2 text-sm font-medium text-blanco-acro transition-colors hover:bg-gris-claro-acro/30"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isVerifying}
                onClick={async () => {
                  if (!password) {
                    setPasswordError("Ingresa tu contraseña.");
                    return;
                  }
                  setIsVerifying(true);
                  setPasswordError("");
                  try {
                    const res = await fetch("/api/auth/verify-password", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ password }),
                    });
                    const data = await res.json();
                    if (!res.ok)
                      throw new Error(data.error || "Error de autenticación.");

                    setShowPasswordModal(false);
                    if (pendingAction) await pendingAction();
                  } catch (err) {
                    setPasswordError(err.message);
                  } finally {
                    setIsVerifying(false);
                  }
                }}
                className="flex items-center justify-center rounded-xl bg-amarillo-acro px-4 py-2 text-sm font-bold text-negro-fondo-acro transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {isVerifying ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
