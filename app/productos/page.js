// app/productos/page.jsx
import ProductosPage from '@/components/productos-lista';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Todo en un solo lugar: Vapes, Moda y Estilo de Vida | Stranger Tattoo',
  description: 'Tienda online de vapes, joyas, bolsos, grinders y artículos para fumar. Productos modernos y exclusivos para quienes buscan estilo, calidad y personalidad en cada detalle.',
  keywords: 'grinders, perforaciones, vapes, joyería corporal, stranger tattoo',
  openGraph: {
    title: 'Productos De Calidad | Stranger Tattoo',
    description: 'Productos de la más alta calidad',
    type: 'website',
    locale: 'es_CO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Productos Profesionales | Stranger Tattoo',
    description: 'Productos de la más alta calidad',
  },
  robots: {
    index: true,
    follow: true,
  },
};

async function getCategorias() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/categorias`, {
      next: { revalidate: 300, tags: ['categorias'] },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function getProductos() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/productos`, {
      next: { revalidate: 300, tags: ['productos'] },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function Page() {
  const [categorias, productos] = await Promise.all([
    getCategorias(),
    getProductos()
  ]);

  return <ProductosPage categorias={categorias} productosIniciales={productos} />;
}
