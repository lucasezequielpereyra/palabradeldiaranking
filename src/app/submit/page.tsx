"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SubmitPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/jugar");
  }, [router]);

  return (
    <div className="text-center py-12 text-slate-400">Redirigiendo...</div>
  );
}
