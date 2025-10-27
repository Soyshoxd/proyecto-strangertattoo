'use client';

import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
  import { Timestamp } from "firebase/firestore";

const ReviewCard = ({ review }) => {
  if (!review) return null;
  
  const { comentario, rating, usuario, verificado, fechaCreacion, foto, esAnonima:anonimo } = review;

  const tieneImagen = foto && foto.trim() !== '';


const fecha = (() => {
  if (!review?.fechaCreacion) return 'Fecha no disponible';
  
  // Si es un string (ya serializado)
  if (typeof review.fechaCreacion === 'string') {
    return new Date(review.fechaCreacion).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  // Si es un objeto Timestamp de Firestore (fallback)
  if (review.fechaCreacion?.seconds && review.fechaCreacion?.nanoseconds) {
    const millis = review.fechaCreacion.seconds * 1000 + Math.floor(review.fechaCreacion.nanoseconds / 1e6);
    return new Date(millis).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return 'Fecha no disponible';
})();

  return (
    <div
      className={`w-[220px] bg-white rounded-xl shadow-md overflow-hidden snap-center flex-shrink-0 border border-gray-200 ${
        tieneImagen ? 'h-70' : 'h-35'
      }`}
    >
      {/* Imagen si existe */}
      {tieneImagen && (
        <div className="w-full h-[140px] relative">
          <Image
            src={foto}
            alt="Foto subida por usuario"
            fill
            sizes="220px"
            className="object-cover"
          />
        </div>
      )}

      {/* Contenido */}
      <div className="p-3 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-sm text-gray-700">
              {anonimo ? 'Usuario anónimo' : usuario?.nombre || 'Sin nombre'}
            </p>
            {verificado && (
              <span className="text-green-600 text-xs font-medium">
                ✔ Verificado
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 mb-1">{fecha}</p>

          <div className="flex gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <FaStar
                key={n}
                size={16}
                color={n <= rating ? '#ba0000' : '#bcbcbc'}
              />
            ))}
          </div>

          <p className="text-sm text-gray-700 line-clamp-3">{comentario}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
