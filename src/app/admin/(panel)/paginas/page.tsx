import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PAGINAS, claveAjuste, type ContenidoPagina } from "@/lib/paginas";

export default async function PaginasAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key,value").like("key", "public.pagina.%");
  const val = new Map((data ?? []).map((r) => [r.key, r.value as ContenidoPagina]));
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold uppercase">Páginas de Historia</h1>
      <p className="mt-1 text-sm text-neutral-600">Los textos que se ven en el menú “Historia” del sitio.</p>
      <ul className="mt-6 divide-y rounded-lg bg-white shadow">
        {PAGINAS.map((p) => {
          const c = val.get(claveAjuste(p.slug));
          const cargada = !!c && p.campos.some((f) => (c[f.k] ?? "").trim());
          return (
            <li key={p.slug} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{p.titulo}</p>
                <p className={`text-xs ${cargada ? "text-green-700" : "text-orange-700"}`}>{cargada ? "Con contenido" : "Sin contenido todavía"}</p>
              </div>
              <Link href={`/admin/paginas/${p.slug}`} className="text-verde-oscuro underline">Editar</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
