import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface AiTransparencyNoticeProps {
  theme: 'dark' | 'light';
}

export const AiTransparencyNotice: React.FC<AiTransparencyNoticeProps> = ({ theme }) => (
  <aside
    role="note"
    aria-label="Información sobre el uso de inteligencia artificial"
    className="glass-panel rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-5 flex items-start gap-4"
  >
    <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-300 shrink-0">
      <Sparkles size={18} aria-hidden="true" />
    </div>
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <strong className="text-sm uppercase tracking-wider">Contenido generado con IA</strong>
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-emerald-300">
          <ShieldCheck size={12} aria-hidden="true" /> Revisión humana requerida
        </span>
      </div>
      <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-black/60' : 'text-white/60'}`}>
        El resultado es una imagen sintética creada a partir de tus instrucciones y referencias. Comprueba derechos, identidad, marcas y posibles errores antes de publicarla.
      </p>
    </div>
  </aside>
);
