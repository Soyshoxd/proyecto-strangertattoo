// app/carrito/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { escucharCambiosCarrito, actualizarCantidadCarrito, eliminarProductoCarrito } from '@/lib/carrito-utils';
import Image from 'next/image';
import Link from 'next/link';

const CarritoPage = () => {
  const [carrito, setCarrito] = useState([]);
  const [user, setUser] = useState(null);

  // Efecto para manejar autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Efecto para sincronización del carrito en tiempo real
  useEffect(() => {
    if (user) {
      // Usuario autenticado: usar escucharCambiosCarrito para tiempo real
      const unsubscribe = escucharCambiosCarrito(user.uid, (productos) => {
        setCarrito(productos);
      });
      
      return unsubscribe;
    } else {
      // Usuario no autenticado: usar localStorage con evento personalizado
      const actualizarCarrito = () => {
        const local = JSON.parse(localStorage.getItem('carrito')) || [];
        setCarrito(Array.isArray(local) ? local : []);
      };
      
      // Cargar inicial
      actualizarCarrito();
      
      // Escuchar cambios
      window.addEventListener('storage', actualizarCarrito);
      window.addEventListener('carritoActualizado', actualizarCarrito);
      
      return () => {
        window.removeEventListener('storage', actualizarCarrito);
        window.removeEventListener('carritoActualizado', actualizarCarrito);
      };
    }
  }, [user]);

  const actualizarCantidad = async (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;

    if (user) {
      // Usuario autenticado: usar la función del carrito-utils
      await actualizarCantidadCarrito(user.uid, id, nuevaCantidad);
    } else {
      // Usuario no autenticado: mantener lógica local
      const nuevoCarrito = carrito.map((item) =>
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item
      );
      setCarrito(nuevoCarrito);
      localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
      // Disparar evento personalizado para actualizar navbar inmediatamente
      window.dispatchEvent(new CustomEvent('carritoActualizado'));
    }
  };

  const eliminarItem = async (id) => {
    if (user) {
      // Usuario autenticado: usar la función del carrito-utils
      await eliminarProductoCarrito(user.uid, id);
    } else {
      // Usuario no autenticado: mantener lógica local
      const nuevoCarrito = carrito.filter((item) => item.id !== id);
      setCarrito(nuevoCarrito);
      localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
      window.dispatchEvent(new CustomEvent('carritoActualizado'));
    }
  };

const calcularSubtotal = () => {
    if (!Array.isArray(carrito)) return 0;
    return carrito.reduce((acc, item) => acc + (item.precio * (item.cantidad || 1)), 0);
  };

  const handleComprar = async () => {
    alert('Gracias por tu compra 😄');
    
    if (user) {
      // Usuario autenticado: vaciar toda la subcolección del carrito
      // Eliminar todos los productos del carrito uno por uno
      for (const producto of carrito) {
        await eliminarProductoCarrito(user.uid, producto.id);
      }
    } else {
      // Usuario no autenticado: limpiar localStorage
      localStorage.removeItem('carrito');
      setCarrito([]);
      window.dispatchEvent(new CustomEvent('carritoActualizado'));
    }
  };

  return (
    <div className="p-4 text-white bg-black min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Tu Carrito</h1>
        <Link href="/productos" className="text-red-500 hover:underline text-sm">Seguir comprando</Link>
      </div>

      {carrito.length === 0 ? (
        <p>No tienes productos en el carrito.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {carrito.map((producto, index) => (
              <li key={`${producto.id}-${index}`} className="flex gap-4 items-center border-b pb-4">
                <Image
                  src={producto.img}
                  alt={producto.nombre}
                  width={80}
                  height={80}
                  className="rounded object-cover"
                />
                <div className="flex-1">
                  <h2 className="font-semibold text-sm">{producto.nombre}</h2>
                  <p className="text-xs text-gray-300">${producto.precio}</p>
                  <div className="flex gap-2 mt-1 items-center">
                    <button onClick={() => actualizarCantidad(producto.id, (producto.cantidad || 1) - 1)} className="bg-red-600 text-white w-6 h-6 rounded">-</button>
                    <span>{producto.cantidad || 1}</span>
                    <button onClick={() => actualizarCantidad(producto.id, (producto.cantidad || 1) + 1)} className="bg-red-600 text-white w-6 h-6 rounded">+</button>
                  </div>
                </div>
                <button
                  onClick={() => eliminarItem(producto.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t pt-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-300">Subtotal:</p>
              <p className="text-lg font-bold text-white">${calcularSubtotal().toFixed(2)}</p>
            </div>
            <button onClick={handleComprar} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 font-semibold text-white text-sm">
              Finalizar compra
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CarritoPage;
