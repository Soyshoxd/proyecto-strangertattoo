'use client';

import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
  import { Timestamp } from "firebase/firestore";

const ReviewCard = ({ review }) => {
  const { comentario, rating, usuario, verificado, fechaCreacion, foto } = review;

  const tieneImagen = foto && foto.trim() !== '';


const convertirFecha = (obj) => {
  if (obj?.seconds && obj?.nanoseconds) {
    const millis = obj.seconds * 1000 + Math.floor(obj.nanoseconds / 1e6);
    return new Date(millis);
  }
  return null;
};

const fecha = review.fechaCreacion
  ? convertirFecha(review.fechaCreacion).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  : 'Fecha no disponible';

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
            className="object-cover"
          />
        </div>
      )}

      {/* Contenido */}
      <div className="p-3 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-sm text-gray-700">
              {usuario?.nombre || 'Usuario anónimo'}
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
