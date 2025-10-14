import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getEmailService } from '@/lib/email/email-service';

// Forçar runtime dinâmico
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Rate limiting em memória (em produção, usar Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(email: string): { allowed: boolean; remainingAttempts: number; resetAt: Date } {
  const now = Date.now();
  const limit = rateLimitMap.get(email);
  
  // Se não existe ou expirou, criar novo
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(email, {
      count: 1,
      resetAt: now + 60 * 60 * 1000 // 1 hora
    });
    return {
      allowed: true,
      remainingAttempts: 2, // 3 tentativas - 1 usada = 2 restantes
      resetAt: new Date(now + 60 * 60 * 1000)
    };
  }
  
  // Verificar se excedeu limite
  if (limit.count >= 3) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetAt: new Date(limit.resetAt)
    };
  }
  
  // Incrementar contador
  limit.count++;
  rateLimitMap.set(email, limit);
  
  return {
    allowed: true,
    remainingAttempts: 3 - limit.count,
    resetAt: new Date(limit.resetAt)
  };
}

/**
 * API para Reenviar Email de Reset de Senha
 * 
 * POST /api/auth/resend-reset-email
 * Body: { email: string, token?: string }
 * 
 * Funcionalidades:
 * - Rate limiting: 3 tentativas por hora
 * - Pode reenviar token existente OU gerar novo
 * - Invalida tokens antigos ao gerar novo
 */
export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();
    
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
    
    // Verificar rate limit
    const rateLimit = checkRateLimit(email.toLowerCase());
    
    if (!rateLimit.allowed) {
      const minutesRemaining = Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 60000);
      
      return NextResponse.json({
        error: 'Limite de tentativas excedido',
        message: `Você atingiu o limite de 3 tentativas por hora. Tente novamente em ${minutesRemaining} minutos.`,
        resetAt: rateLimit.resetAt.toISOString(),
        remainingAttempts: 0
      }, { status: 429 });
    }
    
    console.log(`[RESEND-RESET] Tentativa de reenvio para: ${email} (${rateLimit.remainingAttempts} tentativas restantes)`);
    
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    
    // Segurança: sempre retornar sucesso (prevenir enumeração)
    if (!user) {
      console.log(`[RESEND-RESET] Email não cadastrado: ${email}`);
      return NextResponse.json({
        success: true,
        message: 'Se o email existir, você receberá um novo link de redefinição.',
        remainingAttempts: rateLimit.remainingAttempts
      });
    }
    
    // Verificar se usuário tem senha (não é OAuth)
    if (!user.password) {
      console.log(`[RESEND-RESET] Usuário ${email} usa OAuth, não tem senha`);
      return NextResponse.json({
        success: true,
        message: 'Se o email existir, você receberá um novo link de redefinição.',
        remainingAttempts: rateLimit.remainingAttempts
      });
    }
    
    let resetToken = token;
    let tokenData;
    
    // Se token foi fornecido, verificar se ainda é válido
    if (token) {
      tokenData = await prisma.passwordReset.findFirst({
        where: {
          token,
          email: email.toLowerCase(),
          used: false,
          expires: { gt: new Date() }
        }
      });
      
      if (tokenData) {
        console.log(`[RESEND-RESET] Reenviando token existente válido`);
      } else {
        console.log(`[RESEND-RESET] Token inválido/expirado, gerando novo`);
        resetToken = null; // Forçar geração de novo token
      }
    }
    
    // Se não tem token válido, gerar novo
    if (!resetToken) {
      const crypto = require('crypto');
      resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
      
      // Invalidar tokens antigos
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
      tokenData = await prisma.passwordReset.create({
        data: {
          email: email.toLowerCase(),
          token: resetToken,
          expires,
        },
      });
      
      console.log(`[RESEND-RESET] Novo token gerado, expira em: ${expires.toISOString()}`);
    }
    
    // Enviar email
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    
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
                            <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background-color: #3b82f6; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3); border: 2px solid #3b82f6;">
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
      console.error('[RESEND-RESET] Erro ao enviar email:', emailResult.error);
      return NextResponse.json({
        error: 'Erro ao enviar email',
        message: 'Não foi possível enviar o email. Verifique sua caixa de spam ou tente novamente mais tarde.',
        details: emailResult.error,
        remainingAttempts: rateLimit.remainingAttempts
      }, { status: 500 });
    }
    
    console.log(`[RESEND-RESET] Email reenviado com sucesso para: ${email}`);
    
    return NextResponse.json({
      success: true,
      message: 'Email de redefinição enviado com sucesso! Verifique sua caixa de entrada e spam.',
      remainingAttempts: rateLimit.remainingAttempts,
      expiresAt: tokenData?.expires.toISOString()
    });
    
  } catch (error) {
    console.error('[RESEND-RESET] Erro completo:', error);
    
    return NextResponse.json({
      error: 'Erro ao processar solicitação',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
