import { redirect } from "next/navigation";

// Página principal raíz (/)
// En nuestro caso, la página principal simplemente redirige al usuario al panel de control (/dashboard).
// Si el usuario no está logueado, el middleware de Next.js se encargará de llevarlo a /login automáticamente.
export default function Home() {
  redirect("/dashboard");
}