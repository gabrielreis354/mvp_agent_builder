import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    // Validação básica
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Senha é obrigatória' },
        { status: 400 }
      );
    }

    // Validar força da senha
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Buscar token
    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token },
    });

    // Validar token
    if (!passwordReset) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    // Verificar se já foi usado
    if (passwordReset.used) {
      return NextResponse.json(
        { error: 'Este link já foi utilizado' },
        { status: 400 }
      );
    }

    // Verificar expiração
    if (new Date() > passwordReset.expires) {
      // Marcar como usado
      await prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { used: true, usedAt: new Date() },
      });

      return NextResponse.json(
        { error: 'Token expirado. Solicite um novo link de redefinição.' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: passwordReset.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualizar senha do usuário
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Marcar token como usado
    await prisma.passwordReset.update({
      where: { id: passwordReset.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    console.log(`[RESET-PASSWORD] Senha redefinida com sucesso para: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso! Você já pode fazer login.',
    });

  } catch (error) {
    console.error('[RESET-PASSWORD] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao redefinir senha' },
      { status: 500 }
    );
  }
}

// GET para validar token antes de mostrar formulário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar token
    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token },
    });

    // Validar token
    if (!passwordReset) {
      return NextResponse.json(
        { valid: false, error: 'Token inválido' },
        { status: 400 }
      );
    }

    // Verificar se já foi usado
    if (passwordReset.used) {
      return NextResponse.json(
        { valid: false, error: 'Este link já foi utilizado' },
        { status: 400 }
      );
    }

    // Verificar expiração
    if (new Date() > passwordReset.expires) {
      return NextResponse.json(
        { valid: false, error: 'Token expirado' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: passwordReset.email,
    });

  } catch (error) {
    console.error('[RESET-PASSWORD] Erro ao validar token:', error);
    return NextResponse.json(
      { error: 'Erro ao validar token' },
      { status: 500 }
    );
  }
}
