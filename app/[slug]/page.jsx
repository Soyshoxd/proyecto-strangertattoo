import GaleriaGrid from '@/components/galeriatatu';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase-server';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;

  const q = query(collection(db, "tatuadores"), where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) {
    return { title: 'Tatuador no encontrado | Stranger Tattoo' };
  }
  const artist = snap.docs[0].data();

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

  const q = query(collection(db, "tatuadores"), where("slug", "==", slug));
  const snap = await getDocs(q);

  let artist = null;

  if (!snap.empty) {
    artist = snap.docs[0].data();
  } else {
    const q2 = query(collection(db, "perforadores"), where("slug", "==", slug));
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
      artist = snap2.docs[0].data();
    }
  }

  if (!artist) {
    return <div>Artista no encontrado</div>;
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

export default ArtitsDetailPage;
