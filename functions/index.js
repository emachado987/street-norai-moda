const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

setGlobalOptions({
  maxInstances: 10,
  timeoutSeconds: 300,
  memory: "1GiB"
});

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '50mb' }));

app.post('/api/generate-street', async (req, res) => {
  try {
    const { productImageBase64, modelImageBase64, scenePrompt, apiKey } = req.body;
    const geminiKey = apiKey || process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      return res.json({
        isDemo: true,
        engine: 'demo',
        headline: 'STREET DEMO MODE',
        copy: 'GEMINI_API_KEY is not configured on Firebase server. Demo mode fallback returned.'
      });
    }

    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const parts = [];

    if (productImageBase64) {
      const match = productImageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (match) parts.push({ inlineData: { data: match[2], mimeType: match[1] } });
    }

    if (modelImageBase64) {
      const match = modelImageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (match) parts.push({ inlineData: { data: match[2], mimeType: match[1] } });
    }

    parts.push({
      text: `High-fashion street editorial photography for NØRAI STREET. Scene: ${scenePrompt || 'Urban street style'}. Include background typography 'NØRAI STREET'.`
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: { parts },
      config: { imageConfig: { aspectRatio: '3:4', imageSize: '1K' } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return res.json({
          image: `data:image/png;base64,${part.inlineData.data}`,
          headline: scenePrompt ? scenePrompt.toUpperCase().substring(0, 24) : 'URBAN STREET EDITION',
          copy: `Synthesized street style editorial photo. #NØRAI #STREET`,
          engine: 'gemini'
        });
      }
    }

    res.status(500).json({ error: 'No image returned from Gemini model.' });
  } catch (err) {
    console.error('Functions error:', err);
    res.status(500).json({ error: err.message || 'Error generating image' });
  }
});

exports.api = onRequest({ cors: true, invoker: 'public' }, app);
