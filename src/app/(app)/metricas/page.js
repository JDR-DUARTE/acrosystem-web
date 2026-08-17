import { redirect } from "next/navigation";
import MetricasView from "@/components/metricas/metricas-view";
import { getCurrentEmployee } from "@/lib/auth";

export const metadata = { title: "Métricas · AcroSystem" };

export default async function MetricasPage() {
  const { isAdmin } = await getCurrentEmployee();
  if (!isAdmin) {
    redirect("/dashboard");
  }
  return <MetricasView />;
}
