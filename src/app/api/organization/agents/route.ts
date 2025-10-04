import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: Request) {
  const session = await getServerSession({ req: request as any, ...authOptions });
  // @ts-ignore
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return NextResponse.json({ error: 'Organização não encontrada ou usuário não autorizado.' }, { status: 401 });
  }

  try {
    const agents = await prisma.agent.findMany({
      where: {
        organizationId: organizationId,
      },
      include: {
        user: { // Inclui os dados do usuário proprietário do agente
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
    });

    return NextResponse.json({ success: true, agents });
  } catch (error) {
    console.error('Falha ao buscar agentes da organização:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar agentes.' }, { status: 500 });
  }
}
