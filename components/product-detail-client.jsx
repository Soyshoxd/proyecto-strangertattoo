'use client';

import { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaHeart, FaRegHeart, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { formatoCOP } from '@/lib/formato-cop';
import { agregarProductoCarrito } from '@/lib/carrito-utils';
import { guardarWishlist, eliminarWishlist, isInWishlist } from '@/lib/wishlist';
import { auth, db } from '@/lib/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, orderBy, query as fbQuery } from 'firebase/firestore';
import ModalAviso from './modal-aviso';
import FormularioReseña from './reseñas';
import { FaCodeCompare } from "react-icons/fa6";
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

export default function ProductDetailClient({ producto, reseñas }) {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState('');
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
  const [imagenPrincipal, setImagenPrincipal] = useState(producto?.img || '');
  const [mostrarModalAviso, setMostrarModalAviso] = useState(false);
  const [user, setUser] = useState(null);
  const [enWishlist, setEnWishlist] = useState(false);
  const [esInvitado, setEsInvitado] = useState(false);
  const [cargandoCarrito, setCargandoCarrito] = useState(false);
  const [mostrarModalReseña, setMostrarModalReseña] = useState(false);
  const searchParams = useSearchParams();
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState({});
  const [reseñasState, setReseñasState] = useState(reseñas || []);
  const [promedioEstrellas, setPromedioEstrellas] = useState(0);
  const [totalReseñas, setTotalReseñas] = useState(0);


  // Validación temprana si no hay producto
  if (!producto || !producto.id) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Error: No se pudo cargar la información del producto.</p>
      </div>
    );
  }
  useEffect(() => {
    // Aceptar ambos query params por compatibilidad con diferentes botones
    if (searchParams.get("openReview") === "true" || searchParams.get("review") === "true") {
      setMostrarModalReseña(true);
    }
  }, [searchParams]);


  // Obtener usuario actual y verificar wishlist
  useEffect(() => {
    // Verificar si ya eligió ser invitado
    const invitadoDecision = localStorage.getItem('usuarioInvitado');
    setEsInvitado(invitadoDecision === 'true');

    // Listener para cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      setUser(usuario);

      // Verificar wishlist solo si hay usuario
      if (usuario) {
        try {
          const existe = await isInWishlist(usuario.uid, producto.id);
          setEnWishlist(existe);
        } catch (error) {
        }
      } else {
        setEnWishlist(false);
      }
    });

    // Cleanup del listener
    return () => unsubscribe();
  }, [producto.id]);

  // Inicializar imagen principal y opción por defecto
  useEffect(() => {
    if (producto.opciones && producto.opciones.length > 0) {
      // Manejar tanto strings como objetos para la opción por defecto
      const primeraOpcion = producto.opciones[0];
      const opcionTexto = typeof primeraOpcion === 'object'
        ? primeraOpcion.nombre || primeraOpcion.valor || JSON.stringify(primeraOpcion)
        : primeraOpcion;
      setOpcionSeleccionada(opcionTexto);
    }

    // Si hay múltiples imágenes, usar la primera como principal
    if (producto.imagenes && producto.imagenes.length > 0) {
      setImagenPrincipal(producto.imagenes[0]);
    } else {
      setImagenPrincipal(producto.img);
    }
  }, [producto]);

  // Fetch client-side de reseñas y mantenerlas en estado
  const fetchReseñas = async () => {
    try {
      const colRef = collection(db, 'productos', producto.id, 'resenas');
      const q = fbQuery(colRef, orderBy('fecha', 'desc'));
      const snap = await getDocs(q);
      const lista = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          usuario: data.nombre || data.uid || 'Usuario',
          estrellas: data.rating || data.estrellas || 0,
          comentario: data.comentario || data.text || '',
          fecha: data.fecha || null
        };
      });
      setReseñasState(lista);
      if (lista.length > 0) {
        const total = lista.length;
        const suma = lista.reduce((acc, r) => acc + (r.estrellas || 0), 0);
        const promedio = suma / total;
        setPromedioEstrellas(promedio);
        setTotalReseñas(total);
      } else {
        setPromedioEstrellas(0);
        setTotalReseñas(0);
      }
    } catch (error) {
      console.error('Error fetch reseñas:', error);
    }
  };

  useEffect(() => {
    // Cargar reseñas iniciales al montar y cuando cambie el producto
    if (producto && producto.id) fetchReseñas();
  }, [producto.id]);

  const handleAgregarCarrito = async () => {
    if (cargandoCarrito) return;

    // Validar que se hayan seleccionado todas las opciones requeridas
    const tieneOpciones = producto.opciones && Array.isArray(producto.opciones) && producto.opciones.length > 0;

    if (tieneOpciones) {
      const todasOpcionesSeleccionadas = producto.opciones.every(opcion =>
        opcionesSeleccionadas[opcion.nombre] && opcionesSeleccionadas[opcion.nombre].trim() !== ''
      );

      if (!todasOpcionesSeleccionadas) {
        toast.info('Por favor selecciona todas las opciones disponibles antes de agregar al carrito.');
        return;
      }
    }

    setCargandoCarrito(true);

    try {
      // Crear objeto del producto con las opciones seleccionadas
      const productoConOpciones = {
        ...producto,
        opcionSeleccionada: opcionSeleccionada || null,
        opcionesSeleccionadas: opcionesSeleccionadas,
        cantidadSeleccionada: cantidadSeleccionada
      };

      if (user) {
        // Usuario autenticado: guardar en Firebase
        await agregarProductoCarrito(user.uid, productoConOpciones, cantidadSeleccionada);
        toast.success('Producto agregado al carrito exitosamente!');
      } else if (esInvitado) {
        // Usuario ya eligió ser invitado: agregar al localStorage
        agregarComoInvitado(productoConOpciones);
        toast.success('Producto agregado al carrito exitosamente!');
      } else {
        // Preguntar al usuario qué desea hacer (login / invitado)
        setMostrarModalAviso(true);
      }
    } catch (error) {
      toast.error('Error al agregar el producto al carrito. Por favor intenta de nuevo.');
    } finally {
      setCargandoCarrito(false);
    }
  };

  const agregarComoInvitado = (productoConOpciones) => {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Verificar si el producto con la misma opción ya existe
    const productoExistente = carrito.find(item =>
      item.id === producto.id && item.opcionSeleccionada === opcionSeleccionada
    );

    if (productoExistente) {
      // Si existe, aumentar la cantidad
      productoExistente.cantidad = (productoExistente.cantidad || 1) + cantidadSeleccionada;
    } else {
      // Si no existe, agregarlo
      carrito.push({
        ...productoConOpciones,
        cantidad: cantidadSeleccionada
      });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    window.dispatchEvent(new CustomEvent('carritoActualizado'));
  };

  const seguirComoInvitado = () => {
    // Recordar la decisión del usuario
    localStorage.setItem('usuarioInvitado', 'true');
    setEsInvitado(true);

    // Agregar el producto actual
    const productoConOpciones = {
      ...producto,
      opcionSeleccionada: opcionSeleccionada || null,
      cantidadSeleccionada: cantidadSeleccionada
    };

    agregarComoInvitado(productoConOpciones);
    setMostrarModalAviso(false);
  };

  const redirigirLogin = () => {
    window.location.href = '/login';
  };

  const toggleWishlist = async () => {
    if (!user) {
      setMostrarModalAviso(true);
      return;
    }

    try {
      if (enWishlist) {
        await eliminarWishlist(user.uid, producto.id);
        setEnWishlist(false);
      } else {
        await guardarWishlist(user.uid, producto);
        setEnWishlist(true);
      }
    } catch (error) {
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const ratingNum = rating ?? 0;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= ratingNum ?
          <FaStar key={i} className="text-red-600 text-sm" /> :
          <FaRegStar key={i} className="text-gray-300 text-sm" />
      );
    }

    return stars;
  };
  const manejarSeleccion = (nombreOpcion, valor) => {
    setOpcionesSeleccionadas(prev => ({
      ...prev,
      [nombreOpcion]: valor
    }));
  };
  return (
    <>
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white">Inicio</Link></li>
              <li>/</li>
              <li><Link href="/productos" className="hover:text-white">Productos</Link></li>
              <li>/</li>
              <li><Link href={`/productos/${producto.categoriaSeleccionada?.toLowerCase()}`} className="hover:text-white">{producto.categoriaSeleccionada}</Link></li>
              <li>/</li>
              <li className="text-red-600">{producto.nombre}</li>
            </ol>
          </nav>

          {/* Botón Volver */}
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <FaArrowLeft className="text-sm" />
            Volver a productos
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna de imágenes */}
            <div className="space-y-4">
              {/* Imagen principal */}
              <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden p-4">
                <Image
                  src={imagenPrincipal}
                  alt={producto.nombre}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                {/* Botón de wishlist */}
                <button
                  onClick={toggleWishlist}
                  className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  {enWishlist ?
                    <FaHeart className="text-red-600 text-xl" /> :
                    <FaHeart className="text-gray-300 hover:text-red-600 text-xl" />
                  }
                </button>
              </div>

              {/* Miniaturas de imágenes adicionales */}
              {producto.imagenes && producto.imagenes.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {producto.imagenes.map((imagen, index) => (
                    <button
                      key={index}
                      onClick={() => setImagenPrincipal(imagen)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${imagenPrincipal === imagen ? 'border-red-600' : 'border-gray-700 hover:border-gray-500'
                        }`}
                    >
                      <Image
                        src={imagen}
                        alt={`${producto.nombre} ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Columna de información */}
            <div className="space-y-6">
              <div>
                <p className="text-red-600 text-sm font-medium mb-2">
                  {producto.categoriaSeleccionada}
                </p>
                <h1 className="text-3xl font-bold mb-4">
                  {producto.nombre}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {renderStars(Math.round(promedioEstrellas))}
                  </div>
                  <span className="text-sm text-gray-400">
                    ({producto.totalResenas || 0})
                  </span>
                </div>


                {/* Precio */}
                <div className="mb-6">
                  <p className="text-3xl font-bold text-red-600">
                    ${formatoCOP(producto.precio)}
                  </p>
                  {producto.precioAnterior && (
                    <p className="text-lg text-gray-400 line-through">
                      ${formatoCOP(producto.precioAnterior)}
                    </p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                <p className="text-gray-300 leading-relaxed">
                  {producto.descripcion || producto.biografía || 'Sin descripción disponible.'}
                </p>
              </div>

              {/* Opciones del producto */}
              {producto.opciones && Array.isArray(producto.opciones) && producto.opciones.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-3">Opciones disponibles</h3>
                  {producto.opciones.map(opcion => (
                    <div key={opcion.id || opcion.nombre} className="opcion-grupo">
                      <h4 className="text-sm font-medium mb-2 text-gray-300">{opcion.nombre}</h4>
                      <div className="flex flex-wrap gap-2">
                        {opcion.valores && opcion.valores.map(valor => (
                          <button
                            key={valor}
                            className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors ${opcionesSeleccionadas[opcion.nombre] === valor
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-red-600'
                              }`}
                            onClick={() => manejarSeleccion(opcion.nombre, valor)}
                          >
                            {valor}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selector de cantidad */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Cantidad</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCantidadSeleccionada(Math.max(1, cantidadSeleccionada - 1))}
                    className="cursor-pointer w-10 h-10 rounded-lg border border-gray-600 hover:border-red-600 text-white hover:text-red-600 transition-colors flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-16 text-center text-lg font-medium">
                    {cantidadSeleccionada}
                  </span>
                  <button
                    onClick={() => setCantidadSeleccionada(cantidadSeleccionada + 1)}
                    className="cursor-pointer w-10 h-10 rounded-lg border border-gray-600 hover:border-red-600 text-white hover:text-red-600 transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>


              {/* El formulario de reseña ya no abre como overlay; se muestra inline en la sección de reseñas */}

              {/* Botones de acción */}
              <div className="space-y-4">
                <button
                  onClick={handleAgregarCarrito}
                  disabled={cargandoCarrito}
                  className={`cursor-pointer w-full bg-red-600 text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${cargandoCarrito
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-red-700'
                    }`}
                >
                  <FaShoppingCart />
                  {cargandoCarrito ? 'Agregando...' : 'Agregar al carrito'}
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={toggleWishlist}
                    className={`cursor-pointer p-1 rounded-lg font-medium transition-all flex items-center justify-center gap-1 ${enWishlist
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'border border-gray-600 text-gray-300 hover:border-red-600 hover:text-red-600'
                      }`}
                  >
                    <FaHeart />
                    {enWishlist ? 'En favoritos' : 'Añadir a favoritos'}
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Mira este producto',
                          text: '¡Echa un vistazo a esto!',
                          url: window.location.href,
                        })
                      } else {
                        toast.error('Tu navegador no soporta la función de compartir.');
                      }
                    }}
                    className="gap-2 flex items-center justify-center cursor-pointer px-4 py-2 border rounded-lg border-gray-600 text-gray-300 hover:border-red-600 hover:text-red-600"
                  >
                    <FaCodeCompare />
                    Compartir
                  </button>

                </div>

              </div>

              {/* Reseñas existentes */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3">Reseñas del producto</h3>
                

                {/* Formulario inline (despliega arriba de las reseñas) */}
                {mostrarModalReseña && (
                  <div className="mb-4 bg-gray-700 p-4 rounded-lg">
                    <FormularioReseña
                      producto={producto} productId={producto.id}
                      onClose={() => {
                        setMostrarModalReseña(false);
                        // refrescar reseñas después de enviar
                        fetchReseñas();
                      }}
                    />
                  </div>
                )}

                {reseñasState.map((r, i) => (
                  <div key={i} className="border-b border-gray-200 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, index) => (
                          <FaStar
                            key={index}
                            size={16}
                            color={index < r.estrellas ? "#e7000b" : "#d1d5db"} // amarillo o gris
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">por {r.usuario}</span>
                    </div>
                    <p className="text-gray-700 mt-1">{r.comentario}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de usuario */}
      <ModalAviso
        isOpen={mostrarModalAviso}
        onClose={() => setMostrarModalAviso(false)}
        onInvitado={seguirComoInvitado}
        onLogin={redirigirLogin}
      />
    </>
  );
}
