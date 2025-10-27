'use client';

import { useCacheSync } from '@/hooks/useCacheSync';

/**
 * Componente que sincroniza el cache con el servidor
 * Solo hace 1 lectura al cargar la página
 */
export function CacheSyncProvider({ children }) {
  useCacheSync();
  return <>{children}</>;
}

