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

    if (noCache) cache.delete(cacheKey);

    // Verificar timestamp de invalidación del admin
    const invalidationTimestamp = getTimestamp('productos');
    const allInvalidationTimestamp = getTimestamp('all');
    const lastInvalidation = Math.max(invalidationTimestamp, allInvalidationTimestamp);

    const metaRef = db.collection("meta").doc("productos");
    const metaSnap = await metaRef.get();

    let lastUpdated = 0;
    if (metaSnap.exists) {
      const field = metaSnap.data().lastUpdated;
      if (field && typeof field.toMillis === "function") {
        lastUpdated = field.toMillis();
      }
    }

    const cached = cache.get(cacheKey);

    // Invalidar si el admin marcó como inválido O si meta.lastUpdated es más reciente
    if (cached && isCacheValid(cached.timestamp) && lastUpdated <= cached.timestamp && lastInvalidation <= cached.timestamp) {
      console.log("📦 Productos desde caché (válido)");
      return NextResponse.json(cached.data);
    }

    if (cached && lastInvalidation > cached.timestamp) {
      console.log("🔄 Cache invalidado por admin, recargando...");
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

    cache.set(cacheKey, { data: productos, timestamp: Date.now() });

    console.log("✅ Productos actualizados:", productos.length);
    return NextResponse.json(productos);
  } catch (error) {
    console.error("❌ Error obteniendo productos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
