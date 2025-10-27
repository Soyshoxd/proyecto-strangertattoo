import React, { useState } from 'react'
import { FaStar } from 'react-icons/fa';

const StartRating = ({ value, onChange }) => {

  const [hover, setHover] = useState(null);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = hover !== null ? star <= hover : star <= value;

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)} // Al hacer click, cambia el rating
            onMouseEnter={() => setHover(star)} // Hover para efecto
            onMouseLeave={() => setHover(null)} // Quitar efecto al salir
          >
            <FaStar
              size={24}
              color={filled ? '#facc15' : '#d1d5db'} // Amarillo si activa, gris si no
            />
          </button>
        );
      })}
    </div>
  )
}

export default StartRating