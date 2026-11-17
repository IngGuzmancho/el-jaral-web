"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function StockAdjust({ id, stock }: { id: string; stock: number }) {
  const router = useRouter();
  async function ajustar() {
    const txt = prompt(`Hay ${stock} dosis. ¿Cuántas querés sumar o restar? (usá un número negativo para restar)`);
    if (txt === null) return;
    const delta = parseInt(txt, 10);
    if (!delta) return alert("Poné un número distinto de cero.");
    const motivo = prompt("Motivo del ajuste (queda en el historial):", delta > 0 ? "Ingreso de dosis" : "Salida de dosis") ?? "";
    const { error } = await createClient().rpc("adjust_stock", { p_product_id: id, p_delta: delta, p_detail: motivo });
    if (error) return alert(error.message);
    router.refresh();
  }
  return (
    <span className="flex items-center gap-2">
      {stock} dosis
      <button onClick={ajustar} className="rounded border border-neutral-300 px-2 py-0.5 text-xs hover:bg-neutral-100">Ajustar</button>
    </span>
  );
}
