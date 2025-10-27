'use client';

import { useState, useEffect, useRef } from 'react';

const LazyLoader = ({ 
  children, 
  fallback = null, 
  rootMargin = '50px',
  threshold = 0.1 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const currentElement = elementRef.current;
    
    if (!currentElement) return;

    // Si Intersection Observer no está disponible, cargar inmediatamente
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      setHasLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(currentElement);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, hasLoaded]);

  return (
    <div ref={elementRef}>
      {isVisible ? children : fallback}
    </div>
  );
};

export default LazyLoader;
