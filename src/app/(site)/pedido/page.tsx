import PedidoForm from "@/components/site/PedidoForm";

export default function PedidoPage() {
  return (
    <main className="mx-auto max-w-[960px] px-6 pb-16 pt-12">
      <h1 className="mb-6 font-display text-6xl font-bold uppercase leading-none">Mi pedido</h1>
      <PedidoForm />
    </main>
  );
}
