// app/page.jsx

import Navbar from "@/components/navbar";
import Image from "next/image";
import ImgSlider from '@/assets/imgPrinciapl.webp';
import papel from '@/assets/Papel2.png';
import Link from "next/link";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/btn-whatsapp";
import { Suspense } from "react";
import { TeamSkeleton, ProductSliderSkeleton, ReviewsSkeleton } from "@/components/loading";

// Lazy load components
import dynamic from 'next/dynamic';

const Equipo = dynamic(() => import("@/components/equipo"), {
  loading: () => <TeamSkeleton />
});

const SliderProductos = dynamic(() => import("@/components/sliderproductos"), {
  loading: () => <ProductSliderSkeleton />
});

const Estadisticas = dynamic(() => import("@/components/estadisticas"));

const ReviewSlider = dynamic(() => import("@/components/Slider-review"), {
  loading: () => <ReviewsSkeleton />
});

export const metadata = {
  title: 'Inicio',
  description: 'Stranger Tattoo en Chía - Estudio especializado en tatuajes, piercings, vapes y joyería corporal. Artistas profesionales, productos de calidad y atención personalizada. ¡Visita nuestro estudio!',
  keywords: 'stranger tattoo chía, estudio tatuajes chía, tatuajes profesionales, piercings chía, artistas tatuadores, colombia',
  openGraph: {
    title: 'Stranger Tattoo Chía - Arte en tu piel, historias para toda la vida',
    description: 'Estudio especializado en tatuajes y piercings en Chía. Artistas profesionales, productos de calidad.',
    images: [
      {
        url: '/home-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Stranger Tattoo - Estudio en Chía',
      },
    ],
  },
};

// Configurar ISR (revalidar cada 5 minutos)
export const revalidate = 300;

export default async function Home() {
  // Obtener la URL base, usando una URL por defecto si no está definida
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // 🔥 Obtener productos desde API con ISR
  let productos = [];
  try {
    const res = await fetch(`${baseUrl}/api/productos`, {
      next: { revalidate: 300 } // ISR para productos
    });
    
    if (res.ok) {
      productos = await res.json();
    }
  } catch (error) {
    console.warn('Error al obtener productos:', error.message);
  }
  
  let reviews = [];
  
  try {
    const res = await fetch(`${baseUrl}/api/reviews`, {
      next: { revalidate: 300 } // ISR para reviews también
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data && data.reviews) {
        reviews = data.reviews;
      }
    }
  } catch (error) {
    console.warn('Error al obtener reseñas:', error.message);
    // En caso de error, continúa con un array vacío de reseñas
  }


  return (
    <>
      <Navbar />
      <WhatsAppButton/>
      <main className="bg-black font-monserrat">
        <section className="w-full">
          <Image 
            src={ImgSlider} 
            alt="Slider principal de Stranger Tattoo" 
            className="w-full md:max-h-[400px]" 
            priority={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            quality={80}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </section>

        <header className="flex justify-center px-4 sm:px-6 mt-6">
          <h1 className="text-white text-md sm:text-3xl font-semibold text-center">
            Arte en tu piel, historias para toda la vida.
          </h1>
        </header>

        <section className="relative w-full mt-6" itemScope itemType="https://schema.org/LocalBusiness">
          <div className="w-full">
          <Image 
            src={papel} 
            alt="Papel decorativo"  
            className="w-full md:max-h-[400px] sm:max-h-[200px]" 
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 100vw"
            quality={70}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
          </div>
          <div className="absolute inset-0 flex flex-col justify-center items-center px-4 sm:px-8 text-center text-black">
            <div className="max-w-[700px]">
              <h2 className="text-[17px] md:text-2xl font-bold font-monserrat mb-1" itemProp="name">
                Bienvenidos a Stranger Tattoo
              </h2>
              <p className="text-[12px] md:text-xl font-monserrat font-extralight leading-snug" itemProp="description">
                Creemos que cada tatuaje es más que tinta en la piel: es una historia, un recuerdo
                y una expresión única de identidad. Nuestro estudio fue fundado con la misión de
                ofrecer un espacio donde la creatividad, la pasión y la técnica se fusionen para
                crear obras de arte personalizadas que perduren para siempre.
              </p>
              <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress" style={{display: 'none'}}>
                <span itemProp="addressLocality">Chía</span>,
                <span itemProp="addressRegion">Cundinamarca</span>,
                <span itemProp="addressCountry">Colombia</span>
              </span>
            </div>
          </div>
        </section>
        
        <Equipo />
        <Estadisticas/>
        <section className='flex items-center justify-center mt-6 flex-col'>
          <h2 className='text-red-600 font-mistranger text-3xl md:text-5xl text-glow-red text-center'>Nuestros Productos</h2>
          <div className='text-white w-full flex justify-end pr-4'>
            <Link href="/productos" className='bg-red-600 hover:bg-red-700 text-white font-semibold rounded shadow transition duration-200 text-[12px] p-1 w-[20%] text-center'>
              Ver todos
            </Link>
          </div>
          <SliderProductos productos={productos} />
        </section>
        <section className='flex items-center justify-center mt-6 flex-col'>
          <h2 className='text-red-600 font-mistranger text-center text-2xl md:text-5xl text-glow-red'>Que dicen <br/>Nuestros Clientes</h2>
          <div className='text-white w-full flex justify-end pr-6 mt-4'>
            <Link href="/reviewForm" className='bg-red-600 hover:bg-red-700 text-white font-semibold rounded shadow transition duration-200 text-[12px] p-2 w-35 text-center'>
              Añadir una reseña
            </Link>
          </div>
          <ReviewSlider reviews={reviews}/>
        </section>
        <section className='flex items-center justify-around mt-6 flex-row p-2'>
          <div className="w-full md:w-[60%] h-40 p-2">
            <iframe
              title="Ubicación Stranger Tattoo"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7950.9094694457635!2d-74.0581534!3d4.8632084!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f87d3662e16c9%3A0x9b2d90cceec2876a!2sStranger%20tattoo%20chia!5e0!3m2!1ses-419!2sco!4v1751844181210!5m2!1ses-419!2sco"
              width="100%"
              height="100%"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg shadow"
            />
          </div>

          <div className='w-full md:w-[40%] text-white font-monserrat font-light gap-2 flex flex-col p-2'>
            <p className='text-xs md:text-base'>
              Te esperamos en nuestro estudio, donde te ofrecemos lo mejor en tatuajes, perforaciones, vapes y joyería especializada.
            </p>
            <Link
              href="https://maps.app.goo.gl/YbPPb3oL4NGimggm7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold rounded shadow transition duration-200 text-[9px] md:text-base p-1 w-full text-center"
            >
              Ver en Google Maps
            </Link>
          </div>
        </section>
      </main>
      <Footer/>
    </>
  );
}
