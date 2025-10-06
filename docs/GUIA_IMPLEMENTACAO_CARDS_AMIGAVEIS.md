# 🛠️ Guia de Implementação: Cards Amigáveis

## 📋 Checklist de Implementação

### **Fase 1: Preparação (1 dia)**
- [x] Criar arquivo `friendly-nodes.ts` com definições dos cards
- [x] Criar componente `FriendlyNodePalette.tsx`
- [x] Documentar proposta completa
- [ ] Revisar e aprovar proposta com stakeholders
- [ ] Criar issues no GitHub para tracking

### **Fase 2: Implementação Core (3 dias)**
- [ ] Integrar `FriendlyNodePalette` no builder
- [ ] Adicionar toggle de modo (Simples/Avançado)
- [ ] Implementar mapeamento de cards amigáveis → técnicos
- [ ] Atualizar `CustomNode` para suportar novos ícones
- [ ] Criar presets de configuração para cards especializados

### **Fase 3: Templates Especializados (2 dias)**
- [ ] Criar template "Análise de Contrato Completa"
- [ ] Criar template "Triagem de Currículos"
- [ ] Criar template "Auditoria de Folha"
- [ ] Adicionar botões de quick-start na paleta

### **Fase 4: Testes (2 dias)**
- [ ] Testes unitários dos novos componentes
- [ ] Testes de integração com builder existente
- [ ] Testes de UX com usuários piloto
- [ ] Ajustes baseados em feedback

### **Fase 5: Deploy (1 dia)**
- [ ] Code review
- [ ] Merge para staging
- [ ] Testes em ambiente de staging
- [ ] Deploy para produção
- [ ] Monitoramento de métricas

---

## 🔧 Implementação Técnica Detalhada

### **1. Integração no Builder**

#### **Arquivo: `src/app/builder/page.tsx`**

```typescript
import { FriendlyNodePalette } from '@/components/agent-builder/friendly-node-palette'
import { NodePalette } from '@/components/agent-builder/node-palette'

export default function BuilderPage() {
  const [useFriendlyMode, setUseFriendlyMode] = useState(true)

  return (
    <div className="flex h-screen">
      {/* Sidebar com paleta de nodes */}
      <div className="w-80 bg-gray-900 border-r border-gray-700">
        {useFriendlyMode ? <FriendlyNodePalette /> : <NodePalette />}
      </div>
      
      {/* Canvas */}
      <div className="flex-1">
        <VisualCanvas />
      </div>
    </div>
  )
}
```

---

### **2. Mapeamento de Cards Amigáveis → Técnicos**

#### **Arquivo: `src/lib/friendly-node-mapper.ts`**

```typescript
import { AgentNode } from '@/types/agent'

export interface FriendlyNodeConfig {
  friendlyType: string
  underlyingType: 'input' | 'ai' | 'logic' | 'api' | 'output'
  preset: Partial<AgentNode['data']>
}

export const friendlyNodeConfigs: Record<string, FriendlyNodeConfig> = {
  'receive-document': {
    friendlyType: 'receive-document',
    underlyingType: 'input',
    preset: {
      label: 'Receber Documento',
      inputSchema: {
        type: 'object',
        properties: {
          file: { 
            type: 'string', 
            format: 'binary',
            description: 'Arquivo PDF, Word ou Excel'
          }
        },
        required: ['file']
      }
    }
  },
  
  'analyze-contract': {
    friendlyType: 'analyze-contract',
    underlyingType: 'ai',
    preset: {
      label: 'Analisar Contrato',
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.3,
      prompt: `Analise este contrato trabalhista brasileiro e extraia:
1. Dados do funcionário (nome, CPF, cargo, salário)
2. Dados da empresa (razão social, CNPJ)
3. Cláusulas principais
4. Conformidade com CLT
5. Riscos identificados

