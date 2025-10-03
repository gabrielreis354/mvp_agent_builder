import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const { pathname } = req.nextUrl;
      console.log(`🔒 Middleware checking path: ${pathname}`);

      // Se não houver token, o acesso é negado para qualquer rota protegida.
      if (!token) {
        console.log('🚫 Access denied: No token found.');
        return false;
      }

      // Rotas que requerem privilégios de administrador.
      if (pathname.startsWith('/admin')) {
        const isAdmin = token.role === 'ADMIN' || token.role === 'SUPER_ADMIN';
        if (!isAdmin) {
          console.log(`🚫 Admin access denied for role: ${token.role}`);
        }
        return isAdmin;
      }

      // Para todas as outras rotas no matcher, um token válido é suficiente.
      console.log(`✅ Access granted for role: ${token.role}`);
      return true;
    },
  },
    pages: {
      signIn: '/auth/signin',
    },
  }
)

export const config = {
  matcher: [
    '/builder/:path*',
    '/agents/:path*',
    '/analytics/:path*',
    '/gallery/:path*',
    '/testing/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*'
  ]
}
