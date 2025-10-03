import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 });
  }

  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token de convite não fornecido.' }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation || new Date() > invitation.expires) {
      return NextResponse.json({ error: 'Convite inválido ou expirado.' }, { status: 404 });
    }

    if (invitation.email.toLowerCase() !== session.user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Este convite é para um email diferente.' }, { status: 403 });
    }

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email! } });

    if (currentUser?.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: {
          organizationId: currentUser.organizationId,
          role: 'ADMIN',
        },
      });

      const memberCount = await prisma.user.count({
        where: { organizationId: currentUser.organizationId },
      });

      if (adminCount === 1 && memberCount > 1) {
        return NextResponse.json({ error: 'Você é o único administrador. Promova outro membro a administrador antes de sair.' }, { status: 403 });
      }
    }
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: session.user.email! },
        data: {
          organizationId: invitation.organizationId,
          role: 'USER', // Garante que o papel seja de membro
        },
      });

      try {
        await tx.invitation.delete({ where: { token } });
      } catch (error: any) {
        // Check if it's a Prisma error for a record not being found
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          console.log(`Convite com token ${token} já havia sido deletado. Continuando...`);
        } else {
          // Re-throw other errors
          throw error;
        }
      }
    });

    return NextResponse.json({ success: true, message: 'Você se juntou à organização com sucesso!' });

  } catch (error) {
    console.error('Falha ao juntar-se à organização:', error);
    return NextResponse.json({ error: 'Erro interno ao processar o convite.' }, { status: 500 });
  }
}

