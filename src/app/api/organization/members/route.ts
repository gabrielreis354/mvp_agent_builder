import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: Request) {
  const session = await getServerSession({ req: request as any, ...authOptions });

  // @ts-ignore
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: 'Usuário não autenticado ou sem organização.' }, { status: 401 });
  }

  try {
    // @ts-ignore
    const organizationId = session.user.organizationId;
    // @ts-ignore
    const userRole = session.user.role;

    const members = await prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
      orderBy: { name: 'asc' },
    });

    // Apenas ADMIN pode ver convites pendentes
    const pendingInvitations = userRole === 'ADMIN' ? await prisma.invitation.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        expires: true,
      },
      orderBy: { createdAt: 'desc' },
    }) : [];

    return NextResponse.json({ 
      success: true, 
      members, 
      pendingInvitations,
      canManageMembers: userRole === 'ADMIN' // Indica se pode convidar/remover
    });

  } catch (error) {
    console.error('Falha ao buscar membros da organização:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar membros.' }, { status: 500 });
  }
}
