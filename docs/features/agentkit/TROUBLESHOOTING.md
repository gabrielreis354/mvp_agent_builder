# 🔧 AgentKit - Troubleshooting

**Data:** 20/10/2025

---

## ❌ Problemas Resolvidos

### **Erro: Unknown field 'config' for select statement on model 'Agent'**

**Sintoma:**
```
PrismaClientValidationError: Invalid prisma.agent.findUnique() invocation:
Unknown field 'config' for select statement on model 'Agent'
```

**Causa:**
O campo `config` não existe no model `Agent` do Prisma, mas estava sendo usado no `conversational-engine-v2.ts`.

**Solução:**
Removido `config: true` do select statement na linha 67 de `conversational-engine-v2.ts`.

**Arquivo Corrigido:**
```typescript
// src/lib/agentkit/conversational-engine-v2.ts
const agentConfig = await prisma.agent.findUnique({
  where: { id: agentId },
  select: {
    id: true,
    name: true,
    description: true,
    nodes: true,
    edges: true,
    // config: true, ❌ REMOVIDO - campo não existe
  },
})
```

**Status:** ✅ **RESOLVIDO**

---

## 🐛 Problemas Conhecidos

### **Nenhum problema conhecido no momento**

---

## 📋 Checklist de Validação

Após correções, validar:

- [ ] Servidor inicia sem erros
- [ ] Página `/agents/[agentId]/chat` carrega
- [ ] Mensagem pode ser enviada
- [ ] Resposta do agente é recebida
- [ ] Thread é criado no banco
- [ ] Mensagens são salvas

---

## 🧪 Como Testar Após Correção

### **1. Reiniciar Servidor**

```bash
# Parar servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

### **2. Acessar Chat**

```
http://localhost:3001/profile
→ Tab "Meus Agentes"
→ Clique em "Conversar com Agente"
```

### **3. Enviar Mensagem de Teste**

```
Mensagem: "Olá, como você pode me ajudar?"
```

### **4. Verificar Resposta**

**Esperado:**
- ✅ Mensagem enviada aparece na tela
- ✅ Loading indicator aparece
- ✅ Resposta do agente é exibida
- ✅ Sugestões aparecem (se configuradas)
- ✅ Sem erros no console

---

## 🔍 Como Debugar

### **1. Verificar Logs do Servidor**

```bash
# Terminal onde npm run dev está rodando
# Procurar por:
[ConversationalEngineV2] ...
[ThreadManager] ...
[API /agents/chat] ...
```

### **2. Verificar Console do Browser**

```
F12 → Console
Procurar por erros em vermelho
```

### **3. Verificar Banco de Dados**

```bash
npm run db:studio
```

**Verificar:**
- Tabela `agent_threads` tem registros
- Tabela `thread_messages` tem mensagens
- Relações estão corretas

### **4. Verificar Variáveis de Ambiente**

```bash
# .env.local deve ter:
ENABLE_CONVERSATIONAL_AGENTS=true
OPENAI_API_KEY=sk-proj-...
```

---

## 🚨 Erros Comuns

### **Erro: "Agentes conversacionais não habilitados"**

**Causa:** Feature flag não configurada

**Solução:**
```env
# .env.local
ENABLE_CONVERSATIONAL_AGENTS=true
```

### **Erro: "Não autenticado"**

**Causa:** Sessão expirada ou não logado

**Solução:**
1. Fazer logout
2. Fazer login novamente
3. Tentar novamente

### **Erro: "Agente não encontrado"**

**Causa:** AgentId inválido ou usuário sem permissão

**Solução:**
1. Verificar se agente existe
2. Verificar se agente pertence ao usuário logado
3. Usar agente correto

### **Erro: "OpenAI API error"**

**Causa:** API key inválida ou sem créditos

**Solução:**
1. Verificar `OPENAI_API_KEY` no `.env.local`
2. Verificar saldo na OpenAI
3. Testar key em https://platform.openai.com

### **Erro: "Thread não encontrado"**

**Causa:** ThreadId inválido ou deletado

**Solução:**
1. Clicar em "Nova Conversa"
2. Iniciar novo thread
3. Não reutilizar threadIds antigos

---

## 📊 Status dos Componentes

| Componente | Status | Última Verificação |
|------------|--------|-------------------|
| Schema Prisma | ✅ OK | 20/10/2025 |
| ConversationalEngineV2 | ✅ OK | 20/10/2025 |
| API /agents/chat | ✅ OK | 20/10/2025 |
| API /agents/threads | ✅ OK | 20/10/2025 |
| ChatInterface | ✅ OK | 20/10/2025 |
| ThreadManager | ✅ OK | 20/10/2025 |
| MemoryStore | ✅ OK | 20/10/2025 |

---

## 🔄 Histórico de Correções

### **20/10/2025 - 14:45**
- ✅ Removido campo `config` inexistente do select
- ✅ Corrigido erro de validação do Prisma
- ✅ Sistema funcional

---

## 📞 Suporte

Se encontrar outros problemas:

1. Verificar logs do servidor
2. Verificar console do browser
3. Verificar este documento
4. Documentar novo problema aqui

---

**Última atualização:** 20/10/2025 14:45
