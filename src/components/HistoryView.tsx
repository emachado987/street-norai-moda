import React, { useState, useEffect } from 'react';
import { HistoryItem, INITIAL_DEMO_HISTORY } from '../data/demoData';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Download, Copy, Trash2, Sparkles, Image as ImageIcon, Check } from 'lucide-react';

interface HistoryViewProps {
  onAdminClick: () => void;
  onGeneratorClick: () => void;
  onDemoClick: () => void;
  isAuthenticated: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onAdminClick,
  onGeneratorClick,
  onDemoClick,
  isAuthenticated
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    let firestoreItems: HistoryItem[] = [];
    let localItems: HistoryItem[] = [];

    // 1. Try loading from Cloud Firestore
    if (db) {
      try {
        const q = query(collection(db, 'street_history'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          firestoreItems.push({
            id: docSnap.id,
            resultImage: data.image || data.resultImage,
            prompt: data.prompt || '',
            headline: data.headline || 'NØRAI STREET',
            copy: data.copy || '',
            engine: data.engine || 'gemini',
            createdAt: data.createdAt || Date.now()
          });
        });
      } catch (err) {
        console.warn('[NØRAI History] Firebase query notice:', err);
      }
    }

    // 2. Load from LocalStorage
    try {
      const local = localStorage.getItem('norai_street_history');
      if (local) {
        localItems = JSON.parse(local);
      }
    } catch (e) {
      console.warn('[NØRAI History] LocalStorage read notice:', e);
    }

    // 3. Merge Cloud Firestore & LocalStorage items smoothly
    const combinedMap = new Map<string, HistoryItem>();

    // Add Firestore items
    firestoreItems.forEach((item) => combinedMap.set(item.id, item));

    // Add LocalStorage items if not already present
    localItems.forEach((item) => {
      if (!combinedMap.has(item.id)) {
        combinedMap.set(item.id, item);
      }
    });

    let merged = Array.from(combinedMap.values());

    // Fallback to initial demo lookbook if completely empty
    if (merged.length === 0) {
      merged = INITIAL_DEMO_HISTORY;
    }

    // Sort by createdAt descending
    merged.sort((a, b) => b.createdAt - a.createdAt);

    setHistoryItems(merged);
    setLoading(false);
  };

  const handleDownload = (item: HistoryItem) => {
    const link = document.createElement('a');
    link.href = item.resultImage;
    link.download = `norai-street-${item.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyText = (item: HistoryItem) => {
    navigator.clipboard.writeText(`${item.headline}\n\n${item.copy}`);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (db) {
      try {
        await deleteDoc(doc(db, 'street_history', id));
      } catch (e) {
        console.error('Failed to delete from Firestore:', e);
      }
    }

    const updated = historyItems.filter((i) => i.id !== id);
    setHistoryItems(updated);
    localStorage.setItem('norai_street_history', JSON.stringify(updated));
  };

  return (
    <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto min-h-screen flex flex-col">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 pb-8 border-b border-white/10 gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8">
          <img 
            src="/logo.png" 
            alt="NØRAI STREET FASHION" 
            className="w-28 sm:w-36 md:w-44 h-auto object-contain shrink-0" 
          />
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-red-500 block mb-2 font-semibold">
              EDITORIAL ARCHIVE & SESSIONS
            </span>
            <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight">
              Street Lookbook
            </h1>
            <p className="text-white/50 text-sm font-sans font-light tracking-wide max-w-xl mt-3 leading-relaxed">
              Curated archive of synthesized high-fashion street editorials. Explore generated lookbooks or launch a new session.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onDemoClick}
            className="px-5 py-3 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-sans uppercase tracking-widest text-white transition-colors"
          >
            Ver Demo Interactiva
          </button>

          {isAuthenticated ? (
            <button
              onClick={onGeneratorClick}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-xs font-semibold uppercase tracking-widest hover:bg-gray-200 transition-colors shadow-lg"
            >
              <Sparkles size={16} />
              Nuevas Generaciones
            </button>
          ) : (
            <button
              onClick={onAdminClick}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-xs font-semibold uppercase tracking-widest hover:bg-gray-200 transition-colors shadow-lg"
            >
              Acceso Editorial / Login
            </button>
          )}
        </div>
      </div>

      {/* Grid of sessions */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-white/40">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
          <p className="text-xs uppercase tracking-widest">Cargando archivo de sesiones...</p>
        </div>
      ) : historyItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-3xl p-8">
          <ImageIcon size={48} className="text-white/20 mb-4" />
          <h3 className="font-serif text-2xl mb-2 font-light">No hay sesiones guardadas</h3>
          <p className="text-xs text-white/40 max-w-md mb-6">
            Aún no has generado editoriales de street fashion o no se han guardado sesiones en el archivo.
          </p>
          <button
            onClick={isAuthenticated ? onGeneratorClick : onAdminClick}
            className="px-6 py-3 bg-white text-black rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-gray-200 transition-colors"
          >
            Iniciar Primera Generación
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="group glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-black/60">
                <img
                  src={item.resultImage}
                  alt={item.headline}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Overlay details */}
                <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-red-400 font-semibold block">
                    {new Date(item.createdAt).toLocaleDateString()} — {item.engine.toUpperCase()}
                  </span>
                  <h3 className="font-serif text-2xl font-light text-white leading-tight">
                    {item.headline}
                  </h3>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-black/40 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleDownload(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white uppercase tracking-wider transition-colors"
                  title="Descargar imagen"
                >
                  <Download size={14} />
                  <span>Descargar</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyText(item)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    title="Copiar texto"
                  >
                    {copiedId === item.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-300 transition-colors"
                    title="Eliminar de archivo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};
