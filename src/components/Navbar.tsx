"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/submit", label: "Enviar" },
  { href: "/ranking", label: "Ranking" },
  { href: "/winners", label: "Ganadores" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Top bar */}
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-teal-400">
            🏆 La Palabra
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-teal-500/20 text-teal-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {session?.user?.isAdmin && (
              <Link
                href="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/admin"
                    ? "bg-teal-500/20 text-teal-400"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                <Link
                  href={`/profile/${session.user.nickname}`}
                  className="text-sm text-slate-300 hover:text-teal-400 transition-colors"
                >
                  {session.user.nickname}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-slate-400 hover:text-red-400 transition-colors ml-2"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-300"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                    pathname === item.href
                      ? "bg-teal-500/20 text-teal-400"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {session?.user?.isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Admin
                </Link>
              )}
              <div className="pt-2 border-t border-slate-800">
                {session ? (
                  <div className="flex items-center justify-between px-3 py-2">
                    <Link
                      href={`/profile/${session.user.nickname}`}
                      onClick={() => setMenuOpen(false)}
                      className="text-sm text-teal-400"
                    >
                      {session.user.nickname}
                    </Link>
                    <button
                      onClick={() => { signOut(); setMenuOpen(false); }}
                      className="text-sm text-red-400"
                    >
                      Salir
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-teal-400"
                  >
                    Entrar
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom nav for mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-t border-slate-800">
        <div className="flex justify-around items-center h-14">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full text-xs transition-colors ${
                pathname === item.href ? "text-teal-400" : "text-slate-400"
              }`}
            >
              <span className="text-lg">
                {item.label === "Inicio" && "🏠"}
                {item.label === "Enviar" && "📝"}
                {item.label === "Ranking" && "🏆"}
                {item.label === "Ganadores" && "⭐"}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
