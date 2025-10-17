/**
 * SCRIPT DE TESTE E DIAGNÓSTICO DO SENDGRID
 * 
 * Como executar:
 * 1. Configure as variáveis no .env.local
 * 2. Execute: npx ts-node src/lib/email/test-sendgrid.ts
 * 
 * Ou crie uma API route temporária em:
 * src/app/api/test-email/route.ts
 */

import sgMail from '@sendgrid/mail'

interface SendGridTestResult {
  success: boolean
  message: string
  details?: any
  error?: string
}

/**
 * Testa a configuração do SendGrid
 */
export async function testSendGridSetup(): Promise<SendGridTestResult> {
  console.log('🔍 Iniciando diagnóstico do SendGrid...\n')

  // 1. Verificar variáveis de ambiente
  console.log('📋 PASSO 1: Verificando variáveis de ambiente')
  const apiKey = process.env.SENDGRID_API_KEY
  const fromEmail = process.env.SENDGRID_FROM_EMAIL
  const fromName = process.env.SENDGRID_FROM_NAME

  if (!apiKey) {
    return {
      success: false,
      message: '❌ SENDGRID_API_KEY não encontrada no .env.local',
      error: 'Configure SENDGRID_API_KEY no arquivo .env.local'
    }
  }

  if (!fromEmail) {
    return {
      success: false,
      message: '❌ SENDGRID_FROM_EMAIL não encontrado no .env.local',
      error: 'Configure SENDGRID_FROM_EMAIL no arquivo .env.local'
    }
  }

  console.log(`✅ API Key encontrada: ${apiKey.substring(0, 10)}...`)
  console.log(`✅ From Email: ${fromEmail}`)
  console.log(`✅ From Name: ${fromName || 'AutomateAI'}\n`)

  // 2. Configurar SendGrid
  console.log('📋 PASSO 2: Configurando SendGrid')
  try {
    sgMail.setApiKey(apiKey)
    console.log('✅ SendGrid configurado com sucesso\n')
  } catch (error) {
    return {
      success: false,
      message: '❌ Erro ao configurar SendGrid',
      error: error instanceof Error ? error.message : String(error)
    }
  }

  // 3. Testar envio de email
  console.log('📋 PASSO 3: Testando envio de email')
  console.log('⏳ Enviando email de teste...\n')

  const testEmail = {
    to: fromEmail, // Envia para o próprio email verificado
    from: {
      email: fromEmail,
      name: fromName || 'AutomateAI'
    },
    subject: '✅ Teste SendGrid - AutomateAI',
    text: 'Este é um email de teste do sistema AutomateAI. Se você recebeu este email, a configuração está correta!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .success-badge {
              background: #10b981;
              color: white;
              padding: 10px 20px;
              border-radius: 20px;
              display: inline-block;
              margin: 20px 0;
            }
            .info-box {
              background: white;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Configuração Bem-Sucedida!</h1>
          </div>
          
          <div class="content">
            <div class="success-badge">
              ✅ SendGrid Configurado Corretamente
            </div>
            
            <p>Parabéns! Se você está lendo este email, significa que:</p>
            
            <div class="info-box">
              <strong>✅ Verificações Concluídas:</strong>
              <ul>
                <li>API Key do SendGrid está válida</li>
                <li>Email remetente está verificado</li>
                <li>Sistema de envio está operacional</li>
                <li>Integração AutomateAI funcionando</li>
              </ul>
            </div>
            
            <h3>📋 Informações do Teste:</h3>
            <ul>
              <li><strong>Remetente:</strong> ${fromEmail}</li>
              <li><strong>Nome:</strong> ${fromName || 'AutomateAI'}</li>
              <li><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</li>
              <li><strong>Sistema:</strong> AutomateAI MVP Agent Builder</li>
            </ul>
            
            <h3>🚀 Próximos Passos:</h3>
            <ol>
              <li>O sistema está pronto para enviar emails de relatórios</li>
              <li>Você pode testar executando um agente com envio de email</li>
              <li>Configure templates de email personalizados se necessário</li>
            </ol>
          </div>
          
          <div class="footer">
            <p>Este é um email automático de teste do AutomateAI</p>
            <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        </body>
      </html>
    `
  }

  try {
    const response = await sgMail.send(testEmail)
    
    console.log('✅ EMAIL ENVIADO COM SUCESSO!')
    console.log(`📧 Destinatário: ${fromEmail}`)
    console.log(`📨 Status: ${response[0].statusCode}`)
    console.log(`🆔 Message ID: ${response[0].headers['x-message-id']}\n`)
    
    console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!')
    console.log(`📬 Verifique sua caixa de entrada: ${fromEmail}`)
    console.log('💡 Se não aparecer, verifique a pasta de spam\n')

    return {
      success: true,
      message: '✅ SendGrid configurado e funcionando corretamente!',
      details: {
        statusCode: response[0].statusCode,
        messageId: response[0].headers['x-message-id'],
        to: fromEmail,
        from: fromEmail
      }
    }
  } catch (error: any) {
    console.error('❌ ERRO AO ENVIAR EMAIL\n')
    
    // Diagnóstico detalhado do erro
    if (error.response) {
      console.error('📋 Detalhes do erro:')
      console.error(`Status: ${error.response.statusCode}`)
      console.error(`Body: ${JSON.stringify(error.response.body, null, 2)}\n`)
      
      // Mensagens de erro comuns
      if (error.response.statusCode === 401) {
        console.error('🔑 ERRO DE AUTENTICAÇÃO:')
        console.error('- Verifique se a API Key está correta')
        console.error('- Confirme que a API Key tem permissões de envio')
        console.error('- Tente gerar uma nova API Key no SendGrid\n')
      } else if (error.response.statusCode === 403) {
        console.error('🚫 ERRO DE PERMISSÃO:')
        console.error('- O email remetente pode não estar verificado')
        console.error('- Verifique o Sender Authentication no SendGrid')
        console.error('- Confirme que completou a verificação de email\n')
      }
    } else {
      console.error('Erro:', error.message)
    }

    return {
      success: false,
      message: '❌ Erro ao enviar email de teste',
      error: error.message,
      details: error.response?.body
    }
  }
}

/**
 * Executa o teste se rodado diretamente
 */
if (require.main === module) {
  testSendGridSetup()
    .then(result => {
      if (!result.success) {
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('Erro fatal:', error)
      process.exit(1)
    })
}
