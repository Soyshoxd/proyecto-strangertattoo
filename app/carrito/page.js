// app/carrito/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import Script from 'next/script';
import { auth } from '@/lib/firebase-client';
import {
  escucharCambiosCarrito,
  actualizarCantidadCarrito,
  eliminarProductoCarrito,
} from '@/lib/carrito-utils';
import Image from 'next/image';
import Link from 'next/link';
import { FaTrash } from 'react-icons/fa6';
import { formatoCOP } from '@/lib/formato-cop';
import { toast } from 'sonner';
import { addDoc, collection, getDocs, or, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

const CarritoPage = () => {
  const [carrito, setCarrito] = useState([]);
  const [user, setUser] = useState(null);
  const [boldData, setBoldData] = useState(null);
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const Subtotal = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);


  function generarReference() {
    const fecha = new Date().toISOString().slice(2, 10).replace(/-/g, ""); // 251005
    const random = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 letras
    return `ST-${fecha}-${random}`; // ejemplo: ST-251005-KF8R
  }


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
    if (!Array.isArray(carrito)) return formatoCOP(0);
    const Subtotal = carrito.reduce(
      (acc, item) => acc + item.precio * (item.cantidad || 1),
      0
    );
    return formatoCOP(Subtotal);
  };

  const handleComprar = async () => {
    try {
      toast.info('Generando orden de pago...');
      const reference = generarReference();

      const res = await fetch('/api/bold-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total: Subtotal,
          descripcion: 'Pago desde carrito - Stranger Tattoo',
          orderId: reference,
        }),
      });

      const data = await res.json();
      const user = auth.currentUser;

      if (user) {
        const orderRef = collection(db, 'pedidos');
        await addDoc(orderRef, {
          items: carrito,
          total: Subtotal,
          reference,
          userId: user.uid,
          EstadoPago: 'pendiente',
          EstadoPedido: 'pendiente',
          createdAt: serverTimestamp(),
        });
        toast.success('Orden guardada en tu historial');
      } else {
        toast.info('La orden no se guardó en el historial porque el usuario no está autenticado');
        
      }

      if (!res.ok) throw new Error(data.error || 'Error generando orden');

      setBoldData(data);
      setCheckoutReady(true);
      toast.success('Checkout listo 🔥');

    } catch (err) {
      toast.error('Error: ' + err.message);
    }
  };


  useEffect(() => {
    if (checkoutReady && scriptLoaded && window.BoldPaymentButton) {
      const interval = setInterval(() => {
        const btnContainer = document.getElementById('bold-checkout');
        const apiKeyAttr = btnContainer?.getAttribute('data-api-key');

        if (btnContainer && apiKeyAttr) {
          try {
            window.BoldPaymentButton.initialize();
            clearInterval(interval);
          } catch (err) {
            console.error('Error inicializando BoldPaymentButton:', err);
          }
        } else {
          console.warn('⏳ Esperando que el div tenga los atributos...');
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }, [checkoutReady, scriptLoaded]);

  // 🧠 Nuevo useEffect para verificar si las ENV están llegando bien
  useEffect(() => {
    fetch('/api/bold-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total: 1000, descripcion: 'Verificación ENV' }),
    })
      .then(async (res) => {
        const data = await res.json();
      })
      .catch((err) => console.error('Error verificando ENV:', err));
  }, []);

  return (
    <div className="p-5 text-white bg-black min-h-screen gap-6">
      <div className="flex flex-row justify-between items-center mb-4 w-full">
        <h1 className="text-md md:text-xl font-bold">Tu Carrito</h1>
        <Link
          href="/productos"
          className="text-red-500 hover:underline text-md md:text-xl"
        >
          Seguir comprando
        </Link>
      </div>

      {carrito.length === 0 ? (
        <p>No tienes productos en el carrito.</p>
      ) : (
        <div className="flex flex-col gap-6 w-full h-full">
          {/* Lista de productos */}
          <ul className="space-y-4 mb-6 w-full">
            {carrito.map((producto, index) => (
              <li
                key={`${producto.id}-${index}`}
                className="flex gap-4 justify-items-center border-b pb-4"
              >
                <div className="w-30 h-30 md:w-40 md:h-40 relative">
                  <Image
                    src={producto.img}
                    alt={producto.nombre}
                    fill
                    sizes="(max-width: 768px) 120px, 160px"
                    className="rounded object-cover"
                  />
                </div>

                <div className="w-[30%] md:w-[40%] flex justify-center flex-col">
                  <h2 className="font-semibold text-md md:text-2xl">
                    {producto.nombre}
                  </h2>
                  <p className="text-md md:text-xl text-gray-300">
                    <span className="text-red-700 text-md md:text-xl">$</span>
                    {formatoCOP(producto.precio)}
                  </p>
                </div>

                <div className="flex gap-3 mt-1 items-center justify-center md:text-2xl w-[25%] md:w-[35%]">
                  <button
                    onClick={() =>
                      actualizarCantidad(
                        producto.id,
                        (producto.cantidad || 1) - 1
                      )
                    }
                    className="bg-red-600 text-white w-6 h-6 md:w-10 md:h-10 rounded cursor-pointer"
                  >
                    -
                  </button>
                  <span>{producto.cantidad || 1}</span>
                  <button
                    onClick={() =>
                      actualizarCantidad(
                        producto.id,
                        (producto.cantidad || 1) + 1
                      )
                    }
                    className="bg-red-600 text-white w-6 h-6 md:w-10 md:h-10 rounded cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => eliminarItem(producto.id)}
                  className="text-md md:text-2xl text-red-500 hover:text-red-700 cursor-pointer"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>

          {/* Contenedor de Subtotal */}
          <div className="w-full flex flex-col gap-4">
            <div>
              <p className="text-md md:text-xl text-red-600">Subtotal:</p>
              <p className="text-lg md:text-2xl font-bold text-white">
                ${calcularSubtotal()}
              </p>
            </div>
            {!checkoutReady ? (
              <button
                onClick={handleComprar}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg"
              >
                Finalizar compra
              </button>
            ) : (
              <>
                <div className="flex justify-center items-center mt-8">
                  <div
                    id="bold-checkout"
                    data-bold-button="light-M"
                    className="w-full md:w-[60%] lg:w-[40%] flex justify-center"
                  ></div>
                </div>

                {/* Script oficial de Bold */}
                <Script
                  src="https://checkout.bold.co/library/boldPaymentButton.js"
                  strategy="afterInteractive"
                  onLoad={() => {
                    if (boldData) {
                      const container = document.getElementById('bold-checkout');
                      container.innerHTML = '';

                      const script = document.createElement('script');
                      script.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
                      script.dataset.boldButton = '';
                      script.dataset.apiKey = 'mgrT7qNQ4MqfkUQwCn-KzjIbl5ZqGCxRWBubP-SwRVE';
                      script.dataset.orderId = boldData.orderId;
                      script.dataset.boldButton = '';
                      script.dataset.amount = boldData.amountInCents;
                      script.dataset.currency = 'COP';
                      script.dataset.description = boldData.descripcion;
                      script.dataset.integritySignature = boldData.integritySignature;
                      script.dataset.renderMode = 'embedded';
                      script.dataset.redirectUrl = `${window.location.origin}/confirmacion`;

                      container.appendChild(script);

                      if (window.BoldPaymentButton) {
                        setTimeout(() => window.BoldPaymentButton.initialize(), 300);
                      }
                    }
                  }}

                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CarritoPage;
