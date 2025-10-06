# 🧪 Plano de Testes Completo - AutomateAI MVP

**Data:** 06/10/2025  
**Versão:** 1.0  
**Status:** Pronto para Execução

---

## 🎯 Objetivos dos Testes

1. ✅ Validar sistema de tratamento de erros
2. ✅ Validar cards amigáveis e toggle de modo
3. ✅ Validar fallback automático de IA
4. ✅ Validar validações e mensagens
5. ✅ Identificar bugs críticos antes do deploy

---

## 📊 Categorias de Teste

### **1. Testes de Interface (UI)**

### **2. Testes de Sistema de Erros**

### **3. Testes de Fallback de IA**

### **4. Testes de Validação**

### **5. Testes de Performance**

---

## 🎨 CATEGORIA 1: Testes de Interface (UI)

### **Teste 1.1: Toggle de Modo**

**Objetivo:** Verificar se o toggle entre modos funciona corretamente

**Passos:**

1. Abrir `/builder`
2. Criar novo agente (modo visual)
3. Verificar se toggle "👤 Modo Simples" está visível
4. Clicar no toggle
5. Verificar mudança para "⚙️ Modo Avançado"
6. Verificar se paleta mudou

**Resultado Esperado:**

- ✅ Toggle visível apenas no modo visual
- ✅ Texto do botão muda corretamente
- ✅ Cor do botão muda (roxo → cinza)
- ✅ Paleta renderiza FriendlyNodePalette ou NodePalette

**Status:** ⏳ Aguardando execução

---

### **Teste 1.2: Cards Amigáveis - Modo Simples**

**Objetivo:** Verificar se cards amigáveis aparecem corretamente

**Passos:**

1. Abrir `/builder` em modo visual
2. Garantir que está em "Modo Simples"
3. Verificar paleta lateral esquerda
4. Contar número de cards
5. Verificar categorias

**Resultado Esperado:**

- ✅ 4 categorias visíveis:
  - 📥 RECEBER DADOS
  - 🤖 ANALISAR COM IA
  - ⚖️ VALIDAR E VERIFICAR
  - 📤 ENVIAR E GERAR
- ✅ 8 cards no total
- ✅ Nomes em português claro
- ✅ Ícones apropriados

**Status:** ⏳ Aguardando execução

---

### **Teste 1.3: Cards Avançados - Modo Desenvolvedor**

**Objetivo:** Verificar se cards técnicos aparecem no modo avançado

**Passos:**

1. Abrir `/builder` em modo visual
2. Clicar em "⚙️ Modo Avançado"
3. Verificar paleta lateral
4. Verificar nomenclatura

**Resultado Esperado:**

- ✅ Cards técnicos aparecem (Input, AI Processing, Logic, etc.)
- ✅ Nomenclatura técnica mantida
- ✅ Todas as funcionalidades disponíveis

**Status:** ⏳ Aguardando execução

---

### **Teste 1.4: Drag and Drop de Cards**

**Objetivo:** Verificar se cards podem ser arrastados para o canvas

**Passos:**

1. Modo Simples ativado
2. Arrastar card "📄 Receber Documento" para o canvas
3. Arrastar card "📋 Analisar Contrato" para o canvas
4. Conectar os dois cards
5. Verificar propriedades

**Resultado Esperado:**

- ✅ Cards aparecem no canvas
- ✅ Conexão funciona
- ✅ Propriedades pré-preenchidas corretamente
- ✅ Labels em português

**Status:** ⏳ Aguardando execução

---

## 🛡️ CATEGORIA 2: Testes de Sistema de Erros

### **Teste 2.1: Erro de Validação - Agente Sem Nós**

**Objetivo:** Verificar mensagem de erro quando agente não tem nós

**Passos:**

1. Abrir `/builder`
2. Criar agente vazio (sem nós)
3. Tentar executar
4. Verificar mensagem de erro

**Resultado Esperado:**

- ✅ Erro aparece antes de chamar API
- ✅ Mensagem: "Agente deve ter pelo menos um nó configurado"
- ✅ Tipo: VALIDATION_ERROR
- ✅ Botão de retry não aparece (não é retryable)

**Status:** ⏳ Aguardando execução

---

### **Teste 2.2: Erro de Validação - JSON Inválido**

**Objetivo:** Verificar tratamento de JSON inválido na API

**Método:** Teste via curl/Postman

```bash
curl -X POST http://localhost:3000/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{"agent": "invalid json"}'
```

**Resultado Esperado:**

```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Configuração do agente está em formato inválido (JSON inválido)",
    "suggestedAction": "Verifique os dados informados e tente novamente.",
    "retryable": true
  }
}
```

**Status:** ⏳ Aguardando execução

---

### **Teste 2.3: Erro de Documento Ausente**

**Objetivo:** Verificar erro quando agente requer documento mas não foi enviado

**Passos:**

1. Criar agente com card "📋 Analisar Contrato"
2. Configurar prompt que menciona "documento"
3. Executar SEM enviar arquivo
4. Verificar erro

