'use client';

import { useEffect } from 'react';

export function useCriticalResources() {
  useEffect(() => {
    // Función para cargar fuentes de forma optimizada con requestIdleCallback
    const loadFonts = () => {
      if (!document.querySelector('link[href*="Montserrat"]')) {
        const loadFont = () => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap';
          link.media = 'print';
          
          link.addEventListener('load', function() {
            this.media = 'all';
          });
          
          document.head.appendChild(link);
        };
        
        // Usar requestIdleCallback para cargar fuentes cuando el navegador esté libre
        if ('requestIdleCallback' in window) {
          requestIdleCallback(loadFont, { timeout: 2000 });
        } else {
          setTimeout(loadFont, 100);
        }
      }
    };

    // Función para optimizar CSS precargado
    const optimizePreloadedCSS = () => {
      const preloadedLinks = document.querySelectorAll('link[rel="preload"][as="style"]');
      preloadedLinks.forEach(link => {
        if (link.href.includes('layout.css') || link.href.includes('_next/static/css')) {
          link.rel = 'stylesheet';
        }
      });
    };

    // Función para forzar el uso de CSS crítico
    const forceCriticalCSS = () => {
      const cssLinks = document.querySelectorAll('link[href*="_next/static/css"]');
      cssLinks.forEach(link => {
        if (link.rel === 'preload') {
          link.rel = 'stylesheet';
        }
      });
    };

    // Ejecutar optimizaciones
    loadFonts();
    optimizePreloadedCSS();
    forceCriticalCSS();

    // Observar cambios en el DOM para nuevos links CSS
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.tagName === 'LINK') {
            if (node.rel === 'preload' && node.as === 'style') {
              setTimeout(() => {
                node.rel = 'stylesheet';
              }, 10);
            }
          }
        });
      });
    });

    observer.observe(document.head, {
      childList: true,
      subtree: true
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);
}
