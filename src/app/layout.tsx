
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import ConditionalAppShell from '@/components/ConditionalAppShell';
import { LanguageProvider } from '@/contexts/LanguageContext'; // Import LanguageProvider

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
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
