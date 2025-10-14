import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/database/prisma';
import { z } from 'zod';
import { validateCorporateEmail } from '@/lib/validators/email-validator';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  // Campos RH específicos
  company: z.string().min(1, 'Company is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  department: z.string().optional(),
  companySize: z.string().min(1, 'Company size is required'),
  primaryUseCase: z.string().min(1, 'Primary use case is required'),
  phone: z.string().optional(),
  linkedIn: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validatedData = signupSchema.parse(body);
    const {
      email, password, name, company, jobTitle, 
      department, companySize, primaryUseCase, phone, linkedIn
    } = validatedData;

    // 🔐 VALIDAÇÃO DE EMAIL CORPORATIVO
    console.log(`🔍 [Signup] Validando email corporativo: ${email}`);
    const emailValidation = await validateCorporateEmail(email);
    
    if (!emailValidation.isValid || !emailValidation.isCorporate) {
      console.warn(`❌ [Signup] Email rejeitado: ${email} - ${emailValidation.error}`);
      return NextResponse.json(
        { 
          error: emailValidation.error || 'Email corporativo inválido',
          suggestions: emailValidation.suggestions,
          domain: emailValidation.domain
        },
        { status: 400 }
      );
    }
    
    console.log(`✅ [Signup] Email corporativo válido: ${email} (domínio: ${emailValidation.domain})`);
    if (emailValidation.warnings && emailValidation.warnings.length > 0) {
      console.log(`⚠️ [Signup] Avisos: ${emailValidation.warnings.join(', ')}`);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: company },
      });

      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'USER',
          jobTitle,
          department,
          companySize,
          primaryUseCase,
          phone,
          linkedIn,
          organizationId: organization.id,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: 'USER_SIGNUP',
          details: { email, name, company, jobTitle },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });

      return newUser;
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
