import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/format";
import { PAGINAS, claveAjuste, type ContenidoPagina } from "@/lib/paginas";

async function Contenido({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const def = PAGINAS.find((p) => p.slug === slug);
  if (!def) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("value").eq("key", claveAjuste(slug)).maybeSingle();
  const c = (data?.value ?? {}) as ContenidoPagina;
  const hayTexto = def.campos.some((f) => (c[f.k] ?? "").trim());

  return (
    <main className="mx-auto max-w-[960px] px-6 pb-16 pt-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-verde-oscuro">Historia</p>
      <h1 className="mt-2 font-display text-6xl font-bold uppercase leading-none">{def.titulo}</h1>
      {!hayTexto ? (
        <p className="mt-10 rounded-sm border border-[#E4DDCD] bg-white p-10 text-center text-[#565B50]">Esta sección está en preparación. Muy pronto vas a encontrarla completa.</p>
      ) : (
        <div className="mt-10 flex flex-col gap-8">
          {c.imagen && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl(c.imagen)} alt={def.titulo} className="max-h-[480px] w-full rounded-sm object-cover" />
          )}
          {def.campos.map((f) => {
            const txt = (c[f.k] ?? "").trim();
            if (!txt) return null;
            const titulo = def.campos.length > 1 ? f.label : null;
            return (
              <section key={f.k}>
                {titulo && <h2 className="mb-3 font-display text-4xl font-bold uppercase text-verde-oscuro">{titulo}</h2>}
                {f.k === "objetivos" ? (
                  <ul className="list-disc space-y-2 pl-6 text-lg text-[#35392F]">
                    {txt.split("\n").filter((l) => l.trim()).map((l, i) => <li key={i}>{l.trim()}</li>)}
                  </ul>
                ) : (
                  <p className="whitespace-pre-line text-lg leading-relaxed text-[#35392F]">{txt}</p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function HistoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-[960px] px-6 py-16">Cargando…</p>}>
      <Contenido params={params} />
    </Suspense>
  );
}
