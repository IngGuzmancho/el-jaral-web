"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { imageUrl } from "@/lib/format";
import { claveAjuste, type ContenidoPagina, type DefPagina } from "@/lib/paginas";

export default function PaginaForm({ def, inicial }: { def: DefPagina; inicial: ContenidoPagina }) {
  const router = useRouter();
  const [c, setC] = useState<ContenidoPagina>(inicial);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const supabase = createClient();
    const valor = { ...c };
    if (archivo) {
      const ext = (archivo.name.split(".").pop() || "jpg").toLowerCase();
      const path = `site/${def.slug}-${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("product-images").upload(path, archivo, { contentType: archivo.type });
      if (up.error) {
        setSaving(false);
        return setMsg(`No se pudo subir la foto: ${up.error.message}`);
      }
      valor.imagen = path;
    }
    const { error } = await supabase.from("settings").upsert({ key: claveAjuste(def.slug), value: valor, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) return setMsg(error.message);
    setC(valor);
    setArchivo(null);
    setMsg("Guardado. Ya se ve en el sitio.");
    router.refresh();
  }

  const input = "mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm";
  return (
    <form onSubmit={guardar} className="space-y-6 rounded-lg bg-white p-6 shadow">
      {def.campos.map((f) => (
        <label key={f.k} className="block text-sm font-medium">
          {f.label}
          {f.ayuda && <span className="ml-2 font-normal text-neutral-500">{f.ayuda}</span>}
          <textarea className={input} rows={f.k === "texto" ? 12 : 6} value={c[f.k] ?? ""} onChange={(e) => setC({ ...c, [f.k]: e.target.value })} />
        </label>
      ))}
      {def.conImagen && (
        <div>
          <p className="text-sm font-medium">Foto (opcional)</p>
          {c.imagen && (
            <div className="mt-2 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl(c.imagen)} alt="" className="h-24 w-36 rounded object-cover" />
              <button type="button" className="text-sm text-red-600 underline" onClick={() => setC({ ...c, imagen: "" })}>Quitar foto</button>
            </div>
          )}
          <input className="mt-2 block text-sm" type="file" accept="image/*" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
        </div>
      )}
      {msg && <p className="rounded bg-neutral-100 p-3 text-sm">{msg}</p>}
      <button disabled={saving} className="rounded bg-naranja px-6 py-2.5 font-display text-lg font-bold uppercase text-negro hover:brightness-95 disabled:opacity-60">
        {saving ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
