'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WhatsAppButton from '@/components/WhatsAppButton';

const heroSlides = [
  {
    text: 'Mais de 50 sabores de pizza artesanal',
    subtitle: 'Tradicionais, especiais e gourmet',
    gradient: 'from-red-900 via-red-800 to-orange-900',
  },
  {
    text: 'Delivery rapido - 30 a 45 minutos',
    subtitle: 'Quentinha na sua porta',
    gradient: 'from-blue-900 via-indigo-900 to-purple-900',
  },
  {
    text: 'Borda recheada gratis seg a qui na pizza G!',
    subtitle: 'Cheddar, catupiry ou chocolate',
    gradient: 'from-yellow-900 via-amber-900 to-red-900',
  },
  {
    text: 'Pasteis, beirutes e muito mais',
    subtitle: 'Cardapio completo para toda a familia',
    gradient: 'from-green-900 via-emerald-900 to-teal-900',
  },
];

const categories = [
  { name: 'Pizzas', icon: '🍕', description: 'Mais de 50 sabores', href: '/cardapio' },
  { name: 'Beirutes', icon: '🥖', description: 'Recheados e crocantes', href: '/cardapio' },
  { name: 'Pasteis', icon: '🥟', description: 'Fritos na hora', href: '/cardapio' },
  { name: 'Porcoes', icon: '🍟', description: 'Para compartilhar', href: '/cardapio' },
  { name: 'Bebidas', icon: '🥤', description: 'Refrigerantes e sucos', href: '/cardapio' },
];

const highlights = [
  {
    icon: '🔥',
    title: 'Massa Artesanal',
    description: 'Massa fresca feita diariamente com ingredientes selecionados',
  },
  {
    icon: '🛵',
    title: 'Delivery Rapido',
    description: 'Entrega em 30 a 45 minutos, quentinha na sua porta',
  },
  {
    icon: '🧀',
    title: 'Borda Recheada Gratis',
    description: 'Seg a Qui, pizza Grande com borda gratis: cheddar, catupiry ou chocolate',
  },
  {
    icon: '👨‍🍳',
    title: 'Qualidade Garantida',
    description: 'Mais de 28 anos de tradicao servindo Franca com o melhor sabor',
  },
];

const howItWorks = [
  { step: '1', title: 'Escolha a loja', description: 'Selecione a unidade mais proxima de voce' },
  {
    step: '2',
    title: 'Monte seu pedido',
    description: 'Escolha entre mais de 50 sabores e acompanhamentos',
  },
  { step: '3', title: 'Pague na entrega', description: 'PIX, dinheiro ou cartao - voce escolhe' },
  {
    step: '4',
    title: 'Receba em casa',
    description: 'Delivery rapido ou retire na loja, como preferir',
  },
];

