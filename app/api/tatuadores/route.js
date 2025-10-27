import { db } from '@/lib/firebase-server';
import { NextResponse } from 'next/server';
import { getTimestamp } from '@/lib/cache-timestamps';

const cache = new Map();
const CACHE_KEY = 'tatuadores';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

export async function GET() {
  try {
    // Verificar timestamp de invalidación
    const invalidationTimestamp = getTimestamp('artists');
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
        console.log(`📦 Tatuadores desde caché (${hoursOld}h de antigüedad, válido por 24h)`);
        return NextResponse.json(cached.data);
      }
      
      if (isExpired) {
        console.log("⏰ Cache expirado (24h cumplidas), recargando...");
      }
      
      if (wasInvalidated) {
        console.log('🔄 Cache invalidado por admin, recargando...');
      }
    }

    console.log('🧠 Consultando Firebase para tatuadores...');
    const snapshot = await db.collection('tatuadores').get();
    const tatuadores = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    const now = Date.now();
    cache.set(CACHE_KEY, { data: tatuadores, timestamp: now });
    console.log(`✅ Tatuadores actualizados: ${tatuadores.length} - Cache válido hasta: ${new Date(now + CACHE_TTL).toLocaleString('es-CO')}`);
    
    return NextResponse.json(tatuadores);
  } catch (error) {
    console.error('Error obteniendo tatuadores:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
