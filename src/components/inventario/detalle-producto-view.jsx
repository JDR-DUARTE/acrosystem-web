/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCategorias,
  useProducto,
  useCrearProducto,
  useActualizarProducto,
} from "@/hooks/use-tienda";

export default function DetalleProductoView({ productId }) {
  const router = useRouter();

  // Queries & Mutations
  const { data: categorias = [] } = useCategorias();
  const { data: producto, isLoading: isLoadingProd } = useProducto(productId);

  const crearMutation = useCrearProducto();
  const actualizarMutation = useActualizarProducto();

  // Form State
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [precio, setPrecio] = useState("");
  const [stockActual, setStockActual] = useState("");
  const [stockMinimo, setStockMinimo] = useState("5");
  const [observaciones, setObservaciones] = useState("");

  // Populate data when editing an existing product
  useEffect(() => {
    if (producto) {
      setNombre(producto.nombre || "");
      setDescripcion(producto.descripcion || "");
      setCategoriaId(
        producto.categoria?.id ? String(producto.categoria.id) : "",
      );
      setPrecio(
        producto.precio !== undefined && producto.precio !== null
          ? String(producto.precio)
          : "",
      );
      setStockActual(
        producto.stock !== undefined && producto.stock !== null
          ? String(producto.stock)
          : "",
      );
      if (producto.stockMinimo !== undefined) {
        setStockMinimo(String(producto.stockMinimo));
      }
      setObservaciones(""); // Reiniciar observaciones en edición
    }
  }, [producto]);

  const isSaving = crearMutation.isPending || actualizarMutation.isPending;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!nombre.trim()) {
      toast.error("El nombre del producto es obligatorio.");
      return;
    }

    try {
      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: precio !== "" ? Number(precio) : 0,
        stock: stockActual !== "" ? Number(stockActual) : 0,
        stockMinimo: stockMinimo !== "" ? Number(stockMinimo) : 5,
        idCategoria: categoriaId ? Number(categoriaId) : null,
        observaciones: observaciones.trim(),
      };

      if (productId) {
        await actualizarMutation.mutateAsync({
          id: productId,
          ...payload,
        });
        toast.success("Producto actualizado exitosamente.");
      } else {
        await crearMutation.mutateAsync(payload);
        toast.success("Producto guardado exitosamente en el inventario.");
      }

      // Regresa a la vista de inventario
      router.push("/inventario");
    } catch (err) {
      toast.error(err.message || "Error al guardar el producto.");
    }
  };

  if (productId && isLoadingProd) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-amarillo-acro" />
      </div>
    );
  }

  const inputClass =
    "h-12 w-full rounded-xl bg-[#3E3E3E] px-4 text-base text-blanco-acro placeholder:text-acro-muted border-none focus:outline-none focus:ring-1 focus:ring-amarillo-acro";

  return (
    <section className="relative pb-28">
      {/* Encabezado: Botón Volver y Título */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/inventario"
          className="rounded-lg p-1 text-blanco-acro transition-colors hover:bg-gris-claro-acro/10"
          aria-label="Volver a Inventario"
        >
          <ArrowLeft className="size-7 sm:size-8" />
        </Link>
        <h1 className="text-2xl font-bold text-blanco-acro sm:text-3xl lg:text-4xl">
          Detalle de Producto
        </h1>
      </div>

      {/* Formulario adaptativo (Mobile First 1 columna, Desktop 2 columnas) */}
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-6 md:gap-y-5">
          {/* Nombre */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="nombre"
              className="text-base font-normal text-blanco-acro"
            >
              *Nombre
            </Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del producto"
              className={inputClass}
              required
            />
          </div>

          {/* Categoría */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="categoria"
              className="text-base font-normal text-blanco-acro"
            >
              *Categoría
            </Label>
            <select
              id="categoria"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className={inputClass}
            >
              <option value="" className="bg-[#1C1C1C]">
                Selecciona una categoría
              </option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#1C1C1C]">
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="descripcion"
              className="text-base font-normal text-blanco-acro"
            >
              *Descripción
            </Label>
            <Input
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción o detalle"
              className={inputClass}
            />
          </div>

          {/* Precio */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="precio"
              className="text-base font-normal text-blanco-acro"
            >
              Precio ($)
            </Label>
            <Input
              id="precio"
              type="number"
              step="0.01"
              min="0"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>

          {/* Stock actual */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="stock"
              className="text-base font-normal text-blanco-acro"
            >
              Stock actual
            </Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={stockActual}
              onChange={(e) => setStockActual(e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>

          {/* Stock mínimo */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="stock-min"
              className="text-base font-normal text-blanco-acro"
            >
              Stock mínimo
            </Label>
            <Input
              id="stock-min"
              type="number"
              min="0"
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
              placeholder="5"
              className={inputClass}
            />
          </div>

          {/* Observaciones (Ocupa ambas columnas en Desktop) */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label
              htmlFor="observaciones"
              className="text-base font-normal text-blanco-acro"
            >
              Observaciones del Ajuste (Opcional)
            </Label>
            <Input
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej. Ingreso de mercancía nueva / Merma por daño..."
              className={inputClass}
            />
          </div>
        </div>

        {/* Botón Flotante para Guardar (FAB) */}
        <button
          type="submit"
          disabled={isSaving}
          aria-label="Guardar producto"
          className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-2xl bg-amarillo-acro text-negro-fondo-acro shadow-2xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer sm:bottom-8 sm:right-8 sm:size-16"
        >
          {isSaving ? (
            <Loader2 className="size-8 animate-spin" />
          ) : (
            <Save className="size-8 stroke-[2.2]" />
          )}
        </button>
      </form>
    </section>
  );
}
