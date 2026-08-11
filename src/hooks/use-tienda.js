"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error de red.");
  return data;
}

export function useProductos(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.categoria) params.set("categoria", String(filters.categoria));
  if (filters.stockBajo) params.set("stockBajo", "true");
  const qs = params.toString();

  return useQuery({
    queryKey: ["productos", filters],
    queryFn: () =>
      fetchJson(`/api/productos${qs ? `?${qs}` : ""}`).then((d) => d?.productos ?? []),
  });
}

export function useCategorias() {
  return useQuery({
    queryKey: ["categorias"],
    queryFn: () => fetchJson("/api/categorias").then((d) => d?.categorias ?? []),
  });
}

export function useCrearProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) =>
      fetchJson("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function useActualizarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }) =>
      fetchJson(`/api/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function useEliminarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      fetchJson(`/api/productos/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function useCrearVenta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) =>
      fetchJson("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}