'use client';

import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
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
import { memo } from 'react';
import Link from 'next/link';
import { agregarProductoCarrito } from '@/lib/carrito-utils';
import { formatoCOP } from '@/lib/formato-cop';
import { toast } from 'sonner';

const CardProducto = memo(({ producto }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [user, setUser] = useState(null);
  const [enWishlist, setEnWishlist] = useState(false);
  const [esInvitado, setEsInvitado] = useState(false);





  const renderStars = (rating) => {
    const stars = [];
    const ratingNum = rating ?? 0;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= ratingNum ?
          <FaStar key={i} className="text-red-600 text-sm" /> :
          <FaRegStar key={i} className="text-gray-600 text-sm" />
      );
    }

    return stars;
  };

  // Verificar si el producto tiene opciones
  const tieneOpciones = producto.opciones && Array.isArray(producto.opciones) && producto.opciones.length > 0;

  // Obtener usuario actual y verificar si el producto está en la wishlist
  useEffect(() => {
    // Verificar si el usuario ya eligió ser invitado
    const invitadoDecision = localStorage.getItem('usuarioInvitado');
    setEsInvitado(invitadoDecision === 'true');

    // Listener para cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      console.log('Estado de auth cambió en CardProduct:', usuario ? 'Usuario logueado' : 'Usuario no logueado');
      setUser(usuario);

      // Verificar wishlist solo si hay usuario
      if (usuario) {
        try {
          const existe = await isInWishlist(usuario.uid, producto.id);
          setEnWishlist(existe);
        } catch (error) {
          console.error('Error verificando wishlist:', error);
        }
      } else {
        setEnWishlist(false);
      }
    });

    // Cleanup del listener
    return () => unsubscribe();
  }, [producto.id]);

  const handleAgregarCarrito = async () => {
    if (tieneOpciones) {
      // Si tiene opciones, redirigir a la página de detalle
      window.location.href = `/detailproducts/${producto.slug}`;
      return;
    }

    // Si no tiene opciones, proceder normalmente
    if (user) {
      // Usuario autenticado: guardar en Firebase
      try {
        await agregarProductoCarrito(user.uid, producto, 1);
        // Mostrar confirmación visual
        toast.success('¡Producto agregado al carrito!');
      } catch (error) {
        console.error('Error al agregar al carrito:', error);
        toast.error('Error al agregar el producto. Inténtalo de nuevo.');
      }
    } else if (esInvitado) {
      // Usuario ya eligió ser invitado: agregar directamente al localStorage
      agregarComoInvitado();
      toast.success('¡Producto agregado al carrito!');
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
    <div className="w-[160px] md:w-[180px] bg-white rounded-xl shadow-md overflow-hidden snap-center flex-shrink-0 border border-gray-200 relative hover:shadow-lg transition-shadow hover:scale-105">
      {/* Imagen + Wishlist */}
      <div className="w-full h-[140px] relative">
        <button
          onClick={toggleWishlist}
          className="absolute z-1000 top-2 right-2"
        >
          {enWishlist ? <FaHeart className='text-red-600 cursor-pointer ' /> : <FaHeart className='text-gray-300 hover:text-red-700 cursor-pointer' />}
        </button>
        <Link href={`/detailproducts/${producto.slug}`} prefetch={false}>
          <Image
            className="object-cover"
            fill
            sizes="(max-width: 768px) 160px, (max-width: 1200px) 180px, 200px"
            src={producto.img}
            alt={producto.nombre}
            priority={false}
            loading="lazy"
            quality={75}
          />
        </Link>

      </div>

        {/* Contenido */}
        <div className="px-3 py-2 flex flex-col justify-between">
          <Link href={`/detailproducts/${producto.slug}`} prefetch={false}>
          <div className="flex flex-col items-start min-h-[3rem]">
            <p className="text-[12px] text-gray-500">
              {producto.categoriaSeleccionada}
            </p>
            <h3 className="text-[12px] font-semibold text-gray-900 leading-snug line-clamp-2">
              {producto.nombre}
            </h3>
          </div>
          </Link>


          {/* Estrellas + Precio */}
          <div className="flex justify-between items-center mt-1 mb-1">
            <div className="flex flex-col md:flex-row md:gap-2">
              <div className="flex justify-center items-center ">
                {renderStars(Math.round(producto.ratingPromedio || 0))}
                <span className="text-sm text-gray-600">({producto.totalResenas || 0})</span>
              </div>
              <p className="text-black text-[14px] font-bold">
                <span className="text-md font-bold text-red-600">$</span> {formatoCOP(producto.precio)} </p>
            </div>

          </div>
          {/* Botones */}
          <div className="flex gap-2 mt-1">
            <Link href={`/detailproducts/${producto.slug}`} prefetch={false} className="w-1/2 border border-black text-black py-[4px] text-[10px] text-center rounded hover:bg-gray-200 transition">
              Ver más
            </Link>
            <button
              onClick={handleAgregarCarrito}
              className="w-1/2 cursor-pointer bg-red-600 text-white py-[4px] text-[10px] rounded font-bold hover:bg-red-700 flex items-center justify-center gap-1 transition"
            >
              <IoCartOutline className="text-white text-[12px]" />
              {tieneOpciones ? 'Opciones' : 'Añadir'}
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
}
);

export default CardProducto;
