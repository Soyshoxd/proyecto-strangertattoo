// hooks/useCacheSync.js
import { useEffect } from 'react';
import cacheManager from '@/lib/cache-manager';

const CACHE_VERSION_KEY = 'cache_version';

/**
 * Hook que sincroniza cache con el servidor
 * Se ejecuta SOLO al cargar la página (1 lectura)
 */
export function useCacheSync() {
  useEffect(() => {
    const checkCacheVersion = async () => {
      try {
        // Obtener versión del servidor
        const response = await fetch('/api/cache/invalidate');
        const serverVersions = await response.json();

        // Obtener versiones locales guardadas
        const localVersions = JSON.parse(
          localStorage.getItem(CACHE_VERSION_KEY) || '{}'
        );

        let needsInvalidation = false;

        // Comparar versiones
        if (serverVersions.all > (localVersions.all || 0)) {
          console.log('🔄 Invalidando todo el cache');
          cacheManager.clear();
          needsInvalidation = true;
        } else {
          if (serverVersions.productos > (localVersions.productos || 0)) {
            console.log('🔄 Invalidando cache de productos');
            cacheManager.invalidateProducts();
            needsInvalidation = true;
          }

          if (serverVersions.artists > (localVersions.artists || 0)) {
            console.log('🔄 Invalidando cache de artistas');
            cacheManager.invalidateArtists();
            needsInvalidation = true;
          }

          if (serverVersions.galeria > (localVersions.galeria || 0)) {
            console.log('🔄 Invalidando cache de galería');
            cacheManager.invalidateByPattern('galeria');
            needsInvalidation = true;
          }
        }

        // Guardar nuevas versiones en localStorage
        localStorage.setItem(CACHE_VERSION_KEY, JSON.stringify(serverVersions));
        
        if (needsInvalidation) {
          console.log('✅ Cache invalidado. Los cambios se verán en la próxima navegación');
        }

      } catch (error) {
        console.error('❌ Error verificando cache:', error);
      }
    };

    // Ejecutar solo una vez al montar
    checkCacheVersion();
  }, []); // Dependencias vacías = solo al montar
}

