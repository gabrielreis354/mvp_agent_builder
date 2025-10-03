import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';
import { UserRole } from '@prisma/client';

interface Params {
  params: { memberId: string };
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const { memberId } = params;

  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Apenas administradores podem remover membros.' }, { status: 403 });
  }

  // @ts-ignore
  if (memberId === session.user.id) {
    return NextResponse.json({ error: 'Você não pode remover a si mesmo.' }, { status: 403 });
  }

  try {
    // @ts-ignore
    const organizationId = session.user.organizationId;

    const memberToRemove = await prisma.user.findFirst({
      where: { id: memberId, organizationId },
    });

    if (!memberToRemove) {
      return NextResponse.json({ error: 'Membro não encontrado nesta organização.' }, { status: 404 });
    }

    // Transação para mover o usuário para sua própria organização
    await prisma.$transaction(async (tx) => {
      const newOrg = await tx.organization.create({
        data: {
          name: `${memberToRemove.name}'s Organization`,
        },
      });

      await tx.user.update({
        where: { id: memberId },
        data: {
          organizationId: newOrg.id,
          role: 'ADMIN',
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Membro removido com sucesso.' });

  } catch (error) {
    console.error('Falha ao remover membro:', error);
    return NextResponse.json({ error: 'Erro interno ao remover o membro.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const { memberId } = params;

  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Apenas administradores podem alterar papéis.' }, { status: 403 });
  }

  try {
    const { role } = await request.json();
    // @ts-ignore
    const organizationId = session.user.organizationId;

    if (!role || !(role in UserRole)) {
      return NextResponse.json({ error: 'Papel (role) inválido.' }, { status: 400 });
    }

    // Lógica de segurança: um admin não pode se rebaixar se for o último admin
    // @ts-ignore
    if (memberId === session.user.id && role === 'USER') {
      const adminCount = await prisma.user.count({
        where: { organizationId, role: 'ADMIN' },
      });
      if (adminCount === 1) {
        return NextResponse.json({ error: 'Você não pode rebaixar a si mesmo como o único administrador.' }, { status: 403 });
      }
    }

    const updatedMember = await prisma.user.update({
      where: {
        id: memberId,
        organizationId: organizationId, // Garante que só membros da mesma org sejam alterados
      },
      data: { role: role as UserRole },
    });

    return NextResponse.json({ success: true, member: updatedMember });

  } catch (error) {
    console.error('Falha ao atualizar papel do membro:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar o membro.' }, { status: 500 });
  }
}
