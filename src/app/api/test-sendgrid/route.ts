/**
 * API ROUTE PARA TESTAR SENDGRID
 * 
 * Acesse: http://localhost:3001/api/test-sendgrid
 * 
 * Esta rota testa a configuração do SendGrid e envia um email de teste
 */

import { NextResponse } from 'next/server'
import { testSendGridSetup } from '@/lib/email/test-sendgrid'

export async function GET() {
  try {
    console.log('🚀 Iniciando teste do SendGrid via API...\n')
    
    const result = await testSendGridSetup()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        details: result.details,
        instructions: [
          '1. Verifique sua caixa de entrada',
          '2. Se não aparecer, verifique a pasta de spam',
          '3. O email deve ter o assunto: "✅ Teste SendGrid - AutomateAI"'
        ]
      }, { status: 200 })
    } else {
      return NextResponse.json({
        success: false,
        message: result.message,
        error: result.error,
        details: result.details,
        troubleshooting: [
          'Verifique se SENDGRID_API_KEY está no .env.local',
          'Confirme que o email está verificado no SendGrid',
          'Verifique se a API Key tem permissões de envio',
          'Acesse https://app.sendgrid.com/settings/sender_auth'
        ]
      }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Erro fatal no teste:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Erro fatal ao executar teste',
      error: error instanceof Error ? error.message : String(error),
      troubleshooting: [
        'Verifique os logs do console',
        'Confirme que as variáveis de ambiente estão configuradas',
        'Reinicie o servidor de desenvolvimento'
      ]
    }, { status: 500 })
  }
}

export async function POST() {
  // Permite testar via POST também
  return GET()
}
