import Image from 'next/image';
import { obtenerGaleriaCompleta } from '../api/galery/route';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export const metadata = {
  title: 'Galería de Tatuajes y Piercings',
  description: 'Explora nuestra galería de tatuajes y perforaciones realizados por artistas profesionales en Stranger Tattoo Chía. Diseños únicos, estilos variados y trabajos 100% personalizados.',
  keywords: 'galería tatuajes chía, fotos tattoos, diseños tatuajes, perforaciones chía, trabajos realizados, portfolio tatuajes',
  openGraph: {
    title: 'Galería de Tatuajes | Stranger Tattoo Chía',
    description: 'Descubre los mejores tatuajes y perforaciones realizados por nuestros artistas profesionales.',
    type: 'website',
    images: [
      {
        url: '/galeria-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Galería de tatuajes Stranger Tattoo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Galería de Tatuajes | Stranger Tattoo',
    description: 'Explora nuestra galería de tatuajes y perforaciones realizados por artistas profesionales.',
  },
};

export default async function GaleriaPage() {
  let imagenes = [];
  
  try {
    imagenes = await obtenerGaleriaCompleta();
  } catch (error) {
    console.error('Error cargando galería:', error);
    // Si hay error, mostraremos una página con mensaje de error
    return (
      <>
        <Navbar/>
        <div className='p-8 text-md md:text-xl text-center'>
          <h1 className='text-red-600 font-mistranger text-3xl text-center md:text-6xl text-glow-red'>nuestra <br/> galeria</h1>
          <br/>
          <p>Lo sentimos, no pudimos cargar la galería en este momento. Por favor intenta más tarde.</p>
        </div>
        <Footer/>
      </>
    );
  }

  return (
    <>
    <Navbar/>
    <div className='p-8 text-md md:text-xl'>
    <h1 className='text-red-600 font-mistranger text-3xl text-center md:text-6xl text-glow-red'>nuestra <br/> galeria</h1>
    <br/>
    <p>Explora nuestra galería y descubre los mejores tatuajes y perforaciones realizados por nuestros artistas profesionales. Diseños únicos, estilos variados y trabajos 100% personalizados en cada detalle.</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-8">
      {imagenes.length > 0 ? imagenes.map((url, idx) => (
        <Image
          key={idx}
          src={url}
          alt={`Tatuaje profesional realizado en Stranger Tattoo Chía - Diseño ${idx + 1}`}
          width={300}
          height={300}
          className="rounded shadow-md object-cover"
          loading="lazy"
          quality={85}
        />
      )) : (
        <div className="col-span-full text-center text-gray-500">
          <p>No hay imágenes disponibles en este momento.</p>
        </div>
      )}
    </div>
    <Footer/>
    </>
  );
}
