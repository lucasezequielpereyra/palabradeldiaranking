"use client";

import { motion } from "framer-motion";

interface HowToPlayBannerProps {
  onClose: () => void;
}

export default function HowToPlayBanner({ onClose }: HowToPlayBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full max-w-sm bg-slate-800/95 border border-slate-700 rounded-2xl p-5 text-sm"
    >
      <h3 className="font-bold text-lg text-teal-400 mb-3">
        ¿Cómo se juega?
      </h3>

      <p className="text-slate-300 mb-3">
        Adiviná la palabra de 5 letras en 6 intentos. Después de cada intento, las letras cambian de color:
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-600 rounded flex items-center justify-center font-bold text-white text-lg shrink-0">
            A
          </div>
          <span className="text-slate-300">Letra correcta, posición correcta</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-yellow-500 rounded flex items-center justify-center font-bold text-white text-lg shrink-0">
            B
          </div>
          <span className="text-slate-300">Letra correcta, posición incorrecta</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-700 rounded flex items-center justify-center font-bold text-white text-lg shrink-0">
            C
          </div>
          <span className="text-slate-300">La letra no está en la palabra</span>
        </div>
      </div>

      <p className="text-slate-400 text-xs mb-4">
        Tu resultado se guarda automáticamente en el ranking. ¡Compartilo con tus amigos!
      </p>

      <button
        onClick={onClose}
        className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg transition-colors"
      >
        ¡A jugar!
      </button>
    </motion.div>
  );
}
