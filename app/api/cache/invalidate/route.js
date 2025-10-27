// app/api/cache/invalidate/route.js
import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { cacheTimestamps, updateTimestamp } from '@/lib/cache-timestamps';

/**
 * POST /api/cache/invalidate
 * El admin externo llama esto para señalizar cambios
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, secret } = body;

    // Seguridad básica
    if (!secret || secret !== process.env.CACHE_INVALIDATION_SECRET) {
      return NextResponse.json({ error: 'No autorizado' }, { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    const validTypes = ['productos', 'artists', 'galeria', 'all'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Actualizar timestamp en memoria usando el módulo compartido
    const timestamp = updateTimestamp(type);

    // Revalidar páginas de Next.js según el tipo
    try {
      if (type === 'productos' || type === 'all') {
        revalidatePath('/productos');
        revalidatePath('/');
        revalidatePath('/detailproducts/[slug]', 'page');
        revalidateTag('productos');
        console.log('🔄 Páginas de productos revalidadas');
      }
      
      if (type === 'artists' || type === 'all') {
        revalidatePath('/equipo');
        revalidateTag('tatuadores');
        console.log('🔄 Páginas de tatuadores revalidadas');
      }
      
      if (type === 'galeria' || type === 'all') {
        revalidatePath('/galeria');
        revalidateTag('galeria');
        console.log('🔄 Páginas de galería revalidadas');
      }
    } catch (revalidateError) {
      console.error('⚠️ Error en revalidación:', revalidateError);
      // No fallar si la revalidación falla
    }

    console.log(`✅ Cache invalidado: ${type} - ${new Date(timestamp).toISOString()}`);

    return NextResponse.json({
      success: true,
      type,
      timestamp
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}

/**
 * GET /api/cache/invalidate
 * La tienda llama esto SOLO al cargar para verificar versión
 */
export async function GET() {
  return NextResponse.json(cacheTimestamps, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

/**
 * OPTIONS /api/cache/invalidate
 * Maneja preflight requests de CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

