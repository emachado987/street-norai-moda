export interface GenerationOptions {
  productImageBase64?: string | null;
  modelImageBase64?: string | null;
  scenePrompt: string;
  engine: 'gemini' | 'openai';
  apiKey?: string;
}

export interface GenerationResult {
  image: string;
  headline: string;
  copy: string;
  engine: string;
  isDemo?: boolean;
}
