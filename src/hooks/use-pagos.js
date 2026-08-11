"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error de red.");
  return data;
}

export function usePagos(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.producto) params.set("producto", filters.producto);
  if (filters.fechaDesde) params.set("fechaDesde", filters.fechaDesde);
  if (filters.fechaHasta) params.set("fechaHasta", filters.fechaHasta);
  const qs = params.toString();

  return useQuery({
    queryKey: ["pagos", filters],
    queryFn: () =>
      fetchJson(`/api/pagos${qs ? `?${qs}` : ""}`).then((d) => d?.pagos ?? []),
  });
}