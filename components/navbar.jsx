'use client';

import { useEffect, useState } from 'react';
import { FaInstagram, FaTiktok, FaFacebook, FaShoppingCart, FaUserCircle, FaPlus, FaMinus } from "react-icons/fa";
import { IoMenu, IoPersonCircle } from "react-icons/io5";
import Logo from "@/assets/LogoStrangerLetras.png"
import Link from "next/link";
import Image from 'next/image';
import { auth, db } from '@/lib/firebase-client';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import ModalUsuario from './modalusuario';
import { FaHeart } from 'react-icons/fa';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useCarritoMigration } from '@/hooks/useCarritoMigration';

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

  // Hook para obtener la ruta actual con manejo de errores
  const [pathname, setPathname] = useState('');

  //traer la info de las colecciones
  useEffect(() => {
    const unsubTatuadores = onSnapshot(collection(db, 'tatuadores'), snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListaTatuadores(data);
    });

    const unsubPerforadores = onSnapshot(collection(db, 'perforadores'), snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListaPerforadores(data);
    });

    return () => {
      unsubTatuadores();
      unsubPerforadores();
    };
  }, []);

  // Función para actualizar el pathname
  useEffect(() => {

    const updatePathname = () => {
      try {
        const currentPath = window.location.pathname;
        setPathname(currentPath);
      } catch (error) {
        console.log('Error al obtener pathname:', error);
      }
    };

    // Actualizar pathname inicial
    updatePathname();

    // Escuchar cambios de navegación
    window.addEventListener('popstate', updatePathname);

    // Observar cambios en la URL para Next.js
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== pathname) {
        updatePathname();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      window.removeEventListener('popstate', updatePathname);
      observer.disconnect();
    };
  }, [pathname]);

  // Función para verificar si una ruta está activa
  const isActiveRoute = (route) => pathname === route;
  const isActiveSection = (section) => pathname.startsWith(section);
  
  // Función para verificar si estamos en una ruta de tatuador
  const isOnTatuadorRoute = () => {
    // Si no hay pathname, no estamos en ninguna ruta específica
    if (!pathname || pathname === '/') return false;
    
    // Verificar si el pathname actual (sin la barra inicial) coincide con algún slug de tatuador
    const currentSlug = pathname.substring(1); // Remover la barra inicial
    return listaTatuadores.some(tatuador => tatuador.slug === currentSlug);
  };

  // Función para verificar si estamos en una ruta de perforador
  const isOnPerforadorRoute = () => {
    // Si no hay pathname, no estamos en ninguna ruta específica
    if (!pathname || pathname === '/') return false;
    
    // Verificar si el pathname actual (sin la barra inicial) coincide con algún slug de perforador
    const currentSlug = pathname.substring(1); // Remover la barra inicial
    return listaPerforadores.some(perforador => perforador.slug === currentSlug);
  };

  useEffect(() => {
    if (!usuario) return;

    const wishlistRef = collection(db, 'users', usuario.uid, 'wishlist');
    const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
      setCantidadDeseos(snapshot.size); // número de productos en wishlist
    });

    return () => unsubscribe();
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
              <li>
                <Link
                  href="/"
                  className={`transition-colors ${isActiveSection('/') ? 'text-red-500' : 'hover:text-red-500'
                    }`}
                >
                  Inicio
                </Link>
              </li>
              <li
                className="relative"
                onMouseEnter={() => setTatuadoresDesktopAbierto(true)}
                onMouseLeave={() => setTatuadoresDesktopAbierto(false)}
              >
                <span className={`transition-colors cursor-pointer ${isOnTatuadorRoute() ? 'text-red-500' : 'hover:text-red-500'
                  }`}>
                  Tatuadores
                </span>
                {tatuadoresDesktopAbierto && (
                  <ul className="absolute left-0 top-full mt-1 w-40 bg-black border border-gray-700 shadow-lg rounded z-50">
                    {listaTatuadores.map((tatuador) => (
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
                    ))}
                  </ul>
                )}

              </li>

              <li
                className="relative"
                onMouseEnter={() => setPerforadoresDesktopAbierto(true)}
                onMouseLeave={() => setPerforadoresDesktopAbierto(false)}
              >
                <span className={`transition-colors cursor-pointer ${isOnPerforadorRoute() ? 'text-red-500' : 'hover:text-red-500'
                  }`}>
                  Perforadores
                </span>
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
                        >
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
          <div className="bg-black text-white w-full h-full bg-[url('/assets/menu3.png')]">

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
