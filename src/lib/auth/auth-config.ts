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

    async signIn({ user, account, profile }) {
      console.log('[AUTH] SignIn callback iniciado', {
        provider: account?.provider,
        email: user?.email,
        hasProfile: !!profile
      });

      if (account?.provider === 'credentials') {
        console.log('[AUTH] Login com credenciais - permitido');
        return true;
      }

      // Handle OAuth sign-in (e.g., Google, GitHub)
      try {
        if (!user.email) {
          console.error('[AUTH] OAuth falhou - email não fornecido');
          return false;
        }

        console.log('[AUTH] Verificando usuário existente:', user.email);
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          console.log('[AUTH] Usuário não existe - criando novo usuário e organização');
          
          // If the user does not exist, create a new organization and user.
          await prisma.$transaction(async (tx) => {
            const organization = await tx.organization.create({
              data: {
                name: `${user.name || user.email}'s Organization`,
              },
            });

            console.log('[AUTH] Organização criada:', organization.id);

            const newUser = await tx.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                role: 'ADMIN', // O primeiro usuário é o administrador
                organizationId: organization.id,
                emailVerified: new Date(),
              },
            });

            console.log('[AUTH] Novo usuário criado:', newUser.id);
          });
        } else {
          console.log('[AUTH] Usuário existente encontrado:', existingUser.id);
          
          // CORREÇÃO: Verificar se account OAuth existe
          if (account && account.provider !== 'credentials') {
            console.log('[AUTH] Verificando account OAuth para provider:', account.provider);
            
            const existingAccount = await prisma.account.findFirst({
              where: {
                userId: existingUser.id,
                provider: account.provider,
              }
            });
            
            if (!existingAccount) {
              console.log('[AUTH] ⚠️ Account OAuth não existe - criando...');
              
              // Criar account OAuth manualmente
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                }
              });
              
              console.log('[AUTH] ✅ Account OAuth criado com sucesso');
            } else {
              console.log('[AUTH] Account OAuth já existe:', existingAccount.id);
            }
          }
        }

        console.log('[AUTH] SignIn bem-sucedido para:', user.email);
        return true;
      } catch (error) {
        console.error('[AUTH] ❌ Erro crítico no OAuth sign-in:', error);
        console.error('[AUTH] Stack trace:', error instanceof Error ? error.stack : 'N/A');
        
        // Retornar false para bloquear login em caso de erro
        return false;
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signIn(message) {
      console.log('[AUTH EVENT] signIn:', message.user.email);
    },
    async signOut(message) {
      console.log('[AUTH EVENT] signOut');
    },
    async createUser(message) {
      console.log('[AUTH EVENT] createUser:', message.user.email);
    },
    async session(message) {
      console.log('[AUTH EVENT] session:', message.session.user?.email);
    },
  },
};
