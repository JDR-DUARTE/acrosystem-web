"use client";
// se usa características del cliente (navegador)
import { useState, useCallback } from "react";
// next/dynamic nos permite cargar componentes de forma perezosa (lazy load)
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  QrCode,
  CheckCircle2,
  XCircle,
  UserX,
  Loader2,
} from "lucide-react";
import { useCheckin } from "@/hooks/use-checkin";

// Carga del componente QrScanner dinámicamente,evitar que se renderice en el servidor (ssr: false)
const QrScanner = dynamic(() => import("@/components/checkin/qr-scanner"), {
  ssr: false,
});

// Componente secundario: Muestra el resultado (éxito o error) después de escanear o buscar
function ResultCard({ result, onGoToMember }) {
  // Un "mapa" (diccionario) para definir estilos e iconos dependiendo del resultado devuelto
  const map = {
    permitido: {
      icon: CheckCircle2,
      color: "text-amarillo-acro",
      border: "border-amarillo-acro/40",
      bg: "bg-negro-fondo-acro",
    },
    advertencia: {
      icon: CheckCircle2,
      color: "text-yellow-500",
      border: "border-yellow-500/40",
      bg: "bg-negro-fondo-acro",
    },
    denegado: {
      icon: XCircle,
      color: "text-acro-danger",
      border: "border-acro-danger/40",
      bg: "bg-negro-fondo-acro",
    },
    no_encontrado: {
      icon: UserX,
      color: "text-acro-muted",
      border: "border-gris-claro-acro/30",
      bg: "bg-negro-fondo-acro",
    },
  };

  // Si el resultado no coincide con nada, usamos "no_encontrado" por defecto
  const cfg = map[result.resultado] ?? map.no_encontrado;
  // Extraemos el componente de ícono a usar
  const Icon = cfg.icon;

  return (
    <div
      className={`mt-6 w-full max-w-xs sm:max-w-sm mx-auto rounded-2xl border ${cfg.bg} p-5 text-left shadow-xl ${cfg.border}`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`size-8 ${cfg.color} shrink-0`} />
        <p className={`text-lg font-bold ${cfg.color}`}>
          {/* Mostramos un mensaje legible según el código de resultado */}
          {result.resultado === "permitido"
            ? "Acceso permitido"
            : result.resultado === "advertencia"
              ? "Acceso valido"
              : result.resultado === "denegado"
                ? "Acceso denegado"
                : "No encontrado"}
        </p>
      </div>

      {/* Si la API nos devolvió la información del miembro, mostramos sus datos */}
      {result.miembro && (
        <button
          type="button"
          onClick={() => onGoToMember(result.miembro.id)}
          className="mt-3 block text-left w-full"
        >
          <p className="text-xl font-bold text-blanco-acro underline-offset-4 hover:underline">
            {result.miembro.nombre}
          </p>
          <p className="text-sm text-acro-muted mt-0.5">
            C.I: {result.miembro.cedula || "—"}
            {result.miembro.categoria ? ` · ${result.miembro.categoria}` : ""}
          </p>
        </button>
      )}

      {/* Mensaje devuelto por el servidor */}
      <p className="mt-3 text-sm font-medium text-blanco-acro">
        {result.mensaje}
      </p>

      {/* Detalles del Plan */}
      <div className="mt-3 flex flex-col gap-1 border-t border-gris-claro-acro/20 pt-3 text-sm">
        {result.plan && (
          <p className="text-acro-muted">
            Plan:{" "}
            <span className="font-semibold text-blanco-acro">
              {result.plan}
            </span>
          </p>
        )}

        {result.fechaExpiracion && (
          <p className="text-acro-muted">
            Vencimiento:{" "}
            <span className="font-semibold text-blanco-acro">
              {result.fechaExpiracion}
            </span>
          </p>
        )}

        {/* Muestra días restantes solo si es un plan por pases/días */}
        {result.usaPases &&
          result.pasesRestantes !== null &&
          result.pasesRestantes !== undefined && (
            <p className="text-acro-muted">
              Días restantes:{" "}
              <span className="font-bold text-amarillo-acro">
                {result.pasesRestantes}
              </span>
            </p>
          )}
      </div>
    </div>
  );
}

