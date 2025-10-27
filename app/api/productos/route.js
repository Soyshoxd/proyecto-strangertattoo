// app/api/productos/route.js
import { db } from "@/lib/firebase-server";
import { NextResponse } from "next/server";
import { getTimestamp } from '@/lib/cache-timestamps';

const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

function getCacheKey(categoria) {
  return categoria ? `productos_${categoria}` : "productos_all";
}

function isCacheValid(timestamp) {
  return Date.now() - timestamp < CACHE_TTL;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get("categoria")?.toLowerCase().trim();
    const noCache = searchParams.get("nocache") === "true";
    const cacheKey = getCacheKey(categoria);

    if (noCache) {
      cache.delete(cacheKey);
      console.log("🔄 Cache forzado a recargar (nocache=true)");
    }

    // Verificar timestamp de invalidación del admin
    const invalidationTimestamp = getTimestamp('productos');
    const allInvalidationTimestamp = getTimestamp('all');
    const lastInvalidation = Math.max(invalidationTimestamp, allInvalidationTimestamp);

    const cached = cache.get(cacheKey);

    // Solo usar caché si:
    // 1. Existe el caché
    // 2. No ha expirado el TTL de 24 horas
    // 3. No ha sido invalidado por el admin
    if (cached) {
      const cacheAge = Date.now() - cached.timestamp;
      const isExpired = cacheAge >= CACHE_TTL;
      const wasInvalidated = lastInvalidation > cached.timestamp;
      
      if (!isExpired && !wasInvalidated) {
        const hoursOld = (cacheAge / (1000 * 60 * 60)).toFixed(2);
        console.log(`📦 Productos desde caché (${hoursOld}h de antigüedad, válido por 24h)`);
        return NextResponse.json(cached.data);
      }
      
      if (isExpired) {
        console.log("⏰ Cache expirado (24h cumplidas), recargando...");
      }
      
      if (wasInvalidated) {
        console.log("🔄 Cache invalidado por admin, recargando...");
      }
    }

    console.log("🧠 Consultando Firebase (Admin SDK)…");
    const productosRef = db.collection("productos");
    const snapshot = categoria
      ? await productosRef.where("categoriaSeleccionada", "==", categoria).get()
      : await productosRef.get();

    const productos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const now = Date.now();
    cache.set(cacheKey, { data: productos, timestamp: now });

    console.log(`✅ Productos actualizados: ${productos.length} - Cache válido hasta: ${new Date(now + CACHE_TTL).toLocaleString('es-CO')}`);
    return NextResponse.json(productos);
  } catch (error) {
    console.error("❌ Error obteniendo productos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
