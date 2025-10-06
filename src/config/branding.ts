/**
 * Configuração de Branding - SimplifiqueIA RH
 * 
 * Centralize todas as referências de marca aqui para facilitar
 * futuras mudanças de branding.
 */

export const BRANDING = {
  // Nome da Plataforma
  platform: {
    name: 'SimplifiqueIA',
    fullName: 'SimplifiqueIA RH',
    tagline: 'O Canva da Automação para RH',
    description: 'Plataforma de automação inteligente para Recursos Humanos',
  },

  // URLs e Domínios
  urls: {
    website: 'https://simplifiqueia.com.br',
    app: 'https://rh.simplifiqueia.com.br',
    docs: 'https://docs.simplifiqueia.com.br',
    support: 'https://suporte.simplifiqueia.com.br',
  },

  // Contato
  contact: {
    email: 'contato@simplifiqueia.com.br',
    supportEmail: 'suporte@simplifiqueia.com.br',
    salesEmail: 'vendas@simplifiqueia.com.br',
  },

  // Redes Sociais
  social: {
    linkedin: 'https://linkedin.com/company/simplifiqueia',
    instagram: 'https://instagram.com/simplifiqueia',
    twitter: 'https://twitter.com/simplifiqueia',
    youtube: 'https://youtube.com/@simplifiqueia',
  },

  // SEO e Metadados
  seo: {
    title: 'SimplifiqueIA RH - Automação Inteligente para Recursos Humanos',
    description: 'Automatize processos de RH com inteligência artificial. Análise de currículos, contratos, folha de pagamento e muito mais. Interface visual simples, sem código.',
    keywords: [
      'automação rh',
      'inteligência artificial rh',
      'análise de currículos',
      'gestão de pessoas',
      'automação recursos humanos',
      'ia para rh',
      'simplifique rh',
    ],
    ogImage: '/og-image-simplifiqueia-rh.png',
  },

  // Mensagens de Interface
  messages: {
    welcome: 'Bem-vindo ao SimplifiqueIA RH',
    loginTitle: 'Entre no SimplifiqueIA RH',
    signupTitle: 'Crie sua conta no SimplifiqueIA RH',
    builderTitle: 'Construtor de Agentes - SimplifiqueIA RH',
    dashboardTitle: 'Painel - SimplifiqueIA RH',
  },

  // Features e Benefícios
  features: {
    tagline1: 'Simplifique seu RH com IA',
    tagline2: 'Automatize processos em minutos, não em dias',
    tagline3: 'Interface visual intuitiva, sem necessidade de código',
  },

  // Empresa
  company: {
    name: 'SimplifiqueIA',
    legalName: 'SimplifiqueIA Tecnologia Ltda',
    cnpj: '', // Adicionar quando disponível
    address: '', // Adicionar quando disponível
  },

  // Versão do Produto
  product: {
    version: '1.0.0',
    vertical: 'RH',
    releaseDate: '2025',
  },
} as const

// Tipo para autocompletar
export type BrandingConfig = typeof BRANDING
