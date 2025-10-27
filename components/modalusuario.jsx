// components/ModalUsuario.jsx
'use client';
import { useEffect, useState, useRef } from 'react';
import { auth } from '@/lib/firebase-client';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const ModalUsuario = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const modalRef = useRef();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Cerrar si se da clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    await signOut(auth);
    
    // Limpiar datos de sesión de invitado al cerrar sesión
    // (esto permite que el usuario vuelva a elegir si quiere ser invitado)
    localStorage.removeItem('usuarioInvitado');
    
    onClose();
    router.refresh();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="absolute top-12 right-4 bg-white text-black p-4 rounded shadow-lg w-40 z-50"
    >
      {user ? (
        <>
          <h2 className="text-lg font-bold mb-1">Hola, {user.displayName || 'Usuario'}</h2>
          <p className="text-sm mb-2">{user.email}</p>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white w-full py-2 rounded hover:bg-red-700"
          >
            Cerrar sesión
          </button>
        </>
      ) : (
        <>
          <h2 className="text-lg font-bold mb-1">¡Bienvenido!</h2>
          <p className="text-sm mb-3">Crea una cuenta o inicia sesión para guardar tu carrito.</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push('/login')}
              className="bg-zinc-800 text-white py-1 px-4 rounded hover:bg-zinc-700"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => router.push('/register')}
              className="bg-red-600 text-white py-1 px-4 rounded hover:bg-red-700"
            >
              Registrarse
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ModalUsuario;
