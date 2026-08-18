import { GenerationOptions, GenerationResult } from './gemini';
import { getDemoImagePath } from '../data/demoData';
import { auth } from '../firebase';

const addWatermark = async (imageSource: string): Promise<string> => new Promise((resolve) => {
  const image = new Image();
  image.crossOrigin = 'anonymous';

  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return resolve(imageSource);

    context.drawImage(image, 0, 0);
    const watermarkWidth = image.width * 0.08;
    const padding = image.width * 0.04;
    let useLightWatermark = true;

    try {
      const x = Math.max(0, image.width - watermarkWidth - padding);
      const y = Math.max(0, image.height - watermarkWidth - padding);
      const pixels = context.getImageData(x, y, watermarkWidth, watermarkWidth).data;
      let luminance = 0;

      for (let index = 0; index < pixels.length; index += 4) {
        luminance += (0.299 * pixels[index]) + (0.587 * pixels[index + 1]) + (0.114 * pixels[index + 2]);
      }

      useLightWatermark = luminance / (pixels.length / 4) < 128;
    } catch {
      useLightWatermark = true;
    }

    const watermark = new Image();
    watermark.crossOrigin = 'anonymous';
    watermark.onload = () => {
      const watermarkHeight = (watermark.height / watermark.width) * watermarkWidth;
      context.drawImage(
        watermark,
        image.width - watermarkWidth - padding,
        image.height - watermarkHeight - padding,
        watermarkWidth,
        watermarkHeight
      );
      resolve(canvas.toDataURL('image/png', 0.9));
    };
    watermark.onerror = () => resolve(imageSource);
    watermark.src = useLightWatermark
      ? '/watermark/ai-created-cutout-light-grey.png'
      : '/watermark/ai-created-cutout-dark-grey.png';
  };

  image.onerror = () => resolve(imageSource);
  image.src = imageSource;
});

const getDemoImage = (prompt: string): string => {
  const normalized = prompt.toLowerCase();
  if (normalized.includes('paris') || normalized.includes('haussmann')) return getDemoImagePath('parisian-boulevard');
  if (normalized.includes('brutalist') || normalized.includes('concrete')) return getDemoImagePath('brutalist-concrete');
  if (normalized.includes('soho') || normalized.includes('new york')) return getDemoImagePath('soho-golden-hour');
  if (normalized.includes('berlin')) return getDemoImagePath('berlin-industrial');
  if (normalized.includes('venice')) return getDemoImagePath('venice-canal-twilight');
  if (normalized.includes('milan')) return getDemoImagePath('milan-galleria');
  return getDemoImagePath('shibuya-rain');
};

const getApiError = (status: number, retryAfter: string | null): string => {
  if (status === 401) return 'Tu sesión ha caducado. Vuelve a iniciar sesión.';
  if (status === 403) return 'Tu cuenta no tiene permiso editorial.';
  if (status === 413) return 'Una de las imágenes supera el tamaño permitido.';
  if (status === 429) {
    const seconds = Number(retryAfter || 0);
    const suffix = seconds > 0 ? ` Espera ${Math.ceil(seconds / 60)} minuto(s).` : '';
    return `Has alcanzado el límite temporal de generaciones.${suffix}`;
  }
  return 'El generador no está disponible en este momento. Inténtalo de nuevo más tarde.';
};

export const generateStreetFashion = async (options: GenerationOptions): Promise<GenerationResult> => {
  const user = auth?.currentUser;
  if (!user) throw new Error('Debes iniciar sesión con una cuenta editorial.');

  const token = await user.getIdToken();
  const response = await fetch('/api/generate-street', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(options)
  });

  if (!response.ok) {
    throw new Error(getApiError(response.status, response.headers.get('Retry-After')));
  }

  const data = await response.json();
  const image = data.image || (data.isDemo ? getDemoImage(options.scenePrompt || '') : null);
  if (!image) throw new Error('El proveedor de IA no devolvió ninguna imagen.');

  return {
    image: await addWatermark(image),
    headline: data.headline || 'NØRAI STREET EDITORIAL',
    copy: data.copy || 'Editorial de moda urbana generado con IA por NØRAI.',
    engine: data.engine || options.engine,
    isDemo: Boolean(data.isDemo)
  };
};
