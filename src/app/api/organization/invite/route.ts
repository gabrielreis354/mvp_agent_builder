import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';

export async function POST(request: Request) {
  const session = await getServerSession({ req: request as any, ...authOptions });

  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Apenas administradores podem enviar convites.' }, { status: 403 });
  }

  try {
    const { email } = await request.json();
    // @ts-ignore
    const organizationId = session.user.organizationId;

    if (!email) {
      return NextResponse.json({ error: 'O email é obrigatório.' }, { status: 400 });
    }

    // Verifica se o usuário já existe na organização
    const existingUser = await prisma.user.findFirst({
      where: { email, organizationId },
    });
    if (existingUser) {
      return NextResponse.json({ error: 'Este usuário já pertence à organização.' }, { status: 409 });
    }

    // Verifica se já existe um convite pendente
    const existingInvitation = await prisma.invitation.findUnique({ where: { email } });
    if (existingInvitation) {
      return NextResponse.json({ error: 'Um convite para este email já foi enviado.' }, { status: 409 });
    }

    // Cria o convite
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // Convite expira em 7 dias

    const invitation = await prisma.invitation.create({
      data: {
        email,
        organizationId,
        expires,
      },
    });

    // Em um cenário real, aqui você enviaria um email para o usuário com um link contendo o `invitation.token`
    // Ex: `https://seusite.com/accept-invite?token=${invitation.token}`

    return NextResponse.json({ success: true, message: `Convite enviado para ${email}.` });

  } catch (error) {
    console.error('Falha ao enviar convite:', error);
    return NextResponse.json({ error: 'Erro interno ao processar o convite.' }, { status: 500 });
  }
}