**Resultado Esperado:**

- ✅ Erro claro aparece
- ✅ Mensagem: "Este agente requer um documento, mas nenhum arquivo foi processado"
- ✅ Ação sugerida: "Faça upload de um documento..."
- ✅ Alert visual vermelho no ExecutionPanel

**Status:** ⏳ Aguardando execução

---

### **Teste 2.4: Rate Limiting**

**Objetivo:** Verificar se rate limiting funciona

**Método:** Script de teste

```bash
# Fazer 101 requisições em menos de 1 minuto
for i in {1..101}; do
  curl -X POST http://localhost:3000/api/agents/execute \
    -H "Content-Type: application/json" \
    -d '{"agent": {...}}' &
done
wait
```

**Resultado Esperado:**

- ✅ Primeiras 100 requisições: 200 OK
- ✅ 101ª requisição: 429 Too Many Requests
- ✅ Headers presentes:
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 0`
  - `Retry-After: 60`

**Status:** ⏳ Aguardando execução

---

### **Teste 2.5: Timeout Automático**

**Objetivo:** Verificar se timeout de 30s funciona

**Método:** Criar agente com processamento lento

**Passos:**

1. Criar agente com múltiplos nós de IA
2. Usar prompt muito longo
3. Executar e aguardar
4. Verificar timeout após 30s

**Resultado Esperado:**

- ✅ Timeout após 30 segundos
- ✅ Erro: TIMEOUT_ERROR
- ✅ Mensagem clara
- ✅ Sugestão de usar arquivo menor

**Status:** ⏳ Aguardando execução

---

## 🤖 CATEGORIA 3: Testes de Fallback de IA

### **Teste 3.1: Fallback OpenAI → Google**

**Objetivo:** Verificar fallback quando OpenAI falha

**Método:** Desabilitar temporariamente OpenAI API key

**Passos:**

1. Comentar `OPENAI_API_KEY` no `.env`
2. Criar agente com card "📋 Analisar Contrato"
3. Executar agente
4. Verificar logs

**Resultado Esperado:**

- ✅ Log: "⚠️ Provider openai falhou, tentando próximo..."
- ✅ Sistema tenta Google AI automaticamente
- ✅ Execução bem-sucedida com Google
- ✅ Log: "✅ Provider google bem-sucedido"

**Status:** ⏳ Aguardando execução

---

### **Teste 3.2: Fallback Completo (Todos Providers)**

**Objetivo:** Verificar comportamento quando todos os providers falham

**Método:** Desabilitar todas as API keys

**Passos:**

1. Comentar todas as API keys no `.env`
2. Executar agente
3. Verificar erro final

**Resultado Esperado:**

- ✅ Sistema tenta todos os providers
- ✅ Logs de cada tentativa
- ✅ Erro final claro: "Todos os provedores de IA falharam"
- ✅ Sugestão: "Verifique suas credenciais de API"

**Status:** ⏳ Aguardando execução

---

### **Teste 3.3: Quota Exceeded com Retry**

**Objetivo:** Verificar retry quando quota é excedida

**Método:** Simular quota exceeded (mock)

**Resultado Esperado:**

- ✅ Erro: AI_QUOTA_EXCEEDED
- ✅ Delay de 60 segundos antes do retry
- ✅ Máximo 3 tentativas
- ✅ Fallback para outro provider

**Status:** ⏳ Aguardando execução

---

## ✅ CATEGORIA 4: Testes de Validação

### **Teste 4.1: Validação de Texto Extraído**

**Objetivo:** Verificar validação de qualidade do texto do PDF

**Passos:**

1. Criar agente "Analisar Contrato"
2. Enviar PDF corrompido ou vazio
3. Verificar erro

**Resultado Esperado:**

- ✅ Erro: FILE_PROCESSING_ERROR
- ✅ Mensagem: "Texto extraído está vazio ou muito curto"
- ✅ Sugestão: "Verifique se o arquivo está corrompido"

**Status:** ⏳ Aguardando execução

---

### **Teste 4.2: Validação de Tamanho de Arquivo**

**Objetivo:** Verificar limite de 50MB

**Passos:**

1. Tentar enviar arquivo > 50MB
2. Verificar erro no frontend

**Resultado Esperado:**

- ✅ Erro aparece antes do upload
- ✅ Mensagem: "Arquivo muito grande. Máximo: 50MB"
- ✅ Upload bloqueado

**Status:** ⏳ Aguardando execução

---

### **Teste 4.3: Validação de Estrutura do Agente**

**Objetivo:** Verificar validação de estrutura mínima

**Passos:**

1. Enviar agente sem campo `nodes`
2. Enviar agente com `nodes: []`
3. Verificar erros

**Resultado Esperado:**

- ✅ Erro: VALIDATION_ERROR
- ✅ Mensagem específica para cada caso
- ✅ Status 400 Bad Request

**Status:** ⏳ Aguardando execução

---

## ⚡ CATEGORIA 5: Testes de Performance

### **Teste 5.1: Tempo de Resposta da API**

**Objetivo:** Verificar tempo de resposta aceitável

**Método:** Medir tempo de execução

**Resultado Esperado:**

- ✅ Validações: < 100ms
- ✅ Execução simples (1 nó): < 5s
- ✅ Execução complexa (5 nós): < 20s

**Status:** ⏳ Aguardando execução

---

### **Teste 5.2: Renderização do Canvas**

**Objetivo:** Verificar performance do canvas com muitos nós

**Passos:**

1. Criar agente com 20 nós
2. Arrastar e conectar nós
3. Verificar fluidez

**Resultado Esperado:**

- ✅ Sem lag perceptível
- ✅ Drag and drop suave
- ✅ Zoom e pan funcionando

**Status:** ⏳ Aguardando execução

---

## 🧪 CATEGORIA 6: Testes de Integração

### **Teste 6.1: Fluxo Completo - Análise de Contrato**

**Objetivo:** Testar fluxo end-to-end completo

**Passos:**

1. Abrir `/builder`
2. Modo Simples ativado
3. Arrastar "📄 Receber Documento"
4. Arrastar "📋 Analisar Contrato"
5. Conectar os cards
6. Configurar prompt
7. Salvar agente
8. Executar com PDF real
9. Verificar resultado

**Resultado Esperado:**

- ✅ Todos os passos funcionam
- ✅ PDF processado corretamente
- ✅ IA analisa o contrato
- ✅ Resultado retornado
- ✅ Sem erros

**Status:** ⏳ Aguardando execução

---

### **Teste 6.2: Fluxo com Erro e Recovery**

**Objetivo:** Testar recuperação de erro

**Passos:**

1. Executar agente sem arquivo (erro)
2. Ver mensagem de erro
3. Clicar em "Tentar Novamente"
4. Enviar arquivo correto
5. Executar novamente
6. Verificar sucesso

**Resultado Esperado:**

- ✅ Erro aparece claramente
- ✅ Botão de retry funciona
- ✅ Segunda execução bem-sucedida
- ✅ Estado limpo entre execuções

**Status:** ⏳ Aguardando execução

---

## 📊 Checklist de Execução

### **Pré-requisitos**

- [ ] Servidor rodando (`npm run dev`)
- [ ] Banco de dados conectado
- [ ] API keys configuradas
- [ ] Ambiente de teste preparado

### **Testes de UI (6 testes)**

- [ ] 1.1 - Toggle de Modo
- [ ] 1.2 - Cards Amigáveis
- [ ] 1.3 - Cards Avançados
- [ ] 1.4 - Drag and Drop

### **Testes de Erros (5 testes)**

- [ ] 2.1 - Agente Sem Nós
- [ ] 2.2 - JSON Inválido
- [ ] 2.3 - Documento Ausente
- [ ] 2.4 - Rate Limiting
- [ ] 2.5 - Timeout

### **Testes de Fallback (3 testes)**

- [ ] 3.1 - Fallback OpenAI → Google
- [ ] 3.2 - Fallback Completo
- [ ] 3.3 - Quota Exceeded

### **Testes de Validação (3 testes)**

- [ ] 4.1 - Texto Extraído
- [ ] 4.2 - Tamanho de Arquivo
- [ ] 4.3 - Estrutura do Agente

### **Testes de Performance (2 testes)**

- [ ] 5.1 - Tempo de Resposta
- [ ] 5.2 - Renderização

### **Testes de Integração (2 testes)**

- [ ] 6.1 - Fluxo Completo
- [ ] 6.2 - Erro e Recovery

---

## 📝 Relatório de Bugs

### **Template de Bug**

```markdown
**ID:** BUG-001
**Severidade:** Alta/Média/Baixa
**Categoria:** UI/Erro/Fallback/Validação/Performance
**Descrição:** [Descrição detalhada]
**Passos para Reproduzir:** [Passos]
**Resultado Esperado:** [O que deveria acontecer]
**Resultado Atual:** [O que aconteceu]
**Screenshot:** [Se aplicável]
**Prioridade:** P0/P1/P2/P3
```

---

## ✅ Critérios de Sucesso

**Para aprovar para produção:**

- ✅ Todos os testes de UI passando (100%)
- ✅ Todos os testes de Erros passando (100%)
- ✅ Pelo menos 2/3 testes de Fallback passando (67%)
- ✅ Todos os testes de Validação passando (100%)
- ✅ Testes de Performance aceitáveis (> 80%)
- ✅ Pelo menos 1 teste de Integração completo passando

**Bugs bloqueadores:**

- ❌ Nenhum bug de severidade ALTA não resolvido
- ❌ Máximo 3 bugs de severidade MÉDIA não resolvidos

---

## 🚀 Próximos Passos Após Testes

1. ✅ Corrigir bugs críticos encontrados
2. ✅ Documentar bugs conhecidos (não críticos)
3. ✅ Criar guia de troubleshooting
4. ✅ Preparar para deploy em staging
5. ✅ Agendar testes com usuários reais
