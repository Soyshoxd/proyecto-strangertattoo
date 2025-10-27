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

    // Usar cache si es válido y no fue invalidado
    if (cached && 
        (Date.now() - cached.timestamp) < CACHE_TTL &&
        lastInvalidation <= cached.timestamp) {
      console.log('📦 Tatuadores desde caché (válido)');
      return NextResponse.json(cached.data);
    }

    if (cached && lastInvalidation > cached.timestamp) {
      console.log('🔄 Cache de tatuadores invalidado por admin, recargando...');
    }

    console.log('🧠 Consultando Firebase para tatuadores...');
    const snapshot = await db.collection('tatuadores').get();
    const tatuadores = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    cache.set(CACHE_KEY, { data: tatuadores, timestamp: Date.now() });
    console.log(`✅ Tatuadores actualizados: ${tatuadores.length}`);
    
    return NextResponse.json(tatuadores);
  } catch (error) {
    console.error('Error obteniendo tatuadores:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
