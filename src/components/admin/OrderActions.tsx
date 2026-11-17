"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ESTADOS, type OrderStatus } from "@/lib/types";

const SIGUIENTES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pendiente: ["en_revision"],
  en_revision: [],
  confirmado: ["en_preparacion", "despachado", "entregado"],
  en_preparacion: ["despachado", "entregado"],
  despachado: ["entregado"],
};

export default function OrderActions({ id, status, total, pagado }: { id: string; status: OrderStatus; total: number; pagado: number }) {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState(false);
  const [metodo, setMetodo] = useState("transferencia");
  const [monto, setMonto] = useState("");
  const [ref, setRef] = useState("");

  async function run(fn: () => PromiseLike<{ error: { message: string } | null }>, ok?: () => void) {
    setBusy(true);
    const { error } = await fn();
    setBusy(false);
    if (error) return alert(error.message);
    ok?.();
    router.refresh();
  }

  const cerrado = status === "entregado" || status === "cancelado";
  const puedeConfirmar = status === "pendiente" || status === "en_revision";
  const btn = "rounded px-4 py-2 text-sm font-semibold disabled:opacity-50";

  return (
    <div className="space-y-6">
      {!cerrado && (
        <div className="flex flex-wrap gap-3">
          {puedeConfirmar && (
            <button
              disabled={busy}
              className={`${btn} bg-verde text-white`}
              onClick={() => confirm("Al confirmar, los toros del pedido quedan BLOQUEADOS y las dosis se descuentan del stock. ¿Confirmar?") && run(() => supabase.rpc("confirm_order", { p_order_id: id }))}
            >
              Confirmar pedido
            </button>
          )}
          {(SIGUIENTES[status] ?? []).map((s) => (
            <button
              key={s}
              disabled={busy}
              className={`${btn} border border-neutral-400 bg-white`}
              onClick={() => run(() => supabase.rpc("set_order_status", { p_order_id: id, p_status: s, p_note: "" }))}
            >
              Pasar a: {ESTADOS[s]}
            </button>
          ))}
          <button
            disabled={busy}
            className={`${btn} border border-red-300 bg-white text-red-700`}
            onClick={() => {
              const motivo = prompt("Motivo de la cancelación (queda en el historial):");
              if (motivo === null) return;
              run(() => supabase.rpc("set_order_status", { p_order_id: id, p_status: "cancelado", p_note: motivo }));
            }}
          >
            Cancelar pedido
          </button>
        </div>
      )}

      {status !== "cancelado" && status !== "pendiente" && status !== "en_revision" && (
        <div className="rounded border bg-neutral-50 p-4">
          <p className="text-sm font-semibold">
            Registrar pago · pagado {pagado.toLocaleString("es-BO")} de {total.toLocaleString("es-BO")} USD
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="text-xs">Medio
              <select className="mt-1 block rounded border px-2 py-2 text-sm" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                <option value="transferencia">Transferencia</option>
                <option value="qr">QR</option>
                <option value="efectivo">Efectivo</option>
                <option value="otro">Otro</option>
              </select>
            </label>
            <label className="text-xs">Monto (USD)
              <input className="mt-1 block w-32 rounded border px-2 py-2 text-sm" type="number" min="0" step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} />
            </label>
            <label className="text-xs">Referencia
              <input className="mt-1 block w-48 rounded border px-2 py-2 text-sm" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Nº de comprobante" />
            </label>
            <button
              disabled={busy || !(Number(monto) > 0)}
              className={`${btn} bg-naranja text-negro`}
              onClick={() => {
                const restante = total - pagado;
                const kind = Number(monto) >= restante - 0.001 ? "pago" : "anticipo";
                run(() => supabase.rpc("register_payment", { p_order_id: id, p_method: metodo, p_kind: kind, p_amount: Number(monto), p_reference: ref }), () => {
                  setMonto("");
                  setRef("");
                });
              }}
            >
              Registrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
