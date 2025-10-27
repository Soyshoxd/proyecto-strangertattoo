import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  writeBatch,
  onSnapshot 
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { formatoCOP } from "./formato-cop";

/**
 * Obtiene todos los productos del carrito del usuario desde la subcolección
 * @param {string} uid - ID del usuario
 * @returns {Promise<Array>} - Array de productos en el carrito
 */
export async function obtenerCarritoFirestore(uid) {
  try {
    const carritoRef = collection(db, 'users', uid, 'carrito');
    const snapshot = await getDocs(carritoRef);
    
    const productos = [];
    snapshot.forEach((doc) => {
      productos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return productos;
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    return [];
  }
}

/**
 * Añade un producto al carrito del usuario
 * @param {string} uid - ID del usuario
 * @param {Object} producto - Producto a añadir
 * @param {number} cantidad - Cantidad del producto (default: 1)
 */
export async function agregarProductoCarrito(uid, producto, cantidad = 1) {
  try {
    const productoRef = doc(db, 'users', uid, 'carrito', producto.id);
    const productoDoc = await getDoc(productoRef);
    
    if (productoDoc.exists()) {
      // Si el producto ya existe, actualizar la cantidad
      const cantidadActual = productoDoc.data().cantidad || 1;
      await setDoc(productoRef, {
        ...producto,
        cantidad: cantidadActual + cantidad,
        fechaAgregado: productoDoc.data().fechaAgregado || new Date()
      });
    } else {
      // Si el producto no existe, crear nuevo documento
      await setDoc(productoRef, {
        ...producto,
        cantidad: cantidad,
        fechaAgregado: new Date()
      });
    }
    
    console.log('Producto agregado al carrito exitosamente');
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    throw error;
  }
}

/**
 * Actualiza la cantidad de un producto en el carrito
 * @param {string} uid - ID del usuario
 * @param {string} productId - ID del producto
 * @param {number} nuevaCantidad - Nueva cantidad
 */
export async function actualizarCantidadCarrito(uid, productId, nuevaCantidad) {
  try {
    const productoRef = doc(db, 'users', uid, 'carrito', productId);
    
    if (nuevaCantidad <= 0) {
      // Si la cantidad es 0 o menor, eliminar el producto
      await deleteDoc(productoRef);
    } else {
      // Actualizar la cantidad
      const productoDoc = await getDoc(productoRef);
      if (productoDoc.exists()) {
        await setDoc(productoRef, {
          ...productoDoc.data(),
          cantidad: nuevaCantidad
        });
      }
    }
    
    console.log('Cantidad actualizada exitosamente');
  } catch (error) {
    console.error('Error al actualizar cantidad:', error);
    throw error;
  }
}

/**
 * Elimina un producto específico del carrito
 * @param {string} uid - ID del usuario
 * @param {string} productId - ID del producto a eliminar
 */
export async function eliminarProductoCarrito(uid, productId) {
  try {
    const productoRef = doc(db, 'users', uid, 'carrito', productId);
    await deleteDoc(productoRef);
    console.log('Producto eliminado del carrito exitosamente');
  } catch (error) {
    console.error('Error al eliminar producto del carrito:', error);
    throw error;
  }
}

/**
 * Limpia todo el carrito del usuario
 * @param {string} uid - ID del usuario
 */
export async function limpiarCarrito(uid) {
  try {
    const carritoRef = collection(db, 'users', uid, 'carrito');
    const snapshot = await getDocs(carritoRef);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('Carrito limpiado exitosamente');
  } catch (error) {
    console.error('Error al limpiar carrito:', error);
    throw error;
  }
}

/**
 * Sincroniza el carrito local con Firebase al hacer login
 * @param {string} uid - ID del usuario
 */
export async function sincronizarCarritoAlLogin(uid) {
  try {
    // 1. Obtener carrito local de localStorage
    const carritoLocalStr = localStorage.getItem('carrito');
    
    if (!carritoLocalStr || carritoLocalStr === '[]') {
      console.log('No hay carrito local para sincronizar');
      return;
    }
    
    const carritoLocal = JSON.parse(carritoLocalStr);
    
    if (!Array.isArray(carritoLocal) || carritoLocal.length === 0) {
      console.log('Carrito local está vacío o es inválido');
      localStorage.removeItem('carrito');
      return;
    }
    
    console.log(`Sincronizando ${carritoLocal.length} productos del carrito local...`);
    
    // 2. Obtener carrito actual en Firestore
    const carritoFirestore = await obtenerCarritoFirestore(uid);
    
    // 3. Fusionar carritos usando batch para eficiencia
    const batch = writeBatch(db);
    let productosAgregados = 0;
    let productosActualizados = 0;
    
    carritoLocal.forEach(productoLocal => {
      // Validar que el producto tenga ID
      if (!productoLocal.id) {
        console.warn('Producto sin ID encontrado, saltando:', productoLocal);
        return;
      }
      
      const productoRef = doc(db, 'users', uid, 'carrito', productoLocal.id);
      const existeEnFirestore = carritoFirestore.find(p => p.id === productoLocal.id);
      
      if (existeEnFirestore) {
        // Si el producto ya existe, sumar cantidades
        const nuevaCantidad = (existeEnFirestore.cantidad || 1) + (productoLocal.cantidad || 1);
        batch.set(productoRef, {
          ...productoLocal,
          cantidad: nuevaCantidad,
          fechaAgregado: existeEnFirestore.fechaAgregado || new Date()
        });
        productosActualizados++;
      } else {
        // Si el producto no existe, agregarlo
        batch.set(productoRef, {
          ...productoLocal,
          cantidad: productoLocal.cantidad || 1,
          fechaAgregado: new Date()
        });
        productosAgregados++;
      }
    });
    
    // 4. Ejecutar todas las operaciones
    if (productosAgregados > 0 || productosActualizados > 0) {
      await batch.commit();
      console.log(`Carrito sincronizado: ${productosAgregados} productos agregados, ${productosActualizados} actualizados`);
    }
    
    // 5. Limpiar localStorage y flag de invitado
    localStorage.removeItem('carrito');
    localStorage.removeItem('usuarioInvitado');
    
    // 6. Disparar evento para actualizar el navbar
    window.dispatchEvent(new CustomEvent('carritoActualizado'));
    
  } catch (error) {
    console.error('Error al sincronizar carrito al login:', error);
    // En caso de error, no limpiar el localStorage para no perder los datos
    throw error;
  }
}

/**
 * Escucha cambios en tiempo real del carrito del usuario
 * @param {string} uid - ID del usuario
 * @param {Function} callback - Función que se ejecuta cuando hay cambios
 * @returns {Function} - Función para desuscribirse del listener
 */
export function escucharCambiosCarrito(uid, callback) {
  const carritoRef = collection(db, 'users', uid, 'carrito');
  
  return onSnapshot(
    carritoRef,
    (snapshot) => {
      const productos = [];
      snapshot.forEach((doc) => {
        productos.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Ordenar por fecha de agregado (más reciente primero)
      productos.sort((a, b) => {
        const fechaA = a.fechaAgregado?.toDate() || new Date(0);
        const fechaB = b.fechaAgregado?.toDate() || new Date(0);
        return fechaB - fechaA;
      });
      
      callback(productos);
    },
    (error) => {
      console.error('Error al escuchar cambios del carrito:', error);
      callback([]);
    }
  );
}

/**
 * Obtiene la cantidad total de productos en el carrito
 * @param {Array} productos - Array de productos del carrito
 * @returns {number} - Cantidad total de productos
 */
export function calcularCantidadTotal(productos) {
  if (!Array.isArray(productos)) return 0;
  return productos.reduce((total, item) => total + (item.cantidad || 1), 0);
}

/**
 * Calcula el subtotal del carrito
 * @param {Array} productos - Array de productos del carrito
 * @returns {number} - Subtotal del carrito
 */
export function calcularSubtotal(productos) {
  if (!Array.isArray(productos)) return formatoCOP(0);

  const subtotal =  productos.reduce((acc, item) => acc + (item.precio * (item.cantidad || 1)), 0);

  return formatoCOP(subtotal);
}

