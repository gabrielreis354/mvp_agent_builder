import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: Request) {
  const session = await getServerSession({ req: request as any, ...authOptions });

  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Apenas administradores podem ver os membros.' }, { status: 403 });
  }

  try {
    // @ts-ignore
    const organizationId = session.user.organizationId;

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

    const pendingInvitations = await prisma.invitation.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        expires: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, members, pendingInvitations });

  } catch (error) {
    console.error('Falha ao buscar membros da organização:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar membros.' }, { status: 500 });
  }
}
