import { createClient } from "@/lib/supabase/server";
import { usd } from "@/lib/format";

type Cliente = {
  id: string;
  full_name: string;
  doc_id: string;
  phone: string;
  email: string | null;
  department: string;
  city: string;
  orders: { total_usd: number; status: string }[];
};

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id,full_name,doc_id,phone,email,department,city,orders(total_usd,status)")
    .order("created_at", { ascending: false });
  const clientes = (data ?? []) as unknown as Cliente[];

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold uppercase">Clientes</h1>
      <p className="mt-1 text-sm text-neutral-600">{clientes.length} registrados. Se crean solos cuando alguien envía un pedido.</p>
      {error && <p className="mt-4 text-red-600">Error: {error.message}</p>}
      <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">CI / NIT</th>
              <th className="px-4 py-3">Celular</th>
              <th className="px-4 py-3">Lugar</th>
              <th className="px-4 py-3">Pedidos</th>
              <th className="px-4 py-3">Comprado (entregado)</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => {
              const entregados = c.orders.filter((o) => o.status === "entregado");
              const wa = `https://wa.me/${c.phone.replace(/\D/g, "")}`;
              return (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{c.full_name}{c.email && <span className="block text-xs font-normal text-neutral-500">{c.email}</span>}</td>
                  <td className="px-4 py-3">{c.doc_id}</td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3">{c.city}, {c.department}</td>
                  <td className="px-4 py-3">{c.orders.length}</td>
                  <td className="px-4 py-3">{usd(entregados.reduce((s, o) => s + Number(o.total_usd), 0))}</td>
                  <td className="px-4 py-3 text-right"><a href={wa} target="_blank" rel="noreferrer" className="text-verde-oscuro underline">WhatsApp</a></td>
                </tr>
              );
            })}
            {clientes.length === 0 && !error && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-500">Todavía no hay clientes.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
