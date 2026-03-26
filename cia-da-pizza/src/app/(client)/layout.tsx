'use client';

import Link from 'next/link';
import { useState } from 'react';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '/cardapio', label: 'Cardapio', icon: '📋' },
    { href: '/pedido', label: 'Fazer Pedido', icon: '🛒' },
    { href: '/reserva', label: 'Reservar', icon: '📅' },
    { href: '/acompanhar', label: 'Acompanhar Pedido', icon: '📍' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Navbar */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
                🍕
              </span>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">
                Cia da Pizza
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300 group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-red-500 to-yellow-500 transition-all duration-300 group-hover:w-3/4 rounded-full" />
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
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

          {/* Mobile nav */}
          {menuOpen && (
            <div className="md:hidden pb-4 space-y-1 animate-fade-in">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-300"
                >
                  <span>{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* WhatsApp floating button */}
      <WhatsAppButton />

      {/* Footer */}
      <footer className="border-t border-gray-800/50 bg-gray-950">
        <div className="h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            {/* About */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🍕</span>
                <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">
                  Cia da Pizza
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                A melhor pizzaria e sanduicheria de Franca/SP. Mais de 80 mil clientes atendidos por
                mes. Qualidade e sabor em cada fatia!
              </p>
            </div>

            {/* Links rapidos */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Links Rapidos
              </h3>
              <ul className="space-y-3">
                {[
                  { href: '/cardapio', label: 'Cardapio' },
                  { href: '/pedido', label: 'Fazer Pedido' },
                  { href: '/reserva', label: 'Reservar Mesa' },
                  { href: '/acompanhar', label: 'Acompanhar Pedido' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-red-400 transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Horario */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Horario de Funcionamento
              </h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-red-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Seg a Dom: 18:00 - 23:00
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-red-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Franca/SP - 4 unidades
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-red-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  (16) 3711-4444 (Delivery)
                </li>
              </ul>
            </div>

            {/* Redes sociais */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Redes Sociais
              </h3>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/pizzacompanhiada"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-10 w-10 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:text-white hover:border-transparent hover:scale-110 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a
                  href="https://wa.me/5516937114444"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-10 w-10 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-green-600 hover:text-white hover:border-transparent hover:scale-110 transition-all duration-300"
                  aria-label="WhatsApp"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/ciadapizza"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-10 w-10 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-blue-600 hover:text-white hover:border-transparent hover:scale-110 transition-all duration-300"
                  aria-label="Facebook"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
              <p className="mt-4 text-xs text-gray-500">@pizzacompanhiada</p>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-800/50 pt-8 text-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Cia da Pizza - Franca/SP. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
