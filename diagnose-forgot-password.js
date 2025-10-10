/**
 * Script de Diagnóstico - Esqueci Minha Senha
 * 
 * Verifica:
 * 1. Se o email existe no banco (com/sem case sensitivity)
 * 2. Se o usuário tem senha (não é OAuth)
 * 3. Se tokens foram gerados
 * 4. Configuração SMTP
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
  const emailToTest = 'paulo.reis@om30.com.br';
  
  console.log('\n🔍 DIAGNÓSTICO: Esqueci Minha Senha\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Verificar email exato (case sensitive)
    console.log('\n1️⃣ Buscando email EXATO (case sensitive)...');
    const userExact = await prisma.user.findFirst({
      where: { email: emailToTest }
    });
    
    if (userExact) {
      console.log('✅ Email encontrado EXATAMENTE como:', userExact.email);
      console.log('   - ID:', userExact.id);
      console.log('   - Nome:', userExact.name);
      console.log('   - Tem senha?', userExact.password ? 'SIM' : 'NÃO (OAuth)');
    } else {
      console.log('❌ Email NÃO encontrado com case exato');
    }
    
    // 2. Verificar email lowercase
    console.log('\n2️⃣ Buscando email em LOWERCASE...');
    const userLower = await prisma.user.findUnique({
      where: { email: emailToTest.toLowerCase() }
    });
    
    if (userLower) {
      console.log('✅ Email encontrado em lowercase:', userLower.email);
      console.log('   - ID:', userLower.id);
      console.log('   - Nome:', userLower.name);
      console.log('   - Tem senha?', userLower.password ? 'SIM' : 'NÃO (OAuth)');
    } else {
      console.log('❌ Email NÃO encontrado em lowercase');
    }
    
    // 3. Buscar TODOS os emails similares (case insensitive)
    console.log('\n3️⃣ Buscando emails SIMILARES (ignorando case)...');
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true, password: true }
    });
    
    const similar = allUsers.filter(u => 
      u.email.toLowerCase() === emailToTest.toLowerCase()
    );
    
    if (similar.length > 0) {
      console.log(`✅ Encontrados ${similar.length} email(s) similar(es):`);
      similar.forEach(u => {
        console.log(`   - Email no banco: "${u.email}"`);
        console.log(`     ID: ${u.id}`);
        console.log(`     Nome: ${u.name}`);
        console.log(`     Tem senha? ${u.password ? 'SIM' : 'NÃO (OAuth)'}`);
      });
    } else {
      console.log('❌ Nenhum email similar encontrado');
    }
    
    // 4. Verificar tokens de reset gerados
    console.log('\n4️⃣ Verificando tokens de reset gerados...');
    const tokens = await prisma.passwordReset.findMany({
      where: {
        email: {
          contains: 'paulo.reis',
          mode: 'insensitive'
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    if (tokens.length > 0) {
      console.log(`✅ Encontrados ${tokens.length} token(s) de reset:`);
      tokens.forEach((t, i) => {
        console.log(`\n   Token ${i + 1}:`);
        console.log(`   - Email: ${t.email}`);
        console.log(`   - Criado em: ${t.createdAt.toLocaleString('pt-BR')}`);
        console.log(`   - Expira em: ${t.expires.toLocaleString('pt-BR')}`);
        console.log(`   - Usado? ${t.used ? 'SIM' : 'NÃO'}`);
        console.log(`   - Token: ${t.token.substring(0, 20)}...`);
      });
    } else {
      console.log('❌ Nenhum token de reset encontrado');
    }
    
    // 5. Verificar configuração SMTP
    console.log('\n5️⃣ Verificando configuração SMTP...');
    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: process.env.EMAIL_FROM_NAME
    };
    
    console.log('   Configuração atual:');
    console.log('   - SMTP_HOST:', smtpConfig.host || '❌ NÃO CONFIGURADO');
    console.log('   - SMTP_PORT:', smtpConfig.port || '❌ NÃO CONFIGURADO');
    console.log('   - SMTP_USER:', smtpConfig.user || '❌ NÃO CONFIGURADO');
    console.log('   - EMAIL_FROM_NAME:', smtpConfig.from || '❌ NÃO CONFIGURADO');
    console.log('   - SMTP_PASS:', process.env.SMTP_PASS ? '✅ CONFIGURADO' : '❌ NÃO CONFIGURADO');
    
    // 6. Resumo e recomendações
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DO DIAGNÓSTICO\n');
    
    const foundUser = userExact || userLower || similar[0];
    
    if (!foundUser) {
      console.log('❌ PROBLEMA: Email não existe no banco de dados');
      console.log('\n💡 SOLUÇÃO:');
      console.log('   1. Verificar se o email foi digitado corretamente');
      console.log('   2. Verificar se o usuário completou o cadastro');
      console.log('   3. Buscar no banco por emails similares');
    } else if (!foundUser.password) {
      console.log('⚠️  PROBLEMA: Usuário existe mas usa login OAuth (Google/GitHub)');
      console.log('\n💡 SOLUÇÃO:');
      console.log('   1. Usuário deve fazer login com o provedor OAuth');
      console.log('   2. Não é possível redefinir senha para contas OAuth');
    } else if (!smtpConfig.host || !smtpConfig.user) {
      console.log('❌ PROBLEMA: Configuração SMTP incompleta');
      console.log('\n💡 SOLUÇÃO:');
      console.log('   1. Configurar variáveis de ambiente SMTP no .env.production');
      console.log('   2. Verificar credenciais do servidor de email');
    } else if (tokens.length > 0) {
      console.log('✅ Token foi gerado! Email pode ter falhado no envio');
      console.log('\n💡 SOLUÇÃO:');
      console.log('   1. Verificar logs do servidor de email');
      console.log('   2. Verificar caixa de spam do destinatário');
      console.log('   3. Testar envio de email com script de teste');
      console.log(`   4. Link de reset: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${tokens[0].token}`);
    } else {
      console.log('⚠️  Usuário existe mas nenhum token foi gerado');
      console.log('\n💡 SOLUÇÃO:');
      console.log('   1. Verificar logs da API /api/auth/forgot-password');
      console.log('   2. Tentar novamente a recuperação de senha');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ ERRO ao executar diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar diagnóstico
diagnose().catch(console.error);
