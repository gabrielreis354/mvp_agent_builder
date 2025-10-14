import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/database/prisma';
import { z } from 'zod';
import { validateCorporateEmail } from '@/lib/validators/email-validator';
import { getEmailService } from '@/lib/email/email-service';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
    .regex(/[^a-zA-Z0-9]/, 'A senha deve conter pelo menos um caractere especial (!@#$%^&*...)'),
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

    // Gerar código de verificação (6 dígitos)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

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
          verificationCode,
          verificationCodeExpires,
          emailVerified: null, // Email não verificado
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

    // 📧 ENVIAR EMAIL DE VERIFICAÇÃO
    try {
      console.log(`📧 [Signup] Enviando código de verificação para: ${email}`);
      const emailService = getEmailService();
      const emailResult = await emailService.sendEmail({
        to: email,
        subject: '🔐 Verifique seu email - SimplifiqueIA RH',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🔐 Verifique seu Email
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Bem-vindo ao <strong>SimplifiqueIA RH</strong>! Para ativar sua conta, use o código de verificação abaixo:
              </p>
              
              <!-- Verification Code -->
              <div style="background-color: #f9fafb; border: 2px solid #3b82f6; border-radius: 8px; padding: 30px; margin: 30px 0; text-align: center;">
                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Seu Código de Verificação
                </p>
                <p style="margin: 0; color: #1f2937; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${verificationCode}
                </p>
              </div>
              
              <!-- Warning -->
              <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>⚠️ Importante:</strong> Este código expira em <strong>24 horas</strong>.
                </p>
              </div>
              
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Se você não criou esta conta, pode ignorar este email com segurança.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                <strong>SimplifiqueIA RH</strong> - Automação Inteligente para RH
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <a href="${process.env.NEXTAUTH_URL}" style="color: #3b82f6; text-decoration: none;">www.simplifiqueia.com.br</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
        text: `
Verifique seu Email - SimplifiqueIA RH

Olá ${name},

Bem-vindo ao SimplifiqueIA RH! Para ativar sua conta, use o código de verificação abaixo:

CÓDIGO: ${verificationCode}

⚠️ Importante: Este código expira em 24 horas.

Se você não criou esta conta, pode ignorar este email com segurança.

---
SimplifiqueIA RH - Automação Inteligente para RH
        `
      });
      
      if (emailResult.success) {
        console.log(`✅ [Signup] Código de verificação enviado com sucesso! MessageId: ${emailResult.messageId}`);
      } else {
        console.warn(`⚠️ [Signup] Falha ao enviar código de verificação: ${emailResult.error}`);
        // Não bloqueia o cadastro se o email falhar
      }
    } catch (emailError) {
      console.error(`❌ [Signup] Erro ao enviar código de verificação:`, emailError);
      // Não bloqueia o cadastro se o email falhar
    }

    return NextResponse.json(
      {
        message: 'User created successfully. Please check your email to verify your account.',
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        requiresVerification: true,
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
