import Link from "next/link";
import {
  LogIn,
  Home,
  Users,
  Send,
  CalendarDays,
  QrCode,
} from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import DayCard from "@/components/dashboard/day-card";
import TasasPanel from "@/components/dashboard/tasas-panel";
import { getDashboardStats, getHorarioInfantil } from "@/lib/api/dashboard";
import { getTasasHoy } from "@/lib/api/tasas";

export const metadata = {
  title: "Dashboard · AcroSystem",
};

const DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const CUPO_INFANTIL = 7;

export default async function DashboardPage() {
  const [stats, tasas, horario] = await Promise.all([
    getDashboardStats(),
    getTasasHoy(),
    getHorarioInfantil(),
  ]);
  const cards = [
    {
      label: "Ingresos Hoy",
      value: stats.ingresosHoy,
      icon: LogIn,
    },
    { label: "Miembros Activos", value: stats.miembrosActivos, icon: Home },
    { label: "Total Registrados", value: stats.totalRegistrados, icon: Users },
    { label: "Accesos (7 días)", value: stats.accesosSemana, icon: Send },
  ];

  return (
    <section className="pb-24">
      <h1 className="mb-6 text-2xl font-bold text-blanco-acro md:text-3xl lg:text-4xl">
        Dashboard
      </h1>

      <TasasPanel initial={tasas} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {cards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-3">
          <CalendarDays className="size-7 text-amarillo-acro" />
          <h2 className="text-xl font-semibold text-blanco-acro md:text-2xl">
            Horario Infantil
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {DAYS.map((day) => (
            <DayCard
              key={day}
              day={day}
              cupo={CUPO_INFANTIL}
              members={horario[day] ?? []}
            />
          ))}
        </div>
      </div>

      <Link
        href="/check-in"
        aria-label="Ir a control de acceso"
        className="fixed bottom-6 right-6 z-20 flex size-16 items-center justify-center rounded-2xl bg-amarillo-acro text-negro-fondo-acro shadow-lg transition-transform hover:scale-105"
      >
        <QrCode className="size-8" />
      </Link>
    </section>
  );
}