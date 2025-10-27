'use client';


import { useAuthUser } from '@/lib/useAuthUser';
import React, { useState } from 'react';
import uploadImageToCloudinary from '@/lib/uploadImages';
import StartRating from '@/components/startRating';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';

const ReviewForm = () => {
  const user = useAuthUser();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [rating, setRating] = useState(0);
  const [foto, setFoto] = useState(null);
  const [esAnonima, setEsAnonima] = useState(false);
  const [mostrarEnSlider, setMostrarEnSlider] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    const form = e.target;
    const comentario = form.comentario.value;

    let body = {
      comentario,
      rating,
      esAnonima,
      mostrarEnSlider,
    };

    try {
      if (foto) {
        const imageUrl = await uploadImageToCloudinary(foto);
        body.foto = imageUrl;
      }
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      setMensaje('Error al subir la imagen.');
      setLoading(false);
      return;
    }

    if (user) {
      body.uid = user.uid;
    } else {
      const nombre = form.nombre.value;
      const email = form.email.value;

      if (!nombre || !email) {
        setMensaje('Debes ingresar nombre y correo.');
        setLoading(false);
        return;
      }

      body.datosUsuario = {
        nombre,
        email,
      };
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setMensaje(data.message);
        form.reset();
        setRating(0);
        setFoto(null);
        setEsAnonima(false);
        setMostrarEnSlider(false);
      } else {
        setMensaje(data.error || 'Error al enviar la reseña');
      }
    } catch (err) {
      setMensaje('Error de conexión al enviar la reseña.');
    }

    setLoading(false);
  };

  return (
    <main className="bg-black min-h-97">
      <Navbar />
      <div className="flex flex-col p-6">
        <h1 className="text-red-600 font-mistranger text-[35px] mb-4 text-glow-red text-center">
          Cuentanos tu experiencia
        </h1> 
        <p className="text-white font-monserrat">
          Nos encanta saber cómo fue tu experiencia. Deja tu reseña y ayuda a mejorar cada día.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="p-4 shadow">
        {!user && (
          <>
            <input name="nombre" placeholder="Tu nombre" required className="p-2 text-black bg-gray-300 w-full" />
            <input name="email" type="email" placeholder="Tu correo" required className="p-2 text-black bg-gray-300 w-full" />
          </>
        )}

        <textarea name="comentario" placeholder="Cuéntanos cómo fue tu experiencia..." required className="p-2 text-black bg-gray-300 w-full" />

        <div>
          <label className="block mb-1 font-medium text-white">Calificación:</label>
          <StartRating value={rating} onChange={setRating} />
        </div>

        <div className="my-2">
          <label className="block mb-1 text-white">Imagen (opcional):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files[0])}
            className="input"
          />
        </div>

        <div className="text-white space-y-2 my-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={esAnonima} onChange={() => setEsAnonima(!esAnonima)} />
            Deseo que mi reseña sea anónima
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={mostrarEnSlider} onChange={() => setMostrarEnSlider(!mostrarEnSlider)} />
            Mostrar esta reseña en el slider destacado
          </label>
        </div>

        <button type="submit" disabled={loading} className="btn">
          {loading ? 'Enviando...' : 'Enviar reseña'}
        </button>

        {mensaje && <p className="mt-2 text-sm text-green-600">{mensaje}</p>}
      </form>
      <Footer />
    </main>
  );
};

export default ReviewForm;
