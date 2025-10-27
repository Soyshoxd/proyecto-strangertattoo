'use client'
import React, { useEffect, useState } from 'react';

const GaleriaGrid = ({ imagenes = [], intervalo = 1000 }) => {
  const [displayedImages, setDisplayedImages] = useState([]);
  const [changingIndex, setChangingIndex] = useState(-1);
  const [availableImages, setAvailableImages] = useState([]); // Imágenes disponibles para intercambio
  const total = imagenes.length;
  const maxDisplay = 9; // Siempre mostrar exactamente 9 fotos

  // Inicializar las 9 primeras imágenes y el pool de disponibles
  useEffect(() => {
    if (imagenes.length > 0) {
      const initial = [];
      const available = [];
      
      // Primeras 9 imágenes para mostrar
      for (let i = 0; i < Math.min(maxDisplay, total); i++) {
        initial.push({
          src: imagenes[i],
          originalIndex: i,
          key: `img-${i}-${imagenes[i]}`,
          isChanging: false
        });
      }
      
      // Resto de imágenes disponibles para intercambio
      for (let i = maxDisplay; i < total; i++) {
        available.push({
          src: imagenes[i],
          originalIndex: i,
          hasBeenUsed: false
        });
      }
      
      setDisplayedImages(initial);
      setAvailableImages(available);
    }
  }, [imagenes, total]);

  // Efecto de rotación suave cuando hay más de 9 imágenes
  useEffect(() => {
    if (total <= maxDisplay || displayedImages.length === 0 || availableImages.length === 0) return;
    
    const timer = setInterval(() => {
      // Filtrar imágenes disponibles que no han sido usadas
      const unusedImages = availableImages.filter(img => !img.hasBeenUsed);
      
      // Si no hay imágenes sin usar, resetear el estado de uso
      if (unusedImages.length === 0) {
        setAvailableImages(prev => prev.map(img => ({ ...img, hasBeenUsed: false })));
        return; // Esperar al siguiente ciclo para continuar
      }
      
      // Elegir una imagen aleatoria de las disponibles no usadas
      const randomAvailableIndex = Math.floor(Math.random() * unusedImages.length);
      const imageToShow = unusedImages[randomAvailableIndex];
      
      // Elegir una posición aleatoria para cambiar (0-8)
      const randomPosition = Math.floor(Math.random() * maxDisplay);
      const imageToRemove = displayedImages[randomPosition];
      
      // Marcar la imagen como cambiando
      setChangingIndex(randomPosition);
      
      // Después de la animación de fade out, hacer el intercambio
      setTimeout(() => {
        // Actualizar imágenes mostradas
        setDisplayedImages(prev => {
          const newImages = [...prev];
          newImages[randomPosition] = {
            src: imageToShow.src,
            originalIndex: imageToShow.originalIndex,
            key: `img-${imageToShow.originalIndex}-${imageToShow.src}`,
            isChanging: false
          };
          return newImages;
        });
        
        // Actualizar pool de imágenes disponibles
        setAvailableImages(prev => {
          return prev.map(img => {
            if (img.originalIndex === imageToShow.originalIndex) {
              // Marcar la imagen que va a ser mostrada como usada
              return { ...img, hasBeenUsed: true };
            }
            if (img.originalIndex === imageToRemove.originalIndex) {
              // La imagen que sale vuelve al pool como no usada
              return { ...img, hasBeenUsed: false };
            }
            return img;
          }).concat(
            // Agregar la imagen que salió al pool si no estaba ahí
            prev.some(img => img.originalIndex === imageToRemove.originalIndex) 
              ? [] 
              : [{ 
                  src: imageToRemove.src, 
                  originalIndex: imageToRemove.originalIndex, 
                  hasBeenUsed: false 
                }]
          );
        });
        
        // Limpiar el estado de cambio después del fade in
        setTimeout(() => {
          setChangingIndex(-1);
        }, 300);
      }, 300);
    }, intervalo);
    
    return () => clearInterval(timer);
  }, [total, intervalo, displayedImages, availableImages]);

  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      {displayedImages.map((imgData, idx) => (
        <div
          key={imgData.key}
          className="relative overflow-hidden rounded-lg shadow-lg"
        >
          <img
            src={imgData.src}
            alt={`galeria-${idx}`}
            className={`w-full h-[120px] object-cover transition-all duration-300 ease-in-out transform ${
              changingIndex === idx 
                ? 'opacity-0 scale-95' 
                : 'opacity-100 scale-100 hover:scale-105'
            }`}
            style={{
              filter: changingIndex === idx ? 'blur(2px)' : 'blur(0px)'
            }}
          />
          
          {/* Efecto de overlay durante el cambio */}
          {changingIndex === idx && (
            <div className="absolute inset-0 bg-black/20 animate-pulse" />
          )}
          
          {/* Efecto de brillo sutil en hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </div>
      ))}
    </div>
  );
};

export default GaleriaGrid;
