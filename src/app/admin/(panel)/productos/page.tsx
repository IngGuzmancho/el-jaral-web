import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AvailabilitySelect, PublishToggle } from "@/components/admin/RowControls";
import type { Availability } from "@/lib/types";

type Fila = {
  id: string;
  code: string;
  name: string;
  price_usd: number;
  sale_mode: string;
  stock_qty: number;
  availability: Availability;
  published: boolean;
  categories: { name: string } | null;
};

export default async function ProductosPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id,code,name,price_usd,sale_mode,stock_qty,availability,published,categories(name)")
    .order("created_at", { ascending: false });
  const filas = (data ?? []) as unknown as Fila[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold uppercase">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded bg-naranja px-4 py-2 font-display font-bold uppercase text-negro hover:brightness-95"
        >
          + Nuevo producto
        </Link>
      </div>
      {error && <p className="mt-4 text-red-600">Error: {error.message}</p>}
      <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Precio (USD)</th>
              <th className="px-4 py-3">Disponibilidad / stock</th>
              <th className="px-4 py-3">Publicado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filas.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{p.code}</td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{p.categories?.name}</td>
                <td className="px-4 py-3">{Number(p.price_usd).toLocaleString("es-BO")}</td>
                <td className="px-4 py-3">
                  {p.sale_mode === "unidad" ? (
                    <AvailabilitySelect id={p.id} value={p.availability} />
                  ) : (
                    <span>{p.stock_qty} dosis</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <PublishToggle id={p.id} value={p.published} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/productos/${p.id}`} className="text-verde-oscuro underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {filas.length === 0 && !error && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-neutral-500">
                  Todavía no cargaste productos. Tocá “Nuevo producto” para empezar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
