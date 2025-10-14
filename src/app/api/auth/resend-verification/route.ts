import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getEmailService } from '@/lib/email/email-service';

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
    });

    if (!user) {
      // Não revelar se usuário existe (segurança)
      return NextResponse.json(
        { error: 'Se o email existir, um novo código será enviado.' },
        { status: 200 }
      );
    }

    // Verificar se já está verificado
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email já verificado. Você pode fazer login.' },
        { status: 200 }
      );
    }

    // Gerar novo código
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Atualizar no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationCodeExpires,
      },
    });

    // Enviar email
    try {
      const emailService = getEmailService();
      await emailService.sendEmail({
        to: email,
        subject: '🔐 Novo código de verificação - SimplifiqueIA RH',
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
                🔐 Novo Código de Verificação
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong>${user.name}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Você solicitou um novo código de verificação. Use o código abaixo para ativar sua conta:
              </p>
              
              <!-- Verification Code -->
              <div style="background-color: #f9fafb; border: 2px solid #3b82f6; border-radius: 8px; padding: 30px; margin: 30px 0; text-align: center;">
                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Seu Novo Código
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
                Se você não solicitou este código, pode ignorar este email com segurança.
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
Novo Código de Verificação - SimplifiqueIA RH

Olá ${user.name},

Você solicitou um novo código de verificação. Use o código abaixo para ativar sua conta:

CÓDIGO: ${verificationCode}

⚠️ Importante: Este código expira em 24 horas.

Se você não solicitou este código, pode ignorar este email com segurança.

---
SimplifiqueIA RH - Automação Inteligente para RH
        `
      });

      console.log(`✅ [ResendVerification] Novo código enviado para: ${email}`);
    } catch (emailError) {
      console.error(`❌ [ResendVerification] Erro ao enviar email:`, emailError);
      return NextResponse.json(
        { error: 'Erro ao enviar email. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Novo código enviado! Verifique sua caixa de entrada.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ResendVerification] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao reenviar código' },
      { status: 500 }
    );
  }
}
