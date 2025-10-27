// app/detailproducts/[slug]/page.jsx
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/product-detail-client';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { db } from '@/lib/firebase-server';
import { getTimestamp } from '@/lib/cache-timestamps';

// Cache en memoria para productos individuales
const productCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

function getCacheKey(slug) {
  return `product_${slug}`;
}

function isCacheValid(timestamp) {
  return Date.now() - timestamp < CACHE_TTL;
}

function isCacheInvalidated(cacheTimestamp) {
  const productosInvalidation = getTimestamp('productos');
  const allInvalidation = getTimestamp('all');
  const lastInvalidation = Math.max(productosInvalidation, allInvalidation);
  return lastInvalidation > cacheTimestamp;
}

// Función optimizada para obtener un producto directamente por slug o id
async function getProductBySlug(slug) {
  try {
    // Verificar caché primero
    const cacheKey = getCacheKey(slug);
    const cached = productCache.get(cacheKey);
    
    // Verificar si el caché es válido y no ha sido invalidado
    if (cached && isCacheValid(cached.timestamp) && !isCacheInvalidated(cached.timestamp)) {
      console.log(`📦 Producto "${slug}" desde caché`);
      return cached.data;
    }
    
    // Si el caché fue invalidado, eliminarlo
    if (cached && isCacheInvalidated(cached.timestamp)) {
      console.log(`🔄 Caché de "${slug}" invalidado, recargando...`);
      productCache.delete(cacheKey);
    }
    
    console.log(`🔍 Buscando producto "${slug}" en DB...`);
    
    // Primero intentar buscar por slug usando una query
    const querySnapshot = await db.collection('productos')
      .where('slug', '==', slug)
      .limit(1)
      .get();
    
    let producto = null;
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      producto = { id: doc.id, ...doc.data() };
    } else {
      // Si no se encuentra por slug, intentar buscar directamente por ID
      const docSnapshot = await db.collection('productos').doc(slug).get();
      
      if (docSnapshot.exists) {
        producto = { id: docSnapshot.id, ...docSnapshot.data() };
      }
    }
    
    // Guardar en caché si se encontró
    if (producto) {
      productCache.set(cacheKey, {
        data: producto,
        timestamp: Date.now()
      });
      console.log(`✅ Producto "${slug}" guardado en caché`);
    }
    
    return producto;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Renderizado dinámico con revalidación cada 24 horas
export const dynamic = 'force-dynamic';
export const revalidate = 86400; // 24 horas

// Generar metadata dinámico para SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  const producto = await getProductBySlug(slug);
  
  if (!producto) {
    return {
      title: 'Producto no encontrado | Stranger Tattoo',
      description: 'El producto que buscas no se encuentra disponible.'
    };
  }
    
    // Generar keywords específicas según la categoría
    const generateCategoryKeywords = (categoria, nombre) => {
      const baseKeywords = `${nombre}, stranger tattoo chía, ${categoria}`;
      
      switch (categoria?.toLowerCase()) {
        case 'vapes':
        case 'vapeo':
          return `${baseKeywords}, vapes colombia, vaporizadores, e-cigarettes, vaper, vapeo colombia, cigarrillos electronicos, vape pen, mod vape, e-liquidos`;
        case 'tatuajes':
        case 'tattoo':
          return `${baseKeywords}, agujas tatuaje, tintas tattoo, máquinas tatuar, productos tatuaje profesional, materiales tattoo`;
        case 'perforaciones':
        case 'piercing':
          return `${baseKeywords}, joyería corporal, piercings, agujas perforación, titanio piercing, acero quirúrgico`;
        case 'joyería':
        case 'joyeria':
          return `${baseKeywords}, joyería corporal, accesorios piercing, anillos corporales, plugs, dilatadores`;
        default:
          return `${baseKeywords}, productos profesionales, calidad premium`;
      }
    };
    
    const generateCategoryDescription = (categoria, nombre, descripcion) => {
      const baseDesc = descripcion || `Compra ${nombre} en Stranger Tattoo Chía`;
      
      switch (categoria?.toLowerCase()) {
        case 'vapes':
        case 'vapeo':
          return `${baseDesc}. Vapes de alta calidad, vaporizadores premium y accesorios de vapeo. Envíos a toda Colombia. Los mejores precios en vapes.`;
        case 'tatuajes':
        case 'tattoo':
          return `${baseDesc}. Productos profesionales para tatuajes. Calidad garantizada para artistas profesionales. Envíos seguros a Colombia.`;
        case 'perforaciones':
        case 'piercing':
          return `${baseDesc}. Joyería corporal y productos para perforaciones profesionales. Materiales hipoalergénicos de calidad superior.`;
        default:
          return `${baseDesc}. Productos de alta calidad para profesionales. Envíos a toda Colombia.`;
      }
    };
    
    return {
      title: `${producto.nombre} - ${producto.categoriaSeleccionada} | Stranger Tattoo Chía`,
      description: generateCategoryDescription(producto.categoriaSeleccionada, producto.nombre, producto.descripcion || producto.biografía),
      keywords: generateCategoryKeywords(producto.categoriaSeleccionada, producto.nombre),
      openGraph: {
        title: `${producto.nombre} | Stranger Tattoo`,
        description: producto.descripcion || producto.biografía || `Compra ${producto.nombre} en Stranger Tattoo`,
        images: [{
          url: producto.img,
          width: 800,
          height: 600,
          alt: producto.nombre,
        }],
        type: 'website',
        locale: 'es_CO',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${producto.nombre} | Stranger Tattoo`,
        description: producto.descripcion || producto.biografía,
        images: [producto.img],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
}

export default async function ProductoPage({ params }) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const producto = await getProductBySlug(slug);
  
  if (!producto) {
    console.error('Error fetching product: null');
    notFound();
  }

  try {

    return (
      <>
        <Navbar />
        
        {/* Schema.org structured data para SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": producto.nombre,
              "description": producto.descripcion || producto.biografía || `${producto.nombre} - Producto de calidad profesional`,
              "image": [
                producto.img,
                ...(producto.imagenes || []).slice(0, 3) // Hasta 3 imágenes adicionales
              ],
              "brand": {
                "@type": "Brand",
                "name": "Stranger Tattoo",
                "url": "https://stranger-tattoo.com"
              },
              "manufacturer": {
                "@type": "Organization",
                "name": "Stranger Tattoo",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Chía",
                  "addressRegion": "Cundinamarca",
                  "addressCountry": "CO"
                }
              },
              "offers": {
                "@type": "Offer",
                "price": producto.precio,
                "priceCurrency": "COP",
                "availability": "https://schema.org/InStock",
                "itemCondition": "https://schema.org/NewCondition",
                "url": `https://stranger-tattoo.com/detailproducts/${slug}`,
                "seller": {
                  "@type": "Organization",
                  "name": "Stranger Tattoo",
                  "url": "https://stranger-tattoo.com"
                },
                "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 año desde hoy
                "shippingDetails": {
                  "@type": "OfferShippingDetails",
                  "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": "CO"
                  }
                }
              },
              "category": producto.categoriaSeleccionada,
              "sku": producto.id,
              "gtin": producto.codigoBarras || undefined,
              "mpn": producto.modelNumber || producto.id,
              "weight": producto.peso ? {
                "@type": "QuantitativeValue",
                "value": producto.peso,
                "unitCode": "GRM"
              } : undefined,
              "aggregateRating": producto.rating ? {
                "@type": "AggregateRating",
                "ratingValue": producto.rating,
                "reviewCount": producto.numeroResenas || 1,
                "bestRating": 5,
                "worstRating": 1
              } : undefined,
              "additionalProperty": [
                ...(producto.caracteristicas || []).map(caracteristica => ({
                  "@type": "PropertyValue",
                  "name": caracteristica.nombre || "Característica",
                  "value": caracteristica.valor || caracteristica
                })),
                {
                  "@type": "PropertyValue",
                  "name": "Categoría",
                  "value": producto.categoriaSeleccionada
                }
              ].filter(Boolean)
            })
          }}
        />
        
        <ProductDetailClient producto={producto} mostrarBotonReseña={true}/>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }
}
