"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "./CartProvider";
import { usd } from "@/lib/format";

const DEPARTAMENTOS = ["Santa Cruz", "Beni", "Pando", "La Paz", "Cochabamba", "Oruro", "Potosí", "Chuquisaca", "Tarija"];
const campo = "mt-1.5 min-h-11 w-full rounded-sm border border-[#B9B29E] bg-white px-3";

export default function PedidoForm() {
  const router = useRouter();
  const { lines, total, setQty, remove, clear } = useCart();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({ full_name: "", doc_id: "", phone: "", email: "", department: "Santa Cruz", city: "", address: "" });
  const [entrega, setEntrega] = useState("retiro");
  const [trampa, setTrampa] = useState("");
  const inicio = useRef(0);
  useEffect(() => {
    inicio.current = Date.now();
  }, []);

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-sm border border-[#E4DDCD] bg-white p-12 text-center">
        <p className="text-[#565B50]">Todavía no agregaste productos.</p>
        <Link href="/catalogo" className="flex min-h-12 items-center rounded-sm bg-verde-oscuro px-6 font-semibold text-white">Ir al catálogo</Link>
      </div>
    );
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    // Anti-spam: un robot completa el campo oculto o envía en menos de 3 segundos
    if (trampa) {
      clear();
      router.push("/pedido/gracias");
      return;
    }
    if (Date.now() - inicio.current < 3000) {
      setError("Revisá tus datos un momento y volvé a tocar “Enviar pedido”.");
      return;
    }
    setEnviando(true);
    const { data, error } = await createClient().rpc("create_order", {
      p_customer: f,
      p_delivery: entrega,
      p_items: lines.map((l) => ({ product_id: l.id, qty: l.qty })),
    });
    if (error) {
      setError(error.message);
      setEnviando(false);
      return;
    }
    const r = data as { number: string; total_usd: number };
    clear();
    router.push(`/pedido/gracias?n=${encodeURIComponent(r.number)}&t=${r.total_usd}`);
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-8">
      <div className="rounded-sm border border-[#E4DDCD] bg-white">
        {lines.map((l) => (
          <div key={l.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[#E4DDCD] p-5">
            <div className="flex-1 basis-64">
              <p className="text-xs font-semibold tracking-wider text-[#565B50]">{l.code}</p>
              <p className="font-display text-xl font-medium uppercase">{l.name}</p>
              <p className="text-sm text-[#565B50]">{usd(l.price)} {l.unit}</p>
            </div>
            {l.sale_mode === "cantidad" && (
              <div className="flex items-center rounded-sm border border-[#B9B29E]">
                <button type="button" aria-label="Restar" className="h-11 w-11 text-xl" onClick={() => setQty(l.id, Math.max(l.min, l.qty - l.step))}>−</button>
                <span className="min-w-12 text-center font-semibold">{l.qty}</span>
                <button type="button" aria-label="Sumar" className="h-11 w-11 text-xl" onClick={() => setQty(l.id, Math.min(l.stock, l.qty + l.step))}>+</button>
              </div>
            )}
            <p className="w-28 text-right text-lg font-semibold">{usd(l.price * l.qty)}</p>
            <button type="button" className="text-sm text-red-700 underline" onClick={() => remove(l.id)}>Quitar</button>
          </div>
        ))}
        <div className="flex justify-between p-5 text-xl font-semibold">
          <span>Total estimado</span>
          <span className="text-verde-oscuro">{usd(total)}</span>
        </div>
      </div>

      <section className="rounded-sm border border-[#E4DDCD] bg-white p-6">
        <h2 className="font-display text-[26px] font-bold uppercase">Tus datos</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold sm:col-span-2">Nombre completo
            <input required maxLength={120} className={campo} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
          </label>
          <label className="text-sm font-semibold">Carnet de identidad o NIT
            <input required maxLength={30} className={campo} value={f.doc_id} onChange={(e) => setF({ ...f, doc_id: e.target.value })} />
          </label>
          <label className="text-sm font-semibold">Celular (con WhatsApp)
            <input required type="tel" maxLength={20} className={campo} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+591 7..." />
          </label>
          <label className="text-sm font-semibold">Departamento
            <select className={campo} value={f.department} onChange={(e) => setF({ ...f, department: e.target.value })}>
              {DEPARTAMENTOS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Ciudad o localidad
            <input required maxLength={80} className={campo} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">Correo (opcional)
            <input type="email" maxLength={120} className={campo} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">Dirección o referencia (opcional)
            <input maxLength={300} className={campo} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
          </label>
        </div>
        <fieldset className="mt-6">
          <legend className="text-sm font-semibold">¿Cómo querés recibirlo?</legend>
          <div className="mt-2 flex flex-col gap-2">
            {[
              ["retiro", "Retiro en el establecimiento"],
              ["entrega", "Entrega coordinada por El Jaral"],
              ["transporte", "Lo recoge mi transportista"],
            ].map(([v, t]) => (
              <label key={v} className="flex min-h-11 items-center gap-3">
                <input type="radio" name="entrega" value={v} checked={entrega === v} onChange={() => setEntrega(v)} className="h-5 w-5 accent-verde-oscuro" />
                {t}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>No completar este campo
          <input tabIndex={-1} autoComplete="off" value={trampa} onChange={(e) => setTrampa(e.target.value)} />
        </label>
      </div>
      <p className="rounded-sm bg-[#F0EADC] p-4 text-sm text-[#565B50]">
        Al enviar, tu pedido queda <strong>pendiente de confirmación</strong>. No se cobra nada en el sitio: el equipo de El Jaral te escribe por WhatsApp para confirmar disponibilidad, pago y entrega. Enviar el pedido no reserva el animal hasta que lo confirmemos.
      </p>
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={enviando} className="min-h-[52px] rounded-sm bg-naranja px-6 font-display text-xl font-bold uppercase text-[#1A1408] hover:brightness-95 disabled:opacity-60">
        {enviando ? "Enviando…" : "Enviar pedido"}
      </button>
    </form>
  );
}
