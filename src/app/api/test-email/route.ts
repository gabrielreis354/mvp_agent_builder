import { NextRequest, NextResponse } from 'next/server';
import { getEmailService } from '@/lib/email/email-service';

/**
 * Endpoint de teste para diagnosticar problemas de email
 * 
 * USO:
 * POST /api/test-email
 * Body: { "email": "usuario@empresa.com" }
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`\n🧪 [TEST-EMAIL] ===== TESTE DE EMAIL INICIADO =====`);
    console.log(`🧪 [TEST-EMAIL] Email destino: ${email}`);
    console.log(`🧪 [TEST-EMAIL] Timestamp: ${new Date().toISOString()}`);

    // Verificar configuração SMTP
    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      secure: process.env.SMTP_SECURE,
    };

    console.log(`🧪 [TEST-EMAIL] Configuração SMTP:`, {
      host: smtpConfig.host || '❌ NÃO CONFIGURADO',
      port: smtpConfig.port || '❌ NÃO CONFIGURADO',
      user: smtpConfig.user || '❌ NÃO CONFIGURADO',
      secure: smtpConfig.secure || 'false',
    });

    // Tentar enviar email de teste
    const emailService = getEmailService();
    
    console.log(`🧪 [TEST-EMAIL] Testando conexão SMTP...`);
    const connectionTest = await emailService.testConnection();
    console.log(`🧪 [TEST-EMAIL] Conexão SMTP: ${connectionTest ? '✅ OK' : '❌ FALHOU'}`);

    if (!connectionTest) {
      return NextResponse.json({
        success: false,
        error: 'Falha na conexão SMTP',
        details: {
          message: 'Não foi possível conectar ao servidor SMTP. Verifique as credenciais.',
          config: smtpConfig,
        }
      }, { status: 500 });
    }

    console.log(`🧪 [TEST-EMAIL] Enviando email de teste...`);
    
    const result = await emailService.sendEmail({
      to: email,
      subject: '🧪 Teste de Email - SimplifiqueIA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Teste de Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #3b82f6; margin-bottom: 20px;">🧪 Teste de Email</h1>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Este é um <strong>email de teste</strong> do sistema SimplifiqueIA.
            </p>
            
            <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af;">
                <strong>✅ Sucesso!</strong> Se você está lendo isso, significa que o sistema de email está funcionando corretamente.
              </p>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; color: #92400e;">
                <strong>📋 Informações do Teste:</strong>
              </p>
              <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                <li>Timestamp: ${new Date().toISOString()}</li>
                <li>Destinatário: ${email}</li>
                <li>Servidor SMTP: ${smtpConfig.host}:${smtpConfig.port}</li>
              </ul>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Se você recebeu este email na <strong>caixa de spam</strong>, adicione nosso endereço à lista de remetentes confiáveis.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              SimplifiqueIA - Sistema de Automação Inteligente
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
🧪 Teste de Email - SimplifiqueIA

Este é um email de teste do sistema SimplifiqueIA.

✅ Sucesso! Se você está lendo isso, significa que o sistema de email está funcionando corretamente.

📋 Informações do Teste:
- Timestamp: ${new Date().toISOString()}
- Destinatário: ${email}
- Servidor SMTP: ${smtpConfig.host}:${smtpConfig.port}

Se você recebeu este email na caixa de spam, adicione nosso endereço à lista de remetentes confiáveis.

---
SimplifiqueIA - Sistema de Automação Inteligente
      `,
    });

    console.log(`🧪 [TEST-EMAIL] Resultado do envio:`, result);
    console.log(`🧪 [TEST-EMAIL] ===== TESTE CONCLUÍDO =====\n`);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email de teste enviado com sucesso!',
        details: {
          messageId: result.messageId,
          recipient: email,
          timestamp: new Date().toISOString(),
          smtpServer: `${smtpConfig.host}:${smtpConfig.port}`,
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Falha ao enviar email de teste',
        details: {
          errorMessage: result.error,
          recipient: email,
          smtpConfig,
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('🧪 [TEST-EMAIL] Erro crítico:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao executar teste de email',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
