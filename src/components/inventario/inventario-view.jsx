"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Loader2,
  AlertCircle,
  PackageSearch,
  Edit2,
  Trash2,
  Tag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  useProductos,
  useCategorias,
  useEliminarProducto,
} from "@/hooks/use-tienda";

export default function InventarioView() {
  const router = useRouter();

  // set para filtros
  const [search, setSearch] = useState("");
  const [stockBajo, setStockBajo] = useState(false);

  // consultas
  const { data: categorias } = useCategorias();
  const {
    data: productos,
    isLoading,
    isError,
    error,
  } = useProductos({
    search: search.trim() || undefined,
    stockBajo: stockBajo ? true : undefined,
  });

  const eliminarMutation = useEliminarProducto();
  const [deletingProduct, setDeletingProduct] = useState(null);

  // confirmar eliminar
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    try {
      await eliminarMutation.mutateAsync(deletingProduct.id);
      toast.success("Producto eliminado del inventario.");
      setDeletingProduct(null);
    } catch (err) {
      toast.error(err.message || "Error al eliminar producto.");
    }
  };

  return (
    <section className="relative pb-28">
      {/* Título de la vista */}
      <h1 className="mb-6 text-2xl font-bold text-blanco-acro sm:text-3xl lg:text-4xl">
        Inventario
      </h1>

      {/* Barra de Búsqueda y Switch de Stock Bajo */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Input de Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-acro-muted" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre"
            className="h-12 w-full rounded-xl bg-blanco-acro pl-11 pr-4 text-base text-blanco-acro placeholder:text-acro-muted border-none focus:outline-none focus:ring-1 focus:ring-amarillo-acro"
          />
        </div>

        {/* Switch Toggle: Mostrar solo stock bajo */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <span className="text-sm font-medium text-blanco-acro">
            Mostrar solo stock bajo
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={stockBajo}
            onClick={() => setStockBajo(!stockBajo)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              stockBajo ? "bg-amarillo-acro" : "bg-[#3E3E3E]"
            }`}
          >
            <span
              className={`inline-block size-4 rounded-full bg-negro-fondo-acro transition-transform ${
                stockBajo ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Lista / Grid de Tarjetas de Productos */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-gris-oscuro-acro">
          <Loader2 className="size-8 animate-spin text-amarillo-acro" />
        </div>
      ) : isError ? (
        <div className="flex h-40 items-center justify-center gap-2 rounded-2xl bg-gris-oscuro-acro p-6 text-center text-acro-danger">
          <AlertCircle className="size-6" />
          <p>{error?.message || "Error al cargar el inventario."}</p>
        </div>
      ) : !productos || productos.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl bg-gris-oscuro-acro p-6 text-center text-acro-muted">
          <PackageSearch className="size-12 text-acro-muted/50" />
          <p className="text-lg font-medium text-blanco-acro">
            No se encontraron productos
          </p>
          <p className="text-sm">
            Prueba con otra búsqueda o agrega un nuevo producto.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {productos.map((p) => {
            const categoriaNombre =
              p.categoria?.nombre || p.categoriaNombre || p.categoria_nombre;

            return (
              <div
                key={p.id}
                className="flex flex-col rounded-2xl bg-gris-oscuro-acro p-4 sm:p-5 shadow-lg border border-border/10 transition-transform hover:-translate-y-0.5"
              >
                {/* Fila Superior: Nombre del producto y Botones de Acción */}
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold text-blanco-acro leading-tight">
                    {p.nombre}
                  </h2>

                  {/* Iconos de Acción: Editar y Eliminar */}
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      aria-label="Editar producto"
                      onClick={() => router.push(`/inventario/${p.id}`)}
                      className="rounded-lg p-1 text-amarillo-acro transition-colors hover:bg-amarillo-acro/10"
                    >
                      <Edit2 className="size-5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Eliminar producto"
                      onClick={() => setDeletingProduct(p)}
                      className="rounded-lg p-1 text-amarillo-acro transition-colors hover:bg-acro-danger/10 hover:text-acro-danger"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                </div>

                {/* Fila de Categoría */}
                {categoriaNombre && (
                  <div className="mt-1 flex items-center gap-1.5 text-sm font-normal text-blanco-acro">
                    <Tag className="size-4 text-amarillo-acro shrink-0" />
                    <span>{categoriaNombre}</span>
                  </div>
                )}

                {/* Subtítulo / Descripción */}
                {p.descripcion && (
                  <p className="mt-1 text-sm text-acro-muted leading-relaxed">
                    {p.descripcion}
                  </p>
                )}

                {/* Pie de la tarjeta */}
                <div className="mt-4 flex items-center justify-end gap-4 text-sm font-medium">
                  <span className="text-acro-muted">
                    Precio{" "}
                    <span className="font-semibold text-blanco-acro ml-1">
                      {p.precio} $
                    </span>
                  </span>
                  <span className="text-acro-muted">
                    Stock{" "}
                    <span className="font-semibold text-blanco-acro ml-1">
                      {p.stock} unid
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Botón Flotante para Agregar  */}
      <button
        type="button"
        aria-label="Agregar producto"
        onClick={() => router.push("/inventario/nuevo")}
        className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-2xl bg-amarillo-acro text-negro-fondo-acro shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer sm:bottom-8 sm:right-8 sm:size-16"
      >
        <Plus className="size-8 stroke-[2.5]" />
      </button>

      {/* Modal de Confirmación de Eliminación */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-gris-oscuro-acro p-6 shadow-2xl border border-gris-claro-acro/30">
            <h3 className="text-xl font-bold text-blanco-acro">
              ¿Eliminar producto?
            </h3>
            <p className="mt-2 text-base text-acro-muted">
              ¿Estás seguro de que deseas eliminar{" "}
              <strong className="text-blanco-acro">
                {deletingProduct.nombre}
              </strong>{" "}
              del inventario? Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="rounded-xl px-4 py-2.5 text-base font-medium text-acro-muted hover:bg-gris-claro-acro/10 hover:text-blanco-acro"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={eliminarMutation.isPending}
                onClick={handleDeleteConfirm}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-acro-danger px-6 text-base font-bold text-blanco-acro transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {eliminarMutation.isPending ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : null}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
