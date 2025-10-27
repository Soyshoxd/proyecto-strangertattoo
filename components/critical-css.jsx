'use client';

import { useCriticalResources } from '../hooks/use-critical-resources';

export default function CriticalCSS() {
  // Usar el hook personalizado para optimizar recursos críticos
  useCriticalResources();
  
  return null;
}
