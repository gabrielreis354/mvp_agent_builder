import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

// Forçar runtime dinâmico (não fazer build estático)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * API de Diagnóstico - Verificar Email no Sistema
 * 
 * GET /api/auth/diagnose-email?email=paulo.reis@om30.com.br
 * 
 * ⚠️ ATENÇÃO: Esta API deve ser REMOVIDA ou PROTEGIDA em produção!
 * Ela expõe informações sensíveis para diagnóstico.
 */
export async function GET(request: NextRequest) {
  try {
    const emailToTest = request.nextUrl.searchParams.get('email');
    
    if (!emailToTest) {
      return NextResponse.json({
        error: 'Parâmetro "email" é obrigatório',
        exemplo: '/api/auth/diagnose-email?email=paulo.reis@om30.com.br'
      }, { status: 400 });
    }
    
    const diagnostico: any = {
      emailTestado: emailToTest,
      timestamp: new Date().toISOString(),
      resultados: {}
    };
    
    // 1. Buscar email exato (case sensitive)
    console.log(`[DIAGNOSE] Buscando email exato: ${emailToTest}`);
    const userExact = await prisma.user.findFirst({
      where: { email: emailToTest },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        password: true,
        createdAt: true 
      }
    });
    
    diagnostico.resultados.emailExato = userExact ? {
      encontrado: true,
      emailNoBanco: userExact.email,
      id: userExact.id,
      nome: userExact.name,
      temSenha: !!userExact.password,
      tipoLogin: userExact.password ? 'Email/Senha' : 'OAuth (Google/GitHub)',
      criadoEm: userExact.createdAt
    } : {
      encontrado: false,
      mensagem: 'Email não encontrado com case exato'
    };
    
    // 2. Buscar email lowercase
    console.log(`[DIAGNOSE] Buscando email lowercase: ${emailToTest.toLowerCase()}`);
    const userLower = await prisma.user.findUnique({
      where: { email: emailToTest.toLowerCase() },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        password: true,
        createdAt: true 
      }
    });
    
    diagnostico.resultados.emailLowercase = userLower ? {
      encontrado: true,
      emailNoBanco: userLower.email,
      id: userLower.id,
      nome: userLower.name,
      temSenha: !!userLower.password,
      tipoLogin: userLower.password ? 'Email/Senha' : 'OAuth (Google/GitHub)',
      criadoEm: userLower.createdAt
    } : {
      encontrado: false,
      mensagem: 'Email não encontrado em lowercase'
    };
    
    // 3. Buscar emails similares (case insensitive)
    console.log(`[DIAGNOSE] Buscando emails similares...`);
    const allUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: emailToTest.split('@')[0], // Busca pela parte antes do @
          mode: 'insensitive'
        }
      },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        password: true,
        createdAt: true 
      },
      take: 10
    });
    
    diagnostico.resultados.emailsSimilares = allUsers.map(u => ({
      emailNoBanco: u.email,
      id: u.id,
      nome: u.name,
      temSenha: !!u.password,
      tipoLogin: u.password ? 'Email/Senha' : 'OAuth (Google/GitHub)',
      criadoEm: u.createdAt,
      matchExato: u.email.toLowerCase() === emailToTest.toLowerCase()
    }));
    
    // 4. Verificar tokens de reset gerados
    console.log(`[DIAGNOSE] Verificando tokens de reset...`);
    const tokens = await prisma.passwordReset.findMany({
      where: {
        email: {
          contains: emailToTest.split('@')[0],
          mode: 'insensitive'
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        email: true,
        token: true,
        createdAt: true,
        expires: true,
        used: true,
        usedAt: true
      }
    });
    
    diagnostico.resultados.tokensDeReset = tokens.map(t => ({
      email: t.email,
      tokenPreview: t.token.substring(0, 20) + '...',
      criadoEm: t.createdAt,
      expiraEm: t.expires,
      expirado: t.expires < new Date(),
      usado: t.used,
      usadoEm: t.usedAt,
      linkReset: t.used ? null : `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${t.token}`
    }));
    
    // 5. Verificar configuração SMTP
    diagnostico.resultados.configuracaoSMTP = {
      host: process.env.SMTP_HOST || '❌ NÃO CONFIGURADO',
      port: process.env.SMTP_PORT || '❌ NÃO CONFIGURADO',
      user: process.env.SMTP_USER || '❌ NÃO CONFIGURADO',
      passConfigurado: !!process.env.SMTP_PASS,
      fromName: process.env.EMAIL_FROM_NAME || 'SimplifiqueIA'
    };
    
    // 6. Análise e recomendações
    const foundUser = userExact || userLower || allUsers.find(u => 
      u.email.toLowerCase() === emailToTest.toLowerCase()
    );
    
    if (!foundUser) {
      diagnostico.analise = {
        status: 'ERRO',
        problema: 'Email não existe no banco de dados',
        solucoes: [
          'Verificar se o email foi digitado corretamente',
          'Verificar se o usuário completou o cadastro',
          'Verificar emails similares na lista acima'
        ]
      };
    } else if (!foundUser.password) {
      diagnostico.analise = {
        status: 'AVISO',
        problema: 'Usuário existe mas usa login OAuth (Google/GitHub)',
        solucoes: [
          'Usuário deve fazer login com o provedor OAuth',
          'Não é possível redefinir senha para contas OAuth',
          'Se quiser usar email/senha, criar nova conta'
        ]
      };
    } else if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      diagnostico.analise = {
        status: 'ERRO',
        problema: 'Configuração SMTP incompleta ou ausente',
        solucoes: [
          'Configurar variáveis SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS',
          'Verificar arquivo .env.production',
          'Testar conexão SMTP'
        ]
      };
    } else if (tokens.length > 0 && !tokens[0].used) {
      diagnostico.analise = {
        status: 'SUCESSO_PARCIAL',
        problema: 'Token foi gerado mas email pode não ter sido enviado',
        solucoes: [
          'Verificar caixa de spam do destinatário',
          'Verificar logs do servidor de email',
          'Usar o link de reset manual fornecido acima',
          'Testar envio de email com script de teste'
        ],
        linkResetManual: tokens[0].expires > new Date() 
          ? `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${tokens[0].token}`
          : 'Token expirado - solicitar novo'
      };
    } else {
      diagnostico.analise = {
        status: 'SUCESSO',
        problema: 'Usuário existe e está configurado corretamente',
        solucoes: [
          'Sistema deve funcionar normalmente',
          'Se não recebeu email, verificar spam',
          'Tentar solicitar nova recuperação de senha'
        ]
      };
    }
    
    console.log('[DIAGNOSE] Diagnóstico completo:', JSON.stringify(diagnostico, null, 2));
    
    return NextResponse.json(diagnostico, { status: 200 });
    
  } catch (error) {
    console.error('[DIAGNOSE] Erro ao executar diagnóstico:', error);
    
    return NextResponse.json({
      error: 'Erro ao executar diagnóstico',
      detalhes: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
