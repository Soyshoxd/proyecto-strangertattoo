// lib/cache-manager.js
/**
 * Sistema de caché local para optimizar lecturas de Firebase
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.cacheTimestamps = new Map();
  this.defaultTTL = 24 * 60 * 60 * 1000; // 24 horas por defecto
    this.subscribers = new Map(); // Para notificaciones
    this.setupBroadcastChannel();
  }

  /**
   * Configura el BroadcastChannel para comunicación entre tabs
   */
  setupBroadcastChannel() {
    if (typeof window !== 'undefined') {
      this.channel = new BroadcastChannel('cache_invalidation');
      this.channel.addEventListener('message', (event) => {
        this.handleInvalidationMessage(event.data);
      });
    }
  }

  /**
   * Obtiene un valor del caché
   * @param {string} key - Clave del caché
   * @param {number} ttl - Tiempo de vida en milisegundos
   * @returns {any} - Valor cacheado o null si no existe o expiró
   */
  get(key, ttl = this.defaultTTL) {
    const timestamp = this.cacheTimestamps.get(key);
    
    if (!timestamp || (Date.now() - timestamp) > ttl) {
      // Cache expirado o no existe
      this.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  /**
   * Guarda un valor en el caché
   * @param {string} key - Clave del caché
   * @param {any} value - Valor a cachear
   */
  set(key, value) {
    this.cache.set(key, value);
    this.cacheTimestamps.set(key, Date.now());
  }

  /**
   * Elimina un valor del caché
   * @param {string} key - Clave a eliminar
   */
  delete(key) {
    this.cache.delete(key);
    this.cacheTimestamps.delete(key);
  }

  /**
   * Limpia todo el caché
   */
  clear() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Obtiene el tamaño del caché
   */
  size() {
    return this.cache.size;
  }

  /**
   * Invalida claves de caché por patrón
   * @param {string|RegExp} pattern - Patrón para buscar claves
   */
  invalidateByPattern(pattern) {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (pattern instanceof RegExp) {
        if (pattern.test(key)) {
          keysToDelete.push(key);
        }
      } else if (typeof pattern === 'string') {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      }
    }
    
    keysToDelete.forEach(key => {
      this.delete(key);
      this.notifySubscribers(key, 'invalidated');
    });
    
    return keysToDelete.length;
  }

  /**
   * Invalida caché relacionado con productos
   */
  invalidateProducts() {
    const invalidated = this.invalidateByPattern(/^productos/);
    
    // Notificar a otras tabs que se invalidó el caché de productos
    if (this.channel) {
      this.channel.postMessage({
        type: 'invalidate_products',
        timestamp: Date.now()
      });
    }
    
    return invalidated;
  }

  /**
   * Invalida caché relacionado con tatuadores/perforadores
   */
  invalidateArtists() {
    const patterns = [CACHE_KEYS.TATUADORES, CACHE_KEYS.PERFORADORES];
    let totalInvalidated = 0;
    
    patterns.forEach(pattern => {
      if (this.cache.has(pattern)) {
        this.delete(pattern);
        totalInvalidated++;
      }
    });
    
    // Notificar a otras tabs
    if (this.channel) {
      this.channel.postMessage({
        type: 'invalidate_artists',
        timestamp: Date.now()
      });
    }
    
    this.notifySubscribers('artists', 'invalidated');
    return totalInvalidated;
  }

  /**
   * Maneja mensajes de invalidación de otras tabs
   * @param {Object} data - Datos del mensaje
   */
  handleInvalidationMessage(data) {
    switch (data.type) {
      case 'invalidate_products':
        this.invalidateByPattern(/^productos/);
        break;
      case 'invalidate_artists':
        this.delete(CACHE_KEYS.TATUADORES);
        this.delete(CACHE_KEYS.PERFORADORES);
        this.notifySubscribers('artists', 'invalidated');
        break;
    }
  }

  /**
   * Suscribe a cambios en el caché
   * @param {string} key - Clave o patrón a observar
   * @param {Function} callback - Función a ejecutar cuando cambie
   */
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);
    
    // Retornar función de desuscripción
    return () => {
      const callbacks = this.subscribers.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  /**
   * Notifica a suscriptores sobre cambios
   * @param {string} key - Clave que cambió
   * @param {string} action - Acción realizada
   */
  notifySubscribers(key, action) {
    // Notificar suscriptores exactos
    const exactCallbacks = this.subscribers.get(key);
    if (exactCallbacks) {
      exactCallbacks.forEach(callback => {
        try {
          callback({ key, action, timestamp: Date.now() });
        } catch (error) {
          console.error('Error en callback de caché:', error);
        }
      });
    }
    
    // Notificar suscriptores por patrón
    for (const [pattern, callbacks] of this.subscribers) {
      if (pattern !== key && key.includes(pattern)) {
        callbacks.forEach(callback => {
          try {
            callback({ key, action, pattern, timestamp: Date.now() });
          } catch (error) {
            console.error('Error en callback de caché:', error);
          }
        });
      }
    }
  }

  /**
   * Fuerza la recarga de una clave específica
   * @param {string} key - Clave a recargar
   * @param {Function} reloadFn - Función que recarga los datos
   */
  async forceReload(key, reloadFn) {
    // Eliminar del caché
    this.delete(key);
    
    // Recargar datos
    try {
      const newData = await reloadFn();
      this.set(key, newData);
      this.notifySubscribers(key, 'reloaded');
      return newData;
    } catch (error) {
      console.error(`Error al recargar ${key}:`, error);
      this.notifySubscribers(key, 'error');
      throw error;
    }
  }
}

// Instancia singleton
const cacheManager = new CacheManager();

// Funciones de utilidad para categorías específicas
export const CACHE_KEYS = {
  PRODUCTOS: 'productos',
  TATUADORES: 'tatuadores', 
  PERFORADORES: 'perforadores',
  CATEGORIAS: 'categorias',
  GALERIA: 'galeria'
};

export const CACHE_TTL = {
  // Ajustado según solicitud: mantener 24 horas para productos, tatuadores, perforadores y categorías
  PRODUCTOS: 24 * 60 * 60 * 1000, // 24 horas
  TATUADORES: 24 * 60 * 60 * 1000, // 24 horas
  PERFORADORES: 24 * 60 * 60 * 1000, // 24 horas
  CATEGORIAS: 24 * 60 * 60 * 1000, // 24 horas
};

export default cacheManager;
