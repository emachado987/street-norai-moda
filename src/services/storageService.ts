import { db, storage } from '../firebase';
import { collection, setDoc, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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
  }

  // Backup in localStorage
  try {
    const existing: HistoryItem[] = JSON.parse(localStorage.getItem('norai_street_history') || '[]');
    const filtered = existing.filter((e) => e.id !== item.id);
    localStorage.setItem('norai_street_history', JSON.stringify([item, ...filtered.slice(0, 10)]));
  } catch (e) {
    console.warn('[NØRAI LocalStorage] Quota notice:', e);
  }
};

export const getLocalIDB = async (): Promise<HistoryItem[]> => {
  let idbItems: HistoryItem[] = [];
  try {
    const idb = await openIDB();
    const tx = idb.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    idbItems = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[NØRAI IDB] Read warning:', err);
  }

  let lsItems: HistoryItem[] = [];
  try {
    lsItems = JSON.parse(localStorage.getItem('norai_street_history') || '[]');
  } catch (e) {
    lsItems = [];
  }

  const map = new Map<string, HistoryItem>();
  idbItems.forEach((i) => map.set(i.id, i));
  lsItems.forEach((i) => {
    if (!map.has(i.id)) map.set(i.id, i);
  });

  return Array.from(map.values());
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

  try {
    const existing: HistoryItem[] = JSON.parse(localStorage.getItem('norai_street_history') || '[]');
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem('norai_street_history', JSON.stringify(updated));
  } catch (e) {
    // ignore
  }
};

export const saveHistoryItem = async (newItem: Omit<HistoryItem, 'id'>): Promise<HistoryItem> => {
  const timeId = `street_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  let finalImageUrl = newItem.resultImage || (newItem as any).image || '';

  // 1. Upload to Firebase Storage using binary Blob (matching nørai-virtual-try-on architecture)
  if (storage && finalImageUrl.startsWith('data:image')) {
    try {
      const storageRef = ref(storage, `images/street/${timeId}.png`);
      const response = await fetch(finalImageUrl);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob, { contentType: 'image/png' });
      finalImageUrl = await getDownloadURL(storageRef);
      console.log('[NØRAI Storage] Uploaded binary blob to Firebase Storage:', finalImageUrl);
    } catch (err) {
      console.error('[NØRAI Storage] Firebase Storage blob upload error:', err);
    }
  }

  let finalId = timeId;

  // 2. Save document in Cloud Firestore using setDoc for idempotency
  if (db) {
    try {
      const firestoreDoc = {
        image: finalImageUrl,
        resultImage: finalImageUrl,
        prompt: newItem.prompt || '',
        headline: newItem.headline || 'NØRAI STREET EDITORIAL',
        copy: newItem.copy || '',
        engine: newItem.engine || 'gemini',
        createdAt: newItem.createdAt || Date.now()
      };

      await setDoc(doc(db, 'street_history', finalId), firestoreDoc);
      console.log('[NØRAI Firestore] Saved session document to Cloud Firestore with ID:', finalId);
    } catch (err) {
      console.error('[NØRAI Firestore] Save document error:', err);
    }
  }

  const savedItem: HistoryItem = {
    ...newItem,
    id: finalId,
    image: finalImageUrl,
    resultImage: finalImageUrl
  };

  // 3. Save local backup (IndexedDB / LocalStorage)
  await saveLocalIDB(savedItem);

  return savedItem;
};

export const loadAllHistoryItems = async (): Promise<HistoryItem[]> => {
  // 1. Load strictly from Cloud Firestore if configured
  if (db) {
    const firestoreItems: HistoryItem[] = [];
    try {
      const q = query(collection(db, 'street_history'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const imgUrl = data.image || data.resultImage || '';
        firestoreItems.push({
          id: docSnap.id,
          image: imgUrl,
          resultImage: imgUrl,
          prompt: data.prompt || '',
          headline: data.headline || 'NØRAI STREET EDITORIAL',
          copy: data.copy || '',
          engine: data.engine || 'gemini',
          createdAt: data.createdAt || Date.now()
        });
      });
      // Return Firestore items strictly (even if empty) so local failed backups are never shown
      return firestoreItems;
    } catch (err) {
      console.warn('[NØRAI Firestore] Query warning:', err);
      // Only if query fails entirely do we let it fall through
    }
  }

  // 2. Fallback to Local Storage ONLY if Firebase is completely disconnected or fails
  const localItems = await getLocalIDB();

  const combinedMap = new Map<string, HistoryItem>();
  const seenSignatures = new Set<string>();

  const processItem = (item: HistoryItem) => {
    if (!item || !item.id) return;
    const imgUrl = item.image || item.resultImage || '';
    const imgSnippet = imgUrl ? imgUrl.substring(0, 80) : '';
    const timeWindow = Math.floor((item.createdAt || 0) / 10000);
    const signature = `${item.headline}_${timeWindow}_${imgSnippet}`;

    if (!combinedMap.has(item.id) && !seenSignatures.has(signature)) {
      combinedMap.set(item.id, { ...item, resultImage: imgUrl, image: imgUrl });
      seenSignatures.add(signature);
    }
  };

  localItems.forEach(processItem);

  return Array.from(combinedMap.values()).sort((a, b) => b.createdAt - a.createdAt);
};

export const deleteHistoryItem = async (id: string): Promise<void> => {
  if (storage) {
    try {
      await deleteObject(ref(storage, `images/street/${id}.png`));
    } catch (e) {
      console.warn('[NØRAI Storage] Delete warning:', e);
    }
  }
  if (db) {
    try {
      await deleteDoc(doc(db, 'street_history', id));
    } catch (e) {
      console.warn('[NØRAI Firestore] Delete warning:', e);
    }
  }
  await deleteLocalIDB(id);
};
