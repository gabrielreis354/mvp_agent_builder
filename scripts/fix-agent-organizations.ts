/**
 * Script de Migração: Corrigir organizationId dos Agentes
 * 
 * Problema: Agentes antigos podem não ter organizationId correto
 * Solução: Atualizar organizationId baseado no usuário dono
 * 
 * Como executar:
 * npx ts-node scripts/fix-agent-organizations.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateAgentOrganizations() {
  console.log('🔄 Iniciando migração de organizationId dos agentes...\n');

  try {
    // 1. Buscar todos os agentes com seus donos
    const agents = await prisma.agent.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            organizationId: true
          }
        }
      }
    }) as Array<{
      id: string;
      name: string;
      organizationId: string | null;
      user: {
        id: string;
        email: string;
        organizationId: string | null;
      };
    }>;

    console.log(`📊 Total de agentes encontrados: ${agents.length}\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    // 2. Para cada agente, garantir que organizationId está correto
    for (const agent of agents) {
      try {
        // Se agente não tem organizationId OU está diferente do dono
        if (!agent.organizationId || agent.organizationId !== agent.user.organizationId) {
          
          if (!agent.user.organizationId) {
            const msg = `⚠️ Agente "${agent.name}" (${agent.id}) - Usuário ${agent.user.email} não tem organizationId`;
            console.log(msg);
            errorDetails.push(msg);
            errors++;
            continue;
          }

          console.log(`🔄 Atualizando agente "${agent.name}" (${agent.id})`);
          console.log(`   Dono: ${agent.user.email}`);
          console.log(`   De: ${agent.organizationId || 'NULL'} → Para: ${agent.user.organizationId}\n`);

          await prisma.agent.update({
            where: { id: agent.id },
            data: { organizationId: agent.user.organizationId }
          });

          updated++;
        } else {
          skipped++;
        }
      } catch (error) {
        const msg = `❌ Erro ao atualizar agente ${agent.id}: ${error}`;
        console.error(msg);
        errorDetails.push(msg);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migração concluída!');
    console.log('='.repeat(60));
    console.log(`\n📊 Estatísticas:`);
    console.log(`   ✅ Atualizados: ${updated}`);
    console.log(`   ⏭️  Já corretos: ${skipped}`);
    console.log(`   ❌ Erros: ${errors}`);

    if (errorDetails.length > 0) {
      console.log(`\n⚠️ Detalhes dos erros:`);
      errorDetails.forEach(detail => console.log(`   ${detail}`));
    }

    // 3. Verificação final
    console.log('\n' + '='.repeat(60));
    console.log('🔍 Verificação Final');
    console.log('='.repeat(60));

    // Verificar agentes sem organizationId usando raw query
    const agentsCheck = await prisma.$queryRaw<Array<{count: bigint}>>`
      SELECT COUNT(*) as count FROM agents WHERE "organizationId" IS NULL
    `;
    const agentsWithoutOrg = Number(agentsCheck[0].count);

    const usersCheck = await prisma.$queryRaw<Array<{count: bigint}>>`
      SELECT COUNT(*) as count FROM users WHERE "organizationId" IS NULL
    `;
    const usersWithoutOrg = Number(usersCheck[0].count);

    console.log(`\n📊 Agentes sem organizationId: ${agentsWithoutOrg}`);
    console.log(`📊 Usuários sem organizationId: ${usersWithoutOrg}`);

    if (agentsWithoutOrg > 0) {
      console.log('\n⚠️ ATENÇÃO: Ainda existem agentes sem organizationId!');
      console.log('   Isso pode indicar que os usuários donos também não têm organizationId.');
      console.log('   Verifique manualmente esses casos.');
    } else {
      console.log('\n✅ Todos os agentes têm organizationId correto!');
    }

    // 4. Estatísticas por organização
    const agentsByOrg = await prisma.agent.groupBy({
      by: ['organizationId'],
      _count: {
        id: true
      }
    });

    console.log('\n📊 Agentes por Organização:');
    for (const org of agentsByOrg) {
      const orgData = await prisma.organization.findUnique({
        where: { id: org.organizationId },
        select: { name: true }
      });
      console.log(`   ${orgData?.name || org.organizationId}: ${org._count.id} agentes`);
    }

  } catch (error) {
    console.error('\n❌ Erro na migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
console.log('╔' + '═'.repeat(60) + '╗');
console.log('║  SCRIPT DE MIGRAÇÃO - ORGANIZATIONID DOS AGENTES         ║');
console.log('╚' + '═'.repeat(60) + '╝\n');

migrateAgentOrganizations()
  .then(() => {
    console.log('\n✅ Script finalizado com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script falhou:', error);
    process.exit(1);
  });
