"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ResultForm from "@/components/ResultForm";

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="text-center py-12 text-slate-400">Cargando...</div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-teal-400">
        Enviar resultado
      </h1>
      <p className="text-sm text-slate-400 mb-6">
        Copia el resultado de &quot;La Palabra del Día&quot; desde la app y pégalo abajo.
      </p>
      <ResultForm />
    </div>
  );
}
