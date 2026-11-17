import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/admin/LogoutButton";

async function Gate({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: esPersonal } = await supabase.rpc("is_staff");
  if (!esPersonal) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="bg-negro text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <span className="font-display text-xl font-extrabold uppercase">
              El Jaral <span className="text-naranja">· Panel</span>
            </span>
            <nav className="flex gap-5 text-sm">
              <Link href="/admin/pedidos" className="hover:text-naranja">
                Pedidos
              </Link>
              <Link href="/admin/productos" className="hover:text-naranja">
                Productos
              </Link>
              <Link href="/admin/paginas" className="hover:text-naranja">
                Páginas
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-400">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8">Cargando…</p>}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
