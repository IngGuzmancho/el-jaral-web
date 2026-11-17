"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }
    router.replace("/admin/pedidos");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-negro p-6">
      <form onSubmit={entrar} className="w-full max-w-sm rounded-lg bg-white p-8 shadow-xl">
        <h1 className="font-display text-3xl font-extrabold uppercase text-negro">
          El Jaral <span className="text-naranja">· Panel</span>
        </h1>
        <p className="mt-1 text-sm text-neutral-500">Ingresá con tu cuenta de administrador.</p>
        <label className="mt-6 block text-sm font-medium">Correo</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
        />
        <label className="mt-4 block text-sm font-medium">Contraseña</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="mt-6 w-full rounded bg-naranja py-2.5 font-display text-lg font-bold uppercase text-negro hover:brightness-95 disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
