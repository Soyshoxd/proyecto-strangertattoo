'use client';

import { useEffect } from 'react';

export default function PerformanceOptimization() {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload fonts
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.as = 'font';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap';
      fontLink.crossOrigin = 'anonymous';
      document.head.appendChild(fontLink);
    };

    // Optimize third-party scripts
    const optimizeThirdPartyScripts = () => {
      // Defer non-critical scripts
      const scripts = document.querySelectorAll('script[src*="googleapis"], script[src*="firebase"]');
      scripts.forEach(script => {
        if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
          script.defer = true;
        }
      });
    };

    // Reduce Cumulative Layout Shift (CLS)
    const reduceCLS = () => {
      // Add proper aspect ratios for images
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.style.aspectRatio && img.width && img.height) {
          img.style.aspectRatio = `${img.width}/${img.height}`;
        }
      });
    };

    // Optimize for First Input Delay (FID)
    const optimizeFID = () => {
      // Break up long tasks
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 50) {
            console.warn('Long task detected:', entry);
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.log('Long task observer not supported');
      }
    };

    // Run optimizations
    preloadCriticalResources();
    optimizeThirdPartyScripts();
    reduceCLS();
    optimizeFID();

    // Cleanup
    return () => {
      // Clean up observers if needed
    };
  }, []);

  return null; // This component doesn't render anything
}
