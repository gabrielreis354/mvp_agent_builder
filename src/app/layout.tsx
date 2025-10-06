import './globals.css';
import '@/lib/config/startup'; // Validação de ambiente no startup
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/components/auth/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { ExecutionModalProvider } from '@/components/agent-builder/execution-modal-provider';

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SimplifiqueIA RH - Automação Inteligente para Recursos Humanos',
  description: 'Automatize processos de RH com IA. Análise de currículos, contratos, despesas e mais. Interface visual simples. Multi-usuário e multi-empresa.',
  keywords: ['automação rh', 'ia recursos humanos', 'análise currículos', 'contratos clt', 'gestão rh', 'simplifique rh'],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/apple-icon.svg',
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
  return (
    <html lang="pt-BR" suppressHydrationWarning>
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
      </body>
    </html>
  )
}
