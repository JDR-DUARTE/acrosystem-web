"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LockKeyhole, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const supabase = createClient();
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (err) {
        setError("Credenciales inválidas. Verifica tus datos.");
        setPending(false);
      } else {
        // Hard refresh para asegurar que el middleware reconozca las cookies nuevas de sesión
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("Ocurrió un error inesperado.");
      setPending(false);
    }
  };

  return (
    <div className="w-full max-w-[364px] rounded-xl bg-gris-oscuro-acro px-4 py-8 shadow-[inset_0px_4px_4px_0px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col items-center">
        <Image
          src="/logo-acro.png"
          alt="Acrofobia"
          width={150}
          height={150}
          priority
          className="size-[150px] object-contain"
        />
        <h1 className="mt-2 text-2xl font-bold text-amarillo-acro">
          AcroSystem
        </h1>
      </div>

      <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className=" flex items-center text-lg text-gris-claro-acro"
          >
            <User className="size-6" />
            Correo
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-16 w-full rounded-xl !bg-gris-claro-acro pl-4 pr-4 text-lg text-blanco-acro placeholder:text-blanco-acro/80 focus:outline-none focus:ring-2 focus:ring-amarillo-acro"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="flex items-center text-lg text-gris-claro-acro"
          >
            <LockKeyhole className="size-6" />
            Contraseña
          </label>
          <div className="relative ">
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-16 w-full rounded-xl !bg-gris-oscuro-acro pl-4 pr-4 text-lg text-blanco-acro placeholder:text-blanco-acro/80 focus:outline-none focus:ring-2 focus:ring-amarillo-acro"
            />
          </div>
        </div>

        {error ? (
          <p className="text-sm text-acro-danger" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-4 flex h-16 w-full items-center justify-center gap-2 rounded-xl bg-amarillo-acro font-bold text-lg text-negro-fondo-acro transition-colors hover:bg-amarillo-acro/70 disabled:opacity-70"
        >
          {pending ? <Loader2 className="size-5 animate-spin" /> : null}
          Ingresar
        </button>

        <Link
          href="/forgot-password"
          className="text-center text-lg text-acro-muted hover:text-blanco-acro"
        >
          Olvide mi contraseña
        </Link>
      </form>
    </div>
  );
}
