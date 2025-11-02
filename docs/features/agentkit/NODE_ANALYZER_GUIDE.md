# 🧠 NodeAnalyzer - Sistema Inteligente de Análise de Nós

**Data:** 20/10/2025  
**Versão:** 1.0  
**Status:** ✅ IMPLEMENTADO

---

## 🎯 O Que É

O **NodeAnalyzer** é um sistema que **analisa automaticamente os nós do agente** para identificar quais informações são necessárias para executar o fluxo.

### **Problema Resolvido:**

**Antes:**
- IA genérica perguntava "o que você precisa?"
- Não sabia quais campos eram obrigatórios
- Coleta de informações era aleatória
- Não se adaptava a diferentes agentes

**Depois:**
- IA analisa os nós do agente
- Identifica campos obrigatórios automaticamente
- Faz perguntas específicas para cada campo
- Adapta-se a QUALQUER agente dinamicamente

---

## 🔍 Como Funciona

### **1. Análise Automática de Nós**

```typescript
const agentRequirements = nodeAnalyzer.analyzeAgent(agentConfig)

// Retorna:
{
  fields: [
    {
      name: "curriculo",
      type: "file",
      description: "Currículo do candidato em PDF",
      required: true,
      format: "pdf"
    },
    {
      name: "vaga",
      type: "string",
      description: "Nome ou descrição da vaga",
      required: true,
      examples: ["Desenvolvedor Python", "Analista de RH"]
    }
  ],
  needsFile: true,
  fileTypes: ["pdf"],
  description: "Análise de Currículo - Fluxo: Upload → Análise → Pontuação",
  executionFlow: ["Upload de Currículo", "Análise de Currículo", "Pontuar Candidato"]
}
```

---

### **2. Extração de Campos**

O sistema extrai campos de **3 fontes**:

#### **A. InputSchema dos Nós**

```typescript
// Nó com schema definido
{
  type: 'input',
  data: {
    label: 'Upload de Currículo',
    inputSchema: {
      type: 'object',
      properties: {
        curriculo: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo do currículo (PDF ou DOCX)'
        },
        vaga: {
          type: 'string',
          description: 'Vaga pretendida'
        }
      },
      required: ['curriculo', 'vaga']
    }
  }
}

// NodeAnalyzer extrai:
// ✅ curriculo (obrigatório, tipo file)
// ✅ vaga (obrigatório, tipo string)
```

#### **B. Prompts dos Nós AI**

```typescript
// Nó AI com prompt
{
  type: 'ai',
  data: {
    prompt: `Analise o {curriculo} para a vaga de {cargo}.
             Considere a {experiencia_minima} necessária.`
  }
}

// NodeAnalyzer extrai:
// ✅ curriculo (usado no prompt)
// ✅ cargo (usado no prompt)
// ✅ experiencia_minima (usado no prompt)
```

#### **C. Inferência do Label**

```typescript
// Nó sem schema, mas com label descritivo
{
  type: 'input',
  data: {
    label: 'Receber Currículo e Vaga'
  }
}

// NodeAnalyzer infere:
// ✅ curriculo (do label "Currículo")
// ✅ vaga (do label "Vaga")
```

---

### **3. Conversa Inteligente**

Com os requisitos extraídos, a IA faz perguntas específicas:

```
AGENTE: Análise de Currículo

INFORMAÇÕES NECESSÁRIAS:
- curriculo (OBRIGATÓRIO) - Tipo: file - Currículo em PDF
- vaga (OBRIGATÓRIO) - Tipo: string - Nome da vaga
  Exemplos: Desenvolvedor Python, Analista de RH

FLUXO DE EXECUÇÃO:
1. Upload de Currículo
2. Análise de Currículo
3. Pontuar Candidato

---

Usuário: "Oi, preciso de ajuda"

IA: "Olá! Sou o assistente de Análise de Currículo. 
     Para começar, preciso de duas informações:
     
     1. O currículo do candidato em PDF
     2. O nome da vaga
     
     Você pode me enviar o currículo primeiro?"

Usuário: [anexa curriculo.pdf]

IA: "Recebi o currículo! Agora me diga: qual é a vaga?"

Usuário: "Desenvolvedor Python Sênior"

IA: "Perfeito! Tenho tudo que preciso. Vou analisar..."
     [EXECUTA AGENTE]
```

