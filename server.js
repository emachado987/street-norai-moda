import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper to extract base64 mime and buffer data
const getMimeAndData = (dataUrl) => {
  if (!dataUrl) return null;
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return null;
  }
  return { mimeType: matches[1], data: matches[2] };
};

// Route: Synthesize Street Fashion Editorial Image & Content
app.post('/api/generate-street', async (req, res) => {
  try {
    const { productImageBase64, modelImageBase64, scenePrompt, engine = 'gemini', apiKey } = req.body;

    const geminiKey = apiKey || process.env.GEMINI_API_KEY;
    const openaiKey = apiKey || process.env.OPENAI_API_KEY;

    const promptText = `High-end realistic street fashion editorial photography for NØRAI STREET.
Scene & Aesthetic: ${scenePrompt || 'Urban raw street fashion backdrop with dramatic atmospheric studio lighting'}.
Model Pose & Styling: High-fashion, modern proportions, crisp urban texture, realistic skin and fabric weight.
Branding: Include subtle background typography with the word "NØRAI STREET" integrated into the urban backdrop.`;

    // 1. Engine: Gemini AI (Multimodal Image Synthesis)
    if (engine === 'gemini' && geminiKey) {
      console.log('[NØRAI Server] Generating with Gemini API...');
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      
      const parts = [];
      const product = getMimeAndData(productImageBase64);
      const model = getMimeAndData(modelImageBase64);

      if (product) parts.push({ inlineData: { data: product.data, mimeType: product.mimeType } });
      if (model) parts.push({ inlineData: { data: model.data, mimeType: model.mimeType } });
      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: { parts },
        config: {
          imageConfig: { aspectRatio: '3:4', imageSize: '1K' }
        }
      });

      let foundImage = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          foundImage = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (foundImage) {
        return res.json({
          image: foundImage,
          headline: scenePrompt ? scenePrompt.toUpperCase().substring(0, 24) : 'URBAN STREET SYNTHESIS',
          copy: `Synthesized street style editorial photo. Concept: "${scenePrompt || 'Street Fashion Edition'}". #NØRAI #STREET #noraimoda`,
          engine: 'gemini'
        });
      }
    }

    // 2. Engine: OpenAI DALL-E 3
    if (engine === 'openai' && openaiKey) {
      console.log('[NØRAI Server] Generating with OpenAI DALL-E 3...');
      const openai = new OpenAI({ apiKey: openaiKey });
      
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: promptText,
        n: 1,
        size: '1024x1792',
        quality: 'hd',
        response_format: 'b64_json'
      });

      if (response.data?.[0]?.b64_json) {
        return res.json({
          image: `data:image/png;base64,${response.data[0].b64_json}`,
          headline: scenePrompt ? scenePrompt.toUpperCase().substring(0, 24) : 'DALL-E STREET EDITORIAL',
          copy: `OpenAI DALL-E 3 high-resolution street fashion editorial. Scene: "${scenePrompt || 'Urban Street Style'}". #NØRAI #STREET #DALL-E3`,
          engine: 'openai'
        });
      }
    }

    // 3. Fallback Demo Mode if no API keys configured on server
    console.log('[NØRAI Server] No API keys configured or fallback requested. Serving Demo Response.');
    return res.json({
      isDemo: true,
      engine: 'demo',
      headline: scenePrompt ? scenePrompt.toUpperCase().substring(0, 25) : 'STREET EDITORIAL DEMO',
      copy: `Demo mode street synthesis. Configure GEMINI_API_KEY or OPENAI_API_KEY in .env or the API Config dialog for real AI generations. #NØRAI #STREET`
    });

  } catch (err) {
    console.error('[NØRAI Server Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to synthesize street fashion image.' });
  }
});

// Serve frontend dist static files for VPS hosting
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[NØRAI STREET SERVER] Running on port ${PORT}`);
});
