"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al registrar");
      } else {
        setSuccess(data.message);
        setNickname("");
        setPassword("");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-bold text-center mb-8 text-teal-400">
        Crear cuenta
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Apodo
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            minLength={2}
            maxLength={20}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Elige un apodo"
          />
          <p className="text-xs text-slate-500 mt-1">Entre 2 y 20 caracteres</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Mínimo 4 caracteres"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl px-4 py-3 text-teal-400 text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-xl transition-colors"
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-6">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-teal-400 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