const stats = [
  { value: '80.000+', label: 'Clientes/mes', icon: '👥' },
  { value: '4', label: 'Unidades', icon: '🏪' },
  { value: '50+', label: 'Sabores', icon: '🍕' },
  { value: 'Desde 1995', label: 'Tradicao', icon: '🏆' },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-950">
      {/* Rotating Hero Banner */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
        {/* Animated gradient backgrounds */}
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(220,38,38,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(234,179,8,0.1),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6 animate-float">
            🍕
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-extrabold tracking-tighter mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-yellow-400">
              Cia da Pizza
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 tracking-widest uppercase font-medium">
            Franca / SP
          </p>

          {/* Rotating text */}
          <div className="relative h-24 sm:h-28 flex items-center justify-center mb-8">
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
                  index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <p className="text-xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight px-4 tracking-tight">
                  {slide.text}
                </p>
                <p className="text-sm sm:text-lg text-gray-300/80 mt-2 font-light tracking-wide">
                  {slide.subtitle}
                </p>
              </div>
            ))}
          </div>

          {/* Slide indicators */}
          <div className="flex items-center justify-center gap-2 mb-8 sm:mb-10">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  index === currentSlide
                    ? 'w-8 bg-gradient-to-r from-red-500 to-yellow-400'
                    : 'w-2 bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2 sm:px-0">
            <Link
              href="/cardapio"
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-red-600/25 hover:shadow-red-500/40 hover:scale-[1.02] text-base sm:text-lg w-full sm:w-auto flex items-center justify-center gap-2"
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
              className="bg-gradient-to-r from-yellow-600 to-orange-500 hover:from-yellow-500 hover:to-orange-400 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-orange-600/25 hover:shadow-orange-500/40 hover:scale-[1.02] text-base sm:text-lg w-full sm:w-auto flex items-center justify-center gap-2"
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
              className="bg-gray-800/60 hover:bg-gray-700/60 text-gray-200 border border-gray-600/50 rounded-xl transition-all duration-300 font-semibold py-3.5 px-8 text-base sm:text-lg w-full sm:w-auto flex items-center justify-center gap-2 hover:scale-[1.02]"
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

      {/* Category Showcase */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">
              Nosso Cardapio
            </h2>
            <p className="mt-2 text-gray-400 text-sm sm:text-lg font-light tracking-wide">
              Escolha sua categoria favorita
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group bg-gray-900/80 border border-gray-800/60 rounded-xl p-5 sm:p-6 text-center hover:border-red-500/40 hover:bg-gray-800/60 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-red-900/20"
              >
                <span className="text-3xl sm:text-4xl block mb-3 group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1">{cat.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{cat.description}</p>
                <span className="text-xs font-semibold text-red-400 group-hover:text-red-300 transition-colors">
                  Ver cardapio →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/20 via-gray-950 to-yellow-950/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-900/80 border border-gray-800/60 rounded-xl p-5 sm:p-8 text-center hover:border-red-500/30 transition-all duration-300"
              >
                <span className="text-2xl sm:text-3xl mb-2 sm:mb-3 block">{stat.icon}</span>
                <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">
                  {stat.value}
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 font-medium tracking-wide uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights / Diferenciais */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">
              Por que escolher a Cia da Pizza?
            </h2>
            <p className="mt-2 sm:mt-3 text-gray-400 text-sm sm:text-lg font-light tracking-wide">
              Qualidade, sabor e rapidez em cada pedido
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="bg-gray-900/80 border border-gray-800/60 rounded-xl p-5 sm:p-6 text-center hover:border-red-500/30 hover:bg-gray-800/40 transition-all duration-300 group"
              >
                <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-red-950/10 to-gray-950" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">
              Como Funciona
            </h2>
            <p className="mt-2 sm:mt-3 text-gray-400 text-sm sm:text-lg font-light tracking-wide">
              Pedir e facil e rapido
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-red-600 to-yellow-500 flex items-center justify-center text-xl sm:text-2xl font-extrabold text-white mb-3 sm:mb-4 shadow-lg shadow-red-600/30">
                  {item.step}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 sm:mt-10 text-center">
            <Link
              href="/pedido"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-3 px-6 sm:px-8 rounded-xl transition-all duration-300 shadow-lg shadow-red-600/25 hover:shadow-red-500/40 hover:scale-[1.02] text-base sm:text-lg"
            >
              Pedir Agora
            </Link>
          </div>
        </div>
      </section>

      {/* Promocoes Section */}
      <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-950/20 via-gray-950 to-red-950/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-400">
              Promocoes
            </h2>
            <p className="mt-2 sm:mt-3 text-gray-400 text-sm sm:text-lg font-light tracking-wide">
              Aproveite nossas ofertas especiais
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Terca da Pizza */}
            <div className="bg-gray-900/80 border border-yellow-500/30 rounded-xl shadow-xl p-6 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden">
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
            <div className="bg-gray-900/80 border border-red-500/30 rounded-xl shadow-xl p-6 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden">
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
            <div className="bg-gray-900/80 border border-amber-500/30 rounded-xl shadow-xl p-6 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden">
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
      <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/30 via-gray-950 to-red-950/30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">
              Rodizio de Pizza
            </h2>
            <p className="mt-2 sm:mt-3 text-gray-400 text-sm sm:text-lg font-light tracking-wide">
              Nas unidades Helio Palermo e Pulicano
            </p>
          </div>
          <div className="mx-auto max-w-xl">
            <div className="bg-gray-900/80 border border-gray-800/60 rounded-xl shadow-xl p-5 sm:p-8 lg:p-10 text-center">
              <div className="mb-2">
                <span className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  A partir de
                </span>
              </div>
              <div className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400 mb-2">
                R$ 39,99
              </div>
              <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 font-light">por pessoa</p>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-sm mx-auto mb-6 sm:mb-8">
                <div className="bg-gray-950/60 border border-green-500/20 rounded-xl p-3 sm:p-4">
                  <p className="text-xl sm:text-2xl font-bold text-green-400">Gratis!</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">Criancas ate 6 anos</p>
                </div>
                <div className="bg-gray-950/60 border border-yellow-500/20 rounded-xl p-3 sm:p-4">
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

      {/* Instagram CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/20 via-gray-950 to-pink-950/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400 mb-3 sm:mb-4">
            Siga-nos no Instagram
          </h2>
          <p className="text-gray-400 text-sm sm:text-lg font-light tracking-wide mb-6 sm:mb-8 max-w-xl mx-auto px-2 sm:px-0">
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

      {/* WhatsApp - only on home page */}
      <WhatsAppButton />
    </div>
  );
}
