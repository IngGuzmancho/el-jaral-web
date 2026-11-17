import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import type { AttributeDefinition, Category } from "@/lib/types";

export default async function NuevoProducto() {
  const supabase = await createClient();
  const [{ data: cats }, { data: defs }] = await Promise.all([
    supabase.from("categories").select("*").eq("active", true).order("sort_order"),
    supabase.from("attribute_definitions").select("*"),
  ]);
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-extrabold uppercase">Nuevo producto</h1>
      <ProductForm categories={(cats ?? []) as Category[]} definitions={(defs ?? []) as AttributeDefinition[]} />
    </div>
  );
}
