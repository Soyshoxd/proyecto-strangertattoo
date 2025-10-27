'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { FaInstagram, FaTiktok, FaFacebook, FaShoppingCart, FaUserCircle, FaPlus, FaMinus, FaHeart } from "react-icons/fa";
import { IoPersonCircle } from "react-icons/io5";
import Logo from "@/assets/LogoStrangerLetras.png"
import Link from "next/link";
import Image from 'next/image';
import { auth, db } from '@/lib/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
import ModalUsuario from './modalusuario';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { useCarritoMigration } from '@/hooks/useCarritoMigration';
import cacheManager, { CACHE_KEYS, CACHE_TTL } from '@/lib/cache-manager';
import { useCacheInvalidation } from '@/hooks/useCacheInvalidation';

const Navbar = () => {
  // Hook para migración automática del carrito
  useCarritoMigration();

  const [cantidadCarrito, setCantidadCarrito] = useState(0);
  const [usuario, setUsuario] = useState(null);
  const [mostrarModalUsuario, setMostrarModalUsuario] = useState(false);
  const [cantidadDeseos, setCantidadDeseos] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  // Estados para submenús desplegables (móvil)
  const [tatuadoresAbierto, setTatuadoresAbierto] = useState(false);
  const [perforadoresAbierto, setPerforadoresAbierto] = useState(false);
  // Estados para dropdowns desktop
  const [tatuadoresDesktopAbierto, setTatuadoresDesktopAbierto] = useState(false);
  const [perforadoresDesktopAbierto, setPerforadoresDesktopAbierto] = useState(false);
  //Traer lista de tatuadores y perforadores
  const [listaTatuadores, setListaTatuadores] = useState([]);
  const [listaPerforadores, setListaPerforadores] = useState([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);

  // Hook para obtener la ruta actual con manejo de errores
  const [pathname, setPathname] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.submenu-tatuadores') && tatuadoresDesktopAbierto) {
        setTatuadoresDesktopAbierto(false);
      }
      if (!event.target.closest('.submenu-perforadores') && perforadoresDesktopAbierto) {
        setPerforadoresDesktopAbierto(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [tatuadoresDesktopAbierto, perforadoresDesktopAbierto]);

  // Función para cargar tatuadores y perforadores
  const cargarTatuadoresYPerforadores = useCallback(async (forceReload = false) => {
    if (isLoadingArtists && !forceReload) return;
    
    setIsLoadingArtists(true);
    
    try {
      // Si no es recarga forzada, intentar caché primero
      if (!forceReload) {
        const cachedTatuadores = cacheManager.get(CACHE_KEYS.TATUADORES, CACHE_TTL.TATUADORES);
        const cachedPerforadores = cacheManager.get(CACHE_KEYS.PERFORADORES, CACHE_TTL.PERFORADORES);
        
        if (cachedTatuadores && cachedPerforadores) {
          setListaTatuadores(cachedTatuadores);
          setListaPerforadores(cachedPerforadores);
          setIsLoadingArtists(false);
          return;
        }
      }

      // Hacer consulta a Firebase
      const snapshot = await getDocs(collection(db, 'tatuadores'));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filtrar por tipo
      const soloTatuadores = data.filter(item => item.tipo === 'tatuador');
      const soloPerforadores = data.filter(item => item.tipo === 'perforador');

      // Cachear los resultados
      cacheManager.set(CACHE_KEYS.TATUADORES, soloTatuadores);
      cacheManager.set(CACHE_KEYS.PERFORADORES, soloPerforadores);

      setListaTatuadores(soloTatuadores);
      setListaPerforadores(soloPerforadores);
      
      console.log(`🔄 Navbar: Cargados ${soloTatuadores.length} tatuadores y ${soloPerforadores.length} perforadores`);
    } catch (error) {
      console.error('Error al cargar tatuadores y perforadores:', error);
    } finally {
      setIsLoadingArtists(false);
    }
  }, [isLoadingArtists]);

  // Hook para invalidación de caché por admin
  useCacheInvalidation({
    onArtistsInvalidated: () => {
      console.log('🔄 Navbar: Recargando artistas por invalidación de admin');
      cargarTatuadoresYPerforadores(true);
    }
  });

  useEffect(() => {
    cargarTatuadoresYPerforadores();
  }, [cargarTatuadoresYPerforadores]);

  // Función para actualizar el pathname (optimizada)
  const updatePathname = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const currentPath = window.location.pathname;
        setPathname(currentPath);
      } catch (error) {
        console.error('Error al obtener pathname:', error);
      }
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    // Actualizar pathname inicial
    updatePathname();
  }, [updatePathname]);

  useEffect(() => {
    if (!isClient) return;

    // Escuchar cambios de navegación
    const handlePopState = () => {
      setTimeout(updatePathname, 50);
    };

    window.addEventListener('popstate', handlePopState, { passive: true });

    // Observar cambios en la URL para Next.js (con throttling)
    let timeoutId;
    const observer = new MutationObserver(() => {
      const currentPath = window.location.pathname;
      if (currentPath !== pathname) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setPathname(currentPath);
        }, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      window.removeEventListener('popstate', handlePopState);
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [isClient, pathname, updatePathname]);

  // Función para verificar si una ruta está activa (memoizada)
  const isActiveRoute = useCallback((route) => pathname === route, [pathname]);
  const isActiveSection = useCallback((section) => pathname.startsWith(section), [pathname]);

  // Función para verificar si estamos en una ruta de tatuador (memoizada)
  const isOnTatuadorRoute = useCallback(() => {
    // Si no hay pathname, no estamos en ninguna ruta específica
    if (!pathname || pathname === '/') return false;

    // Verificar si el pathname actual (sin la barra inicial) coincide con algún slug de tatuador
    const currentSlug = pathname.substring(1); // Remover la barra inicial
    return listaTatuadores.some(tatuador => tatuador.slug === currentSlug);
  }, [pathname, listaTatuadores]);

  // Función para verificar si estamos en una ruta de perforador (memoizada)
  const isOnPerforadorRoute = useCallback(() => {
    // Si no hay pathname, no estamos en ninguna ruta específica
    if (!pathname || pathname === '/') return false;

    // Verificar si el pathname actual (sin la barra inicial) coincide con algún slug de perforador
    const currentSlug = pathname.substring(1); // Remover la barra inicial
    return listaPerforadores.some(perforador => perforador.slug === currentSlug);
  }, [pathname, listaPerforadores]);

  useEffect(() => {
    if (!usuario) return;

    const actualizarCantidadDeseos = async () => {
      try {
        const wishlistRef = collection(db, 'users', usuario.uid, 'wishlist');
        const snapshot = await getDocs(wishlistRef);
        setCantidadDeseos(snapshot.size);
      } catch (error) {
        console.error('Error al obtener wishlist:', error);
        setCantidadDeseos(0);
      }
    };

    // Cargar inicialmente
    actualizarCantidadDeseos();
    
    // Actualizar cuando se agregue/elimine desde wishlist
    const handleWishlistChange = () => actualizarCantidadDeseos();
    window.addEventListener('wishlistActualizada', handleWishlistChange);

    return () => {
      window.removeEventListener('wishlistActualizada', handleWishlistChange);
    };
  }, [usuario]);



  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        // Usuario se acaba de loguear, limpiar flag de invitado
        localStorage.removeItem('usuarioInvitado');
      }
      setUsuario(user);
    });
  }, []);

  // Efecto para contador del carrito con sincronización en tiempo real
  useEffect(() => {
    if (usuario) {
      // Usuario autenticado: usar onSnapshot para tiempo real
      const carritoRef = collection(db, 'users', usuario.uid, 'carrito');
      const unsubscribe = onSnapshot(
        carritoRef,
        (snapshot) => {
          // snapshot es una QuerySnapshot de la subcolección carrito
          const productos = [];
          snapshot.forEach((doc) => {
            productos.push({
              id: doc.id,
              ...doc.data()
            });
          });

          // Calcular cantidad total
          if (Array.isArray(productos) && productos.length > 0) {
            const cantidadTotal = productos.reduce((total, item) => total + (item.cantidad || 1), 0);
            setCantidadCarrito(cantidadTotal);
          } else {
            setCantidadCarrito(0);
          }
        },
        (error) => {
          console.error('Error al escuchar carrito:', error);
          setCantidadCarrito(0);
        }
      );

      return unsubscribe;
    } else {
      // Usuario no autenticado: obtener de localStorage
      const actualizarCarrito = () => {
        try {
          const carritoGuardado = localStorage.getItem('carrito');
          const carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];
          // Verificar que carrito sea un array antes de usar reduce
          if (Array.isArray(carrito)) {
            setCantidadCarrito(carrito.reduce((total, item) => total + (item.cantidad || 1), 0));
          } else {
            console.warn('carrito no es un array:', carrito);
            setCantidadCarrito(0);
          }
        } catch (error) {
          console.error('Error al actualizar carrito desde localStorage:', error);
          setCantidadCarrito(0);
        }
      };

      // Actualización inicial
      actualizarCarrito();

      // Escuchar eventos
      window.addEventListener('storage', actualizarCarrito);
      window.addEventListener('carritoActualizado', actualizarCarrito);

      return () => {
        window.removeEventListener('storage', actualizarCarrito);
        window.removeEventListener('carritoActualizado', actualizarCarrito);
      };
    }
  }, [usuario]);
  useEffect(() => {
    if (menuAbierto) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    // Limpieza por si el componente se desmonta con el menú abierto
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [menuAbierto]);

  return (
    <>
      <div className="relative bg-black text-white px-4 py-3 h-[60px]">
        <nav className="flex justify-between items-center z-10 relative">
          <Link href="/">
            <Image src={Logo} alt="Logo" className="w-[90px] h-[35px] object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            {/* Social Media Links */}
            <ul className="flex items-center gap-3 text-xl">
              <li className="hover:text-red-500 transition-colors cursor-pointer" title="Instagram">
                <FaInstagram />
              </li>
              <li className="hover:text-red-500 transition-colors cursor-pointer" title="TikTok">
                <FaTiktok />
              </li>
              <li className="hover:text-red-500 transition-colors cursor-pointer" title="Facebook">
                <FaFacebook />
              </li>
            </ul>

            {/* Navigation Links */}
            <ul className="flex items-center gap-4 ml-6 text-sm">
              <li className="relative">
                <button
                  onClick={() => { setTatuadoresDesktopAbierto(!tatuadoresDesktopAbierto); setPerforadoresDesktopAbierto(false); }} // cerrar el otro menú

                  className={`transition-colors cursor-pointer ${isOnTatuadorRoute() ? 'text-red-500' : 'hover:text-red-500'
                    }`}
                >
                  Tatuadores
                </button>

                {tatuadoresDesktopAbierto && (
                  <ul className="absolute left-0 top-full mt-1 w-48 bg-black border border-gray-700 shadow-lg rounded z-50">
                    {listaTatuadores.map((tatuador) => (
                      <li key={tatuador.id}>
                        <Link
                          href={`/${tatuador.slug}`}
                          className={`block px-4 py-2 transition-colors ${isActiveRoute(`/${tatuador.slug}`)
                            ? 'text-red-500 bg-gray-800'
                            : 'text-white hover:text-red-500 hover:bg-gray-800'
                            }`}
                          onClick={() => setTatuadoresDesktopAbierto(false)} // cerrar al seleccionar
                        >
                          {tatuador.nombre}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>


              <li className="relative">
                <button
                  onClick={() => { setPerforadoresDesktopAbierto(!perforadoresDesktopAbierto); setTatuadoresDesktopAbierto(false); }}
                  className={`transition-colors cursor-pointer ${isOnPerforadorRoute() ? 'text-red-500' : 'hover:text-red-500'
                    }`}
                >
                  Perforadores
                </button>
                {perforadoresDesktopAbierto && (
                  <ul className="absolute left-0 top-full mt-1 w-40 bg-black border border-gray-700 shadow-lg rounded z-50">
                    {listaPerforadores.map((perforador) => (
                      <li key={perforador.id}>
                        <Link
                          href={`/${perforador.slug}`}
                          className={`block px-4 py-2 transition-colors ${isActiveRoute(`/${perforador.slug}`)
                            ? 'text-red-500 bg-gray-800'
                            : 'text-white hover:text-red-500 hover:bg-gray-800'
                            }`}


                          onClick={() => setTatuadoresDesktopAbierto(false)}>
                          {perforador.nombre}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              <li>
                <Link
                  href="/productos"
                  className={`transition-colors ${isActiveSection('/productos') ? 'text-red-500' : 'hover:text-red-500'
                    }`}
                >
                  Productos
                </Link>
              </li>
              {/* Link pedidos */}
              <li>
                <Link href="/mis-pedidos" className={`transition-colors ${isActiveSection('/mis-pedidos') ? 'text-red-500' : 'hover:text-red-500'}`}>
                  Mis Pedidos
                </Link>
              </li>
            </ul>



            {/* Action Icons */}
            <ul className="flex items-center gap-3 ml-4 text-xl relative">
              <Link href="/carrito">
                <li className="relative hover:text-red-500 transition-colors" title="Carrito">
                  <FaShoppingCart />
                  {cantidadCarrito > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {cantidadCarrito}
                    </span>
                  )}
                </li>
              </Link>
              <Link href="/listadedeseos">
                <li className='relative hover:text-red-500 transition-colors' title="Lista de Deseos">
                  <FaHeart />
                  {cantidadDeseos > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {cantidadDeseos}
                    </span>
                  )}
                </li>
              </Link>
              <li>
                <IoPersonCircle
                  onClick={() => setMostrarModalUsuario(true)}
                  className='text-[28px] hover:text-red-500 transition-colors cursor-pointer'
                  title="Perfil"
                />
              </li>
            </ul>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-3">
            {/* Mobile Action Icons */}
            <Link href="/carrito">
              <div className="relative hover:text-red-500 transition-colors" title="Carrito">
                <FaShoppingCart className="text-xl" />
                {cantidadCarrito > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cantidadCarrito}
                  </span>
                )}
              </div>
            </Link>

            <Link href="/listadedeseos">
              <div className='relative hover:text-red-500 transition-colors' title="Lista de Deseos">
                <FaHeart className="text-xl" />
                {cantidadDeseos > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cantidadDeseos}
                  </span>
                )}
              </div>
            </Link>

            <IoPersonCircle
              onClick={() => setMostrarModalUsuario(true)}
              className='text-[28px] hover:text-red-500 transition-colors cursor-pointer'
              title="Perfil"
            />

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="hover:text-red-500 transition-colors p-1"
              aria-label="Menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <div className={`w-5 h-0.5 bg-white transition-all duration-400 ease-in-out ${menuAbierto ? 'rotate-45 translate-y-1.5' : ''
                  }`}></div>
                <div className={`w-5 h-0.5 bg-white mt-1 transition-all duration-400 ease-in-out ${menuAbierto ? 'opacity-0' : ''
                  }`}></div>
                <div className={`w-5 h-0.5 bg-white mt-1 transition-all duration-400 ease-in-out ${menuAbierto ? '-rotate-45 -translate-y-1.5' : ''
                  }`}></div>
              </div>
            </button>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-600 to-purple-600 via-blue-600" />
      </div>

      {/* Mobile Menu Overlay */}
      {menuAbierto && (
        <div className="md:hidden fixed mt-0.4 w-full z-50 h-dvh">
          <div className="bg-black text-white w-full h-full bg-[url('/assets/menu3.png')] bg-cover bg-center">

            {/* Mobile Menu Content */}
            <div className="px-8">
              {/* Navigation Links */}
              <nav className="mb-8">
                <ul className="space-y-4 pt-7">
                  <li>
                    <Link
                      href="/"
                      className={`block text-lg font-semibold py-2 transition-colors ${isActiveRoute('/') ? 'text-red-500' : 'hover:text-red-500'
                        }`}
                      onClick={() => setMenuAbierto(false)}
                    >
                      Inicio
                    </Link>
                  </li>
                  <li>
                    {/* Tatuadores */}
                    <div className="flex items-center justify-between cursor-pointer py-2" onClick={() => setTatuadoresAbierto(!tatuadoresAbierto)}>
                      <span className="block text-lg font-semibold">Tatuadores</span>
                      {tatuadoresAbierto ? <FaMinus className='text-red-600' /> : <FaPlus />}
                    </div>
                    {tatuadoresAbierto && (
                      <ul className="pl-4 space-y-2 mt-2">
                        {listaTatuadores.length > 0 ? (
                          listaTatuadores.map((tatuador) => (
                            <li key={tatuador.id}>
                              <Link
                                href={`/${tatuador.slug}`}
                                className={`block px-4 py-2 transition-colors ${isActiveRoute(`/${tatuador.slug}`)
                                  ? 'text-red-500 bg-gray-800'
                                  : 'text-white hover:text-red-500 hover:bg-gray-800'
                                  }`}
                              >
                                {tatuador.nombre}
                              </Link>
                            </li>
                          ))
                        ) : (
                          <li>
                            <span className="block px-4 py-2 text-white italic opacity-75">
                              No hay tatuadores en este momento
                            </span>
                          </li>
                        )}

                      </ul>
                    )}
                  </li>

                  <li>
                    {/* Perforadores */}
                    <div
                      className="flex items-center justify-between cursor-pointer py-2"
                      onClick={() => setPerforadoresAbierto(!perforadoresAbierto)}
                    >
                      <span className="block text-lg font-semibold">Perforadores</span>
                      {perforadoresAbierto ? (
                        <FaMinus className="text-red-600" />
                      ) : (
                        <FaPlus />
                      )}
                    </div>

                    {perforadoresAbierto && (
                      <ul className="pl-4 space-y-2 mt-2">
                        {listaPerforadores.length > 0 ? (
                          listaPerforadores.map((perforador) => (
                            <li key={perforador.id}>
                              <Link
                                href={`/${perforador.slug}`}
                                className={`block px-4 py-2 transition-colors ${isActiveRoute(`/${perforador.slug}`)
                                  ? "text-red-500 bg-gray-800"
                                  : "text-white hover:text-red-500 hover:bg-gray-800"
                                  }`}
                              >
                                {perforador.nombre}
                              </Link>
                            </li>
                          ))
                        ) : (
                          <li>
                            <span className="block px-4 py-2 text-white italic opacity-75">
                              No hay perforadores en este momento
                            </span>
                          </li>
                        )}

                      </ul>
                    )}
                  </li>

                  <li>
                    <Link
                      href="/productos"
                      className={`block text-lg font-semibold py-2 transition-colors ${isActiveSection('/productos') ? 'text-red-500' : 'hover:text-red-500'
                        }`}
                      onClick={() => setMenuAbierto(false)}
                    >
                      Productos
                    </Link>
                  </li>
                  <li>
                    <Link href="/mis-pedidos" className={`block text-lg font-semibold py-2 transition-colors ${isActiveSection('/mis-pedidos') ? 'text-red-500' : 'hover:text-red-500'
                        }`}>
                      Mis Pedidos
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Social Media Links */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wider">Síguenos</h3>
                <ul className="flex gap-6 text-2xl">
                  <li className="hover:text-red-500 transition-colors cursor-pointer">
                    <FaInstagram />
                  </li>
                  <li className="hover:text-red-500 transition-colors cursor-pointer">
                    <FaTiktok />
                  </li>
                  <li className="hover:text-red-500 transition-colors cursor-pointer">
                    <FaFacebook />
                  </li>
                </ul>
              </div>
            </div>
          </div >
        </div >
      )}

      {/* Modal Usuario */}
      <ModalUsuario isOpen={mostrarModalUsuario} onClose={() => setMostrarModalUsuario(false)} />
    </>
  );
};

export default Navbar;
