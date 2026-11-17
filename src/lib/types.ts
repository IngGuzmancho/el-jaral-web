export type SaleMode = "unidad" | "cantidad" | "lote";
export type Availability = "disponible" | "bloqueado" | "vendido";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  sale_mode: SaleMode;
  sort_order: number;
}

export interface Product {
  id: string;
  code: string;
  category_id: string;
  name: string;
  description: string;
  sale_mode: SaleMode;
  price_usd: number;
  unit_label: string;
  stock_qty: number;
  min_order: number;
  order_step: number;
  availability: Availability;
  featured: boolean;
  attributes: Record<string, unknown>;
  genetics: Record<string, unknown>;
  commercial_info: string;
}
