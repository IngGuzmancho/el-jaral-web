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

export interface AttributeDefinition {
  id: string;
  category_id: string;
  key: string;
  label: string;
  data_type: "text" | "longtext" | "number" | "date" | "list";
  unit: string | null;
  options: string[] | null;
  required: boolean;
  filterable: boolean;
  sort_order: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  path: string;
  alt: string;
  is_cover: boolean;
  sort_order: number;
}

export type OrderStatus = "pendiente" | "en_revision" | "confirmado" | "en_preparacion" | "despachado" | "entregado" | "cancelado";

export const ESTADOS: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  confirmado: "Confirmado",
  en_preparacion: "En preparación",
  despachado: "Despachado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export const PAGOS: Record<string, string> = { sin_pago: "Sin pago", anticipo: "Anticipo", pagado: "Pagado" };
export const ENTREGAS: Record<string, string> = { retiro: "Retiro en el establecimiento", entrega: "Entrega coordinada por El Jaral", transporte: "Lo recoge su transportista" };
