import { db } from '@/lib/firebase-server';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stranger-tattoo.com';

  // URLs estáticas
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/galeria`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/reviewForm`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // URLs dinámicas de productos
  let productUrls = [];
  try {
    const snap = await db.collection('productos').get();
    productUrls = snap.docs
      .filter(doc => doc.data().slug) // Solo productos con slug
      .map((doc) => {
        const product = doc.data();
        return {
          url: `${baseUrl}/detailproducts/${product.slug}`,
          lastModified: product.updatedAt?.toDate() || new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        };
      });
  } catch (error) {
    console.error('Error generating product URLs for sitemap:', error);
    // En caso de error, continuamos con array vacío
    productUrls = [];
  }

  // URLs dinámicas de categorías
  let categoryUrls = [];
  try {
    const snap = await db.collection('categorias').get();
    categoryUrls = snap.docs.map((doc) => {
      const category = doc.data();
      const categorySlug = category.nombre ? category.nombre.toLowerCase().replace(/\s+/g, '-') : doc.id;
      return {
        url: `${baseUrl}/productos/${categorySlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      };
    });
  } catch (error) {
    console.error('Error generating category URLs for sitemap:', error);
    // En caso de error, continuamos con array vacío
    categoryUrls = [];
  }

  return [...staticUrls, ...productUrls, ...categoryUrls];
}
