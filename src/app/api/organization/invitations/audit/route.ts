import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: Request) {
  const session = await getServerSession({ req: request as any, ...authOptions });

  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Apenas administradores podem visualizar auditoria de convites.' }, { status: 403 });
  }

  try {
    // @ts-ignore
    const organizationId = session.user.organizationId;

    // Buscar todos os convites da organização (usados e não usados)
    const invitations = await prisma.invitation.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        organization: {
          select: { name: true }
        }
      }
    });

    // Buscar informações dos usuários que convidaram e aceitaram
    const invitedByIds = invitations.map(inv => inv.invitedBy).filter(Boolean) as string[];
    const acceptedByIds = invitations.map(inv => inv.acceptedByUserId).filter(Boolean) as string[];
    const allUserIds = [...new Set([...invitedByIds, ...acceptedByIds])];

    const users = await prisma.user.findMany({
      where: { id: { in: allUserIds } },
      select: { id: true, name: true, email: true }
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    // Formatar dados para auditoria
    const auditData = invitations.map(inv => {
      const invitedByUser = inv.invitedBy ? userMap.get(inv.invitedBy) : null;
      const acceptedByUser = inv.acceptedByUserId ? userMap.get(inv.acceptedByUserId) : null;

      let status = 'pending';
      if (inv.usedAt) {
        status = 'used';
      } else if (new Date() > inv.expires) {
        status = 'expired';
      }

      return {
        email: inv.email,
        token: inv.token.slice(0, 8) + '...', // Mostrar apenas parte do token
        status,
        createdAt: inv.createdAt.toISOString(),
        expires: inv.expires.toISOString(),
        usedAt: inv.usedAt?.toISOString() || null,
        usedByIp: inv.usedByIp || null,
        invitedBy: invitedByUser ? {
          id: invitedByUser.id,
          name: invitedByUser.name,
          email: invitedByUser.email
        } : null,
        acceptedBy: acceptedByUser ? {
          id: acceptedByUser.id,
          name: acceptedByUser.name,
          email: acceptedByUser.email
        } : null,
        daysUntilExpiry: Math.ceil((inv.expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      };
    });

    // Estatísticas
    const stats = {
      total: invitations.length,
      pending: auditData.filter(i => i.status === 'pending').length,
      used: auditData.filter(i => i.status === 'used').length,
      expired: auditData.filter(i => i.status === 'expired').length,
    };

    return NextResponse.json({
      success: true,
      invitations: auditData,
      stats
    });

  } catch (error) {
    console.error('Erro ao buscar auditoria de convites:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Erro ao buscar auditoria de convites.' 
    }, { status: 500 });
  }
}
