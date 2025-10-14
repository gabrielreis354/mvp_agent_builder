import './globals.css';
import '@/lib/config/startup'; // Validação de ambiente no startup
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/components/auth/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { ExecutionModalProvider } from '@/components/agent-builder/execution-modal-provider';
import { Hotjar } from '@/components/analytics/hotjar';

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SimplifiqueIA RH - Automação Inteligente para Recursos Humanos',
  description: 'Automatize processos de RH com IA. Análise de currículos, contratos, despesas e mais. Interface visual simples. Multi-usuário e multi-empresa.',
  keywords: ['automação rh', 'ia recursos humanos', 'análise currículos', 'contratos clt', 'gestão rh', 'simplifique rh'],
  icons: {
    icon: [
      { url: '/favicon-32x32.png?v=2', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=2', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico?v=2', sizes: 'any' }
    ],
    apple: '/apple-touch-icon.png?v=2',
  },
  openGraph: {
    title: 'SimplifiqueIA RH - Automatize seu RH com Inteligência Artificial',
    description: 'Crie agentes inteligentes para RH em minutos. Interface visual ou linguagem natural. Multi-usuário, multi-empresa.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'SimplifiqueIA RH',
  },
  twitter: {
    card: 'summary',
    title: 'SimplifiqueIA RH',
    description: 'Automatize seu RH com Inteligência Artificial',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Hotjar configuration
  const hotjarId = process.env.NEXT_PUBLIC_HOTJAR_ID;
  const hotjarVersion = process.env.NEXT_PUBLIC_HOTJAR_SNIPPET_VERSION || '6';

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Favicon com cache-busting */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
            <ExecutionModalProvider />
          </AuthProvider>
        </ThemeProvider>
        
        {/* Hotjar Analytics - apenas em produção */}
        {hotjarId && process.env.NODE_ENV === 'production' && (
          <Hotjar 
            hjid={hotjarId} 
            hjsv={hotjarVersion}
            disableFeedback={true} // Desabilita questionários automáticos
          />
        )}
      </body>
    </html>
  )
}
