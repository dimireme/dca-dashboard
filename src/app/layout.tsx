import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const geistSans = Geist({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'BTC DCA Tracker',
  description: 'Track Bitcoin DCA schedule execution and purchase history',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
    >
      <body className="min-h-screen font-sans antialiased">
        <Providers>
          <main className="mx-auto min-w-[394px] max-w-[394px] min-[772px]:max-w-[772px] min-[1150px]:max-w-[1150px] min-[1528px]:max-w-[1528px] px-4 py-4">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
