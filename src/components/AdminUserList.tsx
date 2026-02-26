"use client";

import { useState } from "react";

interface UserItem {
  _id: string;
  nickname: string;
  isApproved: boolean;
  isAdmin: boolean;
  createdAt: string;
}

interface AdminUserListProps {
  users: UserItem[];
  onUpdate: () => void;
}

export default function AdminUserList({ users, onUpdate }: AdminUserListProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(userId: string, updates: Record<string, boolean>) {
    setLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });
      if (res.ok) onUpdate();
    } finally {
      setLoading(null);
    }
  }

  const pending = users.filter((u) => !u.isApproved);
  const approved = users.filter((u) => u.isApproved);

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-yellow-400 mb-3">
            Pendientes de aprobación ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between bg-slate-800 border border-yellow-500/30 rounded-xl p-4"
              >
                <div>
                  <span className="font-medium text-slate-100">{user.nickname}</span>
                  <span className="text-xs text-slate-400 ml-2">
                    {new Date(user.createdAt).toLocaleDateString("es")}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(user._id, { isApproved: true })}
                    disabled={loading === user._id}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-sm rounded-lg disabled:opacity-50"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleAction(user._id, { isApproved: false })}
                    disabled={loading === user._id}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-teal-400 mb-3">
          Usuarios aprobados ({approved.length})
        </h2>
        <div className="space-y-2">
          {approved.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl p-4"
            >
              <div>
                <span className="font-medium text-slate-100">{user.nickname}</span>
                {user.isAdmin && (
                  <span className="ml-2 text-xs bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
                <span className="text-xs text-slate-400 ml-2">
                  {new Date(user.createdAt).toLocaleDateString("es")}
                </span>
              </div>
              <div className="flex gap-2">
                {!user.isAdmin && (
                  <button
                    onClick={() => handleAction(user._id, { isAdmin: true })}
                    disabled={loading === user._id}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg disabled:opacity-50"
                  >
                    Hacer Admin
                  </button>
                )}
                <button
                  onClick={() => handleAction(user._id, { isApproved: false })}
                  disabled={loading === user._id}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm rounded-lg disabled:opacity-50"
                >
                  Revocar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
