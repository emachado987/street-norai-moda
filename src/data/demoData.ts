export interface StreetPreset {
  id: string;
  name: string;
  category: 'urban' | 'architecture' | 'night' | 'minimal' | 'runway';
  sceneDescription: string;
  keywords: string[];
  backdrop: string;
}

export interface HistoryItem {
  id: string;
  productImage?: string;
  image?: string;
  resultImage: string;
  prompt: string;
  headline: string;
  copy: string;
  engine: 'gemini' | 'openai' | 'demo';
  createdAt: number;
}

export const STREET_PRESETS: StreetPreset[] = [
  {
    id: 'shibuya-rain',
    name: 'Shibuya Rain & Neon',
    category: 'night',
    sceneDescription: 'Wet asphalt reflecting vibrant neon billboards in Tokyo Shibuya crossing, moody night atmospheric haze, dynamic high-fashion street style angle.',
    keywords: ['Tokyo', 'Neon', 'Rain', 'Night', 'Reflections', 'Urban Cyber'],
    backdrop: 'Dark wet city streets with neon blur'
  },
  {
    id: 'parisian-boulevard',
    name: 'Paris Haussmann Daylight',
    category: 'urban',
    sceneDescription: 'Sun-drenched Parisian avenue with grand Haussmann architecture, vintage limestone facades, sharp natural sunlight and elegant editorial shadow interplay.',
    keywords: ['Paris', 'Haussmann', 'Daylight', 'High Fashion', 'Effortless Chic'],
    backdrop: 'Classic Parisian architecture'
  },
  {
    id: 'brutalist-concrete',
    name: 'Brutalist Concrete Loft',
    category: 'minimal',
    sceneDescription: 'Raw brutalist concrete structure with bold industrial lines, architectural shadows, minimalist editorial mood and high-contrast monochrome tones.',
    keywords: ['Brutalist', 'Concrete', 'Minimalist', 'Architectural', 'Monochrome'],
    backdrop: 'Raw grey concrete walls & sharp geometric angles'
  },
  {
    id: 'soho-golden-hour',
    name: 'New York Soho Cast Iron',
    category: 'urban',
    sceneDescription: 'Warm golden hour light cutting through cobblestone streets of Soho Manhattan, historic cast-iron fire escapes, crisp modern street tailoring focus.',
    keywords: ['New York', 'Soho', 'Golden Hour', 'Cast Iron', 'Cobblestone'],
    backdrop: 'New York historic street corner'
  },
  {
    id: 'berlin-industrial',
    name: 'Berlin Underground Railway',
    category: 'night',
    sceneDescription: 'Industrial subway station aesthetic, exposed steel beams, dramatic directional spotlighting, raw street style energy with high-contrast edge.',
    keywords: ['Berlin', 'Industrial', 'Underground', 'Raw', 'Techno Aesthetic'],
    backdrop: 'Subway station steel & tile backdrop'
  },
  {
    id: 'venice-canal-twilight',
    name: 'Venice Canal & Grand Palazzo',
    category: 'urban',
    sceneDescription: 'Mysterious twilight glow reflecting along a narrow Venetian canal, historic Renaissance Palazzo facades, rustic stone bridge, ethereal high-fashion street couture mood.',
    keywords: ['Venice', 'Palazzo', 'Canal', 'Twilight', 'Renaissance', 'Haute Couture'],
    backdrop: 'Historic Venetian canal & stone bridge'
  },
  {
    id: 'milan-galleria',
    name: 'Milan Vittorio Emanuele Galleria',
    category: 'runway',
    sceneDescription: 'High-lux glass dome architecture of Galleria Vittorio Emanuele II in Milan, polished marble flooring, sharp afternoon directional lighting and high-tailoring elegance.',
    keywords: ['Milan', 'Galleria', 'High Tailoring', 'Architecture', 'Lombardy'],
    backdrop: 'Marble arches and glass dome of Milan'
  }
];

// Function to get the correct demo image path based on preset ID or fallback
export const getDemoImagePath = (presetId?: string): string => {
  // If no ID is provided, default to shibuya-rain
  const id = presetId || 'shibuya-rain';
  
  // Check if it's a known preset, otherwise default
  const isValidPreset = STREET_PRESETS.some(p => p.id === id);
  if (!isValidPreset && id !== 'shibuya-rain' && id !== 'brutalist-concrete') {
     // If they enter a random prompt, just give them a fallback demo image
     return '/demo/shibuya-rain.png';
  }
  
  return `/demo/${id}.png`;
};

export const INITIAL_DEMO_HISTORY: HistoryItem[] = [
  {
    id: 'demo-1',
    resultImage: getDemoImagePath('shibuya-rain'),
    prompt: 'Shibuya Rain & Neon',
    headline: 'TOKYO NIGHT SHIFT',
    copy: 'Urban night dynamics synthesized in rain-soaked Shibuya. Clean silhouette meets high-contrast raw street fashion. #NØRAI #STREET #TokyoStreetStyle',
    engine: 'demo',
    createdAt: Date.now() - 3600000 * 2
  },
  {
    id: 'demo-2',
    resultImage: getDemoImagePath('brutalist-concrete'),
    prompt: 'Brutalist Concrete Loft',
    headline: 'MONOLITHIC TAILORING',
    copy: 'Sharp geometric cuts against brutalist architecture. Stripped-down aesthetic focused on proportion and modern texture. #NØRAI #BrutalistModa #Minimalist',
    engine: 'demo',
    createdAt: Date.now() - 3600000 * 24
  }
];
