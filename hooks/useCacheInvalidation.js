// hooks/useCacheInvalidation.js
import { useEffect, useCallback, useState } from 'react';
import cacheManager from '@/lib/cache-manager';

/**
 * Hook para manejar invalidación de caché cuando admin hace cambios
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.isAdmin - Si el usuario actual es admin
 * @param {Function} options.onProductsInvalidated - Callback cuando se invaliden productos
 * @param {Function} options.onArtistsInvalidated - Callback cuando se invaliden tatuadores
 */
export function useCacheInvalidation({ 
  isAdmin = false, 
  onProductsInvalidated,
  onArtistsInvalidated 
} = {}) {

  // Función para invalidar productos
  const invalidateProducts = useCallback(() => {
    if (isAdmin) {
      console.log('🔄 Admin: Invalidando caché de productos');
      const invalidated = cacheManager.invalidateProducts();
      console.log(`✅ ${invalidated} entradas de productos invalidadas`);
      
      // Disparar evento global para que otros componentes reaccionen
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin_products_updated', {
          detail: { timestamp: Date.now() }
        }));
      }
    }
  }, [isAdmin]);

  // Función para invalidar artistas (tatuadores/perforadores)
  const invalidateArtists = useCallback(() => {
    if (isAdmin) {
      console.log('🔄 Admin: Invalidando caché de artistas');
      const invalidated = cacheManager.invalidateArtists();
      console.log(`✅ ${invalidated} entradas de artistas invalidadas`);
      
      // Disparar evento global
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin_artists_updated', {
          detail: { timestamp: Date.now() }
        }));
      }
    }
  }, [isAdmin]);

  // Función para invalidar todo
  const invalidateAll = useCallback(() => {
    if (isAdmin) {
      console.log('🔄 Admin: Invalidando todo el caché');
      cacheManager.clear();
      
      // Disparar evento global
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin_cache_cleared', {
          detail: { timestamp: Date.now() }
        }));
      }
    }
  }, [isAdmin]);

  // Escuchar eventos de invalidación (para usuarios no admin)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleProductsUpdated = () => {
      console.log('📢 Productos actualizados por admin, recargando...');
      onProductsInvalidated?.();
    };

    const handleArtistsUpdated = () => {
      console.log('📢 Artistas actualizados por admin, recargando...');
      onArtistsInvalidated?.();
    };

    const handleCacheCleared = () => {
      console.log('📢 Caché limpiado por admin, recargando todo...');
      onProductsInvalidated?.();
      onArtistsInvalidated?.();
    };

    // Solo suscribirse si no es admin (para evitar doble ejecución)
    if (!isAdmin) {
      window.addEventListener('admin_products_updated', handleProductsUpdated);
      window.addEventListener('admin_artists_updated', handleArtistsUpdated);
      window.addEventListener('admin_cache_cleared', handleCacheCleared);
    }

    return () => {
      if (!isAdmin) {
        window.removeEventListener('admin_products_updated', handleProductsUpdated);
        window.removeEventListener('admin_artists_updated', handleArtistsUpdated);
        window.removeEventListener('admin_cache_cleared', handleCacheCleared);
      }
    };
  }, [isAdmin, onProductsInvalidated, onArtistsInvalidated]);

  return {
    invalidateProducts,
    invalidateArtists,
    invalidateAll,
    isAdmin
  };
}

// Hook simplificado para componentes que necesitan reaccionar a cambios
export function useAdminCacheListener() {
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAnyUpdate = (event) => {
      setLastUpdate(Date.now());
    };

    window.addEventListener('admin_products_updated', handleAnyUpdate);
    window.addEventListener('admin_artists_updated', handleAnyUpdate);
    window.addEventListener('admin_cache_cleared', handleAnyUpdate);

    return () => {
      window.removeEventListener('admin_products_updated', handleAnyUpdate);
      window.removeEventListener('admin_artists_updated', handleAnyUpdate);  
      window.removeEventListener('admin_cache_cleared', handleAnyUpdate);
    };
  }, []);

  return lastUpdate;
}
