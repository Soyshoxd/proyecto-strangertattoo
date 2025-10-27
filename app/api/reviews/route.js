import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-server';
import { collection, addDoc, getDocs, doc, getDoc, query, orderBy, updateDoc } from 'firebase/firestore';

// GET - Obtener todas las reseñas
export async function GET() {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, orderBy('fechaCreacion', 'desc'));
    const snapshot = await getDocs(q);
    
    const reviews = [];
    for (const docSnapshot of snapshot.docs) {
      const reviewData = docSnapshot.data();
      let userData = null;
      
      // Si tiene uid, obtener datos del usuario
      if (reviewData.uid) {
        const userRef = doc(db, 'users', reviewData.uid);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          userData = userSnapshot.data();
        }
      }
      
      reviews.push({
        id: docSnapshot.id,
        ...reviewData,
        usuario: userData
      });
    }
    
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error obteniendo reseñas:', error);
    return NextResponse.json({ error: 'Error obteniendo reseñas' }, { status: 500 });
  }
}

// POST - Crear nueva reseña
export async function POST(request) {
  try {
    const body = await request.json();
    const { comentario, rating, foto, uid, datosUsuario,mostrarEnSlider } = body;

    if (!comentario || !rating) {
      return NextResponse.json({ error: 'Comentario y rating son requeridos' }, { status: 400 });
    }

    const reviewData = {
      comentario,
      rating: parseInt(rating),
      foto: foto || null,
      fechaCreacion: new Date(),
      mostrarEnSlider: !!mostrarEnSlider,
    };

    if (uid) {
      // Usuario autenticado
      reviewData.uid = uid;
      reviewData.verificado = true;
    } else {
      // Usuario no autenticado
      if (!datosUsuario?.nombre || !datosUsuario?.email) {
        return NextResponse.json({ error: 'Datos de usuario son requeridos para usuarios no registrados' }, { status: 400 });
      }
      reviewData.datosUsuario = datosUsuario;
      reviewData.verificado = false;
    }

    const reviewsRef = collection(db, 'reviews');
    const docRef = await addDoc(reviewsRef, reviewData);
    
    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      message: 'Reseña enviada correctamente. Será visible después de ser aprobada.' 
    });
  } catch (error) {
    console.error('Error creando reseña:', error);
    return NextResponse.json({ error: 'Error creando reseña' }, { status: 500 });
  }
}