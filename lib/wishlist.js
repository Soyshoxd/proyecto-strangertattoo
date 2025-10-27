import { db } from './firebase-server';
import { doc, setDoc, deleteDoc, getDoc, getDocs, collection } from 'firebase/firestore';

export const guardarWishlist = async (uid, producto) => {
  const ref = doc(db, 'users', uid, 'wishlist', producto.id);
  await setDoc(ref, producto);
};

export const eliminarWishlist = async (uid, productoId) => {
  const ref = doc(db, 'users', uid, 'wishlist', productoId);
  await deleteDoc(ref);
};

export const isInWishlist = async (uid, productoId) => {
  const ref = doc(db, 'users', uid, 'wishlist', productoId);
  const snap = await getDoc(ref);
  return snap.exists();
};
export const getWishlist = async (userId) => {
  const wishlistRef = collection(db, 'users', userId, 'wishlist');
  const snapshot = await getDocs(wishlistRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};