# NØRAI STREET (street.norai.moda)

Web App de sintetizado editorial realista de **Street Fashion** para **street.norai.moda**.

Prenda/producto/modelo + escena street -> Síntesis de fotografía editorial realista con IA.

---

## ⚡ Características Principales

1. **Aestética Editorial NØRAI**: Inspirada en `editorial.norai.moda`, tipografía serif *Cormorant Garamond*, sans *Inter*, paleta `#050505` con acentos urbanos y glassmorphism.
2. **Acceso & Portal de Login**: Clave de acceso (`NORAI`, `STREET`, `admin`) con soporte para Firebase Auth en producción.
3. **Subida Multimodal de Imágenes**: Permite subir fotos de prenda, modelo, maniquí o producto con vista previa e interacciones drag & drop.
4. **Prompt de Escena Street & Presets**: Entrada libre para descripciones urbanas + selección rápida de presets ("Shibuya Rain & Neon", "Parisian Boulevard", "Brutalist Concrete Loft", "Soho Golden Hour", "Berlin Industrial").
5. **Motor IA Dual**:
   - **Google Gemini API** (`@google/genai`, `gemini-3.1-flash-image-preview` / Imagen 3) como motor recomendado.
   - **OpenAI Images API** (`openai`, DALL-E 3) como alternativa configurable.
6. **Fallback Demo Inteligente**: Funciona inmediatamente en modo demostración offline cuando no hay claves API configuradas.
7. **Descarga en 1 Clic**: Botón directo para descargar la imagen editorial sintetizada en formato PNG alta resolución.
8. **Persistencia de Sesiones**:
   - **Local Storage**: Guarda automáticamente las sesiones generadas localmente por usuario.
   - **Firebase Storage & Firestore**: Preparado para guardar imágenes e historial en la colección `street_history` en producción.

---

## 🚀 Despliegue en VPS (Systemd / PM2 + Nginx)

Para desplegar `street.norai.moda` en un servidor VPS:

```bash
# 1. Instalar dependencias y construir la app
npm install
npm run build

# 2. Configurar variables de entorno
cp .env.example .env
nano .env # Añadir GEMINI_API_KEY / OPENAI_API_KEY

# 3. Iniciar el servidor Express con PM2
pm2 start server.js --name "street-norai-moda"
```

### Configuración Nginx para `street.norai.moda`:

```nginx
server {
    server_name street.norai.moda;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔥 Despliegue en Firebase (Hosting & Functions)

```bash
# 1. Autenticar Firebase
npx firebase login

# 2. Desplegar Hosting y Cloud Functions
npx firebase deploy
```

---

## 🛠️ Desarrollo Local

```bash
npm run dev
```

Abre `http://localhost:3000` en tu navegador.
