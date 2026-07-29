import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { HistoryItem } from '../data/demoData';

const DB_NAME = 'norai_street_db';
const STORE_NAME = 'street_history';

// Open browser IndexedDB for unlimited local image & session storage
const openIDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveLocalIDB = async (item: HistoryItem): Promise<void> => {
  try {
    const idb = await openIDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(item);
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  } catch (err) {
    console.warn('[NØRAI IDB] Save warning:', err);
    try {
      const existing = JSON.parse(localStorage.getItem('norai_street_history') || '[]');
      localStorage.setItem('norai_street_history', JSON.stringify([item, ...existing.slice(0, 3)]));
    } catch (e) {
      console.warn('[NØRAI LocalStorage] Quota exceeded fallback:', e);
    }
  }
};

export const getLocalIDB = async (): Promise<HistoryItem[]> => {
  try {
    const idb = await openIDB();
    const tx = idb.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    return await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[NØRAI IDB] Read warning:', err);
    try {
      return JSON.parse(localStorage.getItem('norai_street_history') || '[]');
    } catch (e) {
      return [];
    }
  }
};

export const deleteLocalIDB = async (id: string): Promise<void> => {
  try {
    const idb = await openIDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
  } catch (err) {
    console.warn('[NØRAI IDB] Delete warning:', err);
  }
};

export const saveHistoryItem = async (newItem: Omit<HistoryItem, 'id'>): Promise<HistoryItem> => {
  const id = `norai_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  let finalImageUrl = newItem.resultImage;

  // 1. Attempt Firebase Storage upload if base64 data URL
  if (storage && finalImageUrl.startsWith('data:image')) {
    try {
      const storageRef = ref(storage, `images/street/${id}.png`);
      const response = await fetch(finalImageUrl);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob, { contentType: 'image/png' });
      finalImageUrl = await getDownloadURL(storageRef);
      console.log('[NØRAI Storage] Successfully uploaded image to Firebase Storage:', finalImageUrl);
    } catch (err) {
      console.warn('[NØRAI Storage] Firebase Storage upload skipped/failed:', err);
    }
  }

  const savedItem: HistoryItem = {
    ...newItem,
    id,
    resultImage: finalImageUrl
  };

  // 2. Attempt Firestore save (only if resultImage is a HTTP URL or under 800KB)
  if (db) {
    try {
      if (!savedItem.resultImage.startsWith('data:image') || savedItem.resultImage.length < 900000) {
        await addDoc(collection(db, 'street_history'), {
          ...savedItem,
          createdAt: savedItem.createdAt || Date.now()
        });
        console.log('[NØRAI Firestore] Saved session to Cloud Firestore');
      }
    } catch (err) {
      console.warn('[NØRAI Firestore] Save document warning:', err);
    }
  }

  // 3. Always save to IndexedDB (unlimited local storage)
  await saveLocalIDB(savedItem);

  return savedItem;
};

export const loadAllHistoryItems = async (): Promise<HistoryItem[]> => {
  let firestoreItems: HistoryItem[] = [];
  let localItems: HistoryItem[] = [];

  // 1. Load from Cloud Firestore
  if (db) {
    try {
      const q = query(collection(db, 'street_history'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        firestoreItems.push({
          id: docSnap.id,
          resultImage: data.resultImage || data.image || '',
          prompt: data.prompt || '',
          headline: data.headline || 'NØRAI STREET EDITORIAL',
          copy: data.copy || '',
          engine: data.engine || 'gemini',
          createdAt: data.createdAt || Date.now()
        });
      });
    } catch (err) {
      console.warn('[NØRAI Firestore] Query warning:', err);
    }
  }

  // 2. Load from IndexedDB / LocalStorage
  localItems = await getLocalIDB();

  // 3. Merge items
  const combinedMap = new Map<string, HistoryItem>();
  firestoreItems.forEach((i) => combinedMap.set(i.id, i));
  localItems.forEach((i) => {
    if (!combinedMap.has(i.id)) {
      combinedMap.set(i.id, i);
    }
  });

  return Array.from(combinedMap.values()).sort((a, b) => b.createdAt - a.createdAt);
};

export const deleteHistoryItem = async (id: string): Promise<void> => {
  if (db) {
    try {
      await deleteDoc(doc(db, 'street_history', id));
    } catch (e) {
      console.warn('[NØRAI Firestore] Delete warning:', e);
    }
  }
  await deleteLocalIDB(id);
};
