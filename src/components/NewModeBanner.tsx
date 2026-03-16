"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function NewModeBanner() {
  const { data: session } = useSession();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!session?.user || session.user.acceptedNewMode || dismissed) return null;

  const handleAccept = async () => {
    setLoading(true);
    try {
      await fetch("/api/user/accept-new-mode", { method: "POST" });
      setDismissed(true);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="bg-teal-900/50 border-b border-teal-700">
      <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 text-center sm:text-left">
          <p className="text-teal-100 text-sm font-medium">
            🎮 ¡Ahora podés jugar La Palabra del Día directamente acá!
          </p>
          <p className="text-teal-300/70 text-xs mt-0.5">
            Ya no necesitás copiar y pegar tu resultado. Jugá desde{" "}
            <Link href="/jugar" className="underline hover:text-teal-200">
              la nueva sección
            </Link>{" "}
            y tu resultado se guarda automáticamente.
          </p>
        </div>
        <button
          onClick={handleAccept}
          disabled={loading}
          className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
        >
          {loading ? "..." : "Entendido"}
        </button>
      </div>
    </div>
  );
}
