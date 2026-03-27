'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const menuItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Pedidos', href: '/admin/pedidos', icon: '📋' },
  { label: 'Produtos', href: '/admin/produtos', icon: '🍕' },
  { label: 'Categorias', href: '/admin/categorias', icon: '📁' },
  { label: 'Reservas', href: '/admin/reservas', icon: '📅' },
  { label: 'Lojas', href: '/admin/lojas', icon: '🏪' },
  { label: 'Usuários', href: '/admin/usuarios', icon: '👤' },
  { label: 'Configurações', href: '/admin/configuracoes', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't show layout on login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage) {
      fetch('/api/auth')
        .then((res) => {
          if (!res.ok) {
            router.push('/admin/login');
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data?.user?.name) {
            setAdminName(data.user.name);
          }
        })
        .catch(() => {
          router.push('/admin/login');
        });
    }
  }, [isLoginPage, router]);

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin/login');
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-800">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 transform flex-col bg-gray-900 transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-center border-b border-gray-700 px-6">
          <h1 className="text-xl font-bold text-white">
            Cia da <span className="text-red-500">Pizza</span>
          </h1>
        </div>

        <nav className="mt-6 flex flex-1 flex-col justify-between px-3">
          <div>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`mb-1 flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-red-600/20 text-red-400'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-gray-700 px-1 py-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-gray-400 transition-colors duration-150 hover:bg-red-600/10 hover:text-red-400"
            >
              <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-700 bg-gray-900 px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white lg:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">{adminName}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-600 hover:text-white"
            >
              Sair
            </button>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
