import { db } from '@/lib/firebase-server';
import { NextResponse } from 'next/server';
import { getTimestamp } from '@/lib/cache-timestamps';

const cache = new Map();
const CACHE_KEY = 'categorias';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

export async function GET() {
  try {
    // Las categorías se invalidan con 'all' solamente
    const allInvalidationTimestamp = getTimestamp('all');

    const cached = cache.get(CACHE_KEY);

    // Usar cache si es válido y no fue invalidado
    if (cached && 
        (Date.now() - cached.timestamp) < CACHE_TTL &&
        allInvalidationTimestamp <= cached.timestamp) {
      console.log('📦 Categorías desde caché (válido)');
      return NextResponse.json(cached.data);
    }

    if (cached && allInvalidationTimestamp > cached.timestamp) {
      console.log('🔄 Cache de categorías invalidado, recargando...');
    }

    console.log('🧠 Consultando Firebase para categorías...');
    const snapshot = await db.collection('categorias').get();
    const categorias = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    cache.set(CACHE_KEY, { data: categorias, timestamp: Date.now() });
    console.log(`✅ Categorías actualizadas: ${categorias.length}`);
    
    return NextResponse.json(categorias);
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
