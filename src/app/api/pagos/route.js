import { NextResponse } from "next/server";
import { getCurrentEmployee } from "@/lib/auth";
import { listPagos } from "@/lib/api/tienda";

export async function GET(request) {
  const { employee } = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  try {
    const pagos = await listPagos({
      search: searchParams.get("search") ?? undefined,
      producto: searchParams.get("producto") ?? undefined,
      fechaDesde: searchParams.get("fechaDesde") ?? undefined,
      fechaHasta: searchParams.get("fechaHasta") ?? undefined,
    });
    return NextResponse.json({ pagos });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
