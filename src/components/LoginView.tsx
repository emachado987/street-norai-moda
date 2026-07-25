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
    // Demo password or admin password for editorial access
    if (accessCode.trim() === 'NORAI' || accessCode.trim() === 'STREET' || accessCode.trim() === 'admin' || accessCode.trim() === 'norai2026') {
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
          Back to Archive
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
              Editorial Portal Access
            </h1>
            <p className="text-xs text-white/50 font-sans font-light tracking-wide leading-relaxed">
              Enter your NØRAI access key to unlock high-resolution street fashion AI synthesis.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/70 mb-2 font-medium">
                Passcode / Access Key
              </label>
              <input
                type="password"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  setError(false);
                }}
                placeholder="Enter access code..."
                className="w-full px-5 py-4 bg-white/5 border border-white/15 rounded-xl text-sm font-sans focus:outline-none focus:border-white transition-all text-center tracking-widest"
                autoFocus
              />
              {error && (
                <p className="text-xs text-red-400 mt-2 text-center">
                  Invalid access key. Try <code className="bg-white/10 px-1 py-0.5 rounded">NORAI</code> or <code className="bg-white/10 px-1.5 py-0.5 rounded">STREET</code>.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-white text-black rounded-xl font-medium uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles size={16} />
              Unlock Street Generator
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <div className="inline-flex items-center gap-2 text-[11px] text-white/40 font-mono">
              <ShieldCheck size={14} className="text-green-500" />
              <span>NØRAI VPS & Firebase Ready</span>
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
