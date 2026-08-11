import {
  LayoutGrid,
  Users,
  CalendarClock,
  ScanLine,
  Store,
  Boxes,
  CreditCard,
  History,
  Activity,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Panel", href: "/dashboard", icon: LayoutGrid },
  { label: "Miembros", href: "/miembros", icon: Users },
  { label: "Vencimientos", href: "/vencimientos", icon: CalendarClock },
  { label: "Check-in", href: "/check-in", icon: ScanLine },
  { label: "Tienda", href: "/tienda", icon: Store },
  { label: "Inventario", href: "/inventario", icon: Boxes },
  { label: "Pagos", href: "/pagos", icon: CreditCard },
  { label: "Historico", href: "/historico", icon: History },
  { label: "Métricas", href: "/metricas", icon: Activity, adminOnly: true },
];