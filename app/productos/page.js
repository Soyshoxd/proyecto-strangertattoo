// app/productos/page.jsx
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase-server';
import ProductosPage from '@/components/productos-lista';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Productos Profesionales de Tatuajes y Perforaciones | Stranger Tattoo',
  description: 'Descubre nuestra amplia selección de productos profesionales para tatuajes, perforaciones, vapes y joyería corporal. Calidad garantizada y envíos a toda Colombia.',
  keywords: 'productos tatuajes, materiales tattoo, agujas tatuaje, tintas tattoo, perforaciones, vapes, joyería corporal, stranger tattoo',
  openGraph: {
    title: 'Productos Profesionales | Stranger Tattoo',
    description: 'Productos de la más alta calidad para profesionales del tatuaje y piercing',
    type: 'website',
    locale: 'es_CO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Productos Profesionales | Stranger Tattoo',
    description: 'Productos de la más alta calidad para profesionales del tatuaje y piercing',
  },
  robots: {
    index: true,
    follow: true,
  },
};

async function getCategorias() {
  const snapshot = await getDocs(collection(db, 'categorias'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getProductos() {
  const snapshot = await getDocs(collection(db, 'productos'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export default async function Page() {
  const [categorias, productos] = await Promise.all([
    getCategorias(),
    getProductos()
  ]);

  return <ProductosPage categorias={categorias} productosIniciales={productos} />;
}