// Componente Principal
export default function CheckinView() {
  const router = useRouter();

  // Definición de estados locales (useState) para controlar la UI
  const [cedula, setCedula] = useState("");
  const [scanning, setScanning] = useState(false); // Para mostrar/ocultar la cámara
  const [scanError, setScanError] = useState(null);
  const [result, setResult] = useState(null); // Aquí guardamos lo que nos responde la API

  // Hook que maneja la lógica de petición al servidor
  const checkin = useCheckin();

  // Función para enviar la petición al servidor (busca al miembro)
  // useCallback asegura que esta función no se recree innecesariamente en cada re-render.
  const submit = useCallback(
    async (query) => {
      const term = String(query ?? "").trim();
      if (!term) return;
      try {
        // Ejecutamos la mutación (petición POST)
        const res = await checkin.mutateAsync(term);
        setResult(res);
      } catch (err) {
        // Manejamos cualquier error que ocurra (ej: no hay conexión o no existe la persona)
        setResult({ resultado: "no_encontrado", mensaje: err.message });
      }
    },
    [checkin],
  );

  // Se ejecuta cuando el escáner QR detecta un código correctamente
  const handleScan = useCallback(
    (text) => {
      setScanning(false); // Apagamos la cámara
      submit(text); // Hacemos la consulta
    },
    [submit],
  );

  // Se ejecuta si hay un error con la cámara (ej: permisos denegados)
  const handleScanError = useCallback((msg) => {
    setScanError(msg);
    setScanning(false);
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-100px)] pb-20">
      {/* Título de la vista */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-blanco-acro md:text-4xl">
          Check-in
        </h1>
      </div>

      {/* Contenedor central principal */}
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center pt-2 sm:pt-4">
        {/* Subtítulo */}
        <p className="mb-6 text-center text-sm font-normal text-acro-muted sm:text-base">
          Escanea el codigo QR o ingresa la cedula del miembro
        </p>

        {/* Tarjeta del Escáner QR */}
        <div className="relative aspect-square w-full max-w-[280px] sm:max-w-[320px] overflow-hidden rounded-2xl bg-negro-fondo-acro border border-gris-claro-acro/30 p-6 shadow-2xl transition-all">
          {/* Esquinas decorativas personalizadas (las líneas blancas de las esquinas) */}
          <div className="pointer-events-none absolute left-4 top-4 size-7 rounded-tl-sm border-l-4 border-t-4 border-blanco-acro" />
          <div className="pointer-events-none absolute right-4 top-4 size-7 rounded-tr-sm border-r-4 border-t-4 border-blanco-acro" />
          <div className="pointer-events-none absolute bottom-4 left-4 size-7 rounded-bl-sm border-b-4 border-l-4 border-blanco-acro" />
          <div className="pointer-events-none absolute bottom-4 right-4 size-7 rounded-br-sm border-b-4 border-r-4 border-blanco-acro" />

          {/* Lógica condicional: Si está escaneando mostramos la cámara, si no, el botón grande */}
          {scanning ? (
            <div className="flex h-full w-full flex-col items-center justify-center">
              <QrScanner onScan={handleScan} onError={handleScanError} />
              <button
                type="button"
                onClick={() => setScanning(false)}
                className="mt-3 text-xs font-medium text-acro-muted hover:text-blanco-acro underline"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setScanError(null);
                setScanning(true); // Encender cámara
              }}
              className="flex h-full w-full flex-col items-center justify-center gap-3 transition-transform active:scale-95"
            >
              <QrCode className="size-20 text-blanco-acro" strokeWidth={1.5} />
              <span className="text-xs sm:text-sm font-medium text-blanco-acro">
                Toca para escanear
              </span>
            </button>
          )}
        </div>

        {/* Mensaje de error de la cámara (si existe) */}
        {scanError && (
          <p className="mt-2 text-xs text-acro-danger">{scanError}</p>
        )}

        {/* Formulario alternativo: Búsqueda manual por cédula */}
        <form
          onSubmit={(e) => {
            e.preventDefault(); // Evita que la página se recargue al enviar
            submit(cedula);
          }}
          className="mt-6 flex w-full max-w-[280px] sm:max-w-[320px] flex-col gap-3"
        >
          {/* Input text para la cédula */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-acro-muted" />
            <input
              type="text"
              value={cedula} // Enlazamos el input al estado "cedula"
              onChange={(e) => setCedula(e.target.value)} // Actualizamos el estado al escribir
              placeholder="Ingresar cedula"
              className="h-12 w-full rounded-xl bg-negro-fondo-acro pl-11 pr-4 text-sm sm:text-base text-blanco-acro border border-amarillo-acro focus:border-amarillo-acro focus:outline-none focus:ring-1 focus:ring-amarillo-acro transition-colors placeholder:text-acro-muted"
            />
          </div>

          {/* Botón de Buscar */}
          <button
            type="submit"
            disabled={checkin.isPending} // Desactivado mientras carga la petición
            className="flex h-12 w-full items-center justify-center rounded-xl bg-amarillo-acro font-bold text-negro-fondo-acro text-base shadow-lg transition-transform hover:brightness-105 active:scale-[0.99]"
          >
            {checkin.isPending ? (
              <Loader2 className="size-5 animate-spin" /> // Spinner si está cargando
            ) : (
              "Buscar"
            )}
          </button>
        </form>

        {/* Enlace de redirección */}
        <Link
          href="/check-in/consulta"
          className="mt-4 text-xs sm:text-sm text-acro-muted hover:text-blanco-acro transition-colors cursor-pointer underline-offset-4 hover:underline"
        >
          Consulta Tu Plan
        </Link>

        {/* Si hay un resultado guardado, mostramos la tarjeta ResultCard (reutilizando el componente de arriba) */}
        {result && (
          <ResultCard
            result={result}
            onGoToMember={(id) => router.push(`/miembros/${id}`)}
          />
        )}
      </div>
    </section>
  );
}
