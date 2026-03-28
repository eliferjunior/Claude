import Link from 'next/link';

const stores = [
  {
    name: 'Loja 1 - Helio Palermo',
    address: 'Av. Dr. Helio Palermo, 2811, Franca/SP',
    phone: '(16) 3711-1111',
    hours: '18:00 - 23:00',
    tags: ['Rodizio', 'Retirada'],
  },
  {
    name: 'Loja 2 - Parque Progresso',
    address: 'Franca/SP',
    phone: '(16) 3711-2222',
    hours: '18:00 - 23:00',
    tags: ['Delivery', 'Retirada'],
  },
  {
    name: 'Loja 4 - Delivery',
    address: 'Av. Adhemar Pereira de Barros, 1474, Franca/SP',
    phone: '(16) 3711-4444',
    hours: '18:00 - 23:30',
    tags: ['Delivery'],
  },
  {
    name: 'Loja 6 - Pulicano',
    address: 'Franca/SP',
    phone: '(16) 3711-6666',
    hours: '18:00 - 23:00',
    tags: ['Rodizio', 'Retirada'],
  },
];

const stats = [
  { value: '80mil+', label: 'Clientes/mes', icon: '👥' },
  { value: '4', label: 'Unidades', icon: '🏪' },
  { value: 'Desde 1995', label: 'Tradição', icon: '🏆' },
  { value: '54K', label: 'Seguidores', icon: '📱' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-36">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(220,38,38,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(234,179,8,0.1),transparent_50%)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 text-center">
          <div className="animate-slide-up">
            <span className="inline-block text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6 animate-float">
              🍕
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-8xl font-extrabold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-yellow-400">
                Cia da Pizza
              </span>
            </h1>
            <p className="text-lg sm:text-2xl lg:text-3xl font-light text-gray-400 mt-2 sm:mt-3">
              Franca/SP
            </p>
            <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-sm sm:text-lg lg:text-xl text-gray-300 leading-relaxed px-2 sm:px-0">
              A melhor pizzaria e sanduicheria da cidade! Rodizio exclusivo nas unidades Helio
              Palermo e Pulicano. Mais de 80 mil clientes atendidos por mes!
            </p>
          </div>

          <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-slide-up delay-200 px-2 sm:px-0">
            <Link
              href="/cardapio"
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-red-600/25 hover:shadow-red-500/40 hover:scale-[1.02] text-base sm:text-lg w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Ver Cardapio
            </Link>
            <Link
              href="/pedido"
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-red-600/25 hover:shadow-red-500/40 hover:scale-[1.02] text-base sm:text-lg w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              Fazer Pedido
            </Link>
            <Link
              href="/reserva"
              className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 border border-gray-600/50 rounded-xl transition-all duration-300 font-semibold py-3 px-6 text-base sm:text-lg w-full sm:w-auto flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Reservar Mesa
            </Link>
          </div>
        </div>
      </section>

      {/* Stores Section */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">
              Nossas Unidades
            </h2>
            <p className="mt-2 sm:mt-3 text-gray-400 text-sm sm:text-lg">
              4 lojas para melhor atender voce
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stores.map((store) => (
              <div
                key={store.name}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl p-4 sm:p-6 hover:scale-[1.02] transition-all duration-300 group"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 group-hover:bg-red-500/20 transition-colors duration-300">
                  <svg
                    className="h-6 w-6 text-red-400"
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
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{store.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{store.address}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {store.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        tag === 'Rodizio'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : tag === 'Delivery'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-2 text-sm text-gray-300">
                  <p className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-red-400"
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
                    {store.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-red-400"
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
                    {store.hours}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promocoes Section */}
      <section className="py-12 sm:py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-950/20 via-gray-900 to-red-950/20" />
        <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-400">
              Promocoes
            </h2>
            <p className="mt-2 sm:mt-3 text-gray-400 text-sm sm:text-lg">
              Aproveite nossas ofertas especiais
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Terca da Pizza */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl shadow-xl p-6 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-bl from-yellow-500/20 to-transparent w-32 h-32 rounded-bl-full" />
              <span className="text-4xl mb-4 block">🍕</span>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Terca da Pizza</h3>
              <p className="text-gray-300 mb-4">
                Pizzas tradicionais com{' '}
                <span className="text-yellow-400 font-extrabold text-lg">20% OFF</span>
              </p>
              <span className="inline-block text-xs font-semibold text-yellow-200 bg-yellow-500/20 border border-yellow-500/40 px-3 py-1 rounded-lg uppercase tracking-wide">
                Toda terca-feira
              </span>
            </div>

            {/* Combo Familia */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-red-500/30 rounded-2xl shadow-xl p-6 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-bl from-red-500/20 to-transparent w-32 h-32 rounded-bl-full" />
              <span className="text-4xl mb-4 block">👨‍👩‍👧‍👦</span>
              <h3 className="text-xl font-bold text-red-400 mb-2">Combo Familia</h3>
              <p className="text-gray-300 mb-4">
                2 pizzas grandes + 1 refrigerante 2L por um preco especial
              </p>
              <span className="inline-block text-xs font-semibold text-red-200 bg-red-500/20 border border-red-500/40 px-3 py-1 rounded-lg uppercase tracking-wide">
                Todos os dias
              </span>
            </div>

            {/* Happy Hour */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-amber-500/30 rounded-2xl shadow-xl p-6 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-500/20 to-transparent w-32 h-32 rounded-bl-full" />
              <span className="text-4xl mb-4 block">🍺</span>
              <h3 className="text-xl font-bold text-amber-400 mb-2">Happy Hour</h3>
              <p className="text-gray-300 mb-4">Seg a Qui, 18h-19h: Chopp pela metade do preco</p>
              <span className="inline-block text-xs font-semibold text-amber-200 bg-amber-500/20 border border-amber-500/40 px-3 py-1 rounded-lg uppercase tracking-wide">
                Seg a Qui
              </span>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/pedido"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-red-500 hover:from-yellow-500 hover:to-red-400 text-white font-semibold py-3 px-6 sm:px-8 rounded-xl transition-all duration-300 shadow-lg shadow-red-600/25 hover:shadow-red-500/40 hover:scale-[1.02] text-base sm:text-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              Aproveitar Promocoes
            </Link>
          </div>
        </div>
      </section>

      {/* Rodizio Section */}
      <section className="py-12 sm:py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/30 via-gray-900 to-red-950/30" />
        <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">
              Rodizio de Pizza
            </h2>
            <p className="mt-2 sm:mt-3 text-gray-400 text-sm sm:text-lg">
              Nas unidades Helio Palermo e Pulicano
            </p>
          </div>
          <div className="mx-auto max-w-xl">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl p-5 sm:p-8 lg:p-10 text-center animate-pulse-glow">
              <div className="mb-2">
                <span className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  A partir de
                </span>
              </div>
              <div className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400 mb-2">
                R$ 39,99
              </div>
              <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">por pessoa</p>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-sm mx-auto mb-6 sm:mb-8">
                <div className="bg-gray-900/50 border border-green-500/20 rounded-xl p-3 sm:p-4">
                  <p className="text-xl sm:text-2xl font-bold text-green-400">Gratis!</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">Criancas ate 6 anos</p>
                </div>
                <div className="bg-gray-900/50 border border-yellow-500/20 rounded-xl p-3 sm:p-4">
                  <p className="text-xl sm:text-2xl font-bold text-yellow-400">R$ 9,99</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">Criancas de 7 a 11 anos</p>
                </div>
              </div>

              <Link
                href="/reserva"
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-3 px-5 sm:px-8 rounded-xl transition-all duration-300 shadow-lg shadow-red-600/25 hover:shadow-red-500/40 hover:scale-[1.02] text-base sm:text-lg inline-flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Reservar Mesa para Rodizio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl p-4 sm:p-6 text-center hover:scale-[1.02] transition-all duration-300"
              >
                <span className="text-2xl sm:text-3xl mb-2 sm:mb-3 block">{stat.icon}</span>
                <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">
                  {stat.value}
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram CTA Section */}
      <section className="py-12 sm:py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/20 via-gray-900 to-pink-950/20" />
        <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400 mb-3 sm:mb-4">
            Siga-nos no Instagram
          </h2>
          <p className="text-gray-400 text-sm sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto px-2 sm:px-0">
            Acompanhe nossas novidades, promocoes e bastidores
          </p>
          <a
            href="https://www.instagram.com/pizzacompanhiada"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-white shadow-lg shadow-pink-600/25 hover:shadow-pink-500/40 hover:scale-[1.05] transition-all duration-300"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            @pizzacompanhiada
          </a>
        </div>
      </section>

      {/* Area Restrita */}
      <section className="py-4 sm:py-6">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="border-t border-gray-800/30 pt-4">
            <p className="text-center text-xs text-gray-600 mb-2">Area Restrita</p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/admin/login"
                className="text-xs text-gray-600 hover:text-gray-500 transition-colors"
              >
                Acesso Administrativo
              </Link>
              <span className="text-gray-700">|</span>
              <Link
                href="/loja/login"
                className="text-xs text-gray-600 hover:text-gray-500 transition-colors"
              >
                Acesso Loja
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
