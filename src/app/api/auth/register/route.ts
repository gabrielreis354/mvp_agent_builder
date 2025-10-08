import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    console.log('🔵 [REGISTER] Iniciando registro de usuário...');
    
    const body = await request.json();
    console.log('🔵 [REGISTER] Dados recebidos:', { 
      name: body.name, 
      email: body.email,
      hasPassword: !!body.password,
      company: body.company 
    });
    
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
    } = body;

    // Only name, email, and password are required
    if (!name || !email || !password) {
      console.log('❌ [REGISTER] Campos obrigatórios faltando');
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios.' }, { status: 400 });
    }

    console.log('🔵 [REGISTER] Verificando se usuário já existe...');
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log('❌ [REGISTER] Usuário já existe:', email);
      return NextResponse.json({ error: 'Um usuário com este email já existe.' }, { status: 409 });
    }

    console.log('🔵 [REGISTER] Hasheando senha...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('🔵 [REGISTER] Criando organização e usuário...');
    // Lógica de criação de organização e usuário ADMIN
    await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: company || `${name}'s Organization`,
        },
      });
      console.log('✅ [REGISTER] Organização criada:', organization.id);

      await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'ADMIN',
          organizationId: organization.id,
          emailVerified: new Date(),
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
      console.log('✅ [REGISTER] Usuário criado com sucesso');
    });

    console.log('✅ [REGISTER] Registro completo!');
    return NextResponse.json({ success: true, message: 'Usuário criado com sucesso.' }, { status: 201 });

  } catch (error) {
    console.error('❌ [REGISTER] Erro detalhado:', error);
    console.error('❌ [REGISTER] Stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('❌ [REGISTER] Message:', error instanceof Error ? error.message : String(error));
    
    return NextResponse.json({ 
      error: 'Erro interno ao registrar o usuário.',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
