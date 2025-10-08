import Link from 'next/link'
import { Brain } from 'lucide-react'

/**
 * Layout para páginas públicas (sem autenticação)
 * Usado para: Política de Privacidade, Termos de Serviço, etc.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header Simples */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Brain className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SimplifiqueIA
              </span>
            </Link>

            {/* Links de Navegação */}
            <nav className="flex items-center gap-6">
              <Link 
                href="/privacy" 
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Privacidade
              </Link>
              <Link 
                href="/terms" 
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Termos
              </Link>
              <Link 
                href="/auth/signin" 
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Footer Simples */}
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-md mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} SimplifiqueIA. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Termos de Serviço
              </Link>
              <Link href="mailto:contato@simplifiquia.com.br" className="text-sm text-gray-400 hover:text-white transition-colors">
                Contato
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
