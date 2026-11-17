"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Availability } from "@/lib/types";

export function AvailabilitySelect({ id, value }: { id: string; value: Availability }) {
  const router = useRouter();
  const [v, setV] = useState(value);
  const [busy, setBusy] = useState(false);
  const color =
    v === "disponible" ? "bg-green-100 text-green-900" : v === "bloqueado" ? "bg-orange-100 text-orange-900" : "bg-neutral-300 text-neutral-800";

  async function cambiar(nuevo: Availability) {
    setBusy(true);
    const { error } = await createClient().rpc("set_availability", {
      p_product_id: id,
      p_availability: nuevo,
      p_detail: "Cambio manual desde el panel",
    });
    setBusy(false);
    if (error) {
      alert(error.message);
      return;
    }
    setV(nuevo);
    router.refresh();
  }

  return (
    <select
      value={v}
      disabled={busy}
      onChange={(e) => cambiar(e.target.value as Availability)}
      className={`rounded px-2 py-1 text-sm font-medium ${color}`}
    >
      <option value="disponible">Disponible</option>
      <option value="bloqueado">Bloqueado</option>
      <option value="vendido">Vendido</option>
    </select>
  );
}

export function PublishToggle({ id, value }: { id: string; value: boolean }) {
  const router = useRouter();
  const [v, setV] = useState(value);
  const [busy, setBusy] = useState(false);

  async function cambiar() {
    setBusy(true);
    const nuevo = !v;
    const { error } = await createClient()
      .from("products")
      .update({ published: nuevo, published_at: nuevo ? new Date().toISOString() : null })
      .eq("id", id);
    setBusy(false);
    if (error) {
      alert(error.message);
      return;
    }
    setV(nuevo);
    router.refresh();
  }

  return (
    <button
      onClick={cambiar}
      disabled={busy}
      aria-pressed={v}
      title={v ? "Publicado: se ve en el catálogo" : "Oculto: no se ve en el catálogo"}
      className={`relative h-6 w-11 rounded-full transition ${v ? "bg-verde" : "bg-neutral-400"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${v ? "left-5" : "left-0.5"}`} />
    </button>
  );
}
