import React, { useState } from 'react';
import { STREET_PRESETS, StreetPreset, generateDemoImage } from '../data/demoData';
import { ResultView } from './ResultView';
import { Sparkles, ArrowLeft, Sliders, ShieldCheck } from 'lucide-react';

interface DemoViewProps {
  onBack: () => void;
  onAdminClick: () => void;
}

export const DemoView: React.FC<DemoViewProps> = ({ onBack, onAdminClick }) => {
  const [selectedPreset, setSelectedPreset] = useState<StreetPreset>(STREET_PRESETS[0]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [demoResult, setDemoResult] = useState<{
    image: string;
    headline: string;
    copy: string;
  } | null>(null);

  const handleRunDemo = () => {
    setIsSynthesizing(true);
    setDemoResult(null);

    setTimeout(() => {
      const img = generateDemoImage(selectedPreset.sceneDescription);
      setDemoResult({
        image: img,
        headline: selectedPreset.name.toUpperCase(),
        copy: `High-fashion street editorial synthesized for NØRAI STREET. Scene backdrop: ${selectedPreset.sceneDescription} Keywords: ${selectedPreset.keywords.join(', ')}. #NØRAI #STREET #editorial #streetfashion #noraimoda`
      });
      setIsSynthesizing(false);
    }, 1800);
  };

  return (
    <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto min-h-screen flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al Archivo
        </button>

        <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-mono rounded-full">
          MODO DEMOSTRACIÓN INTERACTIVA
        </span>
      </div>

      {!demoResult ? (
        <div className="max-w-4xl mx-auto w-full space-y-12">
          <div className="text-center space-y-4">
            <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight">
              Prueba Interactiva Street AI
            </h1>
            <p className="text-white/50 text-sm font-sans font-light tracking-wide max-w-xl mx-auto leading-relaxed">
              Prueba el generador editorial de street fashion. Selecciona un ambiente urbano y presiona "Synthesize Demo" para ver la simulación en tiempo real.
            </p>
          </div>

          {/* Presets grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STREET_PRESETS.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-white bg-white/10 shadow-2xl scale-[1.02]'
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-red-400">
                        {preset.category}
                      </span>
                      {isSelected && <Sparkles size={16} className="text-white" />}
                    </div>
                    <h3 className="font-serif text-2xl font-light mb-2">{preset.name}</h3>
                    <p className="text-xs text-white/60 font-light leading-relaxed mb-4">
                      {preset.sceneDescription}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10">
                    {preset.keywords.map((kw, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/50">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-center justify-center space-y-4 pt-4">
            <button
              onClick={handleRunDemo}
              disabled={isSynthesizing}
              className="px-12 py-5 bg-white text-black rounded-full font-semibold uppercase tracking-widest text-xs hover:bg-gray-200 transition-all shadow-2xl flex items-center gap-3 disabled:opacity-50"
            >
              {isSynthesizing ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Sintetizando Escena Street...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="text-black" />
                  Sintetizar Demo Editorial
                </>
              )}
            </button>

            <button
              onClick={onAdminClick}
              className="text-xs uppercase tracking-wider text-white/40 hover:text-white transition-colors"
            >
              ¿Tienes claves API? Inicia sesión para usar modelos Gemini u OpenAI reales →
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
          <ResultView
            image={demoResult.image}
            copy={demoResult.copy}
            headline={demoResult.headline}
            engine="demo"
            onSave={async (img, copy, headline) => {
              const existing = JSON.parse(localStorage.getItem('norai_street_history') || '[]');
              const newItem = {
                id: `demo_${Date.now()}`,
                resultImage: img,
                copy,
                headline,
                prompt: selectedPreset.name,
                engine: 'demo' as const,
                createdAt: Date.now()
              };
              localStorage.setItem('norai_street_history', JSON.stringify([newItem, ...existing]));
            }}
            onReset={() => setDemoResult(null)}
          />
        </div>
      )}
    </main>
  );
};
