import Link from "next/link";
import { Suspense } from "react";
import ProductCard from "@/components/site/ProductCard";
import { getCategories, getPublished } from "@/lib/catalog";

const hFont = "font-display uppercase font-bold";

async function Contenido() {
  const [cats, productos] = await Promise.all([getCategories(), getPublished()]);
  const conteo = (slug: string) => productos.filter((p) => p.category_slug === slug).length;
  const destacados = (productos.some((p) => p.featured) ? productos.filter((p) => p.featured) : productos).slice(0, 6);

  return (
    <>
      <section className="mx-auto max-w-[1200px] px-6 pb-6 pt-16">
        <div className="grid gap-6 md:grid-cols-2">
          {cats.map((c, i) => (
            <Link
              key={c.id}
              href={`/catalogo?cat=${c.slug}`}
              className={`flex min-h-64 flex-col gap-3 p-9 transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(10,10,10,.16)] ${
                (i + Math.floor(i / 2)) % 2 === 0 ? "bg-verde-oscuro text-white" : "bg-naranja text-[#1A1408]"
              }`}
            >
              <span className="text-[13px] font-semibold uppercase tracking-[0.16em]">0{i + 1} · Categoría</span>
              <span className={`${hFont} text-5xl leading-[0.95]`}>{c.name}</span>
              <span className="opacity-90">{c.description}</span>
              <span className="mt-auto font-semibold">{conteo(c.slug)} publicados →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pt-12">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className={`${hFont} text-5xl leading-none`}>{productos.some((p) => p.featured) ? "Destacados" : "Últimos publicados"}</h2>
          <Link href="/catalogo" className="font-semibold text-verde-oscuro hover:text-[#B4500C]">Ver todo el catálogo →</Link>
        </div>
        {destacados.length === 0 ? (
          <p className="rounded-sm border border-[#E4DDCD] bg-white p-10 text-center text-[#565B50]">Pronto vamos a publicar los primeros productos.</p>
        ) : (
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(270px,1fr))]">
            {destacados.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
    </>
  );
}

export default function Home() {
  return (
    <main>
      <section className="bg-negro text-[#F6F2E8]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-14 px-6 pb-24 pt-[72px]">
          <div className="flex flex-1 basis-[420px] flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F2B27E]">Cabaña Senepol · Santa Cruz, Bolivia</p>
            <h1 className={`${hFont} text-[clamp(52px,8vw,104px)] leading-[0.92]`}>
              Genética <span className="text-naranja">Senepol</span> criada a campo, hecha para el trópico
            </h1>
            <p className="max-w-[520px] text-lg text-[#D9DDD2]">
              Desde 2010 criamos Senepol en Santa Cruz: toros reproductores, matrices, semen y embriones con ficha técnica y precio publicado. Armá tu pedido en línea y lo coordinamos con vos por WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/catalogo?cat=toros-reproductores" className="flex min-h-12 items-center rounded-sm bg-naranja px-6 font-semibold text-[#1A1408] hover:brightness-95">Ver reproductores</Link>
              <Link href="/historia/quienes-somos" className="flex min-h-12 items-center rounded-sm border border-[#8FA394] px-6 font-semibold hover:bg-white/10">Conocé El Jaral</Link>
            </div>
          </div>
          <div className="flex min-h-[360px] flex-1 basis-[420px] items-center justify-center bg-verde-oscuro p-8 text-center shadow-[14px_14px_0_#2E9E3A]">
            <p className={`${hFont} text-6xl leading-none text-white`}>
              Rústico<br />
              <span className="text-naranja">Pelo corto</span><br />
              Hecho para el calor
            </p>
          </div>
        </div>
      </section>
      <Suspense fallback={<p className="mx-auto max-w-[1200px] px-6 py-16">Cargando catálogo…</p>}>
        <Contenido />
      </Suspense>
      <section className="mx-auto max-w-[1200px] px-6 pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-verde-oscuro">¿Por qué Senepol?</p>
        <h2 className={`${hFont} mt-2 max-w-[760px] text-5xl leading-none`}>El taurino de campo que rinde más con menos</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Rusticidad", "Pelo corto, resistencia al calor y a los parásitos: se adapta al trópico sin vivir a puro cuidado."],
            ["Precocidad", "Madurez reproductiva temprana, buena ganancia de peso y rápida terminación frigorífica."],
            ["Mansedumbre", "Carácter dócil, que facilita el manejo y baja los costos del día a día."],
            ["Rentabilidad", "Su vistoso color marrón consigue precios diferenciados, con manejo simple y costos bajos."],
          ].map(([t, d]) => (
            <div key={t} className="border-t-4 border-naranja bg-white p-6 shadow-sm">
              <h3 className={`${hFont} text-3xl text-verde-oscuro`}>{t}</h3>
              <p className="mt-2 text-[#35392F]">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-[1200px] px-6">
        <div className="grid gap-10 bg-negro p-10 text-[#F6F2E8] md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F2B27E]">Nuestra forma de trabajar</p>
            <h2 className={`${hFont} mt-2 text-5xl leading-none`}>Alta tecnología reproductiva, cría 100% a campo</h2>
          </div>
          <div className="flex flex-col gap-4 text-[#D9DDD2]">
            <p>Elegimos los apareamientos con evaluación genética y genómica, y multiplicamos la raza con inseminación, fertilización in vitro y transferencia de embriones.</p>
            <p>Los animales se crían a campo, con bienestar animal, buena sombra y pastoreo racional sin agroquímicos, para que respondan a lo que exigen nuestros clientes.</p>
            <Link href="/historia/trayectoria" className="font-semibold text-naranja hover:underline">Conocé nuestra trayectoria →</Link>
          </div>
        </div>
      </section>

      <section className="mt-16 bg-verde-oscuro text-[#F6F2E8]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6 px-6 py-14">
          <div className="flex-1 basis-[420px]">
            <h2 className={`${hFont} text-3xl`}>¿Buscás genética Senepol para tu hato?</h2>
            <p className="mt-2 text-[#D9DDD2]">Armá tu pedido en línea y lo confirmamos por WhatsApp: disponibilidad, pago y entrega. Y si querés verlos en persona, será un privilegio recibirte en El Jaral.</p>
          </div>
          <Link href="/catalogo" className="flex min-h-12 items-center rounded-sm bg-naranja px-6 font-semibold text-[#1A1408] hover:brightness-95">Explorar el catálogo</Link>
        </div>
      </section>
    </main>
  );
}