---

## 🎨 Exemplos de Uso

### **Exemplo 1: Agente de Análise de Currículo**

**Nós do Agente:**
```
1. Input Node: "Upload de Currículo"
   - inputSchema: { curriculo: file, vaga: string }

2. AI Node: "Analisar Currículo"
   - prompt: "Analise o {curriculo}..."

3. Output Node: "Resultado"
```

**NodeAnalyzer Extrai:**
```json
{
  "fields": [
    {
      "name": "curriculo",
      "type": "file",
      "required": true,
      "format": "pdf"
    },
    {
      "name": "vaga",
      "type": "string",
      "required": true
    }
  ],
  "needsFile": true
}
```

**IA Pergunta:**
1. "Você pode me enviar o currículo em PDF?"
2. "Qual é a vaga?"

---

### **Exemplo 2: Agente de Validação de Contrato**

**Nós do Agente:**
```
1. Input Node: "Receber Contrato"
   - inputSchema: { contrato: file, tipo_contrato: string }

2. AI Node: "Validar CLT"
   - prompt: "Valide o {contrato} do tipo {tipo_contrato}..."

3. Logic Node: "Verificar Conformidade"

4. Output Node: "Relatório"
```

**NodeAnalyzer Extrai:**
```json
{
  "fields": [
    {
      "name": "contrato",
      "type": "file",
      "required": true,
      "format": "pdf"
    },
    {
      "name": "tipo_contrato",
      "type": "string",
      "required": true,
      "examples": ["CLT", "PJ", "Estágio"]
    }
  ],
  "needsFile": true
}
```

**IA Pergunta:**
1. "Você pode me enviar o contrato em PDF?"
2. "Qual é o tipo de contrato? (CLT, PJ ou Estágio)"

---

### **Exemplo 3: Agente Sem Schema (Inferência)**

**Nós do Agente:**
```
1. Input Node: "Receber Dados"
   - label: "Upload Currículo e Vaga"
   - (sem inputSchema)

2. AI Node: "Processar"
```

**NodeAnalyzer Infere:**
```json
{
  "fields": [
    {
      "name": "curriculo",
      "type": "file",
      "required": true,
      "description": "Currículo do candidato em PDF"
    },
    {
      "name": "vaga",
      "type": "string",
      "required": true,
      "description": "Nome ou descrição da vaga"
    }
  ],
  "needsFile": true
}
```

**IA Pergunta:**
1. "Você pode me enviar o currículo?"
2. "Qual é a vaga?"

---

## 🔧 Integração com ConversationalEngineV3

### **Fluxo Completo:**

```typescript
// 1. IA recebe mensagem do usuário
async chat(request) {
  // 2. Buscar configuração do agente
  const agentConfig = await prisma.agent.findUnique(...)
  
  // 3. ANALISAR NÓS DO AGENTE
  const agentRequirements = nodeAnalyzer.analyzeAgent(agentConfig)
  
  // 4. Formatar requisitos para prompt
  const requirementsText = nodeAnalyzer.formatRequirementsForPrompt(agentRequirements)
  
  // 5. IA analisa conversa com base nos requisitos
  const prompt = `
    AGENTE: ${agentConfig.name}
    
    ${requirementsText}
    
    CONVERSA: ...
    
    Quais campos OBRIGATÓRIOS ainda faltam?
  `
  
  // 6. IA decide: conversar ou executar?
  if (hasAllRequiredFields) {
    // EXECUTAR AGENTE
  } else {
    // CONTINUAR CONVERSANDO
  }
}
```

---

## 📊 Tipos de Campos Suportados

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| **file** | Arquivo (PDF, DOCX, etc) | Currículo, Contrato |
| **string** | Texto livre | Nome, Vaga, Email |
| **number** | Número | Salário, Idade |
| **boolean** | Sim/Não | Aceita termos? |
| **object** | Objeto estruturado | Endereço completo |

