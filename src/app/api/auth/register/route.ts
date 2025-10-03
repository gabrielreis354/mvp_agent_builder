import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Um usuário com este email já existe.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Lógica de criação de organização e usuário ADMIN
    await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: `${name}'s Organization`,
        },
      });

      await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'ADMIN',
          organizationId: organization.id,
          emailVerified: new Date(), // Considerar um fluxo de verificação de email no futuro
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Usuário criado com sucesso.' }, { status: 201 });

  } catch (error) {
    console.error('Falha no registro:', error);
    return NextResponse.json({ error: 'Erro interno ao registrar o usuário.' }, { status: 500 });
  }
}
