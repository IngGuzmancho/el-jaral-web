import type { Availability, Product } from "./types";

export const usd = (n: number | string) =>
  "$us " + Number(n).toLocaleString("es-BO", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "59177340100";
export const WHATSAPP_DISPLAY = "+591 77340100";
export const whatsappLink = (texto: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;

export function imageUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
}

// Nombre de la unidad con la que se vende un producto por cantidad (dosis, embriones…)
export function unidades(p: { unit_label?: string | null }) {
  return /embri/i.test(p.unit_label ?? "") ? { uno: "embrión", varios: "embriones" } : { uno: "dosis", varios: "dosis" };
}

export function availabilityText(p: Pick<Product, "sale_mode" | "availability" | "stock_qty" | "unit_label">) {
  if (p.sale_mode === "cantidad") return p.stock_qty > 0 ? `${p.stock_qty} ${unidades(p).varios} disponibles` : "Sin stock";
  return p.availability === "disponible" ? "Disponible" : p.availability === "bloqueado" ? "Reservado" : "Vendido";
}

export function isAvailable(p: Pick<Product, "sale_mode" | "availability" | "stock_qty">) {
  return p.sale_mode === "cantidad" ? p.stock_qty > 0 : p.availability === ("disponible" as Availability);
}

// Línea corta para las tarjetas
export function metaLine(p: Pick<Product, "sale_mode" | "attributes">) {
  const a = p.attributes as Record<string, string | number | undefined>;
  if (p.sale_mode === "cantidad") {
    if (a.donante) return [`Donante: ${a.donante}`, a.tipo_semen].filter(Boolean).join(" · ");
    return [a.padre && a.madre ? `${a.padre} × ${a.madre}` : a.padre || a.madre, a.origen].filter(Boolean).join(" · ");
  }
  const edad = a.fecha_nacimiento ? edadTexto(String(a.fecha_nacimiento)) : null;
  return [edad, a.peso_kg && `${a.peso_kg} kg`, a.raza].filter(Boolean).join(" · ");
}

export function edadTexto(fecha: string) {
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return null;
  const meses = Math.max(0, Math.round((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
  return `${meses} meses`;
}
