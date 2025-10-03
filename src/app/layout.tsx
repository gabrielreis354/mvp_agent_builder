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
  title: 'AutomateAI - Agent Builder',
  description: 'Democratize AI agent creation for all companies',
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
