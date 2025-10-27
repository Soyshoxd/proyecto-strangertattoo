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
      <div className="max-w-2xl mx-auto p-6 bg-black rounded-2xl shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-red-600 font-mistranger text-4xl text-glow-red">Cuentanos tu experiencia</h1>
          <p className="text-gray-200 mt-5 font-monserrat">
            Nos encanta saber cómo fue tu experiencia. Deja tu reseña y ayúdanos a mejorar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!user && (
            <>
              <input
                name="nombre"
                placeholder="Tu nombre"
                required
                className="w-full p-3 rounded-md bg-gray-100 text-black placeholder:text-gray-500"
              />
              <input
                name="email"
                type="email"
                placeholder="Tu correo"
                required
                className="w-full p-3 rounded-md bg-gray-100 text-black placeholder:text-gray-500"
              />
            </>
          )}
          <div>
            <label className="block mb-2 text-white font-semibold">Deja tu comentario:</label>
            <textarea
              name="comentario"
              placeholder="Cuéntanos cómo fue tu experiencia..."
              required
              rows={4}
              className="w-full p-3 rounded-md bg-gray-100 text-black placeholder:text-gray-500 resize-none"
            />
          </div>
          <div>
            <label className="block mb-2 text-white font-semibold">Calificación:</label>
            <StartRating value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="block mb-2 text-white font-semibold">Imagen (opcional):</label>

            <div className="flex items-center gap-4">
              <label
                htmlFor="foto"
                className="cursor-pointer px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
              >
                Seleccionar imagen
              </label>
              {foto && <span className="text-sm text-gray-300">{foto.name}</span>}
            </div>

            <input
              id="foto"
              type="file"
              accept="image/*"
              onChange={(e) => setFoto(e.target.files[0])}
              className="hidden"
            />
          </div>


          <div className="space-y-2 text-white">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={esAnonima}
                onChange={() => setEsAnonima(!esAnonima)}
                className="accent-red-500"
              />
              Deseo que mi reseña sea anónima
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={mostrarEnSlider}
                onChange={() => setMostrarEnSlider(!mostrarEnSlider)}
                className="accent-red-500"
              />
              Mostrar esta reseña en el slider destacado
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className=" cursor-pointer w-full py-3 rounded-md bg-red-600 hover:bg-red-700 transition text-white font-semibold"
          >
            {loading ? 'Enviando...' : 'Enviar reseña'}
          </button>

          {mensaje && (
            <p className="text-sm text-white font-medium mt-2">{mensaje}</p>
          )}
        </form>
      </div>

      <Footer />
    </main>
  );
};

export default ReviewForm;
