import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      organizationId: string;
      organizationName?: string;
      jobTitle?: string;
      createdAt: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: string;
    organizationId: string;
    jobTitle?: string;
    createdAt: string; // Adicionando a data de criação
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    organizationId: string;
    organizationName?: string;
    jobTitle?: string;
    createdAt: string; // Adicionando a data de criação
  }
}
