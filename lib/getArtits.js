// lib/getArtist.js
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

export const getArtistById = async (id) => {
  try {
    const ref = doc(db, 'tatuadores', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data();
  } catch (error) {
    console.error('Error obteniendo artista:', error);
    return null;
  }
};
