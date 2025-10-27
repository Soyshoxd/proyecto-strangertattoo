import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";

export async function guardarCarritoFirestore(uid, productos) {
  const ref = doc(db, 'carritos', uid);
  await setDoc(ref, { productos }); // Reemplaza el carrito completo
}

// Nueva función para sincronizar carrito local con Firestore al hacer login
export async function sincronizarCarritoAlLogin(uid) {
  try {
    // 1. Obtener carrito local de localStorage
    const carritoLocal = JSON.parse(localStorage.getItem('carrito')) || [];
    
    if (carritoLocal.length === 0) {
      // No hay carrito local, no hay nada que sincronizar
      return;
    }
    
    // 2. Obtener carrito actual en Firestore
    const carritoRef = doc(db, 'carritos', uid);
    const carritoDoc = await getDoc(carritoRef);
    const carritoFirestore = carritoDoc.exists() ? carritoDoc.data().productos || [] : [];
    
    // 3. Fusionar carritos: combinar productos y sumar cantidades
    const carritoFusionado = [...carritoFirestore];
    
    carritoLocal.forEach(productoLocal => {
      const existeEnFirestore = carritoFusionado.find(p => p.id === productoLocal.id);
      
      if (existeEnFirestore) {
        // Si el producto ya existe, sumar cantidades
        existeEnFirestore.cantidad = (existeEnFirestore.cantidad || 1) + (productoLocal.cantidad || 1);
      } else {
        // Si el producto no existe, agregarlo
        carritoFusionado.push({ ...productoLocal });
      }
    });
    
    // 4. Guardar carrito fusionado en Firestore
    await guardarCarritoFirestore(uid, carritoFusionado);
    
    // 5. Limpiar localStorage
    localStorage.removeItem('carrito');
    
    console.log('Carrito sincronizado exitosamente al iniciar sesión');
    
  } catch (error) {
    console.error('Error al sincronizar carrito al login:', error);
  }
}
