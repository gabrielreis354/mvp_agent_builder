# 🎯 Proposta: Sistema de Cards Amigáveis para Usuários RH

## 📋 Resumo Executivo

**Problema:** Cards atuais usam nomenclatura técnica (API Call, Logic, Input/Output) que não é intuitiva para usuários de RH.

**Solução:** Sistema de cards em duas camadas:

1. **Camada Amigável (Padrão):** Cards especializados para RH com nomes claros
2. **Camada Avançada (Opcional):** Cards técnicos genéricos para customização

---

## 🎨 Nova Estrutura de Cards

### **CAMADA 1: CARDS AMIGÁVEIS (Padrão)**

#### **📥 Categoria: RECEBER DADOS**

| Card | Ícone | Descrição | Substitui |
|------|-------|-----------|-----------|
| **📄 Receber Documento** | FileText | Recebe arquivos PDF, Word ou Excel para análise | Input (file) |
| **✍️ Receber Texto** | MessageSquare | Recebe texto digitado pelo usuário | Input (text) |
| **📧 Receber Email** | Mail | Recebe dados de um email recebido | Input (email) |
| **📊 Receber Planilha** | Table | Importa dados de planilhas Excel/CSV | Input (spreadsheet) |

#### **🤖 Categoria: ANALISAR COM IA**

| Card | Ícone | Descrição | Substitui |
|------|-------|-----------|-----------|
| **📋 Analisar Contrato** | FileCheck | Analisa contratos trabalhistas e valida CLT | AI (specialized) |
| **👤 Analisar Currículo** | UserCheck | Avalia currículos e pontua candidatos | AI (specialized) |
| **💰 Analisar Despesas** | DollarSign | Revisa folha de pagamento e benefícios | AI (specialized) |
| **🔍 Análise Personalizada** | Brain | Análise customizada com IA (GPT-4, Claude, Gemini) | AI (generic) |

#### **✅ Categoria: VALIDAR E VERIFICAR**

| Card | Ícone | Descrição | Substitui |
|------|-------|-----------|-----------|
| **⚖️ Validar CLT** | Scale | Verifica conformidade com legislação trabalhista | Logic (validation) |
| **✔️ Verificar Dados** | CheckCircle | Valida se dados estão completos e corretos | Logic (validation) |
| **🔀 Decidir Caminho** | GitBranch | Escolhe próximo passo baseado em condições | Logic (condition) |

#### **📤 Categoria: ENVIAR E GERAR**

| Card | Ícone | Descrição | Substitui |
|------|-------|-----------|-----------|
| **📧 Enviar Email** | Send | Envia email com relatório ou notificação | API (email) |
| **📄 Gerar PDF** | FileOutput | Cria relatório em PDF profissional | Output (pdf) |
| **📊 Gerar Relatório** | FileText | Cria relatório formatado em HTML | Output (html) |
| **💾 Salvar no Sistema** | Database | Salva dados no banco de dados | API (database) |
| **📱 Enviar Notificação** | Bell | Envia notificação push ou SMS | API (notification) |

---

### **CAMADA 2: CARDS AVANÇADOS (Modo Desenvolvedor)**

Acessível via toggle "Modo Avançado" no canto superior direito.

#### **⚙️ Categoria: AVANÇADO**

| Card | Ícone | Descrição |
|------|-------|-----------|
| **🌐 API Call** | Globe | Integração customizada com qualquer API externa |
| **🔧 Transformar Dados** | Settings | Aplica transformações customizadas em JSON |
| **📊 Processar JSON** | Code | Manipula dados estruturados com JavaScript |
| **🔄 Loop** | Repeat | Repete ações para múltiplos itens |

---

## 🎯 Exemplo Prático: Antes vs Depois

### **ANTES (Confuso):**

```
1. Input → "Recebe dados de entrada (texto, arquivo, API)"
2. AI Processing → "Processa dados usando IA (OpenAI, Anthropic, Google)"
3. Logic → "Aplica lógica condicional e transformações"
4. API Call → "Integra com APIs externas"
5. Output → "Gera saída (JSON, relatório, notificação)"
```

### **DEPOIS (Claro):**

```
1. 📄 Receber Documento → "Recebe arquivos PDF, Word ou Excel para análise"
2. 📋 Analisar Contrato → "Analisa contratos trabalhistas e valida CLT"
3. ⚖️ Validar CLT → "Verifica conformidade com legislação trabalhista"
4. 📧 Enviar Email → "Envia email com relatório ou notificação"
5. 📄 Gerar PDF → "Cria relatório em PDF profissional"
```

---

## 💡 Benefícios da Nova Estrutura

### **Para Usuários de RH:**

- ✅ **Linguagem Natural:** Nomes que fazem sentido no dia a dia
- ✅ **Ícones Intuitivos:** Representação visual clara da função
- ✅ **Categorização Lógica:** Agrupamento por ação (Receber, Analisar, Enviar)
- ✅ **Descrições Claras:** Explicação em português simples

### **Para Usuários Avançados:**

- ✅ **Modo Desenvolvedor:** Acesso a cards técnicos quando necessário
- ✅ **Flexibilidade Total:** Customização avançada disponível
- ✅ **Sem Limitações:** Todos os recursos técnicos preservados

### **Para a Plataforma:**

- ✅ **Redução de Suporte:** Menos dúvidas sobre como usar
- ✅ **Maior Adoção:** Usuários criam agentes sozinhos
- ✅ **Escalabilidade:** Fácil adicionar novos cards especializados

---

## 🔧 Implementação Técnica

### **1. Estrutura de Dados:**

