import React, { useState } from 'react';
import { ArrowLeft, Lock, Sparkles, ShieldCheck } from 'lucide-react';
import { auth } from '../firebase';
import { getIdTokenResult, sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth';

interface LoginViewProps {
  onBack: () => void;
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onBack, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth) {
      setError('El acceso editorial no está configurado. Contacta con administración.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);

      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user, { url: window.location.origin });
        await signOut(auth);
        setError('Te hemos enviado un correo de verificación. Ábrelo antes de volver a iniciar sesión.');
        return;
      }

      const token = await getIdTokenResult(credential.user, true);

      if (token.claims.admin !== true) {
        await signOut(auth);
        throw new Error('not-admin');
      }

      onLogin();
    } catch {
      setError('Credenciales no válidas o cuenta sin permiso editorial.');
    } finally {
      setIsLoading(false);
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

        <div className="flex items-center">
          <img 
            src="/logo.png" 
            alt="NØRAI STREET FASHION" 
            className="h-10 w-auto object-contain" 
          />
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
              Inicia sesión con una cuenta editorial autorizada para acceder al generador.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/70 mb-2 font-medium">
                Correo editorial
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="editor@ejemplo.com"
                autoComplete="username"
                required
                className="w-full px-5 py-4 bg-white/5 border border-white/15 rounded-xl text-sm font-sans focus:outline-none focus:border-white transition-all"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/70 mb-2 font-medium">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Tu contraseña"
                autoComplete="current-password"
                required
                className="w-full px-5 py-4 bg-white/5 border border-white/15 rounded-xl text-sm font-sans focus:outline-none focus:border-white transition-all"
              />
              {error && (
                <p className="text-xs text-red-400 mt-2 text-center font-sans">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-white text-black rounded-xl font-medium uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Desbloquear Generador Street
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <div className="inline-flex items-center gap-2 text-[11px] text-white/40 font-mono">
              <ShieldCheck size={14} className="text-green-500" />
              <span>Acceso protegido con Firebase Auth</span>
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
