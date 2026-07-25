import React, { useState, useEffect } from 'react';
import { Key, Sparkles, Check, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ApiKeyDialogProps {
  onClose?: () => void;
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [engine, setEngine] = useState<'gemini' | 'openai'>('gemini');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const savedGemini = localStorage.getItem('norai_gemini_key') || '';
    const savedOpenai = localStorage.getItem('norai_openai_key') || '';
    const savedEngine = (localStorage.getItem('norai_selected_engine') as 'gemini' | 'openai') || 'gemini';

    setGeminiKey(savedGemini);
    setOpenaiKey(savedOpenai);
    setEngine(savedEngine);
  }, []);

  const handleSave = () => {
    if (geminiKey.trim()) localStorage.setItem('norai_gemini_key', geminiKey.trim());
    else localStorage.removeItem('norai_gemini_key');

    if (openaiKey.trim()) localStorage.setItem('norai_openai_key', openaiKey.trim());
    else localStorage.removeItem('norai_openai_key');

    localStorage.setItem('norai_selected_engine', engine);

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsOpen(false);
      if (onClose) onClose();
    }, 800);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-black/40 hover:bg-white/10 text-xs font-sans tracking-wider uppercase transition-all duration-200"
        title="Configurar Claves API"
      >
        <Key size={13} className="text-amber-400" />
        <span>API Config</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0e0e0e] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl scrollbar-thin">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6 pr-8">
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-amber-400 shrink-0">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="font-serif text-2xl tracking-wide">Configuración de API & Modelos</h3>
                <p className="text-xs text-white/50 font-sans">Configura tus API Keys y elige el motor de generación activo.</p>
              </div>
            </div>

            {/* Engine Selector Cards */}
            <div className="space-y-2 mb-6">
              <label className="block text-xs uppercase tracking-wider text-white/60 font-medium">
                Motor Principal de Generación Activo
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEngine('gemini')}
                  className={`relative p-4 rounded-xl border text-left transition-all ${
                    engine === 'gemini'
                      ? 'border-white bg-white/10 text-white shadow-lg'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-serif font-medium text-lg">Google Gemini</span>
                    {engine === 'gemini' ? (
                      <CheckCircle2 size={16} className="text-amber-400" />
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-sans">Gemini 3.1</span>
                    )}
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Google Gemini / Imagen 3 para síntesis ultrarrealista.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setEngine('openai')}
                  className={`relative p-4 rounded-xl border text-left transition-all ${
                    engine === 'openai'
                      ? 'border-white bg-white/10 text-white shadow-lg'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-serif font-medium text-lg">OpenAI Images</span>
                    {engine === 'openai' ? (
                      <CheckCircle2 size={16} className="text-purple-400" />
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-sans">DALL-E 3</span>
                    )}
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    OpenAI Image API para fotografía editorial.
                  </p>
                </button>
              </div>
            </div>

            {/* Input fields for BOTH keys */}
            <div className="space-y-5 mb-6">
              {/* Gemini Key Input */}
              <div className={`p-4 rounded-xl border transition-colors ${engine === 'gemini' ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10 bg-white/[0.02]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs uppercase tracking-wider text-white/90 font-medium">
                    Google Gemini API Key
                  </label>
                  {engine === 'gemini' && (
                    <span className="text-[10px] uppercase font-mono text-amber-400 tracking-wider">Activo</span>
                  )}
                </div>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/15 rounded-lg text-sm font-mono focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>

              {/* OpenAI Key Input */}
              <div className={`p-4 rounded-xl border transition-colors ${engine === 'openai' ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/10 bg-white/[0.02]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs uppercase tracking-wider text-white/90 font-medium">
                    OpenAI API Key
                  </label>
                  {engine === 'openai' && (
                    <span className="text-[10px] uppercase font-mono text-purple-400 tracking-wider">Activo</span>
                  )}
                </div>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/15 rounded-lg text-sm font-mono focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>

              <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-200 flex items-start gap-2.5 leading-relaxed">
                <ShieldCheck size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Las claves se guardan localmente en tu navegador. Si dejas las claves vacías, el sistema utilizará el servidor o el <strong>Modo Demo Fallback</strong>.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-white/15 text-xs uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-gray-200 transition-colors shadow-lg"
              >
                {savedSuccess ? (
                  <>
                    <Check size={16} className="text-green-600" />
                    ¡Guardado!
                  </>
                ) : (
                  'Guardar Ajustes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
