import React from 'react';
import { STREET_PRESETS, StreetPreset } from '../data/demoData';
import { Compass, Sparkles, Tag } from 'lucide-react';

interface StreetPromptInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  selectedPreset: string | null;
  onSelectPreset: (preset: StreetPreset) => void;
}

export const StreetPromptInput: React.FC<StreetPromptInputProps> = ({
  prompt,
  onPromptChange,
  selectedPreset,
  onSelectPreset
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <label className="font-serif text-lg tracking-wide uppercase text-white/90 font-light flex items-center gap-2">
          <Compass size={18} className="text-white/60" />
          03. Street Scene & Ambience Prompt
        </label>
        <span className="text-[11px] text-white/40 font-mono">OPTIONAL OR CUSTOM</span>
      </div>

      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          maxLength={1000}
          placeholder="Describe the street fashion scene (e.g. 'Rainy night in Tokyo Shibuya with neon reflections', 'Brutalist concrete architecture backdrop in Berlin with high-contrast sunlight')..."
          rows={3}
          className="w-full px-5 py-4 bg-white/[0.03] border border-white/15 rounded-2xl text-sm font-sans text-white placeholder-white/30 focus:outline-none focus:border-white/50 focus:bg-white/[0.05] transition-all resize-none leading-relaxed"
        />
        <span className="absolute bottom-3 right-4 text-[10px] font-mono text-white/30" aria-live="polite">
          {prompt.length}/1000
        </span>
      </div>

      {/* Street Presets Selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/50 font-medium">
          <Tag size={13} className="text-amber-400" />
          <span>Quick Street Presets</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {STREET_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-sans transition-all duration-200 ${
                  isSelected
                    ? 'bg-white text-black font-medium shadow-md scale-[1.02]'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                <Sparkles size={12} className={isSelected ? 'text-black' : 'text-amber-400'} />
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
