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

    // Solo usar caché si no ha expirado y no fue invalidado
    if (cached) {
      const cacheAge = Date.now() - cached.timestamp;
      const isExpired = cacheAge >= CACHE_TTL;
      const wasInvalidated = lastInvalidation > cached.timestamp;
      
      if (!isExpired && !wasInvalidated) {
        const hoursOld = (cacheAge / (1000 * 60 * 60)).toFixed(2);
        console.log(`📦 Galería desde caché (${hoursOld}h de antigüedad, válido por 24h)`);
        return NextResponse.json(cached.data);
      }
      
      if (isExpired) {
        console.log("⏰ Cache expirado (24h cumplidas), recargando...");
      }
      
      if (wasInvalidated) {
        console.log('🔄 Cache invalidado por admin, recargando...');
      }
    }

    console.log('🧠 Consultando Firebase para galería...');
    const ref = db.collection('tatuadores');
    const snapshot = await ref.get();

    // Extraemos todas las galerías y las unimos en un solo array
    const galeriaTotal = snapshot.docs.flatMap(doc => {
      const data = doc.data();
      return data.galeria || []; // Asegura que no falle si galería está vacío
    });

    const now = Date.now();
    cache.set(CACHE_KEY, { data: galeriaTotal, timestamp: now });
    console.log(`✅ Galería actualizada: ${galeriaTotal.length} imágenes - Cache válido hasta: ${new Date(now + CACHE_TTL).toLocaleString('es-CO')}`);

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

