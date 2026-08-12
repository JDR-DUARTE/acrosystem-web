import { NextResponse } from "next/server";
import { getCurrentEmployee } from "@/lib/auth";
import { listCategoriasProducto } from "@/lib/api/tienda";

export async function GET() {
  const { employee } = await getCurrentEmployee();
  if (!employee) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const categorias = await listCategoriasProducto();
    return NextResponse.json({ categorias });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
