"use client";

import { useRef } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ProductCard from "./product-card";
import PlanCard from "./plan-card";

/**
 * Paso 1 del Asistente de Tienda: Catalogo de Productos y Planes.
 * Proporciona navegación por categorias, barra de búsqueda reactiva y catálogo interactivo.
 */
export default function TiendaStepCatalogo({
  categoryCards = [],
  selectedCategory,
  onSelectCategory,
  search,
  onSearchChange,
  isPlanes,
  planesFiltrados = [],
  productos = [],
  isLoading,
  cart = [],
  onAddProducto,
  onAddPlan,
}) {
  const carouselRef = useRef(null);

  // Desplazamiento suave hacia la izquierda en el carrusel de categorías
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -220, behavior: "smooth" });
    }
  };

  // Desplazamiento suave hacia la derecha en el carrusel de categorías
  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 220, behavior: "smooth" });
    }
  };

  return (
    <div>
      {/* Carrusel deslizable de categorías de productos y planes */}
      <div className="relative group my-2">
        {/* Botón de navegación izquierda (visible en pantallas medianas en adelante) */}
        <button
          type="button"
          onClick={scrollLeft}
          aria-label="Anterior categoría"
          className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 size-9 items-center justify-center rounded-full bg-gris-oscuro-acro border border-gris-claro-acro/30 text-blanco-acro shadow-xl transition-all hover:bg-white/10 hover:scale-110 md:flex cursor-pointer"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Contenedor con scroll horizontal para tarjetas de categorías */}
        <div
          ref={carouselRef}
          className="flex items-center gap-3 overflow-x-auto py-2 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categoryCards.map((c) => {
            const Icon = c.icon;
            const active = selectedCategory === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => onSelectCategory(c.key)}
                aria-pressed={active}
                className={cn(
                  "flex h-28 w-36 sm:w-40 shrink-0 snap-start flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer",
                  active
                    ? "border-transparent bg-amarillo-acro text-negro-fondo-acro shadow-md scale-[1.02]"
                    : "border-border bg-gris-oscuro-acro text-blanco-acro hover:bg-gris-claro-acro/10",
                )}
              >
                <span className="text-base sm:text-lg font-semibold truncate">{c.nombre}</span>
                <Icon
                  className={cn(
                    "size-9 self-end shrink-0",
                    active ? "text-negro-fondo-acro" : "text-acro-muted",
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Botón de navegación derecha (visible en pantallas medianas en adelante) */}
        <button
          type="button"
          onClick={scrollRight}
          aria-label="Siguiente categoría"
          className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 size-9 items-center justify-center rounded-full bg-gris-oscuro-acro border border-gris-claro-acro/30 text-blanco-acro shadow-xl transition-all hover:bg-white/10 hover:scale-110 md:flex cursor-pointer"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Barra de búsqueda reactiva para filtrar planes o productos */}
      <div className="relative my-4">
        <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-acro-muted pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={isPlanes ? "Buscar plan..." : "Buscar producto..."}
          className="h-12 bg-gris-oscuro-acro pl-11 text-blanco-acro border-gris-claro-acro/30"
        />
      </div>

      {/* Renderizado condicional de cuadrícula según la categoría seleccionada */}
      {isPlanes ? (
        planesFiltrados.length === 0 ? (
          <p className="py-8 text-center text-acro-muted">No se encontraron planes disponibles.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {planesFiltrados.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                added={cart.some((i) => i.key === `plan-${p.id}`)}
                onAdd={() => onAddPlan(p)}
              />
            ))}
          </div>
        )
      ) : isLoading ? (
        <p className="py-8 text-center text-acro-muted">Cargando productos del catálogo...</p>
      ) : !productos || productos.length === 0 ? (
        <p className="py-8 text-center text-acro-muted">No hay productos en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {productos.map((p) => (
            <ProductCard
              key={p.id}
              producto={p}
              onAdd={(qty) => onAddProducto(p, qty)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
