import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { usd } from "@/lib/format";
import { ESTADOS, PAGOS, type OrderStatus } from "@/lib/types";

type Fila = {
  id: string;
  number: string;
  status: OrderStatus;
  payment_status: string;
  total_usd: number;
  created_at: string;
  buyer: { full_name?: string; phone?: string };
};

const colorEstado: Record<OrderStatus, string> = {
  pendiente: "bg-orange-100 text-orange-900",
  en_revision: "bg-yellow-100 text-yellow-900",
  confirmado: "bg-green-100 text-green-900",
  en_preparacion: "bg-blue-100 text-blue-900",
  despachado: "bg-indigo-100 text-indigo-900",
  entregado: "bg-neutral-200 text-neutral-800",
  cancelado: "bg-red-100 text-red-800",
};

export default async function PedidosPage() {
  const supabase = await createClient();
  const [{ data }, { data: alertas }] = await Promise.all([
    supabase.from("orders").select("id,number,status,payment_status,total_usd,created_at,buyer").order("created_at", { ascending: false }),
    supabase.from("order_item_alerts").select("order_id,alert"),
  ]);
  const filas = (data ?? []) as Fila[];
  const conAlerta = new Set((alertas ?? []).map((a) => a.order_id));
  const nuevos = filas.filter((f) => f.status === "pendiente").length;

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold uppercase">Pedidos</h1>
      <p className="mt-1 text-sm text-neutral-600">{nuevos} pendientes de confirmar</p>
      <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Pago</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filas.map((o) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{o.number}</td>
                <td className="px-4 py-3">{new Date(o.created_at).toLocaleString("es-BO", { timeZone: "America/La_Paz", dateStyle: "short", timeStyle: "short" })}</td>
                <td className="px-4 py-3">
                  {o.buyer?.full_name}
                  <span className="block text-xs text-neutral-500">{o.buyer?.phone}</span>
                </td>
                <td className="px-4 py-3">{usd(o.total_usd)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-1 text-xs font-medium ${colorEstado[o.status]}`}>{ESTADOS[o.status]}</span>
                  {conAlerta.has(o.id) && <span title="Tiene alertas" className="ml-2 text-orange-600">⚠</span>}
                </td>
                <td className="px-4 py-3">{PAGOS[o.payment_status]}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/pedidos/${o.id}`} className="text-verde-oscuro underline">Abrir</Link>
                </td>
              </tr>
            ))}
            {filas.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-500">Todavía no llegó ningún pedido.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
