"use client";

import { Activity, UserPlus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import MemberCombobox from "@/components/tienda/member-combobox";
import { money } from "./product-card";

const MONEDAS = ["COP", "VES", "USD", "EUR", "USDT"];
const FORMAS_PAGO = ["Efectivo", "Transferencia", "Pago móvil", "Tarjeta", "Zelle"];
const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

 // Paso 3 de tienda, Datos del Cliente, Configuracion y Cobro.
 
export default function TiendaStepPago({
  categoriasPrecio = [],
  categoriaPrecio,
  onCategoriaPrecioChange,
  miembro,
  onMiembroChange,
  hasPlan,
  onIrACrearMiembro,
  planesConAgenda = [],
  onToggleDia,
  moneda,
  onMonedaChange,
  formaPago,
  onFormaPagoChange,
  promos = [],
  idPromo,
  onPromoChange,
  montoPagado,
  onMontoPagadoChange,
  totalItems = 0,
  subtotal = 0,
  descuento = 0,
  total = 0,
  isSubmitting = false,
  tasaVigente = true,
  onConfirmarVenta,
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onConfirmarVenta();
      }}
      className="flex flex-col gap-10 relative pb-40"
    >
      {/* Seccion 1: Datos del Cliente y Configuracion de Categoria / Miembro */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-2 text-blanco-acro mb-1">
          <Activity className="size-5 text-amarillo-acro" />
          <h2 className="text-xl font-semibold">Datos</h2>
        </div>

        {/* Selector de Categoria */}
        <div className="flex flex-col gap-2 max-w-xl">
          <Label className="text-sm font-normal text-blanco-acro">Categoría</Label>
          <Select value={String(categoriaPrecio || "")} onValueChange={onCategoriaPrecioChange}>
            <SelectTrigger className="h-10 w-full bg-[#4E4E4E] border-transparent rounded-lg text-blanco-acro">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categoriasPrecio.map((cat) => (
                <SelectItem key={cat.id || cat.nombre} value={cat.nombre}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Buscador de Miembro */}
        <div className="flex flex-col gap-2 max-w-xl">
          <Label className="text-sm font-normal text-blanco-acro">
            Nombre y Apellido
            {hasPlan && <span className="text-amarillo-acro ml-1" title="Obligatorio para planes">*</span>}
          </Label>
          <MemberCombobox value={miembro} onChange={onMiembroChange} />
          {!miembro && (
            <button
              type="button"
              onClick={onIrACrearMiembro}
              className="flex items-center gap-1.5 self-start text-sm font-medium text-amarillo-acro hover:underline cursor-pointer"
            >
              <UserPlus className="size-4" />
              ¿No está registrado? Agregar miembro
            </button>
          )}
        </div>

        {/* Selector de Dias de Asistencia para Planes que requieren agenda */}
        {planesConAgenda.length > 0 && (
          <div className="flex flex-col gap-4 max-w-xl mt-2">
            {planesConAgenda.map((planItem) => (
              <div key={planItem.key} className="flex flex-col gap-2">
                <Label className="text-sm font-normal text-blanco-acro">
                  Días de asistencia · {planItem.nombre}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {DIAS_SEMANA.map((dia) => {
                    const activo = (planItem.dias ?? []).includes(dia);
                    return (
                      <button
                        key={dia}
                        type="button"
                        onClick={() => onToggleDia(planItem.key, dia)}
                        className={cn(
                          "rounded-lg px-3 py-2 text-xs font-medium transition-colors border cursor-pointer",
                          activo
                            ? "bg-amarillo-acro text-negro-fondo-acro border-amarillo-acro"
                            : "bg-[#4E4E4E] text-blanco-acro border-transparent hover:border-gris-claro-acro",
                        )}
                      >
                        {dia}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sección 2: Seleccion de Moneda de Cobro */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-2 text-blanco-acro mb-1">
          <Activity className="size-5 text-amarillo-acro" />
          <h2 className="text-xl font-semibold">Moneda</h2>
        </div>

        <div className="flex max-w-fit border border-gris-oscuro-acro rounded-xl p-1 bg-negro-fondo-acro h-12">
          <div className="flex items-center gap-6 px-4 w-full h-full">
            {MONEDAS.map((m) => (
              <label key={m} className="flex cursor-pointer items-center gap-2 text-blanco-acro text-sm">
                <div className="relative flex items-center justify-center size-4">
                  <input
                    type="radio"
                    name="moneda"
                    value={m}
                    checked={moneda === m}
                    onChange={() => onMonedaChange(m)}
                    className="peer appearance-none size-4 rounded-full border border-blanco-acro checked:border-blanco-acro transition-colors cursor-pointer"
                  />
                  <div className="absolute size-2 rounded-full bg-blanco-acro scale-0 peer-checked:scale-100 transition-transform pointer-events-none" />
                </div>
                {m}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Seccion 3: Forma de Pago */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-2 text-blanco-acro mb-1">
          <Activity className="size-5 text-amarillo-acro" />
          <h2 className="text-xl font-semibold">Forma de pago</h2>
        </div>

        <div className="flex flex-col gap-2 max-w-xl">
          <Select value={formaPago} onValueChange={onFormaPagoChange}>
            <SelectTrigger className="h-10 w-full bg-[#4E4E4E] border-transparent rounded-lg text-blanco-acro">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMAS_PAGO.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Sección 4: Promocion o Descuento Aplicado */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-2 text-blanco-acro mb-1">
          <Activity className="size-5 text-amarillo-acro" />
          <h2 className="text-xl font-semibold">Promoción</h2>
        </div>

        <div className="flex flex-col gap-2 max-w-xl">
          <Select value={idPromo || "none"} onValueChange={(v) => onPromoChange(v === "none" ? "" : v)}>
            <SelectTrigger className="h-10 w-full bg-[#4E4E4E] border-transparent rounded-lg text-blanco-acro">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No aplica</SelectItem>
              {promos.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.nombre} ({p.valorDescuento}%)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Sección 5: Monto que abona el cliente y calculo de deuda */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-2 text-blanco-acro mb-1">
          <Activity className="size-5 text-amarillo-acro" />
          <h2 className="text-xl font-semibold">Monto que abona el cliente</h2>
        </div>

        <div className="flex flex-col gap-2 max-w-xl">
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder={`Total: ${total.toFixed(2)}`}
            value={montoPagado}
            onChange={(e) => onMontoPagadoChange(e.target.value)}
            className="h-10 w-full bg-[#4E4E4E] border-transparent rounded-lg text-sm text-blanco-acro"
          />
          {montoPagado !== "" && Number(montoPagado) < total && (
            <p className="text-sm text-acro-danger font-medium">
              Deuda a generar: {money(total - Number(montoPagado))}
            </p>
          )}
        </div>
      </section>

      {/* Resumen flotante y boton de confirmación */}
      <div className="absolute bottom-0 right-0 left-0 pt-6 flex justify-end">
        <div className="flex flex-col items-end gap-4 max-w-xs w-full">
          <dl className="w-full rounded-xl border border-gris-oscuro-acro p-4 text-blanco-acro space-y-1 bg-negro-fondo-acro shadow-xl">
            <div className="flex justify-between text-sm">
              <dt className="text-blanco-acro">Items ({totalItems})</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-blanco-acro">Descuento</dt>
              <dd>{money(descuento)}</dd>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t border-gris-oscuro-acro pt-1 mt-1">
              <dt className="text-blanco-acro">Total</dt>
              <dd className="text-amarillo-acro">{money(total)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={isSubmitting || totalItems === 0 || !tasaVigente}
            className="flex h-10 px-8 items-center justify-center rounded-full bg-amarillo-acro text-sm font-bold text-negro-fondo-acro hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 cursor-pointer shadow-lg"
          >
            {isSubmitting ? (
              <Loader2 className="size-5 animate-spin mx-auto" />
            ) : (
              "Confirmar"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
