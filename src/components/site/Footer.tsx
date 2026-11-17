import Link from "next/link";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/format";

export default function Footer() {
  return (
    <footer className="mt-20 bg-negro text-[#D9DDD2]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-8 px-6 py-12">
        <div>
          <p className="font-display text-2xl font-bold uppercase text-white">
            Senepol <span className="text-naranja">El Jaral</span>
          </p>
          <p className="mt-1 text-sm">Santa Cruz, Bolivia</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Catálogo</p>
          <ul className="mt-2 space-y-1">
            <li><Link href="/catalogo?cat=toros-reproductores" className="hover:text-naranja">Toros reproductores</Link></li>
            <li><Link href="/catalogo?cat=genetica-semen" className="hover:text-naranja">Genética · Semen</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Contacto</p>
          <p className="mt-2">
            <a className="hover:text-naranja" href={whatsappLink("Hola, quiero consultar por los productos de El Jaral.")} target="_blank" rel="noreferrer">
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
