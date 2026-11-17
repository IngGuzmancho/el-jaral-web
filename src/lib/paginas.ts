// Páginas de texto del sitio (Historia). El contenido se edita desde el panel y se guarda en `settings`.
export type CampoPagina = { k: string; label: string; ayuda?: string };
export type DefPagina = { slug: string; titulo: string; campos: CampoPagina[]; conImagen: boolean };

export const PAGINAS: DefPagina[] = [
  { slug: "quienes-somos", titulo: "Quiénes somos", conImagen: true, campos: [{ k: "texto", label: "Texto" }] },
  { slug: "trayectoria", titulo: "Trayectoria", conImagen: true, campos: [{ k: "texto", label: "Texto" }] },
  {
    slug: "mision-vision-objetivos",
    titulo: "Misión, visión y objetivos",
    conImagen: false,
    campos: [
      { k: "mision", label: "Misión" },
      { k: "vision", label: "Visión" },
      { k: "objetivos", label: "Objetivos", ayuda: "Escribí un objetivo por renglón." },
    ],
  },
];

export const claveAjuste = (slug: string) => `public.pagina.${slug}`;
export type ContenidoPagina = Record<string, string>;
