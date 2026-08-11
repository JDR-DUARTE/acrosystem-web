"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchJson(url) {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error de red.");
  return data;
}

export function useMetricas() {
  return useQuery({
    queryKey: ["metricas"],
    queryFn: () => fetchJson("/api/metricas"),
  });
}