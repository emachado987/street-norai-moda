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

// SVG high-res mock graphics generator for realistic offline demo rendering
export const generateDemoImage = (promptText: string, garmentType: string = 'Garment'): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // Gradient background simulating street lighting
  const grad = ctx.createLinearGradient(0, 0, 900, 1200);
  grad.addColorStop(0, '#0f0f11');
  grad.addColorStop(0.5, '#1e1b2e');
  grad.addColorStop(1, '#050505');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 900, 1200);

  // Geometric abstract shapes representing architectural street backdrop
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.beginPath();
  ctx.moveTo(100, 0);
  ctx.lineTo(450, 1200);
  ctx.lineTo(0, 1200);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 59, 48, 0.15)'; // Street accent light
  ctx.beginPath();
  ctx.arc(700, 300, 250, 0, Math.PI * 2);
  ctx.fill();

  // Model silhouette
  ctx.fillStyle = '#141416';
  // Head
  ctx.beginPath();
  ctx.arc(450, 280, 75, 0, Math.PI * 2);
  ctx.fill();
  // Body torso
  ctx.beginPath();
  ctx.moveTo(350, 370);
  ctx.lineTo(550, 370);
  ctx.lineTo(580, 850);
  ctx.lineTo(320, 850);
  ctx.closePath();
  ctx.fill();

  // Garment overlay simulation
  ctx.fillStyle = 'rgba(240, 240, 245, 0.9)';
  ctx.fillRect(360, 420, 180, 280);

  // Typography backdrop "NØRAI STREET"
  ctx.font = 'bold 80px "Cormorant Garamond", serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.textAlign = 'center';
  ctx.fillText('NØRAI STREET', 450, 220);

  ctx.font = '24px "Inter", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText('EDITORIAL STREET SYNTHESIS', 450, 950);

  ctx.font = 'italic 20px "Cormorant Garamond", serif';
  ctx.fillStyle = '#ff3b30';
  ctx.fillText(`"${promptText.substring(0, 45)}..."`, 450, 1000);

  return canvas.toDataURL('image/png');
};

export const INITIAL_DEMO_HISTORY: HistoryItem[] = [
  {
    id: 'demo-1',
    resultImage: generateDemoImage('Shibuya Rain & Neon Night Street Style'),
    prompt: 'Shibuya Rain & Neon',
    headline: 'TOKYO NIGHT SHIFT',
    copy: 'Urban night dynamics synthesized in rain-soaked Shibuya. Clean silhouette meets high-contrast raw street fashion. #NØRAI #STREET #TokyoStreetStyle',
    engine: 'demo',
    createdAt: Date.now() - 3600000 * 2
  },
  {
    id: 'demo-2',
    resultImage: generateDemoImage('Brutalist Minimalist Concrete Editorial'),
    prompt: 'Brutalist Concrete Loft',
    headline: 'MONOLITHIC TAILORING',
    copy: 'Sharp geometric cuts against brutalist architecture. Stripped-down aesthetic focused on proportion and modern texture. #NØRAI #BrutalistModa #Minimalist',
    engine: 'demo',
    createdAt: Date.now() - 3600000 * 24
  }
];
