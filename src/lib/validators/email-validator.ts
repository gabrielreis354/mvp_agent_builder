/**
 * 🔐 VALIDADOR DE EMAIL CORPORATIVO
 * 
 * Garante que apenas usuários com emails corporativos válidos
 * possam se cadastrar na plataforma SimplifiqueIA RH.
 * 
 * Critérios de validação:
 * 1. Formato de email válido
 * 2. Não permite emails de provedores gratuitos (Gmail, Outlook, etc.)
 * 3. Verifica se o domínio existe (DNS MX record)
 * 4. Lista de domínios corporativos conhecidos (whitelist)
 */

import dns from 'dns'
import { promisify } from 'util'

const resolveMx = promisify(dns.resolveMx)

// 🚫 PROVEDORES GRATUITOS BLOQUEADOS
const FREE_EMAIL_PROVIDERS = [
  // Gmail e variações
  'gmail.com', 'googlemail.com',
  
  // Outlook/Hotmail/Live
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  
  // Yahoo
  'yahoo.com', 'yahoo.com.br', 'ymail.com', 'rocketmail.com',
  
  // Provedores brasileiros gratuitos
  'bol.com.br', 'uol.com.br', 'ig.com.br', 'terra.com.br',
  'globo.com', 'globomail.com', 'r7.com',
  
  // Outros provedores gratuitos internacionais
  'aol.com', 'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'mail.com', 'gmx.com', 'zoho.com',
  'yandex.com', 'mail.ru',
  
  // Emails temporários/descartáveis
  'tempmail.com', 'guerrillamail.com', '10minutemail.com',
  'mailinator.com', 'throwaway.email', 'temp-mail.org'
]

// ✅ DOMÍNIOS CORPORATIVOS CONHECIDOS (Whitelist opcional)
const KNOWN_CORPORATE_DOMAINS = [
  // Grandes empresas brasileiras
  'petrobras.com.br', 'vale.com', 'itau.com.br', 'bradesco.com.br',
  'santander.com.br', 'ambev.com.br', 'jbs.com.br', 'embraer.com.br',
  
  // Empresas de tecnologia
  'totvs.com.br', 'stefanini.com', 'ci&t.com', 'thoughtworks.com',
  
  // Adicione domínios de clientes conhecidos aqui
]

export interface EmailValidationResult {
  isValid: boolean
  isCorporate: boolean
  domain: string
  error?: string
  warnings?: string[]
  suggestions?: string[]
}

/**
 * Valida se um email é corporativo e válido
 */
