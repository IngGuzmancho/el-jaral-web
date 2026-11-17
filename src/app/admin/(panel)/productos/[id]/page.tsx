import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import type { AttributeDefinition, Category, Product, ProductImage } from "@/lib/types";

export default async function EditarProducto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: cats }, { data: defs }, { data: prod }, { data: imgs }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("attribute_definitions").select("*"),
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("product_images").select("*").eq("product_id", id).order("sort_order"),
  ]);
  if (!prod) notFound();
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-extrabold uppercase">Editar · {prod.code}</h1>
      <ProductForm
        categories={(cats ?? []) as Category[]}
        definitions={(defs ?? []) as AttributeDefinition[]}
        product={prod as Product & { published: boolean }}
        images={(imgs ?? []) as ProductImage[]}
      />
    </div>
  );
}