Retorne em formato JSON estruturado.`
    }
  },
  
  'validate-clt': {
    friendlyType: 'validate-clt',
    underlyingType: 'logic',
    preset: {
      label: 'Validar CLT',
      logicType: 'validate',
      validation: `
        // Validações CLT
        const errors = [];
        
        // Salário mínimo
        if (data.salary < 1412) {
          errors.push('Salário abaixo do mínimo legal');
        }
        
        // Jornada de trabalho
        if (data.workHours > 44) {
          errors.push('Jornada semanal acima do permitido (44h)');
        }
        
        // Período de experiência
        if (data.trialPeriod > 90) {
          errors.push('Período de experiência acima de 90 dias');
        }
        
        return {
          isValid: errors.length === 0,
          errors,
          compliance: errors.length === 0 ? 'Conforme CLT' : 'Não conforme'
        };
      `
    }
  },
  
  'send-email': {
    friendlyType: 'send-email',
    underlyingType: 'api',
    preset: {
      label: 'Enviar Email',
      apiEndpoint: '/api/send-email',
      apiMethod: 'POST',
      apiHeaders: {
        'Content-Type': 'application/json'
      },
      // Template de email padrão
      apiBody: {
        to: '{{email_gestor}}',
        subject: 'Análise de Contrato - {{nome_funcionario}}',
        template: 'contract-analysis',
        data: '{{analysis_result}}'
      }
    }
  },
  
  'generate-pdf': {
    friendlyType: 'generate-pdf',
    underlyingType: 'output',
    preset: {
      label: 'Gerar PDF',
      outputSchema: {
        type: 'object',
        properties: {
          pdf: { 
            type: 'string', 
            format: 'binary',
            description: 'Relatório em PDF'
          },
          filename: {
            type: 'string',
            description: 'Nome do arquivo gerado'
          }
        }
      },
      // Configuração do gerador de PDF
      pdfConfig: {
        template: 'professional-report',
        orientation: 'portrait',
        format: 'A4',
        includeHeader: true,
        includeFooter: true
      }
    }
  }
}

// Função para criar node a partir de tipo amigável
export function createFriendlyNode(
  friendlyType: string,
  position: { x: number; y: number }
): AgentNode {
  const config = friendlyNodeConfigs[friendlyType]
  
  if (!config) {
    throw new Error(`Unknown friendly node type: ${friendlyType}`)
  }
  
  return {
    id: `${friendlyType}-${Date.now()}`,
    type: 'customNode',
    position,
    data: {
      ...config.preset,
      nodeType: config.underlyingType,
      friendlyType: config.friendlyType
    }
  }
}
```

---

### **3. Atualização do CustomNode**

#### **Arquivo: `src/components/agent-builder/custom-node.tsx`**

```typescript
// Adicionar novos ícones
import { 
  FileText, 
  MessageSquare, 
  FileCheck, 
  UserCheck,
  DollarSign,
  Scale,
  CheckCircle,
  Send,
  FileOutput,
  Database,
  Bell
} from 'lucide-react'

// Mapa estendido de ícones
const friendlyIconMap = {
  'receive-document': FileText,
  'receive-text': MessageSquare,
  'analyze-contract': FileCheck,
  'analyze-resume': UserCheck,
  'analyze-expenses': DollarSign,
  'validate-clt': Scale,
  'verify-data': CheckCircle,
  'send-email': Send,
  'generate-pdf': FileOutput,
  'save-database': Database,
  'send-notification': Bell
}

// Atualizar componente para usar ícone amigável
export function CustomNode({ data, selected }: CustomNodeProps) {
  const friendlyType = data.friendlyType
  const IconComponent = friendlyType 
    ? friendlyIconMap[friendlyType] 
    : iconMap[data.nodeType]
  
  // Usar label amigável se disponível
  const displayLabel = data.friendlyLabel || data.label
  
  return (
    <div className="...">
      {/* Renderizar com ícone e label amigáveis */}
    </div>
  )
}
```

---

### **4. API de Envio de Email**

#### **Arquivo: `src/app/api/send-email/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, template, data } = await request.json()
    
    // Validação
    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: to, subject' },
        { status: 400 }
      )
    }
    
    // Configurar transporter (usar variáveis de ambiente)
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
    
    // Renderizar template
    const htmlContent = renderEmailTemplate(template, data)
    
    // Enviar email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: htmlContent
    })
    
    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Falha ao enviar email' },
      { status: 500 }
    )
  }
}

