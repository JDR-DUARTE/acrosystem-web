"use client";
// Componente DayCard
// Tarjeta de un dia de horario
export default function DayCard({ day, cupo = 7, members = [] }) {
  return (
    // Contenedor principal de la tarjeta: usa flexbox en columna con un alto mínimo.
    <article className="flex min-h-[260px] flex-col rounded-2xl bg-gris-oscuro-acro p-4">
      {/* Encabezado de la tarjeta: Título del día y contador de cupos */}
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-medium text-blanco-acro">{day}</h3>
        {/* Mostramos cuántos miembros hay agendados respecto al cupo total */}
        <span
          className="text-sm text-acro-muted"
          aria-label={`${members.length} de ${cupo} cupos ocupados`}
        >
          {members.length}/{cupo}
        </span>
      </header>

      {/* Renderizado condicional: si no hay miembros, mostramos un mensaje */}
      {members.length === 0 ? (
        <p className="my-auto text-center text-sm text-acro-muted">
          Sin miembros agendados
        </p>
      ) : (
        /* Si hay miembros, mostramos la lista */
        <ul className="flex flex-col gap-2">
          {members.map((name, i) => (
            <li
              // Clave única combinando el nombre y el índice
              key={`${name}-${i}`}
              // Cada miembro es un pequeño bloque de fondo más oscuro para que resalte
              className="truncate rounded-lg bg-negro-fondo-acro px-3 py-2 text-sm text-blanco-acro"
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
