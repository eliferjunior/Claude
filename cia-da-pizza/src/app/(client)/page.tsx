import Link from 'next/link';

const stores = [
  {
    name: 'Loja 1 - Helio Palermo',
    address: 'Av. Dr. Helio Palermo, 2811, Franca/SP',
    phone: '(16) 3711-1111',
    hours: '18:00 - 23:00',
    hasRodizio: true,
  },
  {
    name: 'Loja 2 - Parque Progresso',
    address: 'Franca/SP',
    phone: '(16) 3711-2222',
    hours: '18:00 - 23:00',
    hasRodizio: false,
  },
  {
    name: 'Loja 4 - Delivery',
    address: 'Av. Adhemar Pereira de Barros, 1474, Franca/SP',
    phone: '(16) 3711-4444',
    hours: '18:00 - 23:30',
    hasRodizio: false,
  },
  {
    name: 'Loja 6 - Pulicano',
    address: 'Franca/SP',
    phone: '(16) 3711-6666',
    hours: '18:00 - 23:00',
    hasRodizio: true,
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-950 via-dark-900 to-primary-950 py-20 sm:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(234,179,8,0.2),transparent_50%)]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight">
            <span className="text-white">Cia da Pizza</span>
            <br />
            <span className="text-gradient">Franca/SP</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-dark-300 leading-relaxed">
            A melhor pizzaria e sanduicheria da cidade! Rodizio exclusivo nas unidades Helio Palermo
            e Pulicano. Mais de 80 mil clientes atendidos por mes!
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/cardapio" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
              Ver Cardapio
            </Link>
            <Link href="/pedido" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto">
              Fazer Pedido
            </Link>
            <Link
              href="/reserva"
              className="inline-flex items-center justify-center rounded-lg border-2 border-dark-600 px-8 py-4 text-lg font-semibold text-white hover:border-primary-500 hover:text-primary-500 transition-colors w-full sm:w-auto"
            >
              Reservar Mesa
            </Link>
          </div>
        </div>
      </section>

      {/* Stores Section */}
      <section className="py-16 sm:py-24 bg-dark-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Nossas Unidades</h2>
            <p className="section-subtitle">4 lojas para melhor atender voce</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stores.map((store) => (
              <div key={store.name} className="card group relative overflow-hidden">
                {store.hasRodizio && (
                  <span className="absolute top-3 right-3 rounded-full bg-primary-600 px-3 py-1 text-xs font-bold text-white">
                    Rodizio
                  </span>
                )}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600/20">
                  <svg
                    className="h-6 w-6 text-primary-500"
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
                <h3 className="text-lg font-bold text-white">{store.name}</h3>
                <p className="mt-1 text-sm text-dark-400">{store.address}</p>
                <div className="mt-4 space-y-1 text-sm text-dark-300">
                  <p className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-primary-500"
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
                      className="h-4 w-4 text-primary-500"
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

      {/* Rodizio Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-primary-950 via-dark-900 to-primary-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="section-title">Rodizio de Pizza</h2>
            <p className="section-subtitle">Nas unidades Helio Palermo e Pulicano</p>
          </div>
          <div className="mt-12 mx-auto max-w-3xl">
            <div className="card bg-gradient-to-br from-dark-800 to-dark-900 border border-primary-800/30 text-center">
              <div className="text-6xl font-extrabold text-primary-500 mb-2">R$ 39,99</div>
              <p className="text-xl text-dark-300 mb-8">por pessoa</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="rounded-lg bg-dark-700/50 p-4">
                  <p className="text-2xl font-bold text-green-400">Gratis!</p>
                  <p className="text-sm text-dark-400 mt-1">Criancas ate 6 anos</p>
                </div>
                <div className="rounded-lg bg-dark-700/50 p-4">
                  <p className="text-2xl font-bold text-secondary-400">R$ 9,99</p>
                  <p className="text-sm text-dark-400 mt-1">Criancas de 7 a 11 anos</p>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/reserva" className="btn-primary text-lg px-8 py-4">
                  Reservar Mesa para Rodizio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="py-16 sm:py-24 bg-dark-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Siga-nos no Instagram</h2>
          <p className="section-subtitle mb-8">
            Acompanhe nossas novidades, promocoes e bastidores
          </p>
          <a
            href="https://www.instagram.com/pizzacompanhiada"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            @pizzacompanhiada
          </a>
        </div>
      </section>
    </div>
  );
}
