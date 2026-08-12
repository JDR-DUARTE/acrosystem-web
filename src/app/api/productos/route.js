import { NextResponse } from "next/server";
import { getCurrentEmployee } from "@/lib/auth";
import { listProductos, crearProducto } from "@/lib/api/tienda";

export async function GET(request) {
  const { employee } = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  try {
    const productos = await listProductos({
      search: searchParams.get("search") ?? undefined,
      categoria: searchParams.get("categoria") ?? undefined,
      stockBajo: searchParams.get("stockBajo") === "true",
    });
    return NextResponse.json({ productos });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { employee } = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const producto = await crearProducto(body);
    return NextResponse.json({ producto }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
