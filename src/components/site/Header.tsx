"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartProvider";

const HISTORIA = [
  ["Quiénes somos", "/historia/quienes-somos"],
  ["Trayectoria", "/historia/trayectoria"],
  ["Misión, visión y objetivos", "/historia/mision-vision-objetivos"],
];
const CATALOGO = [
  ["Toros", "/catalogo?cat=toros-reproductores"],
  ["Matrices", "/catalogo?cat=matrices"],
  ["Semen", "/catalogo?cat=genetica-semen"],
  ["Embriones", "/catalogo?cat=embriones"],
  ["Ver todo el catálogo", "/catalogo"],
];

function Menu({ titulo, items }: { titulo: string; items: string[][] }) {
  return (
    <div className="group relative">
      <button type="button" className="flex items-center gap-1 px-3.5 py-3 text-[15px] font-medium text-[#F3EFE6] group-hover:text-naranja group-focus-within:text-naranja">
        {titulo} <span aria-hidden className="text-[10px]">▼</span>
      </button>
      <div className="invisible absolute left-0 top-full z-40 min-w-56 border-t-2 border-naranja bg-negro py-2 shadow-xl group-focus-within:visible group-hover:visible">
        {items.map(([t, h]) => (
          <Link key={h} href={h} className="block px-4 py-2.5 text-[15px] text-[#F3EFE6] hover:bg-white/10 hover:text-naranja">
            {t}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Header() {
  const { count } = useCart();
  return (
    <header className="border-b-[3px] border-verde bg-negro">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" aria-label="El Jaral, ir al inicio">
          <Image src="/logo.png" alt="Senepol El Jaral" width={104} height={72} priority className="h-[72px] w-auto" />
        </Link>
        <nav aria-label="Principal" className="flex flex-wrap items-center gap-1">
          <Link href="/" className="px-3.5 py-3 text-[15px] font-medium text-[#F3EFE6] hover:text-naranja">Inicio</Link>
          <Menu titulo="Historia" items={HISTORIA} />
          <Menu titulo="Catálogo" items={CATALOGO} />
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
