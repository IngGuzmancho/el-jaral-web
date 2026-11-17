import Link from "next/link";
import { availabilityText, imageUrl, isAvailable, metaLine, usd } from "@/lib/format";
import type { Product } from "@/lib/types";

export type CardProduct = Product & { cover: string | null; category_name: string };

export default function ProductCard({ p }: { p: CardProduct }) {
  const ok = isAvailable(p);
  const tag = p.code.replace(/^EJ-?/i, "").slice(-4);
  return (
    <article className="flex flex-col overflow-hidden rounded-sm border border-[#E4DDCD] bg-white transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(10,10,10,.16)]">
      <Link href={`/producto/${encodeURIComponent(p.code)}`} aria-label={`Ver ficha de ${p.name}`} className="block h-52 bg-verde-oscuro">
        {p.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl(p.cover)} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-2 text-[13px] text-[#C9D3C8]">
            <span className="flex -rotate-3 flex-col items-center rounded-t-[10px] rounded-b-[18px] bg-naranja px-6 pb-3 pt-2.5 text-[#1A1408] shadow-[0_6px_0_rgba(0,0,0,.3)]">
              <span className="mb-1 h-3 w-3 rounded-full bg-verde-oscuro" />
              <span className="font-display text-5xl font-bold leading-none">{tag}</span>
            </span>
            Foto próximamente
          </span>
        )}
      </Link>
      <div className="flex grow flex-col gap-2.5 p-5">
        <div className="flex justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-[#565B50]">
          <span>{p.category_name}</span>
          <span>{p.code}</span>
        </div>
        <h3 className="font-display text-[22px] font-bold uppercase leading-tight">{p.name}</h3>
        <p className="text-sm text-[#565B50]">{metaLine(p)}</p>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-[22px] font-semibold text-verde-oscuro">{usd(p.price_usd)}</span>
          <span className="text-[13px] text-[#565B50]">{p.unit_label}</span>
        </div>
        <span
          className={`self-start rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${
            ok ? "bg-[#E3EFE2] text-[#1F5A36]" : "bg-[#F8E6D6] text-[#7A3A08]"
          }`}
        >
          {ok ? "●" : "◆"} {availabilityText(p)}
        </span>
        <Link
          href={`/producto/${encodeURIComponent(p.code)}`}
          className="mt-1.5 flex min-h-11 items-center justify-center rounded-sm border border-verde-oscuro text-sm font-semibold text-verde-oscuro hover:bg-verde-oscuro hover:text-white"
        >
          Ver ficha
        </Link>
      </div>
    </article>
  );
}
