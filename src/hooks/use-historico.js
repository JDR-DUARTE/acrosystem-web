"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error de red.");
  return data;
}

export function useHistorico(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.plan) params.set("plan", filters.plan);
  if (filters.fechaDesde) params.set("fechaDesde", filters.fechaDesde);
  if (filters.fechaHasta) params.set("fechaHasta", filters.fechaHasta);
  const qs = params.toString();

  return useQuery({
    queryKey: ["historico-checkin", filters],
    queryFn: () =>
      fetchJson(`/api/checkin${qs ? `?${qs}` : ""}`).then((d) => d?.historico ?? []),
  });
}