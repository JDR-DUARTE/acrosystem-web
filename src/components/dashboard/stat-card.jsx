import { cn } from "@/lib/utils";

// Componente StatCard
// Este es un componente de UI reutilizable (o "UI component") diseñado para mostrar
// una métrica simple, compuesta por una etiqueta (label), un valor (value) y un ícono (icon).
//
// Recibe "props" (propiedades):
// - label: El texto que describe la estadística (ej: "Usuarios activos").
// - value: El número o valor a mostrar (ej: "1,200").
// - icon: Icon: Renombramos la prop "icon" a "Icon" con mayúscula porque en React
//   los componentes deben empezar con mayúscula para poder usarlos como etiquetas <Icon />.
// - className: Permite inyectar clases CSS adicionales desde donde se use el componente.
export default function StatCard({ label, value, icon: Icon, className }) {
  return (
    <div
      // cn() es una función de utilidad que combina las clases CSS de Tailwind de forma segura,
      // resolviendo posibles conflictos. Aquí combinamos nuestras clases base con la prop 'className'.
      className={cn(
        "flex min-h-[128px] flex-col justify-between rounded-2xl bg-gris-oscuro-acro p-4",
        className,
      )}
    >
      {/* Sección superior: Ícono y Etiqueta */}
      <div className="flex items-center gap-2">
        {/* Renderizamos el ícono pasado por props aplicando un tamaño y nuestro color amarillo de acento */}
        <Icon className="size-5 text-amarillo-acro" />
        <span className="text-sm text-blanco-acro">{label}</span>
      </div>
      
      {/* Sección inferior: Valor de la estadística */}
      {/* Usamos self-end para alinear el texto grande a la derecha dentro del contenedor flex */}
      <span className="self-end text-5xl font-semibold text-blanco-acro">
        {value}
      </span>
    </div>
  );
}