import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Recuperar contraseña · AcroSystem",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-negro-fondo-acro p-6">
      <div className="w-full max-w-[364px] rounded-xl bg-gris-oscuro-acro px-4 py-8">
        <div className="flex flex-col items-center">
          <Image
            src="/logo-acro.png"
            alt="Acrofobia"
            width={120}
            height={120}
            className="size-[120px] object-contain"
          />
          <h1 className="mt-2 text-xl font-bold text-amarillo-acro">
            Recuperar contraseña
          </h1>
        </div>
        <p className="mt-6 text-center text-sm text-acro-muted">
          Contacta a un administrador para restablecer tu acceso.
        </p>
        <Link
          href="/login"
          className="mt-6 flex h-14 w-full items-center justify-center rounded-xl bg-gris-claro-acro text-blanco-acro transition-colors hover:bg-gris-claro-acro/80"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    </main>
  );
}