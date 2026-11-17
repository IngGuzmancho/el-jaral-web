"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartProvider";

export default function Header() {
  const { count } = useCart();
  const nav = "px-3.5 py-3 text-[15px] font-medium text-[#F3EFE6] hover:text-naranja";
  return (
    <header className="border-b-[3px] border-verde bg-negro">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" aria-label="El Jaral, ir al inicio">
          <Image src="/logo.png" alt="Senepol El Jaral" width={104} height={72} priority className="h-[72px] w-auto" />
        </Link>
        <nav aria-label="Principal" className="flex flex-wrap items-center gap-1">
          <Link href="/" className={nav}>Inicio</Link>
          <Link href="/catalogo?cat=toros-reproductores" className={nav}>Reproductores</Link>
          <Link href="/catalogo?cat=genetica-semen" className={nav}>Genética</Link>
          <Link href="/catalogo" className={nav}>Catálogo</Link>
          <Link
            href="/pedido"
            className="ml-2 flex min-h-11 items-center gap-2 rounded-sm border border-naranja px-4 text-[15px] font-semibold text-white hover:bg-white/10"
          >
            <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5h2l2.2 10.2a1 1 0 0 0 1 .8h8.1a1 1 0 0 0 1-.8L20 8H7" />
              <circle cx="10" cy="19.5" r="1.3" />
              <circle cx="17" cy="19.5" r="1.3" />
            </svg>
            Mi pedido
            <span className="min-w-[22px] rounded-full bg-naranja px-1.5 text-center text-[13px] leading-[22px] text-[#1A1408]">{count}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
