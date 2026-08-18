import { cn } from "@/lib/utils";

// Componente StatCard
// Metricas
export default function StatCard({ label, value, icon: Icon, className }) {
  return (
    <article
      // cn() para combinar las clases CSS de Tailwind
      className={cn(
        "flex min-h-[128px] flex-col justify-between rounded-2xl bg-gris-oscuro-acro p-4",
        className,
      )}
    >
      {/* Sección superior: Ícono y Etiqueta */}
      <header className="flex items-center gap-2">
        {/* Renderizamos el ícono pasado por props aplicando un tamaño y nuestro color amarillo de acento */}
        <Icon className="size-5 text-amarillo-acro" aria-hidden="true" />
        <span className="text-sm text-blanco-acro">{label}</span>
      </header>

      {/* Sección inferior: Valor de la estadística */}
      <p className="self-end text-5xl font-semibold text-blanco-acro">
        {value}
      </p>
    </article>
  );
}
