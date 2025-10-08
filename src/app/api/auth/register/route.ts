import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { 
      name, 
      email, 
      password,
      // Optional HR fields
      company,
      jobTitle,
      department,
      companySize,
      primaryUseCase,
      phone,
      linkedIn
    } = await request.json();

    // Only name, email, and password are required
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios.' }, { status: 400 });
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
          name: company || `${name}'s Organization`,
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
          // Optional HR fields - only save if provided
          ...(company && { company }),
          ...(jobTitle && { jobTitle }),
          ...(department && { department }),
          ...(companySize && { companySize }),
          ...(primaryUseCase && { primaryUseCase }),
          ...(phone && { phone }),
          ...(linkedIn && { linkedIn }),
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Usuário criado com sucesso.' }, { status: 201 });

  } catch (error) {
    console.error('Falha no registro:', error);
    return NextResponse.json({ error: 'Erro interno ao registrar o usuário.' }, { status: 500 });
  }
}
