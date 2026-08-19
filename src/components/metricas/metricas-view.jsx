"use client";

// Importación de componentes e íconos
import { useState } from "react";
import { useMetricas } from "@/hooks/use-metricas";
import { Loader2, AlertCircle, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

//Componente de Métricas, Ingresos, Stock y Afluencia.

export default function MetricasView() {
  // Consulta de datos desde la API de métricas
  const { data, isLoading, isError, error } = useMetricas();

  // Estados locales para los filtros de fecha
  const [ingresosDesde, setIngresosDesde] = useState("");
  const [ingresosHasta, setIngresosHasta] = useState("");
  const [ingresosFiltroApli, setIngresosFiltroApli] = useState({
    desde: "",
    hasta: "",
  });

  const [stockDesde, setStockDesde] = useState("");
  const [stockHasta, setStockHasta] = useState("");
  const [stockFiltroApli, setStockFiltroApli] = useState({
    desde: "",
    hasta: "",
  });

  // Pantalla de carga mientras se obtienen los datos
  if (isLoading) {
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
          {error?.message || "Error al cargar las métricas."}
        </p>
      </div>
    );
  }

  // Extracción de colecciones de datos para listas y gráficos
  const { ingresos = [], stock = [], afluencia = [] } = data || {};

  // Función de apoyo para parsear DD/MM/YYYY y verificar filtros
  const parseFecha = (fechaStr) => {
    const [d, m, y] = fechaStr.split("/");
    return new Date(y, m - 1, d).getTime();
  };

  const ingresosFiltrados = ingresos.filter((item) => {
    if (!ingresosFiltroApli.desde && !ingresosFiltroApli.hasta) return true;
    const itemTime = parseFecha(item.fecha);
    const desdeTime = ingresosFiltroApli.desde
      ? new Date(ingresosFiltroApli.desde + "T00:00:00").getTime()
      : null;
    const hastaTime = ingresosFiltroApli.hasta
      ? new Date(ingresosFiltroApli.hasta + "T23:59:59").getTime()
      : null;

    if (desdeTime && itemTime < desdeTime) return false;
    if (hastaTime && itemTime > hastaTime) return false;
    return true;
  });

  const stockFiltrado = stock.filter((item) => {
    if (!stockFiltroApli.desde && !stockFiltroApli.hasta) return true;
    const itemTime = parseFecha(item.fecha);
    const desdeTime = stockFiltroApli.desde
      ? new Date(stockFiltroApli.desde + "T00:00:00").getTime()
      : null;
    const hastaTime = stockFiltroApli.hasta
      ? new Date(stockFiltroApli.hasta + "T23:59:59").getTime()
      : null;

    if (desdeTime && itemTime < desdeTime) return false;
    if (hastaTime && itemTime > hastaTime) return false;
    return true;
  });

  return (
    <section className="relative min-h-[calc(100vh-100px)] pb-20">
      {/* Encabezado principal */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blanco-acro md:text-4xl">
          Métricas
        </h1>
      </div>

      <div className="flex flex-col gap-10">
        {/* Seccion de ingreso*/}
        <div>
          <h2 className="mb-3 text-xl font-semibold text-blanco-acro flex items-center gap-2">
            <Activity className="size-5 text-amarillo-acro" />
            Resumen de Ingresos
          </h2>

          {/* Filtros  */}
          <div className="mb-4 flex flex-nowrap gap-2 sm:gap-4">
            <input
              type="text"
              placeholder="Desde"
              value={ingresosDesde}
              onChange={(e) => setIngresosDesde(e.target.value)}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              className="rounded-full bg-gris-claro-acro px-3 py-1.5 text-xs font-medium text-blanco-acro transition-colors focus:outline-none focus:ring-1 focus:ring-amarillo-acro border-none min-w-0 w-full sm:w-32"
            />
            <input
              type="text"
              placeholder="Hasta"
              value={ingresosHasta}
              onChange={(e) => setIngresosHasta(e.target.value)}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              className="rounded-full bg-gris-claro-acro px-3 py-1.5 text-xs font-medium text-blanco-acro transition-colors focus:outline-none focus:ring-1 focus:ring-amarillo-acro border-none min-w-0 w-full sm:w-32"
            />
            <button
              onClick={() =>
                setIngresosFiltroApli({
                  desde: ingresosDesde,
                  hasta: ingresosHasta,
                })
              }
              className="shrink-0 rounded-full bg-gris-claro-acro px-4 py-1.5 text-xs font-medium text-blanco-acro transition-colors focus:outline-none focus:ring-1 focus:ring-amarillo-acro"
            >
              Aplicar
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-negro-fondo-acro border border-gris-claro-acro/20 shadow-xl">
            <div className="min-w-[500px]">
              {/* cabecera de tabla */}
              <div className="grid grid-cols-12 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-acro-muted sm:px-6">
                <div className="col-span-4 sm:col-span-4">Producto</div>
                <div className="col-span-2 text-center sm:col-span-2">
                  Cant.
                </div>
                <div className="col-span-3 text-center sm:col-span-3">
                  Fecha
                </div>
                <div className="col-span-3 text-right sm:col-span-3">Monto</div>
              </div>

              {/* Tabla Rows */}
              <div className="divide-y divide-white/5 max-h-60 overflow-y-auto">
                {ingresosFiltrados.length === 0 ? (
                  <div className="px-6 py-4 text-sm text-acro-muted">
                    No hay registros de ingresos para el rango seleccionado.
                  </div>
                ) : (
                  ingresosFiltrados.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 items-center px-4 py-3.5 text-sm transition-colors hover:bg-gris-claro-acro/10 sm:px-6"
                    >
                      <div className="col-span-4 pr-2 font-medium text-blanco-acro truncate sm:col-span-4">
                        {item.movimiento}
                      </div>
                      <div className="col-span-2 text-center text-acro-muted font-mono text-xs sm:col-span-2 sm:text-sm">
                        {item.cantidad}
                      </div>
                      <div className="col-span-3 text-center text-acro-muted font-mono text-xs sm:col-span-3 sm:text-sm">
                        {item.fecha}
                      </div>
                      <div className="col-span-3 text-right font-semibold text-blanco-acro sm:col-span-3">
                        {item.monto}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reporte de Stock */}
        <div>
          <h2 className="mb-3 text-xl font-semibold text-blanco-acro flex items-center gap-2">
            <Activity className="size-5 text-amarillo-acro" />
            Reporte de Stock
          </h2>

          <div className="mb-4 flex flex-nowrap gap-2 sm:gap-4">
            <input
              type="text"
              placeholder="Desde"
              value={stockDesde}
              onChange={(e) => setStockDesde(e.target.value)}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              className="rounded-full bg-gris-claro-acro px-3 py-1.5 text-xs font-medium text-blanco-acro transition-colors focus:outline-none focus:ring-1 focus:ring-amarillo-acro border-none min-w-0 w-full sm:w-32"
            />
            <input
              type="text"
              placeholder="Hasta"
              value={stockHasta}
              onChange={(e) => setStockHasta(e.target.value)}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              className="rounded-full bg-gris-claro-acro px-3 py-1.5 text-xs font-medium text-blanco-acro transition-colors focus:outline-none focus:ring-1 focus:ring-amarillo-acro border-none min-w-0 w-full sm:w-32"
            />
            <button
              onClick={() =>
                setStockFiltroApli({ desde: stockDesde, hasta: stockHasta })
              }
              className="shrink-0 rounded-full bg-gris-claro-acro px-4 py-1.5 text-xs font-medium text-blanco-acro transition-colors focus:outline-none focus:ring-1 focus:ring-amarillo-acro"
            >
              Aplicar
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-negro-fondo-acro border border-gris-claro-acro/20 shadow-xl">
            <div className="min-w-[500px]">
              {/* cabecera de tabla */}
              <div className="grid grid-cols-12 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-acro-muted sm:px-6">
                <div className="col-span-5 sm:col-span-6">Movimiento</div>
                <div className="col-span-4 text-center sm:col-span-3">
                  Fecha
                </div>
                <div className="col-span-3 text-right sm:col-span-3">
                  Cantidad
                </div>
              </div>

              {/* filas de tabla */}
              <div className="divide-y divide-white/5 max-h-60 overflow-y-auto">
                {stockFiltrado.length === 0 ? (
                  <div className="px-6 py-4 text-sm text-acro-muted">
                    No hay movimientos de stock para el rango seleccionado.
                  </div>
                ) : (
                  stockFiltrado.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 items-center px-4 py-3.5 text-sm transition-colors hover:bg-gris-claro-acro/10 sm:px-6"
                    >
                      <div className="col-span-5 pr-2 font-medium text-blanco-acro truncate sm:col-span-6">
                        {item.movimiento}
                      </div>
                      <div className="col-span-4 text-center text-acro-muted font-mono text-xs sm:col-span-3 sm:text-sm">
                        {item.fecha}
                      </div>
                      <div className="col-span-3 text-right font-semibold text-blanco-acro sm:col-span-3">
                        {item.monto}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Afluencia de escaladores */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-blanco-acro flex items-center gap-2">
            <Activity className="size-5 text-amarillo-acro" />
            Afluencia de escaladores
          </h2>

          <div className="h-[300px] w-full rounded-2xl bg-negro-fondo-acro p-4 border border-gris-claro-acro/20 shadow-xl sm:p-6 sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={afluencia}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff10"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke="#ffffff50"
                  tick={{ fill: "#ffffff80", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#ffffff50"
                  tick={{ fill: "#ffffff80", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: "#ffffff10" }}
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #ffffff10",
                    borderRadius: "12px",
                    color: "#f4f4f5",
                  }}
                  itemStyle={{ color: "#ffd000", fontWeight: "bold" }}
                />
                <Bar
                  dataKey="count"
                  name="Check-ins"
                  fill="#ffffff50"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
