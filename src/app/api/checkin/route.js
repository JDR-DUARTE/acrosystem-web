import { NextResponse } from "next/server";
import { getCurrentEmployee } from "@/lib/auth";
import { registrarCheckin, listHistoricoCheckin } from "@/lib/api/checkin";

export async function GET(request) {
  const { employee } = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  try {
    const historico = await listHistoricoCheckin({
      search: searchParams.get("search") ?? undefined,
      plan: searchParams.get("plan") ?? undefined,
      fechaDesde: searchParams.get("fechaDesde") ?? undefined,
      fechaHasta: searchParams.get("fechaHasta") ?? undefined,
    });
    return NextResponse.json({ historico });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { employee } = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (!body.query) {
    return NextResponse.json(
      { error: "Ingresa un código QR o cédula." },
      { status: 400 },
    );
  }

  try {
    const resultado = await registrarCheckin({ query: body.query });
    return NextResponse.json(resultado);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
