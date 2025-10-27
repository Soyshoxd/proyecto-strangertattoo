import { db } from '@/lib/firebase-server';
import { NextResponse } from 'next/server';
import { getTimestamp } from '@/lib/cache-timestamps';

const cache = new Map();
const CACHE_KEY = 'galeria';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

export async function GET() {
  try {
    // Verificar timestamp de invalidación
    const invalidationTimestamp = getTimestamp('galeria');
    const allInvalidationTimestamp = getTimestamp('all');
    const lastInvalidation = Math.max(invalidationTimestamp, allInvalidationTimestamp);

    const cached = cache.get(CACHE_KEY);

    // Usar cache si es válido y no fue invalidado
    if (cached && 
        (Date.now() - cached.timestamp) < CACHE_TTL &&
        lastInvalidation <= cached.timestamp) {
      console.log('📦 Galería desde caché (válido)');
      return NextResponse.json(cached.data);
    }

    if (cached && lastInvalidation > cached.timestamp) {
      console.log('🔄 Cache de galería invalidado por admin, recargando...');
    }

    console.log('🧠 Consultando Firebase para galería...');
    const ref = db.collection('tatuadores');
    const snapshot = await ref.get();

    // Extraemos todas las galerías y las unimos en un solo array
    const galeriaTotal = snapshot.docs.flatMap(doc => {
      const data = doc.data();
      return data.galeria || []; // Asegura que no falle si galería está vacío
    });

    cache.set(CACHE_KEY, { data: galeriaTotal, timestamp: Date.now() });
    console.log(`✅ Galería actualizada: ${galeriaTotal.length} imágenes`);

    return NextResponse.json(galeriaTotal);
  } catch (error) {
    console.error('Error obteniendo galería:', error);
    return NextResponse.json({ error: 'Error obteniendo galería' }, { status: 500 });
  }
}

export async function obtenerGaleriaCompleta() {
  try {
    const ref = db.collection('tatuadores');
    const snapshot = await ref.get();

    // Extraemos todas las galerías y las unimos en un solo array
    const galeriaTotal = snapshot.docs.flatMap(doc => {
      const data = doc.data();
      return data.galeria || []; // Asegura que no falle si galería está vacío
    });

    return galeriaTotal;
  } catch (error) {
    console.error('Error obteniendo galería:', error);
    // En lugar de hacer throw, devolvemos un array vacío para evitar errores de build
    return [];
  }
}

