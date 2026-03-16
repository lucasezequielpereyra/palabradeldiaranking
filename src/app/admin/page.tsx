"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import AdminUserList from "@/components/AdminUserList";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && !session?.user?.isAdmin) {
      router.push("/");
      return;
    }
    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status, session, router, fetchUsers]);

  if (status === "loading" || loading) {
    return <div className="text-center py-12 text-slate-400">Cargando...</div>;
  }

  if (!session?.user?.isAdmin) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-teal-400">
        Panel de administración
      </h1>
      <AdminUserList users={users} onUpdate={fetchUsers} />
    </div>
  );
}
