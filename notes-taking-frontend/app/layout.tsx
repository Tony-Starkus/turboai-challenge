import type { Metadata } from 'next';
import SessionBootstrap from '@/app/session-bootstrap';
import Providers from '@/components/providers';
import { Inria_Serif, Inter } from 'next/font/google';
import './globals.css';

export const metadata: Metadata = {
  title: 'Notes Taking App',
  description: 'Pastel notes app built with Next.js and Django REST Framework.',
};

const inriaSerif = Inria_Serif({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-inria-serif',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${inriaSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <SessionBootstrap>{children}</SessionBootstrap>
        </Providers>
      </body>
    </html>
  );
}