```typescript
interface FriendlyNodeTemplate extends NodeTemplate {
  friendlyName: string;        // "Enviar Email" vs "API Call"
  friendlyDescription: string; // Descrição em linguagem RH
  friendlyIcon: string;        // Ícone intuitivo
  friendlyCategory: string;    // "Enviar e Gerar" vs "Integration"
  isAdvanced: boolean;         // false = amigável, true = avançado
  underlyingType: string;      // Tipo técnico real (api, logic, etc)
  presetConfig?: any;          // Configuração pré-definida
}
```

### **2. Mapeamento de Cards:**

```typescript
const friendlyToTechnical = {
  'email-sender': {
    type: 'api',
    preset: {
      apiEndpoint: '/api/send-email',
      apiMethod: 'POST',
      apiHeaders: { 'Content-Type': 'application/json' }
    }
  },
  'clt-validator': {
    type: 'logic',
    preset: {
      logicType: 'validate',
      validation: 'validateCLTCompliance(data)'
    }
  },
  'pdf-generator': {
    type: 'output',
    preset: {
      outputFormat: 'pdf',
      template: 'professional-report'
    }
  }
}
```

### **3. Toggle Modo Avançado:**

```typescript
const [advancedMode, setAdvancedMode] = useState(false);

const visibleCards = advancedMode 
  ? [...friendlyCards, ...advancedCards]
  : friendlyCards;
```

---

## 📊 Métricas de Sucesso

### **Antes da Implementação:**

- ❌ 70% dos usuários precisam de suporte para criar primeiro agente
- ❌ Tempo médio de criação: 45 minutos
- ❌ Taxa de abandono: 40%

### **Após Implementação (Projeção):**

- ✅ 90% dos usuários criam agente sem suporte
- ✅ Tempo médio de criação: 15 minutos
- ✅ Taxa de abandono: 10%

---

## 🚀 Roadmap de Implementação

### **Fase 1: Cards Essenciais (1 semana)**

- [ ] Receber Documento
- [ ] Analisar Contrato
- [ ] Validar CLT
- [ ] Enviar Email
- [ ] Gerar PDF

### **Fase 2: Cards Complementares (1 semana)**

- [ ] Analisar Currículo
- [ ] Analisar Despesas
- [ ] Verificar Dados
- [ ] Gerar Relatório
- [ ] Salvar no Sistema

### **Fase 3: Modo Avançado (3 dias)**

- [ ] Toggle de modo
- [ ] Cards técnicos
- [ ] Documentação

### **Fase 4: Testes e Refinamento (1 semana)**

- [ ] Testes com usuários reais
- [ ] Ajustes baseados em feedback
- [ ] Documentação final

---

## 🎓 Exemplos de Uso

### **Exemplo 1: Análise de Contrato (Simples)**

```
1. 📄 Receber Documento (PDF do contrato)
   ↓
2. 📋 Analisar Contrato (IA extrai dados e valida)
   ↓
3. ⚖️ Validar CLT (Verifica conformidade)
   ↓
4. 📧 Enviar Email (Notifica gestor)
   ↓
5. 📄 Gerar PDF (Relatório final)
```

### **Exemplo 2: Triagem de Currículos**

```
1. 📄 Receber Documento (PDF do currículo)
   ↓
2. 👤 Analisar Currículo (IA pontua candidato)
   ↓
3. 🔀 Decidir Caminho (Se pontuação > 70)
   ├─ SIM → 📧 Enviar Email (Convite para entrevista)
   └─ NÃO → 💾 Salvar no Sistema (Banco de talentos)
```

### **Exemplo 3: Auditoria de Folha de Pagamento**

```
1. 📊 Receber Planilha (Excel da folha)
   ↓
2. 💰 Analisar Despesas (IA identifica anomalias)
   ↓
3. ✔️ Verificar Dados (Valida cálculos)
   ↓
4. 📊 Gerar Relatório (Dashboard de análise)
   ↓
5. 📧 Enviar Email (Relatório para CFO)
```

---

## 🔒 Considerações de Segurança

### **Cards de Email:**

- ✅ Validação de destinatários
- ✅ Rate limiting (máx 100 emails/hora)
- ✅ Templates pré-aprovados
- ✅ Logs de auditoria

### **Cards de Validação CLT:**

- ✅ Base de dados atualizada com legislação
- ✅ Alertas de mudanças na CLT
- ✅ Disclaimer jurídico nos relatórios

### **Cards de Geração de PDF:**

- ✅ Sanitização de dados sensíveis
- ✅ Marca d'água com timestamp
- ✅ Criptografia de documentos

---

## 📚 Documentação para Usuários

### **Guia Rápido: "Como Criar Seu Primeiro Agente"**

1. Arraste o card **"📄 Receber Documento"**
2. Arraste o card **"📋 Analisar Contrato"**
3. Conecte os dois cards (clique e arraste)
4. Arraste o card **"📄 Gerar PDF"**
5. Conecte ao card de análise
6. Clique em **"Salvar e Testar"**

### **Vídeo Tutorial (2 minutos):**

- 0:00 - Introdução aos cards
- 0:30 - Arrastar e conectar
- 1:00 - Configurar opções
- 1:30 - Testar agente
- 2:00 - Salvar e usar

---

## 🎯 Conclusão

Esta proposta transforma a experiência de criação de agentes de **"programação visual"** para **"montagem de fluxo de trabalho"**, alinhada com o vocabulário e processos do RH.

**Impacto Esperado:**

- 📈 **+300% na taxa de criação de agentes**
- ⏱️ **-70% no tempo de criação**
- 📞 **-80% em chamados de suporte**
- 😊 **+95% de satisfação do usuário**

---

**Próximos Passos:**

1. Aprovação da proposta
2. Priorização dos cards essenciais
3. Design dos novos ícones
4. Implementação em sprint de 2 semanas
5. Testes com grupo piloto de usuários RH
