import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase-client';

export async function actualizarPromedioProducto(productId) {
  try {
    // Obtener todas las reseñas del producto
    const resenasRef = collection(db, 'productos', productId, 'resenas');
    const snapshot = await getDocs(resenasRef);

    if (snapshot.empty) {
      await updateDoc(doc(db, 'productos', productId), {
        ratingPromedio: 0,
        totalResenas: 0,
      });
      return;
    }

    // Calcular promedio
    let suma = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      suma += data.rating || 0;
    });

    const total = snapshot.size;
    const promedio = (suma / total).toFixed(1);

    // Actualizar producto
    await updateDoc(doc(db, 'productos', productId), {
      ratingPromedio: Number(promedio),
      totalResenas: total,
    });

    console.log(`⭐ Promedio actualizado para ${productId}: ${promedio} (${total} reseñas)`);
  } catch (error) {
    console.error('Error al actualizar promedio:', error);
  }
}
