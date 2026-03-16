"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import WordleGame from "@/components/wordle/WordleGame";

export default function JugarPage() {
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
    <div className="max-w-lg mx-auto py-4">
      <WordleGame />
    </div>
  );
}
