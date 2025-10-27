'use client';

import React, { useState, useMemo, useRef } from 'react';
import CardProducto from './cardproduct';
import Navbar from './navbar';
import Footer from './footer';
import Image from 'next/image';

export default function ProductosPage({ 
  categorias, 
  productosIniciales, 
  categoriaPreseleccionada = null,
}) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(
    categoriaPreseleccionada || 'todas'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [productosPorPagina, setProductosPorPagina] = useState(10);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef(null);

  // Filtrar productos según la categoría seleccionada
  const productosFiltrados = useMemo(() => {
    if (categoriaSeleccionada === 'todas') {
      return productosIniciales;
    }
    
    const filtrados = productosIniciales.filter(producto => {
      // Normalizar strings para comparación (quitar espacios extra, mismo case)
      const categoriaProducto = (producto.categoriaSeleccionada || '').trim();
      const categoriaFiltro = categoriaSeleccionada.trim();
      
      // Comparación exacta primero
      let match = categoriaProducto === categoriaFiltro;
      
      // Si no hay match exacto, probar comparación case-insensitive
      if (!match) {
        match = categoriaProducto.toLowerCase() === categoriaFiltro.toLowerCase();
      }
      
      return match;
    });
    
    return filtrados;
  }, [productosIniciales, categoriaSeleccionada]);

  // Cálculo de paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indiceUltimoProducto = paginaActual * productosPorPagina;
  const indicePrimerProducto = indiceUltimoProducto - productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indicePrimerProducto, indiceUltimoProducto);

  // Resetear página cuando cambia la categoría o productos por página
  React.useEffect(() => {
    setPaginaActual(1);
  }, [categoriaSeleccionada, productosPorPagina]);

  const handleCategoriaClick = (categoria) => {
    setIsLoading(true);
    setCategoriaSeleccionada(categoria);
    // Simular un pequeño delay para mejor UX
    setTimeout(() => setIsLoading(false), 100);
  };

  // Funciones de scroll
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Verificar si se necesitan las flechas
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // useEffect para inicializar scroll buttons
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollButtons();
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [categorias]);

  // Generar datos para SEO con la misma lógica de comparación
  const categoriasConConteo = categorias.map(categoria => ({
    ...categoria,
    conteo: productosIniciales.filter(producto => {
      const categoriaProducto = (producto.categoriaSeleccionada || '').trim();
      const categoriaNombre = (categoria.nombre || '').trim();
      
      return categoriaProducto === categoriaNombre || 
             categoriaProducto.toLowerCase() === categoriaNombre.toLowerCase();
    }).length
  }));

  return (
    <>
      <Navbar />
      <main className="bg-black font-monserrat min-h-screen">
        {/* SEO Schema.org structured data para productos */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "Productos Stranger Tattoo",
              "description": "Catálogo completo de productos para tatuajes, perforaciones, vapes y joyería",
              "numberOfItems": productosIniciales.length,
              "itemListElement": productosIniciales.map((producto, index) => ({
                "@type": "Product",
                "position": index + 1,
                "name": producto.nombre,
                "description": producto.descripcion,
                "image": producto.img,
                "offers": {
                  "@type": "Offer",
                  "price": producto.precio,
                  "priceCurrency": "COP"
                },
                "brand": {
                  "@type": "Brand",
                  "name": "Stranger Tattoo"
                },
                "category": producto.categoriaSeleccionada
              }))
            })
          }}
        />

        <div className="container mx-auto px-4 py-8">
          {/* Header optimizado para SEO */}
          <header className="text-center mb-8">
            <h1 className="text-red-600 font-mistranger text-[40px] text-glow-red mb-4">
                Productos
              
            </h1>
            <p className="text-white text-lg max-w-2xl mx-auto">
          
                Descubre nuestra amplia selección de productos para fumar, vapear, piercings, joyería, bolsos y accesorios de moda. Calidad garantizada para quienes buscan destacar con estilo y actitud.
            </p>
          </header>

          {/* Breadcrumb para SEO */}
          <nav aria-label="breadcrumb" className="mb-6">
            <ol className="flex text-sm text-gray-400">
              <li><a href="/" className="hover:text-white">Inicio</a></li>
              <li className="mx-2">/</li>
              <li className="text-white">Productos</li>
              {categoriaSeleccionada !== 'todas' && (
                <>
                  <li className="mx-2">/</li>
                  <li className="text-red-600">{categoriaSeleccionada}</li>
                </>
              )}
            </ol>
          </nav>

          {/* Filtros de categorías con imágenes circulares */}
          <section className="mb-8">
            <h2 className="text-white text-lg font-semibold mb-4">Categorías</h2>
            {/* Contenedor de categorías con scroll horizontal y flechas */}
            <div className="relative">
              {/* Flecha izquierda */}
              {showLeftArrow && (
                <button
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-red-700 text-black cursor-pointer rounded-full p-2 shadow-lg transition-all duration-200 backdrop-blur-sm"
                  aria-label="Scroll hacia la izquierda"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
              {/* Contenedor scrolleable */}
              <div 
                ref={scrollContainerRef}
                className="flex flex-row gap-3 overflow-x-auto pb-2 scrollbar-hide px-8"
                style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
              >
              {/* Mostrar skeleton mientras carga si no hay categorías */}
              {isLoading && categorias.length === 0 ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex flex-col items-center p-3 animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-gray-700 mb-2"></div>
                    <div className="h-3 w-12 bg-gray-700 rounded mb-1"></div>
                    <div className="h-2 w-8 bg-gray-700 rounded"></div>
                  </div>
                ))
              ) : (
                <>
              {/* Botón "Todas" con imagen especial */}
              <button
                onClick={() => handleCategoriaClick('todas')}
                className={`group flex flex-col items-center rounded-xl transition-all duration-300 min-w-[80px] flex-shrink-0 p-2 cursor-pointer${
                  categoriaSeleccionada === 'todas' ? ' ' : ''
                }`}
                aria-pressed={categoriaSeleccionada === 'todas'}
              >
                {/* Círculo con gradiente para "Todas" */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                  categoriaSeleccionada === 'todas'
                    ? 'bg-gradient-to-r from-red-600 to-red-800 scale-110 shadow-lg shadow-red-600/50'
                    : 'bg-gradient-to-r from-gray-600 to-gray-800 group-hover:from-red-600 group-hover:to-red-800'
                }`}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className={`text-[10px] font-medium transition-colors duration-300 text-center ${
                  categoriaSeleccionada === 'todas' ? 'text-red-600' : 'text-gray-300 group-hover:text-white'
                }`}>
                  Todas
                </span>
                <span className={`text-xs transition-colors duration-300 ${
                  categoriaSeleccionada === 'todas' ? 'text-red-400' : 'text-gray-400 group-hover:text-gray-300'
                }`}>
                  ({productosIniciales.length})
                </span>
              </button>

              {/* Botones de categorías con imágenes circulares */}
              {categoriasConConteo.map((categoria) => {
                const isSelected = categoriaSeleccionada === categoria.nombre;
                const imagenCategoria = categoria.icono || categoria.Icono; // Adaptable a diferentes nombres de campo
                
                return (
                  <button
                    key={categoria.id}
                    onClick={() => handleCategoriaClick(categoria.nombre)}
                    className={`group flex flex-col items-center rounded-xl transition-all duration-300 min-w-[80px] flex-shrink-0 p-2 cursor-pointer ${
                      isSelected ? '' : ''
                    }`}
                    aria-pressed={isSelected}
                  >
                    {/* Imagen circular de la categoría */}
                    <div className={`w-16 h-16 rounded-full overflow-hidden mb-1 transition-all duration-300 border-2 ${
                      isSelected 
                        ? 'border-red-600 scale-110 shadow-lg shadow-red-600/50' 
                        : 'border-gray-600 group-hover:border-red-600 group-hover:scale-105'
                    }`}>
                      {imagenCategoria ? (
                        <Image
                          src={imagenCategoria}
                          alt={`Categoría ${categoria.nombre}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        // Fallback con icono si no hay imagen
                        <div className="w-full h-full bg-gradient-to-r from-gray-600 to-gray-800 flex items-center justify-center">
                          <span className="text-white text-lg font-bold">
                            {categoria?.nombre?.charAt(0)?.toUpperCase() || 'C'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Texto de la categoría - multilínea */}
                    <span className={`text-[10px] font-medium transition-colors duration-300 text-center leading-tight max-w-[80px] break-words ${
                      isSelected ? 'text-red-600' : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {categoria.nombre}
                    </span>
                    
                    {/* Contador de productos */}
                    <span className={`text-xs transition-colors duration-300 ${
                      isSelected ? 'text-red-400' : 'text-gray-400 group-hover:text-gray-300'
                    }`}>
                      ({categoria.conteo})
                    </span>
                  </button>
                );
              })}
                </>
              )}
              </div>
              
              {/* Flecha derecha */}
              {showRightArrow && (
                <button
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-red-700 text-black rounded-full p-2 shadow-lg transition-all duration-200 backdrop-blur-sm cursor-pointer"
                  aria-label="Scroll hacia la derecha"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </section>

          <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4  justify-items-center">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div 
                  key={index}
                  className="w-[150px] bg-gray-800 rounded-xl animate-pulse"
                >
                  <div className="w-full h-[140px] bg-gray-700 rounded-t-xl"></div>
                  <div className="px-3 py-2">
                    <div className="h-3 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="flex justify-between">
                      <div className="h-3 w-16 bg-gray-700 rounded"></div>
                      <div className="h-3 w-12 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : productosPaginados.length > 0 ? (
              productosPaginados.map((producto, index) => (
                <CardProducto key={`${producto.id}-${index}`} producto={producto} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="bg-gray-900 rounded-lg p-8 max-w-md mx-auto">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    No hay productos disponibles
                  </h3>
                  <p className="text-gray-400 mb-4">
                    No se encontraron productos en la categoría "{categoriaSeleccionada}"
                  </p>
                  <button
                    onClick={() => handleCategoriaClick('todas')}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
                  >
                    Ver todos los productos
                  </button>
                </div>
              </div>
            )}
          </section>
           {/* Controles de paginación */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 mb-6 gap-4">
            {/* Selector de productos por página */}
            <div className="flex items-center gap-2 text-white">
              <label htmlFor="productosPorPagina" className="text-sm font-medium">
                Mostrar:
              </label>
              <select
                id="productosPorPagina"
                value={productosPorPagina}
                onChange={(e) => setProductosPorPagina(parseInt(e.target.value))}
                className="bg-gray-800 border border-gray-600 text-white px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                {[5, 10, 15, 20, 25, 30].map((numero) => (
                  <option key={numero} value={numero}>
                    {numero}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-400">por página</span>
            </div>

            {/* Información de página actual */}
            <div className="text-sm text-gray-400">
              Mostrando {indicePrimerProducto + 1}-{Math.min(indiceUltimoProducto, productosFiltrados.length)} de {productosFiltrados.length} productos
            </div>
          </div>

          {/* Paginación solo si hay más de una página */}
          {totalPaginas > 1 && (
            <div className="flex justify-center mb-6">
              <nav className="flex items-center space-x-1" aria-label="Paginación">
                {/* Botón anterior */}
                <button
                  onClick={() => setPaginaActual(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-l-md hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página anterior"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Números de página */}
                {(() => {
                  const pages = [];
                  const maxVisible = 5;
                  let startPage = Math.max(1, paginaActual - Math.floor(maxVisible / 2));
                  let endPage = Math.min(totalPaginas, startPage + maxVisible - 1);
                  
                  // Ajustar el inicio si estamos cerca del final
                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }

                  // Primera página
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => setPaginaActual(1)}
                        className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="ellipsis1" className="px-3 py-2 text-sm text-gray-500">
                          ...
                        </span>
                      );
                    }
                  }

                  // Páginas visibles
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setPaginaActual(i)}
                        className={`px-3 py-2 text-sm font-medium border transition-colors ${
                          paginaActual === i
                            ? 'text-white bg-red-600 border-red-600'
                            : 'text-gray-300 bg-gray-800 border-gray-600 hover:bg-gray-700 hover:text-white'
                        }`}
                        aria-current={paginaActual === i ? 'page' : undefined}
                      >
                        {i}
                      </button>
                    );
                  }

                  // Última página
                  if (endPage < totalPaginas) {
                    if (endPage < totalPaginas - 1) {
                      pages.push(
                        <span key="ellipsis2" className="px-3 py-2 text-sm text-gray-500">
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPaginas}
                        onClick={() => setPaginaActual(totalPaginas)}
                        className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        {totalPaginas}
                      </button>
                    );
                  }

                  return pages;
                })()}

                {/* Botón siguiente */}
                <button
                  onClick={() => setPaginaActual(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-r-md hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página siguiente"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
          {/* FAQ Section para SEO */}
          <section className="mt-2">
            <details className="bg-gray-900 rounded-lg p-6 max-w-4xl mx-auto">
              <summary className="text-white text-lg font-semibold cursor-pointer hover:text-red-600 transition">
                Preguntas frecuentes sobre nuestros productos
              </summary>
              <div className="mt-4 space-y-4 text-gray-300">
                <div>
                  <h4 className="text-white font-medium mb-2">¿Los productos son profesionales?</h4>
                  <p>Sí, todos nuestros productos son de grado profesional y cumplen con los más altos estándares de calidad y seguridad.</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">¿Hacen envíos a toda Colombia?</h4>
                  <p>Por el momento no realizamos envios, podras recoger los productos en nuestra tienda fisica.</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">¿Ofrecen garantía?</h4>
                  <p>Todos nuestros productos cuentan con garantía del fabricante y nuestro respaldo como distribuidor autorizado.</p>
                </div>
              </div>
            </details>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
