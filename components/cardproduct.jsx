'use client';

import { auth } from '@/lib/firebase-client';
import React, { useEffect, useState } from 'react';
import { FaStar, FaRegStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import { IoCartOutline } from 'react-icons/io5';
import ModalAviso from './modal-aviso';
import {
  guardarWishlist,
  eliminarWishlist,
  isInWishlist
} from '@/lib/wishlist';
import Image from 'next/image';
import Link from 'next/link';
import { agregarProductoCarrito } from '@/lib/carrito-utils';

const CardProducto = ({ producto }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [user, setUser] = useState(null);
  const [enWishlist, setEnWishlist] = useState(false);
  const [esInvitado, setEsInvitado] = useState(false);

  // Obtener usuario actual y verificar si el producto está en la wishlist
  useEffect(() => {
    const usuario = auth.currentUser;
    setUser(usuario);

    // Verificar si el usuario ya eligió ser invitado
    const invitadoDecision = localStorage.getItem('usuarioInvitado');
    setEsInvitado(invitadoDecision === 'true');

    const verificarWishlist = async () => {
      if (usuario) {
        const existe = await isInWishlist(usuario.uid, producto.id);
        setEnWishlist(existe);
      }
    };

    verificarWishlist();
  }, [producto.id]);

  const handleAgregarCarrito = async () => {
    if (user) {
      // Usuario autenticado: guardar en Firebase
      try {
        await agregarProductoCarrito(user.uid, producto, 1);
        console.log('Producto agregado al carrito de Firebase');
      } catch (error) {
        console.error('Error al agregar al carrito:', error);
      }
    } else if (esInvitado) {
      // Usuario ya eligió ser invitado: agregar directamente al localStorage
      agregarComoInvitado();
    } else {
      // Preguntar al usuario qué desea hacer
      setMostrarModal(true);
    }
  };

  const agregarComoInvitado = () => {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Verificar si el producto ya existe en el carrito
    const productoExistente = carrito.find(item => item.id === producto.id);
    
    if (productoExistente) {
      // Si existe, aumentar la cantidad
      productoExistente.cantidad = (productoExistente.cantidad || 1) + 1;
    } else {
      // Si no existe, agregarlo con cantidad 1
      carrito.push({ ...producto, cantidad: 1 });
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Disparar evento para actualizar navbar
    window.dispatchEvent(new CustomEvent('carritoActualizado'));
  };

  const seguirComoInvitado = () => {
    // Recordar la decisión del usuario
    localStorage.setItem('usuarioInvitado', 'true');
    setEsInvitado(true);
    
    // Agregar el producto actual
    agregarComoInvitado();
    
    setMostrarModal(false);
  };

  const redirigirLogin = () => {
    window.location.href = '/login';
  };

  const toggleWishlist = async () => {
    if (!user) {
      // Para la wishlist siempre requerir login
      setMostrarModal(true);
      return;
    }

    if (enWishlist) {
      await eliminarWishlist(user.uid, producto.id);
      setEnWishlist(false);
    } else {
      await guardarWishlist(user.uid, producto);
      setEnWishlist(true);
    }
  };

  return (
    <div className="w-[150px] md:w-[180px] bg-white rounded-xl shadow-md overflow-hidden snap-center flex-shrink-0 border border-gray-200 relative">

      {/* Imagen + Wishlist */}
      <div className="w-full h-[140px] relative">
        <Image
          className="object-cover"
          fill
          sizes="150px"
          src={producto.img}
          alt={producto.nombre}
        />
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 cursor-pointer"
        >
          {enWishlist ? <FaHeart className='text-red-600 ' /> : <FaHeart className='text-gray-300 hover:text-red-700'/>}
        </button>
      </div>

      {/* Contenido */}
      <div className="px-3 py-2 flex flex-col justify-between">
        <div className="h-11">
          <p className="text-[12px] text-gray-500">{producto.categoriaSeleccionada}</p>
          <h3 className="text-[12px] font-semibold text-gray-900 leading-snug line-clamp-2">
            {producto.nombre}
          </h3>
        </div>

        {/* Estrellas + Precio */}
        <div className="flex justify-between items-center mt-1">
          <div className="flex gap-[1px]">
            {[1, 2, 3, 4, 5].map((n) =>
              n <= producto.rating ? (
                <FaStar key={n} className="text-red-700 text-[11px]" />
              ) : (
                <FaRegStar key={n} className="text-gray-800 text-[11px]" />
              )
            )}
          </div>
          <p className="text-black text-[14px] font-bold">
            <span className="text-xs font-bold text-red-600">$</span>
            {producto.precio}
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-2 mt-1">
          <Link href={`/detailproducts/${producto.slug}`} className="w-1/2 border border-black text-black py-[4px] text-[10px] text-center rounded hover:bg-gray-200 transition">
            Ver más
          </Link>
          <button
            onClick={handleAgregarCarrito}
            className="w-1/2 bg-red-600 text-white py-[4px] text-[10px] rounded font-bold hover:bg-red-700 flex items-center justify-center gap-1 transition"
          >
            <IoCartOutline className="text-white text-[12px]" />
            Añadir
          </button>
        </div>
      </div>

      {/* Modal de aviso */}
      <ModalAviso
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onInvitado={seguirComoInvitado}
        onLogin={redirigirLogin}
      />
    </div>
  );
};

export default CardProducto;
