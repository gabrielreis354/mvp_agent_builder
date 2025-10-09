import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getEmailService } from '@/lib/email/email-service';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validação básica
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // ⚠️ SEGURANÇA: Sempre retornar sucesso, mesmo se usuário não existir
    // Isso previne enumeração de usuários
    if (!user) {
      console.log(`[FORGOT-PASSWORD] Tentativa para email não cadastrado: ${email}`);
      return NextResponse.json({
        success: true,
        message: 'Se o email existir, você receberá instruções para redefinir sua senha.',
      });
    }

    // Verificar se usuário tem senha (pode ser OAuth)
    if (!user.password) {
      console.log(`[FORGOT-PASSWORD] Usuário ${email} usa OAuth, não tem senha`);
      return NextResponse.json({
        success: true,
        message: 'Se o email existir, você receberá instruções para redefinir sua senha.',
      });
    }

    // Gerar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Invalidar tokens antigos do mesmo email
    await prisma.passwordReset.updateMany({
      where: {
        email: email.toLowerCase(),
        used: false,
      },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    // Criar novo token
    await prisma.passwordReset.create({
      data: {
        email: email.toLowerCase(),
        token,
        expires,
      },
    });

    // Enviar email
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    
    const emailService = getEmailService();
    const emailResult = await emailService.sendEmail({
      to: email,
      subject: 'Redefinir sua senha - SimplifiqueIA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redefinir Senha</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        🔐 Redefinir Senha
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                        Olá,
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                        Recebemos uma solicitação para redefinir a senha da sua conta <strong>SimplifiqueIA</strong>.
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                        Clique no botão abaixo para criar uma nova senha:
                      </p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 10px 0 30px;">
                            <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                              Redefinir Minha Senha
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Alternative Link -->
                      <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        Ou copie e cole este link no seu navegador:
                      </p>
                      
                      <p style="margin: 0 0 30px; padding: 15px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; color: #3b82f6; font-size: 14px; word-break: break-all;">
                        ${resetUrl}
                      </p>
                      
                      <!-- Warning -->
                      <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                          <strong>⚠️ Importante:</strong> Este link expira em <strong>1 hora</strong>.
                        </p>
                      </div>
                      
                      <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        Se você não solicitou esta redefinição, pode ignorar este email com segurança.
                      </p>
                      
                      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        Sua senha permanecerá inalterada.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                      <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                        <strong>SimplifiqueIA</strong> - Automação Inteligente para RH
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        Este é um email automático, por favor não responda.
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
Redefinir Senha - SimplifiqueIA

Olá,

Recebemos uma solicitação para redefinir a senha da sua conta SimplifiqueIA.

Clique no link abaixo para criar uma nova senha:
${resetUrl}

⚠️ Importante: Este link expira em 1 hora.

Se você não solicitou esta redefinição, pode ignorar este email com segurança.
Sua senha permanecerá inalterada.

---
SimplifiqueIA - Automação Inteligente para RH
Este é um email automático, por favor não responda.
      `,
    });

    if (!emailResult.success) {
      console.error('[FORGOT-PASSWORD] Erro ao enviar email:', emailResult.error);
      return NextResponse.json(
        { error: 'Erro ao enviar email. Tente novamente mais tarde.' },
        { status: 500 }
      );
    }

    console.log(`[FORGOT-PASSWORD] Email enviado com sucesso para: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Se o email existir, você receberá instruções para redefinir sua senha.',
    });

  } catch (error) {
    console.error('[FORGOT-PASSWORD] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}
