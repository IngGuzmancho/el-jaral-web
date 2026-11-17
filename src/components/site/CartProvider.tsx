"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  id: string;
  code: string;
  name: string;
  price: number;
  sale_mode: "unidad" | "cantidad" | "lote";
  unit: string;
  qty: number;
  min: number;
  step: number;
  stock: number;
};

type Ctx = {
  lines: CartLine[];
  count: number;
  total: number;
  has: (id: string) => boolean;
  add: (l: CartLine) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "eljaral-pedido-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- se lee localStorage recién tras montar, para no romper la hidratación
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready]);

  const value = useMemo<Ctx>(
    () => ({
      lines,
      count: lines.length,
      total: lines.reduce((s, l) => s + l.price * l.qty, 0),
      has: (id) => lines.some((l) => l.id === id),
      add: (l) => setLines((cur) => (cur.some((x) => x.id === l.id) ? cur.map((x) => (x.id === l.id ? l : x)) : [...cur, l])),
      setQty: (id, qty) => setLines((cur) => cur.map((x) => (x.id === id ? { ...x, qty } : x))),
      remove: (id) => setLines((cur) => cur.filter((x) => x.id !== id)),
      clear: () => setLines([]),
    }),
    [lines],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart fuera de CartProvider");
  return c;
}
