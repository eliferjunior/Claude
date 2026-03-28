'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Credenciais invalidas');
        return;
      }

      router.push('/admin/dashboard');
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Cia da Pizza</h1>
          <p className="mt-2 text-gray-400">Painel Administrativo</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-gray-800 p-8 shadow-2xl ring-1 ring-gray-700"
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-900/50 px-4 py-3 text-sm text-red-300 ring-1 ring-red-700">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-300">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-[16px] text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Digite seu usuario"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-[16px] text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Digite sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
