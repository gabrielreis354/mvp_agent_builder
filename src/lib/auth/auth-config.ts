import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/database/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            // Não revelar se o usuário existe ou não (segurança)
            return null;
          }
          
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Log apenas em desenvolvimento
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Authentication successful for:', user.email);
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId,
            createdAt: user.createdAt.toISOString(),
          };
        } catch (error) {
          // Log de erro sem expor detalhes sensíveis
          if (process.env.NODE_ENV === 'development') {
            console.error('Auth error:', error);
          }
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, `user` object is available. Persist the necessary data to the token.
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        // @ts-ignore
        token.organizationId = user.organizationId;
      }

      // On subsequent calls, `user` is undefined. Fetch fresh data from DB.
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            include: { organization: true },
          });

          if (dbUser) {
            token.userId = dbUser.id;
            token.role = dbUser.role;
            token.organizationId = dbUser.organizationId;
            token.organizationName = dbUser.organization?.name ?? undefined;
            token.jobTitle = dbUser.jobTitle ?? undefined;
            token.createdAt = dbUser.createdAt.toISOString(); // Adiciona createdAt ao token
          }
        } catch (error) {
          console.error("Error fetching user data for JWT:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string;
        session.user.organizationName = token.organizationName as string | undefined;
        session.user.jobTitle = token.jobTitle as string | undefined;
        session.user.createdAt = token.createdAt as string;
      }
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === 'credentials') {
        return true;
      }

      // Handle OAuth sign-in (e.g., Google, GitHub)
      try {
        if (!user.email) return false;

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // If the user does not exist, create a new organization and user.
          await prisma.$transaction(async (tx) => {
            const organization = await tx.organization.create({
              data: {
                name: `${user.name || user.email}'s Organization`,
              },
            });

            await tx.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                role: 'ADMIN', // O primeiro usuário é o administrador
                organizationId: organization.id,
                emailVerified: new Date(),
              },
            });
          });
        }

        return true;
      } catch (error) {
        console.error("OAuth sign-in error:", error);
        return false;
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
