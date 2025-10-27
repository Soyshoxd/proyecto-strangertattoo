import GaleriaGrid from '@/components/galeriatatu';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Image from 'next/image';
import { notFound } from 'next/navigation';

async function getArtistBySlug(slug) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/tatuadores`, {
      next: { revalidate: 300 }
    });
    
    if (!res.ok) return null;
    const artists = await res.json();
    return artists.find(artist => artist.slug === slug) || null;
  } catch (error) {
    console.error('Error fetching artist:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;

  const artist = await getArtistBySlug(slug);
  if (!artist) {
    return { title: 'Tatuador no encontrado | Stranger Tattoo' };
  }

  return {
    title: `${artist.nombre} | Stranger Tattoo`,
    description: artist.bio || `Conoce a ${artist.nombre}, artista en Stranger Tattoo`,
    openGraph: {
      title: `${artist.nombre} | Stranger Tattoo`,
      images: [artist.banner],
    },
  };
}

const ArtitsDetailPage = async ({ params }) => {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;

  const artist = await getArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <div className="text-white flex flex-col bg-black">
        <div>
        <Image
          src={artist.banner}
          alt={artist.nombre}
          width={1280}
          height={100}
          className="object-cover max-h-[180px] sm:max-h-[280px] md:max-h-[300px] lg:max-h-[400px]"
        />
        </div>
        <div className='p-6'>
        <p className=" text-md md:text-xl mt-2">{artist.bio}</p>
        </div>

        <div className="max-w-[800px] mx-auto w-full px-4">
          <div className="flex justify-end my-2">
            <a
              href="https://www.instagram.com/strangertattoochia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold rounded shadow text-[12px] md:text-md px-6 py-1"
            >
              Ver más
            </a>
          </div>

          <GaleriaGrid imagenes={artist.galeria || []} intervalo={2500} />

          <div className="flex justify-end my-6">
            <a
              href="https://wa.me/573046724589?text=Hola,%20quiero%20agendar%20una%20cita%20para%20un%20tatuaje"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold rounded shadow text-[18px] w-full py-1 text-center"
            >
              Agenda tu cita
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ArtitsDetailPage;
