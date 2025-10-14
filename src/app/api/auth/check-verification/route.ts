import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { emailVerified: true },
    });

    if (!user) {
      // Não revelar se usuário existe (segurança)
      return NextResponse.json(
        { verified: false, exists: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        verified: !!user.emailVerified,
        exists: true 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CheckVerification] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    );
  }
}
