"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import CardProducto from "./cardproduct";

export default function SliderProductos({ productos }) {
  const scrollRef = useRef(null);
  const [pagina, setPagina] = useState(0);
  const [cardsPorVista, setCardsPorVista] = useState(1);
  
  const filteredProducts = productos.filter(p => p.mostrarEnSlider);

  const calcularCards = useCallback(() => {
    const ancho = window.innerWidth;
    if (ancho >= 1280) setCardsPorVista(4);
    else if (ancho >= 768) setCardsPorVista(3);
    else setCardsPorVista(2.2);
  }, []);

  useEffect(() => {
    calcularCards();
    
    // Debounce para el resize
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calcularCards, 150);
    };
    
    window.addEventListener("resize", debouncedResize, { passive: true });
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [calcularCards]);

  const scroll = (dir) => {
    const container = scrollRef.current;
    const scrollWidth = container.offsetWidth;
    const cardWidth = container.scrollWidth / filteredProducts.length;
    const scrollStep = cardWidth * Math.floor(cardsPorVista);

    const maxPage = Math.ceil(filteredProducts.length / Math.floor(cardsPorVista)) - 1;
    const newPage = dir === "left" ? pagina - 1 : pagina + 1;
    if (newPage < 0 || newPage > maxPage) return;

    setPagina(newPage);
    container.scrollBy({ left: dir === "left" ? -scrollStep : scrollStep, behavior: "smooth" });
  };

  const totalPaginas = Math.ceil(filteredProducts.length / Math.floor(cardsPorVista));


  return (
    <div className="mt-1 w-full px-4">
  <div className="overflow-hidden py-6 bg-black rounded-lg relative w-full">

        {/* Flechas */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-red-600 text-white shadow p-2 rounded-full cursor-pointer"
        >
          <MdKeyboardArrowLeft size={24} />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-red-600 text-white shadow p-2 rounded-full cursor-pointer"
        >
          <MdKeyboardArrowRight size={24} />
        </button>

        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex gap-2 snap-x snap-mandatory overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollBehavior: 'smooth', willChange: 'scroll-position' }}
        >
          {filteredProducts.map((p, index) => (
            <CardProducto key={`${p.id}-${index}`} producto={p} />
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalPaginas }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === pagina ? "bg-red-600 scale-110" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
