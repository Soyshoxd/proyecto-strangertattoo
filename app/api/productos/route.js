// app/api/productos/route.js
import { db } from '@/lib/firebase-server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get('categoria')?.toLowerCase().trim();

  const productosRef = collection(db, 'productos');
const q = categoria
  ? query(productosRef, where('categoriaSeleccionada', '==', categoria))
  : productosRef;


  const snapshot = await getDocs(q);
  const productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  console.log("🧠 Categoría recibida:", categoria);
console.log("📦 Productos encontrados:", snapshot.docs.length);

  return NextResponse.json(productos);
}
