import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  const session = await getServerSession({ req: request as any, ...authOptions });

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

    // ✅ SEGURANÇA: Verificar se convite já foi usado
    if (invitation.usedAt) {
      return NextResponse.json({ 
        error: 'Este convite já foi utilizado.',
        details: 'Por segurança, cada convite só pode ser usado uma vez. Solicite um novo convite ao administrador.'
      }, { status: 410 });
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
    // Obter IP do usuário para rastreamento de segurança
    const forwarded = request.headers.get('x-forwarded-for');
    const userIp = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    await prisma.$transaction(async (tx) => {
      // Atualizar usuário para nova organização
      const updatedUser = await tx.user.update({
        where: { email: session.user.email! },
        data: {
          organizationId: invitation.organizationId,
          role: 'USER', // Garante que o papel seja de membro
        },
      });

      // ✅ SEGURANÇA: Marcar convite como usado (não deletar para auditoria)
      await tx.invitation.update({
        where: { token },
        data: {
          usedAt: new Date(),
          usedByIp: userIp,
          acceptedByUserId: updatedUser.id,
        },
      });

      console.log(`✅ Usuário ${updatedUser.email} transferido para organização ${invitation.organizationId}`);
      console.log(`🔒 Convite marcado como usado. IP: ${userIp}`);
      console.log(`ℹ️ Agentes do usuário permanecem privados. Use a opção "Compartilhar com Organização" para torná-los públicos.`);
    });

    return NextResponse.json({ success: true, message: 'Você se juntou à organização com sucesso!' });

  } catch (error) {
    console.error('Falha ao juntar-se à organização:', error);
    return NextResponse.json({ error: 'Erro interno ao processar o convite.' }, { status: 500 });
  }
}

