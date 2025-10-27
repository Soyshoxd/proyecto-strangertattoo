// app/detailproducts/[slug]/page.js
import { db } from "@/lib/firebase-server";
import { collection, query, where, getDocs } from "firebase/firestore";
import Image from "next/image";

export async function generateStaticParams() {
  try {
    const snap = await getDocs(collection(db, "productos"));

    const paths = snap.docs
      .map((doc) => {
        const data = doc.data();
        if (!data.slug) return null;
        return { slug: data.slug };
      })
      .filter(Boolean);

    console.log('Generated paths:', paths); // Para debugging
    return paths;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function ProductoPage({ params }) {
  // En Next.js 15, params puede ser una promesa
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;

  if (!slug) {
    return <div>Error: slug no recibido</div>;
  }

  const q = query(collection(db, "productos"), where("slug", "==", slug));
  const snap = await getDocs(q);

  if (snap.empty) {
    return <div>Producto no encontrado</div>;
  }

  const producto = snap.docs[0].data();

  return (
    <div class="w-full shadow-lg bg-black">
  <div class="w-full h-60 bg-gray-100 overflow-hidden flex items-center justify-center">
    <Image src={producto.img} alt={producto.nombre} width={500} height={500} class="object-cover w-full h-full" />
  </div>

  <div class="mt-4 p-4">
    <h1 class="text-xl font-semibold text-white">{producto.nombre}</h1>

    <div class="flex items-center mt-1 text-yellow-400">
      <span class="flex">
        ★★★★☆
      </span>
      <span class="ml-2 text-sm text-gray-500">(120 opiniones)</span>
    </div>

    <p class="text-2xl font-bold text-red-600 mt-2">${producto.precio}</p>

    <p class="text-sm text-gray-400 mt-2">{producto.biografía}</p>

    <button class="w-full bg-red-600 text-white py-2 rounded-xl mt-4 hover:bg-white hover:text-red-600 cursor-pointer transition">
      Agregar al carrito
    </button>
  </div>

  <div class="mt-6 border-t p-4">
    <h2 class="text-lg font-semibold text-gray-800 mb-2">Reseñas de clientes</h2>
    
    <div class="text-sm text-gray-500 italic">
      No hay reseñas aún. Sé el primero en opinar.
    </div>
    <div class="mt-2 space-y-3">
      <div class="bg-gray-50 p-3 rounded-lg shadow-sm">
        <p class="text-sm text-gray-800">"Excelente producto, llegó rápido y funciona perfecto."</p>
        <div class="flex justify-between items-center mt-1 text-xs text-gray-500">
          <span>Juan P.</span>
          <span>★★★★★</span>
        </div>
      </div>
    </div>
  </div>
</div>

  );
}
