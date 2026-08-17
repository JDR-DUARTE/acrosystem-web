"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error de red.");
  return data;
}

export function useConfiguracion() {
  return useQuery({
    queryKey: ["configuracion"],
    queryFn: () => fetchJson("/api/configuracion"),
  });
}

export function useAddConfiguracion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      fetchJson("/api/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracion"] });
    },
  });
}

export function useDeleteConfiguracion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      fetchJson("/api/configuracion", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracion"] });
    },
  });
}
