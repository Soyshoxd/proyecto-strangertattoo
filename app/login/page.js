'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from '@/lib/firebase-server';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { sincronizarCarritoAlLogin } from '@/lib/carrito';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
await signInWithEmailAndPassword(auth, email, password);
      await sincronizarCarritoAlLogin();
      router.push('/productos');
    } catch (err) {
      console.error(err);
      setError('Correo o contraseña inválidos.');
    }
  };

  const loginWithGoogle = async () => {
    try {
await signInWithPopup(auth, googleProvider);
      await sincronizarCarritoAlLogin();
      router.push('/productos');
    } catch (err) {
      console.error(err);
      setError('Error al iniciar con Google');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleLogin} className="bg-zinc-800 p-6 rounded w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Iniciar sesión</h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-zinc-700 text-white"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-zinc-700 text-white"
        />
        <button type="submit" className="w-full bg-red-600 py-2 rounded hover:bg-red-700">
          Iniciar sesión
        </button>

        <button
          type="button"
          onClick={loginWithGoogle}
          className="mt-4 w-full bg-white text-black py-2 rounded hover:bg-gray-200"
        >
          Iniciar con Google
        </button>

        <p className="text-sm mt-4">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-red-500 underline">
            Regístrate aquí
          </Link>
        </p>
      </form>
    </div>
  );
}
