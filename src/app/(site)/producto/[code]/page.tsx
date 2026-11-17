import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import AddToCart from "@/components/site/AddToCart";
import { createClient } from "@/lib/supabase/server";
import { getProductByCode } from "@/lib/catalog";
import { availabilityText, edadTexto, imageUrl, isAvailable, usd } from "@/lib/format";
import type { AttributeDefinition, Product } from "@/lib/types";

const h2 = "mb-4 font-display text-[26px] font-bold uppercase";

async function Ficha({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getProductByCode(decodeURIComponent(code));
  if (!data) notFound();
  const { categories, product_images, ...resto } = data as typeof data & {
    categories: { name: string; slug: string } | null;
    product_images: { id: string; path: string; alt: string; is_cover: boolean; sort_order: number }[];
  };
  const p = resto as unknown as Product;
  const imgs = [...product_images].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order);

  const supabase = await createClient();
  const { data: defs } = await supabase.from("attribute_definitions").select("*").eq("category_id", p.category_id).order("sort_order");
  const attrs = p.attributes as Record<string, string | number>;
  const specs = ((defs ?? []) as AttributeDefinition[])
    .filter((d) => attrs[d.key] !== undefined && attrs[d.key] !== "")
    .map((d) => {
      let v = String(attrs[d.key]);
      if (d.data_type === "date") v = new Date(v + "T12:00:00").toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" }) + (d.key === "fecha_nacimiento" ? ` (${edadTexto(String(attrs[d.key]))})` : "");
      if (d.unit) v += ` ${d.unit}`;
      return { k: d.label, v };
    });
  const deps = Object.entries(p.genetics as Record<string, string | number>);
  const ok = isAvailable(p);

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-16 pt-8">
      <Link href="/catalogo" className="font-semibold text-verde-oscuro">← Volver al catálogo</Link>
      <div className="mt-4 flex flex-wrap items-start gap-12">
        <div className="flex min-w-0 flex-1 basis-[420px] flex-col gap-3">
          <div className="flex h-[420px] items-center justify-center overflow-hidden rounded-sm bg-[#E9E2D2] text-[#6A654F]">
            {imgs[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl(imgs[0].path)} alt={imgs[0].alt || p.name} className="h-full w-full object-cover" />
            ) : (
              <span className="font-semibold">Foto próximamente</span>
            )}
          </div>
          {imgs.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {imgs.slice(1, 4).map((im) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={im.id} src={imageUrl(im.path)} alt={im.alt || p.name} className="h-24 w-full rounded-sm object-cover" loading="lazy" />
              ))}
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 basis-[420px] flex-col gap-4">
          <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-widest text-[#565B50]">
            <span>{categories?.name}</span>
            <span>Código {p.code}</span>
          </div>
          <h1 className="font-display text-6xl font-bold uppercase leading-[1.05]">{p.name}</h1>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="text-[34px] font-semibold text-verde-oscuro">{usd(p.price_usd)}</span>
            <span className="text-[#565B50]">{p.unit_label}</span>
          </div>
          <span className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${ok ? "bg-[#E3EFE2] text-[#1F5A36]" : "bg-[#F8E6D6] text-[#7A3A08]"}`}>
            {ok ? "●" : "◆"} {availabilityText(p)}
          </span>
          {p.description && <p className="whitespace-pre-line">{p.description}</p>}
          <AddToCart p={p} disponible={ok} />
          <p className="rounded-sm bg-[#F0EADC] p-3.5 text-sm text-[#565B50]">
            Pedido sujeto a disponibilidad y confirmación del equipo de El Jaral. No se cobra en el sitio: el pago y la entrega se coordinan por WhatsApp.
          </p>
        </div>
      </div>

      <div className="mt-14 flex flex-wrap items-start gap-12">
        <section className="min-w-0 flex-1 basis-[420px]">
          <h2 className={h2}>Ficha técnica</h2>
          <dl className="border-t border-[#E4DDCD]">
            {specs.map((s) => (
              <div key={s.k} className="flex flex-wrap gap-x-4 border-b border-[#E4DDCD] py-3">
                <dt className="basis-48 text-sm text-[#565B50]">{s.k}</dt>
                <dd className="min-w-0 flex-1 basis-48 whitespace-pre-line font-medium">{s.v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="min-w-0 flex-1 basis-[420px]">
          {deps.length > 0 && (
            <>
              <h2 className={h2}>Información genética</h2>
              <div className="overflow-x-auto rounded-sm border border-[#E4DDCD] bg-white">
                <table className="w-full min-w-[320px] text-[15px]">
                  <thead className="bg-[#F0EADC] text-left">
                    <tr><th className="px-4 py-3 font-semibold">Característica</th><th className="px-4 py-3 text-right font-semibold">Valor</th></tr>
                  </thead>
                  <tbody>
                    {deps.map(([k, v]) => (
                      <tr key={k} className="border-t border-[#E4DDCD]"><td className="px-4 py-3">{k}</td><td className="px-4 py-3 text-right font-semibold tabular-nums">{String(v)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {p.commercial_info && (
            <>
              <h2 className={`${h2} mt-8`}>Información comercial</h2>
              <p className="whitespace-pre-line text-[#4B5046]">{p.commercial_info}</p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default function ProductoPage({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-[1200px] px-6 py-16">Cargando…</p>}>
      <Ficha params={params} />
    </Suspense>
  );
}
