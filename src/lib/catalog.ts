import { createClient } from "@/lib/supabase/server";
import type { CardProduct } from "@/components/site/ProductCard";
import type { Category } from "@/lib/types";

type Row = Omit<CardProduct, "cover" | "category_name"> & {
  categories: { name: string; slug: string } | null;
  product_images: { path: string; is_cover: boolean; sort_order: number }[];
};

function toCard(r: Row): CardProduct & { category_slug: string } {
  const imgs = [...(r.product_images ?? [])].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order);
  const { categories, product_images, ...rest } = r;
  void product_images;
  return { ...(rest as CardProduct), cover: imgs[0]?.path ?? null, category_name: categories?.name ?? "", category_slug: categories?.slug ?? "" };
}

const SELECT = "*, categories(name,slug), product_images(path,is_cover,sort_order)";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").eq("active", true).order("sort_order");
  return (data ?? []) as Category[];
}

export async function getPublished() {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select(SELECT).eq("published", true).order("published_at", { ascending: false });
  return ((data ?? []) as unknown as Row[]).map(toCard);
}

export async function getProductByCode(code: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*, categories(name,slug), product_images(id,path,alt,is_cover,sort_order)").eq("code", code).eq("published", true).maybeSingle();
  return data;
}
