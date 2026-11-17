import { Suspense } from "react";
import ProductCard from "@/components/site/ProductCard";
import { getCategories, getPublished } from "@/lib/catalog";
import { isAvailable } from "@/lib/format";

type SP = { q?: string; cat?: string; precio?: string; disp?: string; orden?: string };
const campo = "mt-1.5 min-h-11 w-full rounded-sm border border-[#B9B29E] bg-white px-3";

async function Listado({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [cats, todos] = await Promise.all([getCategories(), getPublished()]);

  let items = todos;
  if (sp.cat) items = items.filter((p) => p.category_slug === sp.cat);
  if (sp.q) {
    const q = sp.q.toLowerCase();
    items = items.filter((p) => `${p.name} ${p.code}`.toLowerCase().includes(q));
  }
  if (sp.precio) {
    const [min, max] = sp.precio.split("-").map(Number);
    items = items.filter((p) => Number(p.price_usd) >= min && (!max || Number(p.price_usd) <= max));
  }
  if (sp.disp === "1") items = items.filter(isAvailable);
  if (sp.orden === "precio-asc") items = [...items].sort((a, b) => Number(a.price_usd) - Number(b.price_usd));
  if (sp.orden === "precio-desc") items = [...items].sort((a, b) => Number(b.price_usd) - Number(a.price_usd));

  return (
    <>
      <p className="mb-8 text-[#565B50]">{items.length} productos</p>
      <div className="flex flex-wrap items-start gap-8">
        <form method="get" aria-label="Filtros" className="flex max-w-xs flex-1 basis-56 flex-col gap-4 rounded-sm border border-[#E4DDCD] bg-white p-5">
          <label className="text-[13px] font-semibold">
            Buscar
            <input name="q" type="search" defaultValue={sp.q ?? ""} placeholder="Nombre o código" className={campo} />
          </label>
          <label className="text-[13px] font-semibold">
            Categoría
            <select name="cat" defaultValue={sp.cat ?? ""} className={campo}>
              <option value="">Todas</option>
              {cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </label>
          <label className="text-[13px] font-semibold">
            Precio
            <select name="precio" defaultValue={sp.precio ?? ""} className={campo}>
              <option value="">Todos</option>
              <option value="0-50">Hasta $us 50</option>
              <option value="50-500">$us 50 a 500</option>
              <option value="500-2000">$us 500 a 2.000</option>
              <option value="2000-0">Más de $us 2.000</option>
            </select>
          </label>
          <label className="flex min-h-11 items-center gap-2.5 text-[15px]">
            <input type="checkbox" name="disp" value="1" defaultChecked={sp.disp === "1"} className="h-5 w-5 accent-verde-oscuro" />
            Solo disponibles
          </label>
          <label className="border-t border-[#E4DDCD] pt-4 text-[13px] font-semibold">
            Ordenar por
            <select name="orden" defaultValue={sp.orden ?? ""} className={campo}>
              <option value="">Más recientes</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
            </select>
          </label>
          <button className="min-h-11 rounded-sm bg-verde-oscuro font-semibold text-white hover:brightness-110">Aplicar filtros</button>
          <a href="/catalogo" className="font-semibold text-verde-oscuro underline">Limpiar filtros</a>
        </form>
        <div className="min-w-0 flex-[999_1_560px]">
          {items.length === 0 ? (
            <p className="rounded-sm border border-[#E4DDCD] bg-white p-12 text-center text-[#565B50]">Ningún producto coincide con esos filtros.</p>
          ) : (
            <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
              {items.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Catalogo({ searchParams }: { searchParams: Promise<SP> }) {
  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-16 pt-12">
      <h1 className="mb-2 font-display text-6xl font-bold uppercase leading-none">Catálogo</h1>
      <Suspense fallback={<p className="py-8">Cargando…</p>}>
        <Listado searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
