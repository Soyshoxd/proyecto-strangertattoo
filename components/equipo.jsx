// src/app/components/Equipo.jsx
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase-server';
import Image from 'next/image';
import Link from 'next/link';
import imgEstudio from '@/assets/estudio1.png'; // asegúrate de tener esta imagen

export default async function Equipo() {
  const snapshot = await getDocs(collection(db, 'tatuadores'));
  const todos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const tatuadores = todos.filter(t => t.tipo === 'tatuador');
  const perforadores = todos.filter(t => t.tipo === 'perforador');

  // Rellenar vacíos
  while (tatuadores.length < 3) tatuadores.push({ id: `empty-${tatuadores.length}`, isEmpty: true });
  while (perforadores.length < 2) perforadores.push({ id: `empty-${perforadores.length}`, isEmpty: true });

  return (
    <section className="container-equipo">
      <div className="flex items-center justify-center">
        <h2 className="text-red-600 font-mistranger text-3xl md:text-5xl text-glow-red">Nuestro Equipo</h2>
      </div>

      <div className="flex justify-center w-full mt-2 ">
        <div className="flex items-center justify-center gap-4 max-w-[1000px] w-full p-4 ">
          {/* Imagen del estudio */}
          <div className="h-auto w-43 sm:h-58 sm:w-40  md:h-80 md:w-60 overflow-hidden mx-auto sm:mx-0">
            <Image
              src={imgEstudio}
              alt="Interior del estudio Stranger Tattoo"
              width={65}
              height={65}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Contenido del equipo */}
          <div className="flex flex-col gap-3">
            {/* Tatuadores */}
            <div className="grid grid-cols-3 gap-3 justify-center sm:w-90 md:w-120">
              {tatuadores.map((artist) =>
                artist.isEmpty ? (
                  <div
                    key={artist.id}
                    className="aspect-square flex items-center justify-center bg-[#424242] text-white text-3xl md:text-6xl cursor-pointer hover:scale-105 transition"
                  >
                    ?
                  </div>
                ) : (
                  <Link
                    href={`/${artist.slug}`}
                    key={artist.id}
                    className="aspect-square overflow-hidden cursor-pointer hover:scale-105 transition"
                  >
                    <Image
                      src={artist.img}
                      alt={`Tatuador: ${artist.nombre}`}
                      width={75}
                      height={75}
                      className="object-cover w-full h-full"
                    />
                  </Link>
                )
              )}
            </div>

            {/* Galería + Perforadores */}
            <div className="grid grid-cols-3 sm:w-90 md:w-120 gap-3 justify-center">
              <Link
                href="/galeria"
                className="aspect-square bg-red-700 text-white md:text-4xl flex items-center justify-center text-xs text-center cursor-pointer hover:scale-105 transition"
              >
                Nuestra Galería
              </Link>

              {perforadores.map((artist) =>
                artist.isEmpty ? (
                  <div
                    key={artist.id}
                    className="aspect-square flex items-center justify-center bg-[#424242] text-white text-3xl md:text-6xl cursor-pointer hover:scale-105 transition"
                  >
                    ?
                  </div>
                ) : (
                  <Link
                    href={`/${artist.slug}`}
                    key={artist.id}
                    className="aspect-square overflow-hidden cursor-pointer hover:scale-105 transition"
                  >
                    <Image
                      src={artist.img}
                      alt={`Perforador: ${artist.nombre}`}
                      width={75}
                      height={75}
                      className="object-cover w-full h-full"
                    />
                  </Link>
                )
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
