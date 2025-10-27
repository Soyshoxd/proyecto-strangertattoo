// app/tatuador/[id]/page.jsx
import GaleriaGrid from '@/components/galeriatatu';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getArtistById } from '@/lib/getArtits';

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const artist = await getArtistById(resolvedParams.id); 
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

const TattooDetailPage = async ({ params }) => {
  const resolvedParams = await Promise.resolve(params);
  const artist = await getArtistById(resolvedParams.id);

  if (!artist) notFound();

  return (
    <>
      <Navbar />
      <div className="text-white flex flex-col bg-black">
        <Image
          src={artist.banner}
          alt={artist.nombre}
          width={1280}
          height={300}
          className="w-full object-cover"
        />

        <p className="p-3 text-sm mt-2">{artist.bio}</p>

        <div className="max-w-[800px] mx-auto w-full px-4">
          <div className="flex justify-end my-2">
            <a
              href="https://www.instagram.com/strangertattoochia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold rounded shadow text-[12px] px-6 py-1"
            >
              Ver más
            </a>
          </div>

          <GaleriaGrid imagenes={artist.galeria || []} intervalo={5000} />

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

export default TattooDetailPage;
