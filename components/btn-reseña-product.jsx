import { auth, db } from '@/lib/firebase-client';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const BotonReseña = ({ producto }) => {
  const [yaDejoreseña, setYaDejoreseña] = useState(false);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verificarReseña = async () => {
      const user = auth.currentUser;
      if (!user) return setCargando(false);

      try {
        const productId = producto?.id || producto?.slug || producto?.nombre;
        console.log('Verificando reseña para el producto ID:', productId, 'y usuario ID:', user.uid);
        // Primero probar la colección con tilde 'reseñas'
        let colRef = collection(db, 'productos', productId, 'resenas');
        let snap = await getDocs(colRef);
        // Verificar si el usuario ya dejó una reseña (buscar por uid en los docs)
        const ya = snap.docs.some(d => d.data()?.uid === user.uid);
        setYaDejoreseña(ya);
      } catch (error) {
        console.error('error al verficar la reseña:', error);
      } finally {
        setCargando(false);
      }

    }
    verificarReseña();
  }, [producto?.id, producto?.slug])

  if (cargando) return <p>Cargando...</p>

  if (yaDejoreseña) return <span className='text-green-500 font-semibold'>Ya dejaste una reseña</span>

  const handleClick = async () => {
    // Intentar resolver correctamente el slug aunque desde pedidos se haya pasado item.id
    let candidate = producto?.slug || producto?.id || producto?.nombre || null;
    let resolved = null;

    if (!candidate) {
      console.warn('No hay identificador de producto en el botón de reseña');
      return;
    }

    try {
      // 1) Si candidate corresponde al id de un documento en 'productos', obtener ese documento
      const docRef = doc(db, 'productos', candidate);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Preferir el slug si existe, sino usar el id del doc
        resolved = data?.slug || docSnap.id;
      } else {
        // 2) Si no existe doc con ese id, intentar buscar por campo slug == candidate
        const colRef = collection(db, 'productos');
        const q = query(colRef, where('slug', '==', candidate));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const first = snap.docs[0];
          const data = first.data();
          resolved = data?.slug || first.id;
        }
      }
    } catch (err) {
      console.error('Error resolviendo producto antes de navegar:', err);
    }

    const target = resolved || candidate;
    router.push(`/detailproducts/${target}?openReview=true`);
  }

  return (
    <button onClick={handleClick} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
      Dejar una reseña
    </button>
  )
}

export default BotonReseña