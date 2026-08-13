import { redirect } from "next/navigation";
import ConfiguracionView from "@/components/configuracion/configuracion-view";
import { getCurrentEmployee } from "@/lib/auth";

export const metadata = { title: "Configuración · AcroSystem" };

export default async function ConfiguracionPage() {
  const { isAdmin } = await getCurrentEmployee();
  if (!isAdmin) {
    redirect("/dashboard");
  }
  return <ConfiguracionView />;
}
