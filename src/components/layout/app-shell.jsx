"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Settings, LogOut } from "lucide-react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav";
import { createClient } from "@/lib/supabase/client";

// Componente para el Logotipo y la Marca
function Brand({ onClick }) {
  return (
    <Link
      href="/dashboard"
      onClick={onClick}
      className="flex items-center gap-3 transition-opacity hover:opacity-90"
    >
      <Image
        src="/logo-acro.png"
        alt="Logo de acrofobia, un perosnaje amarillo llamado Acro escalanado en las letras que componen el nombre acrofobia"
        width={40}
        height={40}
        className="size-10 shrink-0 object-contain"
        priority
      />
      <span className="text-xl font-bold text-blanco-acro">AcroSystem</span>
    </Link>
  );
}

// Función auxiliar para determinar qué clases CSS usar en los elementos del menú
function itemClasses(active) {
  return cn(
    "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors",
    // Si está activo, aplicamos el fondo amarillo. Si no, un hover sutil oscuro.
    active
      ? "bg-amarillo-acro text-negro-fondo-acro"
      : "text-blanco-acro hover:bg-gris-claro-acro/10",
  );
}

// Cuerpo de la barra lateral Sidebar

function SidebarBody({ isAdmin, pathname, onNavigate }) {
  // Filtramos las opciones de menú basándonos en si el usuario es administrador
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);
  const router = useRouter();

  // Función para cerrar la sesión
  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error(err);
      router.push("/login");
    }
  };

  return (
    <div className="flex h-full flex-col px-4 py-4">
      {/* Sección principal de enlaces de navegación (flex-1 la hace crecer para ocupar el espacio) */}
      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={itemClasses(active)}
            >
              <Icon className="size-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sección inferior para configuración y cierre de sesión */}
      <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4">
        {isAdmin && (
          <Link
            href="/configuracion"
            onClick={onNavigate}
            className={itemClasses(pathname.startsWith("/configuracion"))}
          >
            <Settings className="size-5 shrink-0" />
            <span className="truncate">Configuración</span>
          </Link>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-acro-danger transition-colors hover:bg-acro-danger/10"
        >
          <LogOut className="size-5 shrink-0" />
          <span className="truncate">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}

// AppShell: Componente contenedor principal
export default function AppShell({ isAdmin = false, children }) {
  // Estado para controlar el menú lateral en dispositivos móviles
  const [open, setOpen] = useState(false);
  // Obtenemos la ruta actual para saber qué opción de menú iluminar
  const pathname = usePathname();

  const closeMenu = () => setOpen(false);

  return (
    // Contenedor principal de altura completa (min-h-dvh)
    <div className="flex min-h-dvh flex-col bg-negro-fondo-acro">
      {/* Cabecera */}
      <header className="sticky top-0 z-40 flex h-[72px] shrink-0 items-center justify-between border-b border-border bg-negro-fondo-acro px-6">
        <Brand />
        {/* Botón menú hamburguesa solo se muestra en pantallas pequeñas sm hiden*/}
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setOpen(true)}
          className="rounded-md p-1 text-blanco-acro transition-colors hover:bg-gris-claro-acro/10 sm:hidden"
        >
          <Menu className="size-7" />
        </button>
      </header>

      {/* Contenedor del área de contenido principal y la barra lateral */}
      <div className="flex flex-1">
        {/* Barra Lateral oculta en móvil visible a partir de tamaño sm*/}
        <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[240px] shrink-0 overflow-y-auto no-scrollbar bg-gris-oscuro-acro sm:block md:w-[260px] xl:w-[320px]">
          <SidebarBody isAdmin={isAdmin} pathname={pathname} />
        </aside>

        {/* Área principal de contenido children */}
        <main className="min-w-0 flex-1 border-border p-4 sm:border-l sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Menú lateral movil*/}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          aria-describedby={undefined}
          className="flex w-[300px] flex-col gap-0 border-border bg-gris-oscuro-acro p-0"
        >
          {/* Cabecera del menú móvil */}
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <SheetTitle asChild>
              <Brand onClick={closeMenu} />
            </SheetTitle>
            {/* Botón para cerrar el menú móvil */}
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={closeMenu}
              className="rounded-md p-1 text-blanco-acro transition-colors hover:bg-gris-claro-acro/10"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* Cuerpo del menú móvil */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <SidebarBody
              isAdmin={isAdmin}
              pathname={pathname}
              onNavigate={closeMenu}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
