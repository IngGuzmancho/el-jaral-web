"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { usd } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function AddToCart({ p, disponible }: { p: Product; disponible: boolean }) {
  const { add, has } = useCart();
  const esSemen = p.sale_mode === "cantidad";
  const [qty, setQty] = useState(esSemen ? p.min_order : 1);
  const enPedido = has(p.id);

  if (!disponible) {
    return <p className="flex min-h-[52px] items-center font-semibold text-[#7A3A08]">Este producto no está disponible para pedido.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {esSemen && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold">Dosis</span>
          <div className="flex items-center rounded-sm border border-[#B9B29E] bg-white">
            <button type="button" aria-label={`Restar ${p.order_step} dosis`} className="h-11 w-11 text-xl" onClick={() => setQty(Math.max(p.min_order, qty - p.order_step))}>−</button>
            <span className="min-w-14 text-center font-semibold">{qty}</span>
            <button type="button" aria-label={`Sumar ${p.order_step} dosis`} className="h-11 w-11 text-xl" onClick={() => setQty(Math.min(p.stock_qty, qty + p.order_step))}>+</button>
          </div>
          <span className="text-sm text-[#565B50]">Pedido mínimo: {p.min_order} dosis · Subtotal {usd(qty * Number(p.price_usd))}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="min-h-[52px] flex-1 basis-52 rounded-sm bg-naranja px-6 font-semibold text-[#1A1408] hover:brightness-95"
          onClick={() =>
            add({
              id: p.id, code: p.code, name: p.name, price: Number(p.price_usd), sale_mode: p.sale_mode,
              unit: p.unit_label, qty, min: p.min_order, step: p.order_step, stock: p.stock_qty,
            })
          }
        >
          {enPedido ? "Actualizar en mi pedido" : "Agregar al pedido"}
        </button>
        {enPedido && (
          <Link href="/pedido" className="flex min-h-[52px] flex-1 basis-52 items-center justify-center rounded-sm border border-verde-oscuro px-6 font-semibold text-verde-oscuro">
            En tu pedido ✓ · Ver pedido
          </Link>
        )}
      </div>
    </div>
  );
}
