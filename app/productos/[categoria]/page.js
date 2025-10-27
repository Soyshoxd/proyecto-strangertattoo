// app/productos/[categoria]/page.jsx
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase-server';
import ProductosPage from '@/components/productos-lista';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Generar metadata dinámico basado en la categoría
export async function generateMetadata({ params }) {
  const { categoria } = await params;
  
  // Mapeo de categorías para SEO
  const categoriaInfo = {
    'tatuajes': {
      title: 'Productos para Tatuajes Profesionales',
      description: 'Agujas, tintas, máquinas y todo lo necesario para tatuajes profesionales',
    },
    'perforaciones': {
      title: 'Productos para Perforaciones y Piercings',
      description: 'Joyería corporal, agujas y herramientas para perforaciones profesionales',
    },
    'vapes': {
      title: 'Vapes y E-cigarettes',
      description: 'Amplia selección de vapes, e-liquids y accesorios de vapeo',
    },
    'joyeria': {
      title: 'Joyería Corporal y Accesorios',
      description: 'Joyería especializada para piercings y modificaciones corporales',
    },
  };

  const info = categoriaInfo[categoria.toLowerCase()] || {
    title: `Productos ${categoria}`,
    description: `Productos profesionales en la categoría ${categoria}`
  };

  return {
    title: `${info.title} | Stranger Tattoo`,
    description: `${info.description}. Calidad garantizada y envíos a toda Colombia.`,
    keywords: `${categoria}, productos ${categoria}, stranger tattoo, ${categoria} profesional`,
    openGraph: {
      title: `${info.title} | Stranger Tattoo`,
      description: info.description,
      type: 'website',
      locale: 'es_CO',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${info.title} | Stranger Tattoo`,
      description: info.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

async function getCategorias() {
  const snapshot = await getDocs(collection(db, 'categorias'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getProductos() {
  const snapshot = await getDocs(collection(db, 'productos'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Generar rutas estáticas para las categorías principales
export async function generateStaticParams() {
  const snapshot = await getDocs(collection(db, 'categorias'));
  const categorias = snapshot.docs.map(doc => doc.data());
  
  return categorias.map((categoria) => ({
    categoria: categoria.nombre.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export default async function CategoriaPage({ params }) {
  const { categoria } = await params;
  
  const [categorias, productos] = await Promise.all([
    getCategorias(),
    getProductos()
  ]);

  // Convertir el parámetro de URL de vuelta al nombre de categoría
  const nombreCategoria = categoria.replace(/-/g, ' ');
  
  // Verificar si la categoría existe
  const categoriaExiste = categorias.find(
    cat => cat.nombre.toLowerCase() === nombreCategoria.toLowerCase()
  );

  if (!categoriaExiste) {
    notFound();
  }

  // Filtrar productos por categoría
  const productosCategoria = productos.filter(
    producto => producto.categoriaSeleccionada?.toLowerCase() === nombreCategoria.toLowerCase()
  );

  // Props especiales para la página de categoría
  const propsCategoria = {
    categorias,
    productosIniciales: productos,
    categoriaPreseleccionada: categoriaExiste.nombre,
    esPaginaCategoria: true,
    nombreCategoria: categoriaExiste.nombre,
    productosEnCategoria: productosCategoria.length,
  };

  return <ProductosPage {...propsCategoria} />;
}
