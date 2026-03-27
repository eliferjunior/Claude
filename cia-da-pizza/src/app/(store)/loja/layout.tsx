'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [storeName, setStoreName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoginPage = pathname === '/loja/login';

  useEffect(() => {
    if (isLoginPage) return;

    fetch('/api/auth/store/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/loja/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.store_name) {
          setStoreName(data.store_name);
        }
      })
      .catch(() => {
        router.push('/loja/login');
      });
  }, [router, isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch('/api/auth/store', { method: 'DELETE' });
    router.push('/loja/login');
  }

  const navLinks = [
    { href: '/loja', label: 'Painel' },
    { href: '/loja/pedidos', label: 'Pedidos' },
    { href: '/loja/reservas', label: 'Reservas' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/loja" className="flex items-center gap-2 text-xl font-bold text-white">
                <span className="text-2xl">🍕</span>
                <span className="hidden sm:inline">{storeName || 'Cia da Pizza'}</span>
              </Link>

              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-1 ml-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? 'bg-red-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-sm text-gray-400">{storeName}</span>
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-red-600/10 hover:text-red-400"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sair
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                aria-label="Abrir menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {menuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {menuOpen && (
            <div className="md:hidden pb-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-4 py-2 text-sm font-medium ${
                    pathname === link.href
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-400 hover:bg-red-600/10 hover:text-red-400"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sair
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
