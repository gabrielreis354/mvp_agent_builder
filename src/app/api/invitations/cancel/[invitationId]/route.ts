import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';

interface Params {
  params: { invitationId: string };
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const { invitationId } = params;

  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Apenas administradores podem cancelar convites.' }, { status: 403 });
  }

  try {
    // @ts-ignore
    const organizationId = session.user.organizationId;

    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, organizationId },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Convite não encontrado ou não pertence a esta organização.' }, { status: 404 });
    }

    await prisma.invitation.delete({ where: { id: invitationId } });

    return NextResponse.json({ success: true, message: 'Convite cancelado com sucesso.' });

  } catch (error) {
    console.error('Falha ao cancelar convite:', error);
    return NextResponse.json({ error: 'Erro interno ao cancelar o convite.' }, { status: 500 });
  }
}
