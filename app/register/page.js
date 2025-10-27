'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase-server';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { sincronizarCarritoAlLogin } from '@/lib/carrito';

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setconfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
        const archivo = e.target.files[0];
        setFile(archivo); // Guarda el archivo en el estado
        if (archivo) {
            setPreview(URL.createObjectURL(archivo)); // Genera una URL temporal para mostrar el preview
        } else {
            setPreview(null); // Si no hay archivo, elimina el preview
        }
    };


  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword){
        setError('las contraseñas no coinciden');
        return;
    }
    try {
      const credenciales = await createUserWithEmailAndPassword(auth, email, password);

      // 1. Actualizar perfil del usuario en Auth
      await updateProfile(credenciales.user, {
        displayName: nombre,
      });

      // 2. Crear documento del usuario en Firestore
      await setDoc(doc(db, 'users', credenciales.user.uid), {
        uid: credenciales.user.uid,
        nombre,
        correo: email,
        photoURL: '',
        creadoEn: new Date()
      });

      // 3. Sincronizar carrito local con Firestore
      await sincronizarCarritoAlLogin(credenciales.user.uid);

      router.push('/productos');
    } catch (err) {
      console.error(err);
      setError('No se pudo registrar el usuario.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleRegister} className="bg-zinc-800 p-6 rounded w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Registro</h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-zinc-700 text-white"
          required
        />

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-zinc-700 text-white"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-zinc-700 text-white"
          required
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setconfirmPassword(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-zinc-700 text-white"
          required
        />
        <button type="submit" className="w-full bg-red-600 py-2 rounded hover:bg-red-700">
          Registrarse
        </button>

        <p className="text-sm mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-red-500 underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