---

## 🎯 Benefícios

### **1. Adaptabilidade Total**

- ✅ Funciona com QUALQUER agente
- ✅ Não precisa configurar manualmente
- ✅ Extrai requisitos automaticamente

### **2. Perguntas Específicas**

- ✅ IA sabe exatamente o que perguntar
- ✅ Faz UMA pergunta por vez
- ✅ Explica POR QUE precisa da informação

### **3. Validação Inteligente**

- ✅ Verifica se tem todos os campos obrigatórios
- ✅ Valida tipos de dados
- ✅ Só executa quando tiver tudo

### **4. Experiência Natural**

- ✅ Conversa fluida
- ✅ Contexto completo
- ✅ Sem perguntas redundantes

---

## 🧪 Como Testar

### **1. Criar Agente com InputSchema**

```typescript
// No builder visual, criar nó:
{
  type: 'input',
  data: {
    label: 'Dados do Candidato',
    inputSchema: {
      properties: {
        nome: { type: 'string', description: 'Nome completo' },
        email: { type: 'string', description: 'Email' },
        curriculo: { type: 'string', format: 'binary' }
      },
      required: ['nome', 'curriculo']
    }
  }
}
```

### **2. Conversar com o Agente**

```
Você: "Oi"
IA: "Olá! Para começar, preciso do seu nome completo."

Você: "João Silva"
IA: "Obrigado, João! Agora você pode me enviar seu currículo em PDF?"

Você: [anexa PDF]
IA: "Perfeito! Tenho tudo que preciso. Processando..."
```

### **3. Verificar Logs**

```
[NodeAnalyzer] Analisando agente: Análise de Candidato
[NodeAnalyzer] Nós de input encontrados: 1
[ConversationalEngineV3] Requisitos do agente: {
  fields: 2,
  needsFile: true,
  fileTypes: ['pdf']
}
```

---

## 📝 Padrões de Extração

### **Padrão 1: Schema Completo**

```typescript
inputSchema: {
  properties: {
    campo1: { type: 'string', description: '...' },
    campo2: { type: 'file', format: 'pdf' }
  },
  required: ['campo1']
}
```

**Resultado:** Extração perfeita ✅

---

### **Padrão 2: Prompt com Placeholders**

```typescript
prompt: "Analise o {documento} considerando {criterio}"
```

**Resultado:** Extrai `documento` e `criterio` ✅

---

### **Padrão 3: Label Descritivo**

```typescript
label: "Upload de Currículo e Vaga"
```

**Resultado:** Infere `curriculo` e `vaga` ✅

---

## 🚀 Próximas Melhorias

### **Fase 1 (Atual):**
- ✅ Extração de campos de inputSchema
- ✅ Extração de prompts
- ✅ Inferência de labels
- ✅ Validação de campos obrigatórios

### **Fase 2 (Futuro):**
- [ ] Validação de formatos (email, phone, CPF)
- [ ] Sugestões de valores (autocomplete)
- [ ] Campos condicionais (se X então Y)
- [ ] Multi-idioma

### **Fase 3 (Avançado):**
- [ ] Aprendizado de padrões
- [ ] Otimização de perguntas
- [ ] Detecção de ambiguidade
- [ ] Correção automática

---

## ✅ Checklist de Validação

- [ ] NodeAnalyzer extrai campos corretamente
- [ ] IA faz perguntas específicas
- [ ] Campos obrigatórios são validados
- [ ] Arquivos são detectados
- [ ] Fluxo de execução é construído
- [ ] Funciona com diferentes agentes
- [ ] Logs aparecem no console

---

**Status:** 🟢 **SISTEMA INTELIGENTE E ADAPTÁVEL!**

Agora a IA analisa os nós do agente e sabe exatamente quais informações pedir, adaptando-se automaticamente a qualquer fluxo! 🧠🚀

---

**Última atualização:** 20/10/2025 15:15
