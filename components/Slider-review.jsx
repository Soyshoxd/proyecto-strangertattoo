'use client';


import { useEffect, useRef, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import ReviewCard from "./card-review";

export default function ReviewSlider({ reviews = [] }) {
  const scrollRef = useRef(null);
  const [pagina, setPagina] = useState(0);
  const [cardsPorVista, setCardsPorVista] = useState(1);

  useEffect(() => {
    const calcularCards = () => {
      const ancho = window.innerWidth;
      if (ancho >= 1280) setCardsPorVista(4);       // PC
      else if (ancho >= 768) setCardsPorVista(3);    // Tablet
      else setCardsPorVista(2.2);                    // Móvil
    };
    calcularCards();
    window.addEventListener("resize", calcularCards);
    return () => window.removeEventListener("resize", calcularCards);
  }, []);

  const scroll = (dir) => {
    if (!scrollRef.current || !filteredReviews.length) return;
    
    const container = scrollRef.current;
    const scrollWidth = container.offsetWidth;
    const cardWidth = filteredReviews.length > 0 ? container.scrollWidth / filteredReviews.length : 0;
    const scrollStep = cardWidth * Math.floor(cardsPorVista);

    const maxPage = Math.ceil(filteredReviews.length / Math.floor(cardsPorVista)) - 1;
    const newPage = dir === "left" ? pagina - 1 : pagina + 1;
    if (newPage < 0 || newPage > maxPage) return;

    setPagina(newPage);
    container.scrollBy({ left: dir === "left" ? -scrollStep : scrollStep, behavior: "smooth" });
  };

  // 🔴 Filtrar solo las reseñas que se deben mostrar en el slider
  const filteredReviews = reviews?.filter(r => r?.mostrarEnSlider) || [];

  const totalPaginas = Math.max(1, Math.ceil(filteredReviews.length / Math.floor(cardsPorVista)));

  return (
    <section className="mt-2 w-full">
      <div className="mt-1 w-full px-4">
        <div className="overflow-hidden bg-black rounded-lg relative w-full">

          {/* Flechas */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black text-white shadow p-2 rounded-full cursor-pointer"
          >
            <MdKeyboardArrowLeft size={24} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black text-white shadow p-2 rounded-full cursor-pointer"
          >
            <MdKeyboardArrowRight size={24} />
          </button>

          {/* Cards */}
          <div
            ref={scrollRef}
            className="flex items-center gap-4 snap-x snap-mandatory overflow-x-auto scrollbar-hide scroll-smooth"
          >
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
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
    </section>
  );
}
