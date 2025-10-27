// app/listadedeseos/page.js
'use client';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase-server';
import { getWishlist, removeFromWishlist } from '@/lib/wishlist';
import { guardarCarritoFirestore } from '@/lib/carrito';
import Image from 'next/image';
import Link from 'next/link';
import { FaRegStar, FaStar, FaHeart, FaTrash } from 'react-icons/fa';
import { IoCartOutline } from 'react-icons/io5';
import ModalAviso from '@/components/modal-aviso';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const items = await getWishlist(currentUser.uid);
          setWishlist(items);
        } catch (error) {
          console.error('Error cargando lista de deseos:', error);
        }
      } else {
        setWishlist([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAgregarCarrito = async (producto) => {
    if (user) {
      try {
        await guardarCarritoFirestore(user.uid, producto);
        // Opcional: mostrar notificación de éxito
      } catch (error) {
        console.error('Error agregando al carrito:', error);
      }
    } else {
      setProductoSeleccionado(producto);
      setMostrarModal(true);
    }
  };
  
  const seguirComoInvitado = () => {
    if (productoSeleccionado) {
      const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
      localStorage.setItem('carrito', JSON.stringify([...carrito, productoSeleccionado]));
      setMostrarModal(false);
      setProductoSeleccionado(null);
    }
  };
  
  const redirigirLogin = () => {
    window.location.href = '/login';
  };

  const eliminarItem = async (productId) => {
    if (user) {
      try {
        await removeFromWishlist(user.uid, productId);
        setWishlist(wishlist.filter(item => item.id !== productId));
      } catch (error) {
        console.error('Error eliminando de lista de deseos:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Cargando lista de deseos...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <FaHeart className="text-red-500 text-6xl mb-4" />
        <h1 className="text-2xl font-bold text-white mb-4">Inicia sesión para ver tu lista de deseos</h1>
        <Link href="/login" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black border-b border-gray-800 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <FaHeart className="text-red-500" />
            Mi lista de deseos
          </h1>
          <p className="text-gray-400 mt-1">{wishlist.length} producto{wishlist.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {wishlist.length === 0 ? (
            <div className="text-center py-12">
              <FaHeart className="text-gray-600 text-6xl mb-4 mx-auto" />
              <h2 className="text-xl font-semibold text-white mb-2">Tu lista de deseos está vacía</h2>
              <p className="text-gray-400 mb-6">Agrega productos que te gusten para verlos aquí</p>
              <Link href="/tienda" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition">
                Explorar tienda
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {wishlist.map((item) => (
                <div key={item.id} className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  {/* Imagen del producto */}
                  <div className="relative aspect-square">
                    <Image
                      src={item.img}
                      alt={item.nombre}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => eliminarItem(item.id)}
                      className="absolute top-2 right-2 bg-black bg-opacity-70 text-red-500 p-2 rounded-full hover:bg-opacity-90 transition"
                      title="Eliminar de lista de deseos"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>

                  {/* Información del producto */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white text-sm md:text-base mb-2 line-clamp-2">
                      {item.nombre}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((n) =>
                        n <= (item.rating || 0) ? (
                          <FaStar key={n} className="text-red-600 text-xs" />
                        ) : (
                          <FaRegStar key={n} className="text-gray-500 text-xs" />
                        )
                      )}
                      <span className="text-gray-400 text-xs ml-1">({item.rating || 0})</span>
                    </div>

                    {/* Precio */}
                    <p className="text-white text-lg font-bold mb-4">
                      <span className="text-red-600">$</span>
                      {item.precio}
                    </p>

                    {/* Botones */}
                    <div className="space-y-2">
                      <Link
                        href={`/detailproducts/${item.slug || item.id}`}
                        className="w-full border border-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition text-center block text-sm"
                      >
                        Ver detalles
                      </Link>
                      <button
                        onClick={() => handleAgregarCarrito(item)}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center gap-2 transition text-sm"
                      >
                        <IoCartOutline className="text-lg" />
                        Añadir al carrito
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ModalAviso
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onInvitado={seguirComoInvitado}
        onLogin={redirigirLogin}
      />
    </div>
  );
};

export default WishlistPage;
