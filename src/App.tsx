import React, { useState, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { StreetPromptInput } from './components/StreetPromptInput';
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';
import { LoginView } from './components/LoginView';
import { DemoView } from './components/DemoView';
import { AiTransparencyNotice } from './components/AiTransparencyNotice';
import { generateStreetFashion } from './services/api';
import { StreetPreset } from './data/demoData';
import { saveHistoryItem } from './services/storageService';
import { auth } from './firebase';
import { getIdTokenResult, onAuthStateChanged, signOut } from 'firebase/auth';
import { Sparkles, History, ArrowRight, Sun, Moon, LogOut } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'archive' | 'login' | 'generator' | 'demo'>('archive');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('norai_theme') as 'dark' | 'light') || 'dark';
  });

  const [productImage, setProductImage] = useState<string | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [streetPrompt, setStreetPrompt] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedCopy, setGeneratedCopy] = useState<string | null>(null);
  const [generatedHeadline, setGeneratedHeadline] = useState<string | null>(null);
  const [usedEngine, setUsedEngine] = useState<string>('gemini');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Remove secrets saved by versions anteriores. Provider keys now live only on the server.
    localStorage.removeItem('norai_gemini_key');
    localStorage.removeItem('norai_openai_key');
    localStorage.removeItem('norai_selected_engine');
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('norai_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!auth) return;

    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const token = await getIdTokenResult(user, true);
        setIsAuthenticated(token.claims.admin === true);
      } catch {
        setIsAuthenticated(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated && currentView === 'generator') setCurrentView('archive');
  }, [currentView, isAuthenticated]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = async () => {
    if (auth) await signOut(auth);
    setIsAuthenticated(false);
    reset();
    setCurrentView('archive');
  };

  const handleSelectPreset = (preset: StreetPreset) => {
    setSelectedPresetId(preset.id);
    setStreetPrompt(preset.sceneDescription);
  };

  const handleGenerate = async () => {
    if (!productImage && !modelImage && !streetPrompt) {
      setError('Por favor, sube una foto (prenda/modelo) o escribe una descripción de la escena street.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateStreetFashion({
        productImageBase64: productImage,
        modelImageBase64: modelImage,
        scenePrompt: streetPrompt,
        engine: 'gemini'
      });

      setGeneratedImage(result.image);
      setGeneratedHeadline(result.headline);
      setGeneratedCopy(result.copy);
      setUsedEngine(result.engine);
    } catch (err: any) {
      console.error('Generación fallida:', err);
      setError(err.message || 'Fallo al generar la imagen editorial. Por favor intenta nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToHistory = async (image: string, copy: string, headline: string) => {
    try {
      await saveHistoryItem({
        resultImage: image,
        prompt: streetPrompt,
        headline,
        copy,
        engine: usedEngine as any,
        createdAt: Date.now()
      });
      console.log('[NØRAI App] Session saved successfully');
    } catch (e) {
      console.error('[NØRAI App] Error saving history item:', e);
    }
  };

  const reset = () => {
    setProductImage(null);
    setModelImage(null);
    setStreetPrompt('');
    setSelectedPresetId(null);
    setGeneratedImage(null);
    setGeneratedCopy(null);
    setGeneratedHeadline(null);
    setError(null);
  };

  if (currentView === 'login') {
    return (
      <LoginView
        onBack={() => setCurrentView('archive')}
        onLogin={() => {
          setIsAuthenticated(true);
          setCurrentView('generator');
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'light' ? 'bg-[#f7f7f8] text-[#0f0f11]' : 'bg-[#050505] text-[#f9f9f9]'} selection:bg-white/20`}>
      {/* Editorial Header Navigation */}
      <nav className="fixed top-0 w-full glass-nav z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="cursor-pointer flex items-center"
            onClick={() => {
              reset();
              setCurrentView('archive');
            }}
          >
            <img 
              src="/logo.png" 
              alt="NØRAI STREET FASHION" 
              className="h-12 md:h-14 w-auto object-contain hover:opacity-90 transition-opacity" 
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-full border transition-all duration-200 ${
                theme === 'light'
                  ? 'border-black/15 bg-black/5 text-black hover:bg-black/10'
                  : 'border-white/15 bg-black/40 text-amber-400 hover:bg-white/10'
              }`}
              title={theme === 'light' ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {currentView !== 'archive' ? (
              <button
                onClick={() => setCurrentView('archive')}
                className={`flex items-center gap-2 text-xs uppercase tracking-widest transition-colors px-3.5 py-2 rounded-full border ${
                  theme === 'light'
                    ? 'border-black/15 hover:bg-black/5 text-black'
                    : 'border-white/10 hover:text-white/70 text-white'
                }`}
              >
                <History size={15} />
                Lookbook / Archive
              </button>
            ) : isAuthenticated ? (
              <button
                onClick={() => setCurrentView('generator')}
                className={`flex items-center gap-2 text-xs uppercase tracking-widest transition-colors px-4 py-2 rounded-full font-semibold ${
                  theme === 'light'
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                <Sparkles size={15} />
                Generator
              </button>
            ) : null}

            {/* Logout Button */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans uppercase tracking-wider transition-colors border ${
                  theme === 'light'
                    ? 'border-red-500/30 text-red-600 hover:bg-red-500/10'
                    : 'border-red-500/30 text-red-400 hover:bg-red-500/20'
                }`}
                title="Cerrar sesión"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main View Router */}
      {currentView === 'archive' ? (
        <HistoryView
          onAdminClick={() => setCurrentView('login')}
          onGeneratorClick={() => setCurrentView('generator')}
          onDemoClick={() => setCurrentView('demo')}
          isAuthenticated={isAuthenticated}
        />
      ) : currentView === 'demo' ? (
        <DemoView
          onBack={() => setCurrentView('archive')}
          onAdminClick={() => setCurrentView('login')}
        />
      ) : (
        <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen flex flex-col">
          {!generatedImage ? (
            <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full space-y-10">
              
              {/* Generator Title */}
              <div className="text-center space-y-4">
                <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight">
                  Street Fashion AI Synthesizer
                </h1>
                <p className={`${theme === 'light' ? 'text-black/60' : 'text-white/50'} font-sans font-light tracking-wide max-w-2xl mx-auto leading-relaxed text-sm sm:text-base`}>
                  Subes una prenda, producto, modelo o maniquí y define el concepto de street fashion. NØRAI sintetizará una fotografía editorial realista.
                </p>
              </div>

              <AiTransparencyNotice theme={theme} />

              {/* Uploaders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ImageUploader
                  label="01. Prenda / Producto / Maniquí"
                  description="Sube la foto del producto o prenda de vestir"
                  image={productImage}
                  onImageChange={setProductImage}
                  icon="shirt"
                />
                <ImageUploader
                  label="02. Modelo / Maniquí (Opcional)"
                  description="Sube la foto del modelo o maniquí de referencia"
                  image={modelImage}
                  onImageChange={setModelImage}
                  icon="user"
                />
              </div>

              {/* Street Scene Prompt Input */}
              <div className="glass-panel p-6 rounded-3xl">
                <StreetPromptInput
                  prompt={streetPrompt}
                  onPromptChange={(val) => {
                    setStreetPrompt(val);
                    setSelectedPresetId(null);
                  }}
                  selectedPreset={selectedPresetId}
                  onSelectPreset={handleSelectPreset}
                />
              </div>

              {error && (
                <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-500 rounded-xl text-center text-sm font-sans">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`group relative flex items-center gap-4 px-12 py-5 rounded-full font-semibold tracking-widest uppercase text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl overflow-hidden ${
                    theme === 'light'
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-white text-black hover:bg-gray-200'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className={`w-5 h-5 border-2 ${theme === 'light' ? 'border-white/20 border-t-white' : 'border-black/20 border-t-black'} rounded-full animate-spin`} />
                      Sintetizando Editorial Street...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} className={theme === 'light' ? 'text-white' : 'text-black'} />
                      Generar Imagen Editorial Realista
                      <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
              <ResultView
                image={generatedImage}
                copy={generatedCopy || ''}
                headline={generatedHeadline || ''}
                engine={usedEngine}
                onSave={handleSaveToHistory}
                onReset={reset}
              />
            </div>
          )}
        </main>
      )}
    </div>
  );
}
