'use client';
import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { toast } from 'sonner';
import { db } from '@/lib/firebase-client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '@/lib/firebase-client';
import { actualizarPromedioProducto } from '@/lib/prom-resenas';
import { useRouter } from 'next/navigation';

export default function FormularioReseña({ producto, onClose, productId }) {
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [cargando, setCargando] = useState(false);

  const router = useRouter();

  const irADetalle = () => {
    router.push('/productos');
  };

  const handleEnviar = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Debes iniciar sesión para dejar una reseña.');
      return;
    }

    if (rating === 0 || comentario.trim() === '') {
      toast.error('Completa todos los campos.');
      return;
    }

    try {
      setCargando(true);
      await addDoc(collection(db, 'productos', producto.id, 'resenas'), {
        uid: user.uid,
        nombre: user.displayName || 'Usuario',
        rating,
        comentario,
        fecha: serverTimestamp(),
      });
      await actualizarPromedioProducto(productId);

      toast.success('¡Gracias por tu reseña!');
      irADetalle();
      
    } catch (error) {
      console.error('Error al guardar reseña:', error);
      toast.error('Error al guardar reseña.');
    } finally {
      setCargando(false);
    }

  };

  return (
    <div className="p-4 border rounded-lg bg-gray-700 mt-4">
      <h4 className="font-semibold text-gray-200 mb-2">Tu reseña</h4>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <FaStar
            key={n}
            className={`cursor-pointer text-xl ${n <= rating ? 'text-red-600' : 'text-gray-300'
              }`}
            onClick={() => setRating(n)}
          />
        ))}
      </div>

      <textarea
        className="w-full p-2 border rounded-md text-sm"
        rows={3}
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Escribe tu reseña..."
      />

      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={onClose}
          className="text-gray-200 text-sm hover:underline"
        >
          Cancelar
        </button>
        <button
          onClick={handleEnviar}
          disabled={cargando}
          className="bg-red-600 text-white px-4 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
        >
          {cargando ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
}