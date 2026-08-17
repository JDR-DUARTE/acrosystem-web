import { NextResponse } from "next/server";
import { getMetricasData } from "@/lib/api/metricas";

export async function GET() {
  try {
    const data = await getMetricasData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
