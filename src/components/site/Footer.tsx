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
            <li><Link href="/catalogo?cat=toros-reproductores" className="hover:text-naranja">Toros</Link></li>
            <li><Link href="/catalogo?cat=matrices" className="hover:text-naranja">Matrices</Link></li>
            <li><Link href="/catalogo?cat=genetica-semen" className="hover:text-naranja">Semen</Link></li>
            <li><Link href="/catalogo?cat=embriones" className="hover:text-naranja">Embriones</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Historia</p>
          <ul className="mt-2 space-y-1">
            <li><Link href="/historia/quienes-somos" className="hover:text-naranja">Quiénes somos</Link></li>
            <li><Link href="/historia/trayectoria" className="hover:text-naranja">Trayectoria</Link></li>
            <li><Link href="/historia/mision-vision-objetivos" className="hover:text-naranja">Misión, visión y objetivos</Link></li>
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
