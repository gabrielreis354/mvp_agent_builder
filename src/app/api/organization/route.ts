import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Apenas administradores podem renomear a organização.' }, { status: 403 });
  }

  try {
    const { name } = await request.json();
    // @ts-ignore
    const organizationId = session.user.organizationId;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'O nome da organização não pode ser vazio.' }, { status: 400 });
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: { name: name.trim() },
    });

    return NextResponse.json({ success: true, message: 'Organização renomeada com sucesso.' });

  } catch (error) {
    console.error('Falha ao renomear organização:', error);
    return NextResponse.json({ error: 'Erro interno ao renomear a organização.' }, { status: 500 });
  }
}
