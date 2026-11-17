import Link from "next/link";
import { notFound } from "next/navigation";
import PaginaForm from "@/components/admin/PaginaForm";
import { createClient } from "@/lib/supabase/server";
import { PAGINAS, claveAjuste, type ContenidoPagina } from "@/lib/paginas";

export default async function EditarPagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const def = PAGINAS.find((p) => p.slug === slug);
  if (!def) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("value").eq("key", claveAjuste(slug)).maybeSingle();
  return (
    <div className="space-y-4">
      <Link href="/admin/paginas" className="text-sm text-verde-oscuro underline">← Volver a páginas</Link>
      <h1 className="font-display text-3xl font-extrabold uppercase">{def.titulo}</h1>
      <PaginaForm def={def} inicial={(data?.value ?? {}) as ContenidoPagina} />
    </div>
  );
}