function renderEmailTemplate(template: string, data: any): string {
  // Templates de email
  const templates: Record<string, (data: any) => string> = {
    'contract-analysis': (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { padding: 20px; text-align: center; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Análise de Contrato Concluída</h1>
          </div>
          <div class="content">
            <p>Olá,</p>
            <p>A análise do contrato de <strong>${data.nome_funcionario}</strong> foi concluída.</p>
            <h3>Resumo:</h3>
            <ul>
              <li><strong>Cargo:</strong> ${data.cargo}</li>
              <li><strong>Salário:</strong> ${data.salario}</li>
              <li><strong>Conformidade CLT:</strong> ${data.conformidade}</li>
            </ul>
            <p>O relatório completo está em anexo.</p>
          </div>
          <div class="footer">
            <p>AutomateAI - Automação Inteligente para RH</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
  
  return templates[template]?.(data) || '<p>Template não encontrado</p>'
}
```

---

### **5. Variáveis de Ambiente**

#### **Arquivo: `.env.local`**

```bash
# SMTP Configuration (para envio de emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
SMTP_FROM="AutomateAI <noreply@automateai.com>"

# Rate Limiting (emails)
EMAIL_RATE_LIMIT=100  # máximo de emails por hora
```

---

## 🧪 Testes

### **Teste 1: Criação de Card Amigável**

```typescript
// __tests__/friendly-nodes.test.ts
import { createFriendlyNode } from '@/lib/friendly-node-mapper'

describe('Friendly Nodes', () => {
  it('should create receive-document node with correct config', () => {
    const node = createFriendlyNode('receive-document', { x: 100, y: 100 })
    
    expect(node.data.label).toBe('Receber Documento')
    expect(node.data.nodeType).toBe('input')
    expect(node.data.inputSchema).toBeDefined()
  })
  
  it('should create analyze-contract node with AI preset', () => {
    const node = createFriendlyNode('analyze-contract', { x: 200, y: 100 })
    
    expect(node.data.label).toBe('Analisar Contrato')
    expect(node.data.nodeType).toBe('ai')
    expect(node.data.provider).toBe('openai')
    expect(node.data.prompt).toContain('contrato trabalhista')
  })
})
```

### **Teste 2: Toggle de Modo**

```typescript
// __tests__/friendly-palette.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { FriendlyNodePalette } from '@/components/agent-builder/friendly-node-palette'

describe('FriendlyNodePalette', () => {
  it('should toggle between simple and advanced mode', () => {
    render(<FriendlyNodePalette />)
    
    // Modo simples por padrão
    expect(screen.getByText('👤 Modo Simples')).toBeInTheDocument()
    expect(screen.getByText('📄 Receber Documento')).toBeInTheDocument()
    
    // Alternar para modo avançado
    fireEvent.click(screen.getByText('👤 Modo Simples'))
    
    expect(screen.getByText('⚙️ Modo Avançado')).toBeInTheDocument()
    expect(screen.getByText('🌐 API Call')).toBeInTheDocument()
  })
})
```

---

## 📊 Monitoramento de Métricas

### **Métricas a Acompanhar:**

```typescript
// src/lib/analytics/friendly-nodes-metrics.ts
export interface FriendlyNodeMetrics {
  // Uso de cards
  cardUsage: Record<string, number>
  
  // Modo preferido
  modeUsage: {
    simple: number
    advanced: number
  }
  
  // Tempo de criação
  avgCreationTime: number
  
  // Taxa de sucesso
  successRate: number
  
  // Feedback
  userSatisfaction: number
}

export async function trackCardUsage(cardType: string) {
  // Enviar para analytics
  await fetch('/api/analytics/card-usage', {
    method: 'POST',
    body: JSON.stringify({ cardType, timestamp: Date.now() })
  })
}
```

---

## 🚀 Deploy

### **Checklist de Deploy:**

1. **Staging:**
   ```bash
   git checkout -b feature/friendly-cards
   git add .
   git commit -m "feat: Add friendly node cards for RH users"
   git push origin feature/friendly-cards
   # Criar PR para staging
   ```

2. **Testes em Staging:**
   - [ ] Verificar todos os cards amigáveis funcionando
   - [ ] Testar toggle de modo
   - [ ] Testar criação de agente completo
   - [ ] Testar envio de email
   - [ ] Testar geração de PDF

3. **Produção:**
   ```bash
   # Após aprovação do PR
   git checkout main
   git merge feature/friendly-cards
   git push origin main
   # Deploy automático via CI/CD
   ```

---

## 📚 Documentação para Usuários

### **Criar Guia Visual:**

1. **Vídeo Tutorial (3 minutos):**
   - 0:00 - Introdução aos novos cards
   - 0:30 - Diferença entre modo simples e avançado
   - 1:00 - Criar agente de análise de contrato
   - 2:00 - Testar e salvar
   - 2:30 - Dicas e truques

2. **Documentação Escrita:**
   - Guia de início rápido
   - Referência de todos os cards
   - Exemplos de fluxos comuns
   - FAQ

---

## ✅ Conclusão

Com esta implementação, a plataforma AutomateAI terá:

- ✅ **Cards intuitivos** para usuários de RH
- ✅ **Modo avançado** para usuários técnicos
- ✅ **Templates prontos** para casos comuns
- ✅ **Documentação completa**
- ✅ **Métricas de uso** para melhoria contínua

**Tempo estimado total: 9 dias úteis (2 semanas)**
