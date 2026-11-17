import Link from "next/link";
import { notFound } from "next/navigation";
import OrderActions from "@/components/admin/OrderActions";
import { createClient } from "@/lib/supabase/server";
import { usd, whatsappLink } from "@/lib/format";
import { ENTREGAS, ESTADOS, PAGOS, type OrderStatus } from "@/lib/types";

const TEXTO_ALERTA: Record<string, string> = {
  no_disponible: "Este producto ya no está disponible (bloqueado o vendido).",
  pedido_duplicado: "Otro pedido pendiente pide este mismo animal.",
  stock_insuficiente: "No alcanzan las dosis en stock para este pedido.",
};

export default async function PedidoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: o }, { data: items }, { data: alertas }, { data: pagos }, { data: eventos }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
    supabase.from("order_item_alerts").select("*").eq("order_id", id),
    supabase.from("payments").select("*").eq("order_id", id).order("paid_at"),
    supabase.from("order_events").select("*").eq("order_id", id).order("created_at"),
  ]);
  if (!o) notFound();

  const b = o.buyer as Record<string, string | null>;
  const pagado = (pagos ?? []).reduce((s, p) => s + Number(p.amount_usd), 0);
  const alertaDe = (itemId: string) => (alertas ?? []).filter((a) => a.order_item_id === itemId).map((a) => TEXTO_ALERTA[a.alert as string] ?? a.alert);
  const wa = whatsappLink(`Hola ${b.full_name}, te escribimos de El Jaral por tu pedido ${o.number}.`).replace("wa.me/59177340100", `wa.me/${String(b.phone ?? "").replace(/\D/g, "")}`);

  return (
    <div className="space-y-6">
      <Link href="/admin/pedidos" className="text-sm text-verde-oscuro underline">← Volver a pedidos</Link>
      <div className="flex flex-wrap items-baseline gap-4">
        <h1 className="font-display text-3xl font-extrabold uppercase">{o.number}</h1>
        <span className="rounded bg-neutral-200 px-2 py-1 text-xs font-semibold">{ESTADOS[o.status as OrderStatus]}</span>
        <span className="text-sm text-neutral-600">Pago: {PAGOS[o.payment_status]}</span>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow">
          <h2 className="font-display text-lg font-bold uppercase">Cliente</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div><dt className="inline text-neutral-500">Nombre: </dt><dd className="inline font-medium">{b.full_name}</dd></div>
            <div><dt className="inline text-neutral-500">CI / NIT: </dt><dd className="inline">{b.doc_id}</dd></div>
            <div><dt className="inline text-neutral-500">Celular: </dt><dd className="inline">{b.phone}</dd></div>
            {b.email && <div><dt className="inline text-neutral-500">Correo: </dt><dd className="inline">{b.email}</dd></div>}
            <div><dt className="inline text-neutral-500">Lugar: </dt><dd className="inline">{b.city}, {b.department}</dd></div>
            {b.address && <div><dt className="inline text-neutral-500">Dirección: </dt><dd className="inline">{b.address}</dd></div>}
            <div><dt className="inline text-neutral-500">Entrega: </dt><dd className="inline">{ENTREGAS[o.delivery_method]}</dd></div>
          </dl>
          <a href={wa} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded bg-[#25D366] px-4 py-2 text-sm font-semibold text-[#06310f]">Escribirle por WhatsApp</a>
        </div>

        <div className="rounded-lg bg-white p-5 shadow">
          <h2 className="font-display text-lg font-bold uppercase">Productos</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {(items ?? []).map((it) => (
              <li key={it.id} className="border-b pb-3 last:border-0">
                <div className="flex justify-between gap-3">
                  <span><span className="font-mono text-xs">{it.product_code}</span> · {it.product_name}</span>
                  <span className="whitespace-nowrap">{it.qty} × {usd(it.unit_price_usd)}</span>
                </div>
                {alertaDe(it.id).map((t) => (
                  <p key={t} className="mt-1 rounded bg-orange-50 px-2 py-1 text-xs text-orange-800">⚠ {t}</p>
                ))}
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t pt-3 text-lg font-semibold"><span>Total</span><span>{usd(o.total_usd)}</span></p>
        </div>
      </section>

      <section className="rounded-lg bg-white p-5 shadow">
        <h2 className="mb-4 font-display text-lg font-bold uppercase">Acciones</h2>
        <OrderActions id={o.id} status={o.status as OrderStatus} total={Number(o.total_usd)} pagado={pagado} />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow">
          <h2 className="font-display text-lg font-bold uppercase">Pagos</h2>
          {(pagos ?? []).length === 0 ? <p className="mt-2 text-sm text-neutral-500">Sin pagos registrados.</p> : (
            <ul className="mt-2 space-y-1 text-sm">
              {(pagos ?? []).map((p) => (
                <li key={p.id}>{new Date(p.paid_at).toLocaleDateString("es-BO", { timeZone: "America/La_Paz" })} · {usd(p.amount_usd)} · {p.method}{p.reference ? ` · ${p.reference}` : ""} ({p.kind})</li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-lg bg-white p-5 shadow">
          <h2 className="font-display text-lg font-bold uppercase">Historial</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {(eventos ?? []).map((e) => (
              <li key={e.id}><span className="text-neutral-500">{new Date(e.created_at).toLocaleString("es-BO", { timeZone: "America/La_Paz", dateStyle: "short", timeStyle: "short" })}</span> · {e.kind}{e.detail ? ` — ${e.detail}` : ""}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
