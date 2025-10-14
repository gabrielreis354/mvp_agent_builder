import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email e código são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já está verificado
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email já verificado' },
        { status: 200 }
      );
    }

    // Verificar código
    if (user.verificationCode !== code) {
      return NextResponse.json(
        { error: 'Código de verificação inválido' },
        { status: 400 }
      );
    }

    // Verificar expiração
    if (user.verificationCodeExpires && user.verificationCodeExpires < new Date()) {
      return NextResponse.json(
        { error: 'Código de verificação expirado. Solicite um novo código.' },
        { status: 400 }
      );
    }

    // Verificar email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    console.log(`✅ [VerifyEmail] Email verificado com sucesso: ${email}`);

    return NextResponse.json(
      { message: 'Email verificado com sucesso! Você já pode fazer login.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[VerifyEmail] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar email' },
      { status: 500 }
    );
  }
}
