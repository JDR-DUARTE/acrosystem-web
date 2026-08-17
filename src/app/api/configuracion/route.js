import { NextResponse } from "next/server";
import {
  getConfiguracionData,
  addPlan,
  addPromo,
  addPersonal,
  deletePlan,
  deletePromo,
  deletePersonal,
} from "@/lib/api/configuracion";

export async function GET() {
  try {
    const data = await getConfiguracionData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (body.type === "PLAN") {
      const plan = await addPlan(body.data);
      return NextResponse.json({ plan });
    } else if (body.type === "PROMO") {
      const promo = await addPromo(body.data);
      return NextResponse.json({ promo });
    } else if (body.type === "PERSONAL") {
      const personal = await addPersonal(body.data);
      return NextResponse.json({ personal });
    }
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    if (body.type === "PLAN") {
      await deletePlan(body.id);
      return NextResponse.json({ success: true });
    } else if (body.type === "PROMO") {
      await deletePromo(body.id);
      return NextResponse.json({ success: true });
    } else if (body.type === "PERSONAL") {
      await deletePersonal(body.id);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
