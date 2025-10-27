// lib/cache-timestamps.js
// Cache en memoria del servidor compartido entre todas las APIs
// Se resetea al reiniciar el servidor

export const cacheTimestamps = {
  productos: Date.now(),
  artists: Date.now(),
  galeria: Date.now(),
  all: Date.now()
};

export function updateTimestamp(type) {
  const timestamp = Date.now();
  cacheTimestamps[type] = timestamp;
  
  // Si se invalida "all", actualizar todos los timestamps
  if (type === 'all') {
    cacheTimestamps.productos = timestamp;
    cacheTimestamps.artists = timestamp;
    cacheTimestamps.galeria = timestamp;
  }
  
  return timestamp;
}

export function getTimestamp(type) {
  return cacheTimestamps[type] || 0;
}

