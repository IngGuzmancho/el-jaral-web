"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="text-sm text-neutral-300 hover:text-white"
      onClick={async () => {
        await createClient().auth.signOut();
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      Salir
    </button>
  );
}