export async function validateCorporateEmail(email: string): Promise<EmailValidationResult> {
  const warnings: string[] = []
  const suggestions: string[] = []
  
  // 1. Validação básica de formato
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      isCorporate: false,
      domain: '',
      error: 'Formato de email inválido'
    }
  }
  
  // 2. Extrair domínio
  const domain = email.split('@')[1].toLowerCase()
  
  // 3. Verificar se é provedor gratuito (BLOQUEADO)
  if (FREE_EMAIL_PROVIDERS.includes(domain)) {
    return {
      isValid: false,
      isCorporate: false,
      domain,
      error: 'Email corporativo obrigatório. Emails gratuitos (Gmail, Outlook, etc.) não são permitidos.',
      suggestions: [
        'Use seu email corporativo (ex: seu.nome@suaempresa.com.br)',
        'Se sua empresa não possui email corporativo, entre em contato com nosso suporte'
      ]
    }
  }
  
  // 4. Verificar se domínio existe (DNS MX record)
  try {
    const mxRecords = await resolveMx(domain)
    
    if (!mxRecords || mxRecords.length === 0) {
      return {
        isValid: false,
        isCorporate: false,
        domain,
        error: 'Domínio de email não possui servidor de email configurado',
        suggestions: [
          'Verifique se digitou o email corretamente',
          'Entre em contato com o TI da sua empresa'
        ]
      }
    }
    
    // Verificar se MX aponta para provedor gratuito (Gmail for Business, etc.)
    const mxHosts = mxRecords.map(r => r.exchange.toLowerCase())
    const usesGmailInfra = mxHosts.some(host => 
      host.includes('google.com') || host.includes('googlemail.com')
    )
    const usesOutlookInfra = mxHosts.some(host => 
      host.includes('outlook.com') || host.includes('microsoft.com')
    )
    
    if (usesGmailInfra) {
      warnings.push('Email usa infraestrutura do Google Workspace (válido para empresas)')
    }
    if (usesOutlookInfra) {
      warnings.push('Email usa infraestrutura do Microsoft 365 (válido para empresas)')
    }
    
  } catch (error) {
    console.error('🔍 [EmailValidator] Erro ao verificar DNS MX:', error)
    
    // 🔒 SEGURANÇA: BLOQUEAR se não conseguir verificar DNS
    // Domínio provavelmente não existe ou está mal configurado
    return {
      isValid: false,
      isCorporate: false,
      domain,
      error: 'Não foi possível verificar o domínio de email. O domínio pode não existir ou estar mal configurado.',
      suggestions: [
        'Verifique se digitou o email corretamente',
        'Confirme que o domínio da empresa está ativo',
        'Entre em contato com o TI da sua empresa',
        'Se o problema persistir, contate nosso suporte: suporte@simplifiqueia.com.br'
      ]
    }
  }
  
  // 5. Verificar se está na whitelist de domínios conhecidos
  const isKnownCorporate = KNOWN_CORPORATE_DOMAINS.includes(domain)
  if (isKnownCorporate) {
    console.log(`✅ [EmailValidator] Domínio corporativo conhecido: ${domain}`)
  }
  
  // 6. Validações adicionais de segurança
  
  // Verificar se domínio tem TLD válido
  const tld = domain.split('.').pop()
  if (tld && tld.length < 2) {
    return {
      isValid: false,
      isCorporate: false,
      domain,
      error: 'Domínio inválido'
    }
  }
  
  // Verificar se domínio tem pelo menos 2 partes (nome.tld)
  const domainParts = domain.split('.')
  if (domainParts.length < 2) {
    return {
      isValid: false,
      isCorporate: false,
      domain,
      error: 'Domínio incompleto'
    }
  }
  
  // ✅ Email corporativo válido!
  console.log(`✅ [EmailValidator] Email corporativo válido: ${email}`)
  
  return {
    isValid: true,
    isCorporate: true,
    domain,
    warnings: warnings.length > 0 ? warnings : undefined,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  }
}

/**
 * Versão síncrona simplificada (sem verificação DNS)
 * Útil para validação rápida no frontend
 */
export function validateCorporateEmailSync(email: string): Pick<EmailValidationResult, 'isValid' | 'isCorporate' | 'domain' | 'error'> {
  // Validação básica de formato
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      isCorporate: false,
      domain: '',
      error: 'Formato de email inválido'
    }
  }
  
  // Extrair domínio
  const domain = email.split('@')[1].toLowerCase()
  
  // Verificar se é provedor gratuito
  if (FREE_EMAIL_PROVIDERS.includes(domain)) {
    return {
      isValid: false,
      isCorporate: false,
      domain,
      error: 'Email corporativo obrigatório. Emails gratuitos não são permitidos.'
    }
  }
  
  // Validação básica de domínio
  const domainParts = domain.split('.')
  if (domainParts.length < 2) {
    return {
      isValid: false,
      isCorporate: false,
      domain,
      error: 'Domínio incompleto'
    }
  }
  
  return {
    isValid: true,
    isCorporate: true,
    domain
  }
}

/**
 * Adiciona domínio à whitelist de domínios corporativos conhecidos
 * (Útil para adicionar clientes dinamicamente)
 */
export function addToWhitelist(domain: string): void {
  const normalizedDomain = domain.toLowerCase()
  if (!KNOWN_CORPORATE_DOMAINS.includes(normalizedDomain)) {
    KNOWN_CORPORATE_DOMAINS.push(normalizedDomain)
    console.log(`✅ [EmailValidator] Domínio adicionado à whitelist: ${normalizedDomain}`)
  }
}

/**
 * Verifica se um domínio está na whitelist
 */
export function isWhitelisted(domain: string): boolean {
  return KNOWN_CORPORATE_DOMAINS.includes(domain.toLowerCase())
}
