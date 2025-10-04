import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: Request) {
  const session = await getServerSession({ req: request as any, ...authOptions });

  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: 'Usuário não pertence a uma organização.' }, { status: 403 });
  }

  try {
    const organizationId = session.user.organizationId;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
          orderBy: {
            role: 'asc', // Admins primeiro
          },
        },
        agents: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organização não encontrada.' }, { status: 404 });
    }

    return NextResponse.json(organization);

  } catch (error) {
    console.error('Falha ao buscar detalhes da organização:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
