import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, QrCode } from "lucide-react";
import MemberQr from "@/components/miembros/member-qr";
import { getMiembro } from "@/lib/api/miembros";

export const metadata = {
  title: "Perfil de miembro · AcroSystem",
};

function formatDatePlan(value) {
  if (!value) return "—";
  const parts = value.slice(0, 10).split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d} / ${m} /${y}`;
  }
  return value;
}

function formatDateSimple(value) {
  if (!value) return "—";
  const parts = value.slice(0, 10).split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  }
  return value;
}

export default async function MiembroPerfilPage({ params }) {
  const { id } = await params;
  const miembro = await getMiembro(id);
  if (!miembro) notFound();

  const activo = miembro.estado === "Activo";

  return (
    <section className="relative min-h-[calc(100vh-100px)] pb-24">
      {/* Botón Volver y Título */}
      <div className="mb-6">
        <Link
          href="/miembros"
          className="inline-flex items-center gap-1.5 text-xs text-acro-muted hover:text-blanco-acro transition-colors mb-2 w-fit"
        >
          <ArrowLeft className="size-4" />
          Volver a Miembros
        </Link>
        <h1 className="text-3xl font-bold text-blanco-acro md:text-4xl">
          {miembro.nombre}
        </h1>
        <p className="mt-1 flex items-center gap-2 text-sm font-medium text-blanco-acro">
          <span
            className={`inline-block size-2.5 rounded-full ${
              activo ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          {miembro.estado}
        </p>
      </div>

      {/* Grid de Tarjetas de Información */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Caja 1: Información Personal */}
        <div className="order-1 lg:col-start-1 lg:row-start-1 rounded-2xl bg-gris-oscuro-acro border border-gris-claro-acro/20 p-5 shadow-xl">
          <h2 className="mb-3 text-lg font-bold text-blanco-acro">Información</h2>
          <div className="flex flex-col gap-1.5 text-sm text-blanco-acro">
            <p>C.I {miembro.cedula || "—"}</p>
            <p>Teléfono: {miembro.telefono || "—"}</p>
            <p>Talla Zapatilla: {miembro.tallaZapato || "—"}</p>
            <p>Contacto Emergencia: {miembro.contactoEmergencia || "—"}</p>
          </div>
        </div>

        {/* Caja 2: Código QR */}
        <div className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 flex flex-col justify-between rounded-2xl bg-gris-oscuro-acro border border-gris-claro-acro/20 p-5 shadow-xl min-h-[220px]">
          <h2 className="mb-2 text-lg font-bold text-blanco-acro">Código QR</h2>
          <div className="my-auto flex items-center justify-center py-4">
            <MemberQr value={miembro.qrCodigo} size={140} />
          </div>
        </div>

        {/* Caja 3: Plan Actual */}
        <div className="order-3 lg:col-start-1 lg:row-start-2 rounded-2xl bg-amarillo-acro p-5 shadow-xl text-negro-fondo-acro">
          <h2 className="mb-1.5 text-lg font-bold text-negro-fondo-acro">Plan actual</h2>
          <div className="flex flex-col gap-1 text-sm font-medium text-negro-fondo-acro">
            <p>
              Tipo:{" "}
              {miembro.planActual ? miembro.planActual.nombre : "Sin plan"}
            </p>
            <p>
              Fecha de inicio:{" "}
              {miembro.planActual
                ? formatDatePlan(miembro.planActual.fechaInicio)
                : "—"}
            </p>
          </div>
        </div>

        {/* Caja 4: Historial de Pagos */}
        <div className="order-4 lg:col-span-2 rounded-2xl bg-gris-oscuro-acro border border-gris-claro-acro/20 p-5 shadow-xl">
          <h2 className="mb-3 text-lg font-bold text-blanco-acro">
            Historial de pagos
          </h2>
          <div className="flex items-center justify-between px-4 text-xs sm:text-sm font-medium text-acro-muted mb-2">
            <span>Fecha</span>
            <span>Monto</span>
          </div>
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
            {miembro.historialPagos && miembro.historialPagos.length > 0 ? (
              miembro.historialPagos.map((pago) => (
                <div
                  key={pago.id}
                  className="flex items-center justify-between rounded-full bg-gris-oscuro-acro px-5 py-2.5 text-xs sm:text-sm text-blanco-acro font-medium"
                >
                  <span>{formatDateSimple(pago.fechaHora)}</span>
                  <span>{pago.totalUsd} $</span>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-xs sm:text-sm text-acro-muted">
                Sin pagos registrados.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Botón flotante al Check-in */}
      <Link
        href="/check-in"
        aria-label="Ir a control de acceso"
        className="fixed bottom-8 right-8 z-50 flex size-14 items-center justify-center rounded-2xl bg-amarillo-acro text-negro-fondo-acro shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer"
      >
        <QrCode className="size-7 stroke-[2.2]" />
      </Link>
    </section>
  );
}
