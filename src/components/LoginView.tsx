import React, { useState } from 'react';
import { ArrowLeft, Lock, Sparkles, ShieldCheck } from 'lucide-react';

interface LoginViewProps {
  onBack: () => void;
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onBack, onLogin }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const envPasscode = import.meta.env.VITE_EDITORIAL_ACCESS_CODE;
    const input = accessCode.trim();

    // Secure editorial passcodes
    const validCodes = [
      envPasscode,
      'NORAI-STREET-2026-X9',
      'EDITORIAL-MODA-STREET#2026',
      'NORAI-EDITOR-PRO-99'
    ].filter(Boolean);

    if (validCodes.includes(input)) {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Top Header */}
      <header className="flex items-center justify-between w-full max-w-7xl mx-auto z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al Archivo
        </button>

        <div className="font-serif text-2xl tracking-[0.2em] uppercase font-light">
          NØRAI <span className="text-red-500 font-sans text-xs tracking-widest ml-1 font-semibold">STREET</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md mx-auto my-auto z-10 py-12">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl relative">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white">
              <Lock size={28} />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl font-light tracking-wide mb-2">
              Acceso Portal Editorial
            </h1>
            <p className="text-xs text-white/50 font-sans font-light tracking-wide leading-relaxed">
              Introduce tu clave de acceso autorizada NØRAI para desbloquear la síntesis editorial de street fashion.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/70 mb-2 font-medium">
                Clave de Acceso Editorial
              </label>
              <input
                type="password"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  setError(false);
                }}
                placeholder="Introduce tu clave de seguridad..."
                className="w-full px-5 py-4 bg-white/5 border border-white/15 rounded-xl text-sm font-sans focus:outline-none focus:border-white transition-all text-center tracking-widest"
                autoFocus
              />
              {error && (
                <p className="text-xs text-red-400 mt-2 text-center font-sans">
                  Clave de acceso no válida o expirada. Por favor verifica tus credenciales de editor.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-white text-black rounded-xl font-medium uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles size={16} />
              Desbloquear Generador Street
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <div className="inline-flex items-center gap-2 text-[11px] text-white/40 font-mono">
              <ShieldCheck size={14} className="text-green-500" />
              <span>NØRAI Security Protocol Active</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] uppercase tracking-widest text-white/30 font-sans z-10">
        © {new Date().getFullYear()} NØRAI MODA — ALL RIGHTS RESERVED
      </footer>
    </div>
  );
};
