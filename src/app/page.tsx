import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";
import { Suspense } from "react";

async function Categorias() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description,sale_mode,sort_order")
    .order("sort_order");
  const categories = (data ?? []) as Category[];

  if (error) return <p className="mt-6 text-red-600">Error: {error.message}</p>;
  return (
    <ul className="mt-6 space-y-2">
      {categories.map((c) => (
        <li key={c.id} className="rounded border p-3">
          <strong>{c.name}</strong> <span className="text-neutral-500">({c.sale_mode})</span>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-display text-4xl font-bold uppercase">El Jaral</h1>
      <p className="mt-2 text-sm text-neutral-500">Conexión de prueba con Supabase</p>
      <Suspense fallback={<p className="mt-6">Cargando…</p>}>
        <Categorias />
      </Suspense>
    </main>
  );
}
