// lib/getArtist.js
import { db } from '@/lib/firebase-server';
import { doc, getDoc } from 'firebase/firestore';

export const getArtistById = async (id) => {
  const ref = doc(db, 'tatuadores', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
};
