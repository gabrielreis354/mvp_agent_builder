import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

interface Params {
  params: { token: string };
}

export async function GET(request: Request, { params }: Params) {
  const { token } = params;

  if (!token) {
    return NextResponse.json({ error: 'Token não fornecido.' }, { status: 400 });
  }

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: { name: true },
        },
      },
    });

    if (!invitation || new Date() > invitation.expires) {
      return NextResponse.json({ error: 'Convite inválido ou expirado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, invitation });
  } catch (error) {
    console.error('Falha ao validar convite:', error);
    return NextResponse.json({ error: 'Erro interno ao validar o convite.' }, { status: 500 });
  }
}
