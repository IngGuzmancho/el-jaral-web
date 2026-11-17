"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AttributeDefinition, Category, Product, ProductImage } from "@/lib/types";

type Props = {
  categories: Category[];
  definitions: AttributeDefinition[];
  product?: Product & { published: boolean };
  images?: ProductImage[];
};

type GenRow = { k: string; v: string };

const input = "mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm";
const label = "block text-sm font-medium";

export default function ProductForm({ categories, definitions, product, images = [] }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const editando = !!product;

  const [categoryId, setCategoryId] = useState(product?.category_id ?? categories[0]?.id ?? "");
  const category = categories.find((c) => c.id === categoryId);
  const modo = category?.sale_mode ?? "unidad";

  const [code, setCode] = useState(product?.code ?? "");
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(String(product?.price_usd ?? ""));
  const [description, setDescription] = useState(product?.description ?? "");
  const [commercial, setCommercial] = useState(product?.commercial_info ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [published, setPublished] = useState(product?.published ?? false);
  const esEmbrion = category?.slug === "embriones";
  const nombreUnidad = esEmbrion ? "embriones" : "dosis";
  const [stock, setStock] = useState(String(product?.stock_qty ?? (modo === "unidad" ? 1 : 0)));
  const [minOrder, setMinOrder] = useState(String(product?.min_order ?? 1));
  const [step, setStep] = useState(String(product?.order_step ?? 1));
  const [attrs, setAttrs] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(product?.attributes ?? {}).map(([k, v]) => [k, String(v ?? "")])),
  );
  const [gen, setGen] = useState<GenRow[]>(
    Object.entries(product?.genetics ?? {}).map(([k, v]) => ({ k, v: String(v ?? "") })),
  );
  const [fotos, setFotos] = useState<ProductImage[]>(images);
  const [nuevas, setNuevas] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const defs = definitions.filter((d) => d.category_id === categoryId).sort((a, b) => a.sort_order - b.sort_order);
  const urlDe = (path: string) => supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const faltan = defs.filter((d) => d.required && !(attrs[d.key] ?? "").trim());
    if (faltan.length) {
      setError(`Falta completar: ${faltan.map((d) => d.label).join(", ")}.`);
      return;
    }
    if (!(Number(price) >= 0) || price === "") {
      setError("Poné un precio válido en dólares.");
      return;
    }

    setSaving(true);
    const attributes: Record<string, string | number> = {};
    for (const d of defs) {
      const raw = (attrs[d.key] ?? "").trim();
      if (!raw) continue;
      attributes[d.key] = d.data_type === "number" ? Number(raw) : raw;
    }
    const genetics: Record<string, string | number> = {};
    for (const r of gen) {
      if (!r.k.trim() || !r.v.trim()) continue;
      genetics[r.k.trim()] = isNaN(Number(r.v)) ? r.v.trim() : Number(r.v);
    }

    const fila = {
      code: code.trim(),
      category_id: categoryId,
      name: name.trim(),
      description,
      commercial_info: commercial,
      sale_mode: modo,
      price_usd: Number(price),
      unit_label: modo === "unidad" ? "por ejemplar" : esEmbrion ? "por embrión" : "por dosis",
      stock_qty: modo === "unidad" ? 1 : Number(stock),
      min_order: modo === "unidad" ? 1 : Number(minOrder),
      order_step: modo === "unidad" ? 1 : Number(step),
      featured,
      published,
      published_at: published ? (product?.published ? undefined : new Date().toISOString()) : null,
      attributes,
      genetics,
    };

    let id = product?.id;
    if (id) {
      const { stock_qty, ...sinStock } = fila; // el stock de semen se ajusta con movimientos, no a mano
      const { error } = await supabase
        .from("products")
        .update(modo === "unidad" ? fila : sinStock)
        .eq("id", id);
      void stock_qty;
      if (error) return fallar(error.message);
    } else {
      const { data, error } = await supabase.from("products").insert(fila).select("id").single();
      if (error) return fallar(error.message);
      id = data.id;
    }

    // Fotos nuevas
    for (const [i, f] of nuevas.entries()) {
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${id}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("product-images").upload(path, f, { contentType: f.type });
      if (up.error) return fallar(`No se pudo subir la foto ${f.name}: ${up.error.message}`);
      const { error } = await supabase.from("product_images").insert({
        product_id: id,
        path,
        alt: name.trim(),
        is_cover: fotos.length === 0 && i === 0,
        sort_order: fotos.length + i,
      });
      if (error) return fallar(error.message);
    }

    router.replace("/admin/productos");
    router.refresh();
  }

  function fallar(msg: string) {
    setError(msg);
    setSaving(false);
  }

  async function borrarFoto(img: ProductImage) {
    if (!confirm("¿Borrar esta foto?")) return;
    await supabase.storage.from("product-images").remove([img.path]);
    const { error } = await supabase.from("product_images").delete().eq("id", img.id);
    if (error) return alert(error.message);
    setFotos((f) => f.filter((x) => x.id !== img.id));
  }

  async function hacerPortada(img: ProductImage) {
    await supabase.from("product_images").update({ is_cover: false }).eq("product_id", img.product_id);
    const { error } = await supabase.from("product_images").update({ is_cover: true }).eq("id", img.id);
    if (error) return alert(error.message);
    setFotos((f) => f.map((x) => ({ ...x, is_cover: x.id === img.id })));
  }

  return (
    <form onSubmit={guardar} className="space-y-8">
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="font-display text-xl font-bold uppercase">Datos generales</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Categoría</label>
            <select
              className={input}
              value={categoryId}
              disabled={editando}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setAttrs({});
              }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {editando && <p className="mt-1 text-xs text-neutral-500">La categoría no se puede cambiar después de crear.</p>}
          </div>
          <div>
            <label className={label}>Código interno</label>
            <input className={input} required value={code} onChange={(e) => setCode(e.target.value)} placeholder="EJ-T-214" />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Nombre</label>
            <input className={input} required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={label}>Precio en dólares (USD) {modo === "cantidad" && `· por ${esEmbrion ? "embrión" : "dosis"}`}</label>
            <input className={input} type="number" step="0.01" min="0" required value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          {modo === "cantidad" && (
            <>
              {!editando && (
                <div>
                  <label className={label}>Stock inicial ({nombreUnidad})</label>
                  <input className={input} type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
                </div>
              )}
              <div>
                <label className={label}>Pedido mínimo ({nombreUnidad})</label>
                <input className={input} type="number" min="1" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
              </div>
              <div>
                <label className={label}>Se vende de a ({nombreUnidad})</label>
                <input className={input} type="number" min="1" value={step} onChange={(e) => setStep(e.target.value)} />
              </div>
            </>
          )}
          <div className="sm:col-span-2">
            <label className={label}>Descripción</label>
            <textarea className={input} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Información comercial (condiciones, entrega, etc.)</label>
            <textarea className={input} rows={3} value={commercial} onChange={(e) => setCommercial(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Publicado (visible en el catálogo)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Destacado en el inicio
          </label>
        </div>
        {editando && modo === "cantidad" && (
          <p className="mt-3 text-xs text-neutral-500">El stock se ajusta desde la lista de productos, así queda registrado en el historial.</p>
        )}
      </section>

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="font-display text-xl font-bold uppercase">Ficha técnica</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {defs.map((d) => (
            <div key={d.id} className={d.data_type === "longtext" ? "sm:col-span-2" : ""}>
              <label className={label}>
                {d.label}
                {d.unit ? ` (${d.unit})` : ""}
                {d.required && <span className="text-red-600"> *</span>}
              </label>
              {d.data_type === "longtext" ? (
                <textarea className={input} rows={3} value={attrs[d.key] ?? ""} onChange={(e) => setAttrs({ ...attrs, [d.key]: e.target.value })} />
              ) : d.data_type === "list" ? (
                <select className={input} value={attrs[d.key] ?? ""} onChange={(e) => setAttrs({ ...attrs, [d.key]: e.target.value })}>
                  <option value="">—</option>
                  {(d.options ?? []).map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  className={input}
                  type={d.data_type === "number" ? "number" : d.data_type === "date" ? "date" : "text"}
                  step={d.data_type === "number" ? "any" : undefined}
                  value={attrs[d.key] ?? ""}
                  onChange={(e) => setAttrs({ ...attrs, [d.key]: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="font-display text-xl font-bold uppercase">Datos genéticos (DEP)</h2>
        <p className="text-sm text-neutral-500">Agregá una fila por cada dato, por ejemplo “DEP peso al destete” con su valor.</p>
        <div className="mt-4 space-y-2">
          {gen.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={input + " mt-0"}
                placeholder="Nombre del dato"
                value={r.k}
                onChange={(e) => setGen(gen.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))}
              />
              <input
                className={input + " mt-0 max-w-40"}
                placeholder="Valor"
                value={r.v}
                onChange={(e) => setGen(gen.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))}
              />
              <button type="button" className="px-2 text-red-600" onClick={() => setGen(gen.filter((_, j) => j !== i))}>
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="mt-3 text-sm text-verde-oscuro underline" onClick={() => setGen([...gen, { k: "", v: "" }])}>
          + Agregar dato
        </button>
      </section>

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="font-display text-xl font-bold uppercase">Fotos</h2>
        {fotos.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {fotos.map((img) => (
              <div key={img.id} className="rounded border p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={urlDe(img.path)} alt={img.alt} className="aspect-square w-full rounded object-cover" />
                <div className="mt-2 flex items-center justify-between text-xs">
                  {img.is_cover ? (
                    <span className="font-bold text-verde-oscuro">Portada</span>
                  ) : (
                    <button type="button" className="underline" onClick={() => hacerPortada(img)}>
                      Hacer portada
                    </button>
                  )}
                  <button type="button" className="text-red-600" onClick={() => borrarFoto(img)}>
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <input
          className="mt-4 block text-sm"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setNuevas(Array.from(e.target.files ?? []))}
        />
        {nuevas.length > 0 && <p className="mt-2 text-xs text-neutral-500">{nuevas.length} foto(s) se suben al guardar.</p>}
      </section>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="flex gap-3">
        <button disabled={saving} className="rounded bg-naranja px-6 py-2.5 font-display text-lg font-bold uppercase text-negro hover:brightness-95 disabled:opacity-60">
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" className="rounded border px-6 py-2.5" onClick={() => router.push("/admin/productos")}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
