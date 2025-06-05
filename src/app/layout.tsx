
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import ConditionalAppShell from '@/components/ConditionalAppShell';
import { LanguageProvider } from '@/contexts/LanguageContext'; // Import LanguageProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'arabic'], // Added Arabic subset
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin', 'arabic'], // Added Arabic subset
});

export const metadata: Metadata = {
  title: 'LinguaLeap', // This could also be localized later if needed at build time
  description: 'Learn 5 words by 5 in any language.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"> {/* Default lang, will be updated by LanguageProvider */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LanguageProvider> {/* Wrap with LanguageProvider */}
          <ConditionalAppShell>
            {children}
          </ConditionalAppShell>
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}

    