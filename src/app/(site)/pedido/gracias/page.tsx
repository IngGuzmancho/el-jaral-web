import Link from "next/link";
import { Suspense } from "react";
import { usd, whatsappLink } from "@/lib/format";

async function Contenido({ searchParams }: { searchParams: Promise<{ n?: string; t?: string }> }) {
  const { n, t } = await searchParams;
  const numero = (n ?? "").slice(0, 20);
  const msg = `Hola, acabo de enviar el pedido ${numero} desde el sitio de El Jaral y quiero coordinar la confirmación.`;
  return (
    <div className="rounded-sm border border-[#E4DDCD] bg-white p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-verde-oscuro">Pedido recibido</p>
      <h1 className="mt-2 font-display text-5xl font-bold uppercase leading-none">{numero || "Gracias"}</h1>
      {t && <p className="mt-3 text-lg">Total estimado: <strong>{usd(Number(t))}</strong></p>}
      <p className="mt-4 text-[#4B5046]">
        Tu pedido quedó <strong>pendiente de confirmación</strong>. Nuestro equipo te va a escribir por WhatsApp para confirmar disponibilidad, coordinar el pago y la entrega. Si querés agilizar, escribinos vos con tu número de pedido.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={whatsappLink(msg)} target="_blank" rel="noreferrer" className="flex min-h-12 items-center rounded-sm bg-[#25D366] px-6 font-semibold text-[#06310f]">Escribir por WhatsApp</a>
        <Link href="/catalogo" className="flex min-h-12 items-center rounded-sm border border-verde-oscuro px-6 font-semibold text-verde-oscuro">Seguir viendo el catálogo</Link>
      </div>
    </div>
  );
}

export default function Gracias({ searchParams }: { searchParams: Promise<{ n?: string; t?: string }> }) {
  return (
    <main className="mx-auto max-w-[760px] px-6 pb-16 pt-12">
      <Suspense fallback={<p>Cargando…</p>}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
