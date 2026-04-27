import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { Toaster } from '@/components/ui/sonner';
import { defaultMetadata } from '@/config/metadata';
import { cn } from '@/lib/utils/cn';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn(inter.variable, 'font-sans antialiased')}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
