import { PrismaClient } from '@prisma/client';
import { agentTemplates } from '../templates';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default organizations
  let adminOrg = await prisma.organization.findFirst({ where: { name: 'AutomateAI Internal' } });
  if (!adminOrg) {
    adminOrg = await prisma.organization.create({ data: { name: 'AutomateAI Internal' } });
  }

  let demoOrg = await prisma.organization.findFirst({ where: { name: 'Demo Organization' } });
  if (!demoOrg) {
    demoOrg = await prisma.organization.create({ data: { name: 'Demo Organization' } });
  }

  console.log('✅ Created default organizations');

  // Create system admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mvp-agent-builder.com' },
    update: {},
    create: {
      email: 'admin@mvp-agent-builder.com',
      name: 'System Administrator',
      role: 'SUPER_ADMIN',
      organizationId: adminOrg.id,
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@mvp-agent-builder.com' },
    update: {},
    create: {
      email: 'demo@mvp-agent-builder.com',
      name: 'Demo User',
      role: 'USER',
      organizationId: demoOrg.id,
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Seed agent templates
  console.log('🔄 Seeding agent templates...');
  
  for (const template of agentTemplates) {
    // Extract inputSchema and outputSchema from nodes
    const inputNode = template.nodes.find(node => node.data.nodeType === 'input');
    const outputNode = template.nodes.find(node => node.data.nodeType === 'output');

    await prisma.agentTemplate.upsert({
      where: { id: template.id },
      update: {
        name: template.name,
        description: template.description,
        category: template.category,
        difficulty: template.difficulty || 'beginner',
        tags: template.tags || [],
        nodes: template.nodes as any,
        edges: template.edges as any,
        inputSchema: inputNode?.data.inputSchema || template.inputSchema,
        outputSchema: outputNode?.data.outputSchema || template.outputSchema,
      },
      create: {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        difficulty: template.difficulty || 'beginner',
        tags: template.tags || [],
        nodes: template.nodes as any,
        edges: template.edges as any,
        inputSchema: inputNode?.data.inputSchema || template.inputSchema,
        outputSchema: outputNode?.data.outputSchema || template.outputSchema,
      },
    });
  }

  console.log(`✅ Seeded ${agentTemplates.length} agent templates`);

  // Create sample agents from templates
  console.log('🔄 Creating sample agents...');

  const sampleAgents = [
    {
      templateId: 'contract-analyzer',
      name: 'Analisador de Contratos RH - Demo',
      description: 'Versão demonstrativa do analisador de contratos para RH',
      isPublic: true,
    },
    {
      templateId: 'recruitment-screening',
      name: 'Triagem de Currículos - Demo',
      description: 'Sistema demo para triagem automática de currículos',
      isPublic: true,
    },
  ];

  for (const sampleAgent of sampleAgents) {
    const template = agentTemplates.find(t => t.id === sampleAgent.templateId);
    if (template) {
      // Extract inputSchema and outputSchema from nodes
      const inputNode = template.nodes.find(node => node.data.nodeType === 'input');
      const outputNode = template.nodes.find(node => node.data.nodeType === 'output');

      await prisma.agent.upsert({
        where: { 
          id: `${sampleAgent.templateId}-demo`,
        },
        update: {},
        create: {
          id: `${sampleAgent.templateId}-demo`,
          name: sampleAgent.name,
          description: sampleAgent.description,
          category: template.category,
          isPublic: sampleAgent.isPublic,
          isTemplate: false,
          tags: template.tags || [],
          nodes: template.nodes as any,
          edges: template.edges as any,
          inputSchema: inputNode?.data.inputSchema || template.inputSchema,
          outputSchema: outputNode?.data.outputSchema || template.outputSchema,
          userId: demoUser.id,
          organizationId: demoOrg.id,
        },
      });
    }
  }

  console.log('✅ Created sample agents');

  // Seed system configuration
  console.log('🔄 Seeding system configuration...');

  const systemConfigs = [
    {
      key: 'app.name',
      value: 'MVP Agent Builder',
      description: 'Application name',
      category: 'general',
      isPublic: true,
    },
    {
      key: 'app.version',
      value: '1.0.0',
      description: 'Application version',
      category: 'general',
      isPublic: true,
    },
    {
      key: 'features.async_execution',
      value: true,
      description: 'Enable asynchronous agent execution',
      category: 'features',
      isPublic: false,
    },
    {
      key: 'features.ai_providers',
      value: ['openai', 'anthropic', 'google'],
      description: 'Supported AI providers',
      category: 'features',
      isPublic: true,
    },
    {
      key: 'limits.max_agents_per_user',
      value: 100,
      description: 'Maximum agents per user',
      category: 'limits',
      isPublic: false,
    },
    {
      key: 'limits.max_executions_per_day',
      value: 1000,
      description: 'Maximum executions per user per day',
      category: 'limits',
      isPublic: false,
    },
    {
      key: 'queue.max_concurrent_jobs',
      value: 5,
      description: 'Maximum concurrent queue jobs',
      category: 'queue',
      isPublic: false,
    },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {
        value: config.value,
        description: config.description,
        category: config.category,
        isPublic: config.isPublic,
      },
      create: {
        key: config.key,
        value: config.value,
        description: config.description,
        category: config.category,
        isPublic: config.isPublic,
      },
    });
  }

  console.log('✅ Seeded system configuration');

  // Initialize usage metrics for current date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.usageMetrics.upsert({
    where: { date: today },
    update: {},
    create: {
      date: today,
      activeUsers: 2,
      newUsers: 2,
      agentsCreated: sampleAgents.length,
    },
  });

  console.log('✅ Initialized usage metrics');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
