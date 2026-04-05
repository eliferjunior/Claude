import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cia da Pizza - A Melhor Pizzaria de Franca/SP',
  description:
    'Cia da Pizza - Pizzaria artesanal em Franca/SP. Sabores tradicionais e especiais, ' +
    'massa fresca feita diariamente. Delivery e retirada no balcao.',
  keywords: ['pizzaria', 'pizza', 'Franca', 'SP', 'delivery', 'Cia da Pizza', 'pizza artesanal'],
  authors: [{ name: 'Cia da Pizza' }],
  openGraph: {
    title: 'Cia da Pizza - A Melhor Pizzaria de Franca/SP',
    description:
      'Pizzaria artesanal em Franca/SP. Sabores tradicionais e especiais com massa fresca.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Cia da Pizza',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
