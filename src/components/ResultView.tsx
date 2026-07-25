import React, { useState } from 'react';
import { Download, BookmarkPlus, Check, RefreshCw, Copy, Share2, Sparkles } from 'lucide-react';

interface ResultViewProps {
  image: string;
  copy: string;
  headline: string;
  engine?: string;
  onSave: (image: string, copy: string, headline: string) => Promise<void>;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  image,
  copy,
  headline,
  engine = 'gemini',
  onSave,
  onReset
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image;
    link.download = `norai-street-editorial-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSession = async () => {
    if (isSaved || isSaving) return;
    setIsSaving(true);
    try {
      await onSave(image, copy, headline);
      setIsSaved(true);
    } catch (e) {
      console.error('Failed to save session:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyText = () => {
    const fullText = `${headline}\n\n${copy}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Editorial Image Frame */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-2xl group">
            <img
              src={image}
              alt="NØRAI Street Editorial Synthesis"
              className="w-full h-auto max-h-[720px] object-contain mx-auto"
            />
            
            {/* Watermark / Branding overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 opacity-90">
              <span className="font-serif text-sm tracking-widest uppercase">
                NØRAI <span className="text-red-500 font-sans text-[10px] ml-1">STREET</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-white/50">
                Engine: {engine.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Editorial Content & Actions Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
            
            {/* Headline */}
            <div>
              <span className="text-[10px] uppercase tracking-widest text-red-400 font-mono font-semibold block mb-1">
                EDITORIAL HEADLINE
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-white leading-tight">
                {headline || 'STREET ESSENTIALS'}
              </h2>
            </div>

            {/* Editorial Copywriting */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono block">
                MAGAZINE & SOCIAL CAPTION
              </span>
              <p className="text-sm font-sans text-white/80 leading-relaxed font-light whitespace-pre-line bg-white/[0.03] p-4 rounded-xl border border-white/10">
                {copy}
              </p>
            </div>

            {/* Action Buttons Grid */}
            <div className="space-y-3 pt-2">
              
              {/* Download Result Button */}
              <button
                onClick={handleDownload}
                className="w-full py-4 bg-white text-black rounded-xl font-medium uppercase tracking-widest text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-2.5 shadow-lg group"
              >
                <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                <span>Descargar Imagen Editorial (PNG)</span>
              </button>

              {/* Save Session Button */}
              <button
                onClick={handleSaveSession}
                disabled={isSaved || isSaving}
                className={`w-full py-3.5 rounded-xl font-medium uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2.5 border ${
                  isSaved
                    ? 'border-green-500/40 bg-green-500/10 text-green-300'
                    : 'border-white/20 bg-white/5 hover:bg-white/10 text-white'
                }`}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : isSaved ? (
                  <>
                    <Check size={16} className="text-green-400" />
                    <span>Guardado en Sesiones</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus size={16} />
                    <span>Guardar Sesión en Archivo</span>
                  </>
                )}
              </button>

              {/* Copy Caption Button */}
              <button
                onClick={handleCopyText}
                className="w-full py-3 rounded-xl font-medium uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 border border-white/10 bg-transparent text-white/70 hover:text-white hover:bg-white/5"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-green-400" />
                    <span>Texto Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copiar Caption & Hashtags</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-center">
              <button
                onClick={onReset}
                className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors"
              >
                <RefreshCw size={14} />
                Generar Nueva Editorial
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
