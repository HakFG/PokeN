import type { Metadata } from 'next';
import { Chakra_Petch, Geist, Geist_Mono } from 'next/font/google';
import { XpFeedbackProvider } from '@/components/Xp/XpFeedbackProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const chakraPetch = Chakra_Petch({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PokeN',
  description: 'Living Dex pessoal de Hak',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${chakraPetch.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <XpFeedbackProvider>{children}</XpFeedbackProvider>
      </body>
    </html>
  );
}
