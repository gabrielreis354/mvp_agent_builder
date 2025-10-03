'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'VIEWER'
}

export function AuthGuard({ children, requiredRole = 'USER' }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    console.log('🔒 AuthGuard executado:', { status, session: !!session })
    
    if (status === 'loading') return // Still loading

    if (!session) {
      console.log('❌ Usuário não autenticado - redirecionando')
      const currentPath = window.location.pathname
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`)
      return
    }

    // Check role if required
    if (requiredRole && requiredRole !== 'USER') {
      const userRole = session.user?.role
      const allowedRoles = {
        'VIEWER': ['VIEWER', 'USER', 'ADMIN', 'SUPER_ADMIN'],
        'USER': ['USER', 'ADMIN', 'SUPER_ADMIN'],
        'ADMIN': ['ADMIN', 'SUPER_ADMIN'],
        'SUPER_ADMIN': ['SUPER_ADMIN']
      }

      if (!allowedRoles[requiredRole]?.includes(userRole)) {
        console.log('❌ Permissões insuficientes - redirecionando')
        router.push(`/auth/signin?error=insufficient_permissions`)
        return
      }
    }

    console.log('✅ Usuário autenticado e autorizado')
  }, [session, status, router, requiredRole])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Redirecionando...</h2>
          <p className="text-gray-600">Você será redirecionado para a página de login.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
