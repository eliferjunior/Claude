import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cia da Pizza - A Melhor Pizzaria de Franca/SP',
  description:
    'Cia da Pizza - Pizzaria artesanal em Franca/SP. Sabores tradicionais e especiais, ' +
    'massa fresca feita diariamente. Delivery e retirada no balcao.',
  keywords: [
    'pizzaria',
    'pizza',
    'Franca',
    'SP',
    'delivery',
    'Cia da Pizza',
    'pizza artesanal',
  ],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans">{children}</body>
    </html>
  );
}
