'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { sincronizarCarritoAlLogin } from '@/lib/carrito-utils';

export function useCarritoMigration() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuario se acaba de loguear, verificar si hay carrito local
        const carritoLocal = localStorage.getItem('carrito');
        
        if (carritoLocal && carritoLocal !== '[]') {
          console.log('Migrando carrito de localStorage a Firebase...');
          try {
            await sincronizarCarritoAlLogin(user.uid);
            console.log('Carrito migrado exitosamente');
          } catch (error) {
            console.error('Error al migrar carrito:', error);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);
}
