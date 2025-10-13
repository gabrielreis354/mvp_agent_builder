# 🎯 Survey Após Criação de Agente - Guia Completo

**Data:** 13/10/2025  
**Objetivo:** Mostrar survey apenas após usuário criar um agente

---

## 📋 Método 1: Por URL (Mais Simples)

### **Como Funciona:**

Survey aparece quando usuário está na página de sucesso após criar agente.

### **Configuração no Hotjar:**

1. **Criar Survey:**
   - Vá em **Surveys** → **Create survey**
   - Nome: "Feedback Pós-Criação de Agente"

2. **Perguntas Recomendadas:**

   ```yaml
   Pergunta 1: "Quão fácil foi criar seu agente?"
   Tipo: Rating (1-10)
   
   Pergunta 2: "Isso vai economizar seu tempo?"
   Tipo: Multiple choice
   Opções:
     - Sim, muito! (mais de 5 horas/semana)
     - Sim, um pouco (1-5 horas/semana)
     - Não tenho certeza ainda
     - Não
   
   Pergunta 3: "O que podemos melhorar?"
   Tipo: Open text (opcional)
   ```

3. **Targeting:**

   ```yaml
   Device: All devices
   Users: All users
   
   Page targeting:
     ✅ Show on specific pages
     URL contains: /builder
     ou
     URL contains: /agents
   ```

4. **Behavior:**

   ```yaml
   Timing:
     ● After a delay on the page
     Display after: 5 seconds
   
   Frequency:
     ● Only once, even if they do not respond
   ```

**Prós:**

- ✅ Muito simples de configurar
- ✅ Não precisa mexer no código

**Contras:**

- ⚠️ Pode aparecer mesmo se usuário não criou agente
- ⚠️ Menos preciso

---

## 📋 Método 2: Por Evento Customizado (RECOMENDADO)

### **Como Funciona:**

Seu código envia um evento `agent_created` para o Hotjar quando o agente é criado.

### **Passo 1: Adicionar Código no Builder**

No arquivo onde o agente é salvo, adicione:

```typescript
// src/components/agent-builder/agent-builder.tsx
import { useHotjar } from '@/hooks/use-hotjar';

export function AgentBuilder() {
  const { trackEvent } = useHotjar();

  const handleSaveAgent = async (nodes?: AgentNode[], edges?: AgentEdge[]) => {
    // ... código existente de salvar agente ...
    
    try {
      // Salvar agente
      const response = await fetch('/api/agents/save', {
        method: 'POST',
        body: JSON.stringify(updatedAgent),
      });

      if (response.ok) {
        // ✅ ADICIONAR ESTA LINHA:
        trackEvent('agent_created');
        
        // Mostrar mensagem de sucesso
        toast.success('Agente salvo com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  return (
    // Seu componente
  );
}
```

### **Passo 2: Configurar Survey no Hotjar**

1. **Criar Survey** (mesmo do Método 1)

2. **Targeting - DIFERENTE:**

   ```yaml
   Device: All devices
   Users: All users
   
   Page targeting:
     ✅ Show on all pages
   
   Event targeting: ⭐ (IMPORTANTE!)
     ✅ Trigger when event occurs
     Event name: agent_created
   ```

3. **Behavior:**

   ```yaml
   Timing:
     ● Immediately after event
     (ou)
     ● After a delay
     Display after: 3 seconds
   
   Frequency:
     ● Only once, even if they do not respond
   ```

**Prós:**

- ✅ Muito preciso (só aparece quando agente é criado)
- ✅ Funciona em qualquer página
- ✅ Pode rastrear outros eventos também

**Contras:**

- ⚠️ Precisa adicionar código
- ⚠️ Precisa testar se evento está sendo enviado

---

## 📋 Método 3: Por Evento + Delay (MAIS SOFISTICADO)

### **Como Funciona:**

Survey aparece apenas após usuário criar E executar o agente (mais engajamento).

### **Código:**

```typescript
// src/components/agent-builder/agent-builder.tsx
import { useHotjar } from '@/hooks/use-hotjar';
import { useState } from 'react';

export function AgentBuilder() {
  const { trackEvent, showSurvey } = useHotjar();
  const [agentCreated, setAgentCreated] = useState(false);

  const handleSaveAgent = async () => {
    // Salvar agente...
    
    if (response.ok) {
      trackEvent('agent_created');
      setAgentCreated(true);
    }
  };

  const handleExecuteAgent = async () => {
    // Executar agente...
    
    if (response.ok && agentCreated) {
      // Usuário criou E executou o agente
      trackEvent('agent_executed_first_time');
      
      // Aguardar 3 segundos e mostrar survey
      setTimeout(() => {
        showSurvey('seu-survey-id'); // ID do Hotjar
      }, 3000);
    }
  };

  return (
    // Seu componente
  );
}
```

### **Configuração no Hotjar:**

```yaml
Event targeting:
  ✅ Trigger when event occurs
  Event name: agent_executed_first_time

Behavior:
  Timing: Immediately after event
  Frequency: Only once per user (mais restritivo)
```

**Quando usar:**

- ✅ Quer garantir que usuário teve sucesso completo
- ✅ Quer feedback sobre a experiência completa (criar + executar)

---

## 🎯 Qual Método Escolher?

### **Use Método 1 (URL) se:**

- ✅ Quer algo rápido (5 minutos)
- ✅ Não quer mexer no código
- ✅ Aceita um pouco de imprecisão

### **Use Método 2 (Evento) se:** ⭐ RECOMENDADO

- ✅ Quer precisão total
- ✅ Pode adicionar 1 linha de código
- ✅ Quer rastrear outros eventos também

### **Use Método 3 (Evento + Delay) se:**

- ✅ Quer feedback após experiência completa
- ✅ Tem controle total do código
- ✅ Quer otimizar taxa de resposta

---

## 🧪 Como Testar

### **Teste 1: Verificar se Evento Está Sendo Enviado**

1. Abra seu site
2. Abra DevTools (F12)
3. Vá na aba **Console**
4. Digite:

   ```javascript
   window.hj = window.hj || function() { console.log('Hotjar event:', arguments); };
   ```

5. Crie um agente
6. Você deve ver no console:

   ```
   Hotjar event: ['event', 'agent_created']
   ```

### **Teste 2: Verificar se Survey Aparece**

1. Abra site em **aba anônima**
2. Crie um agente
3. Aguarde 3-5 segundos
4. Survey deve aparecer

**Se não aparecer:**

- Verifique se evento está sendo enviado (Teste 1)
- Verifique configuração de targeting no Hotjar
- Verifique se frequency não está bloqueando (você já respondeu antes?)

---

## 📊 Exemplo Completo de Implementação

### **Arquivo: `src/components/agent-builder/agent-builder.tsx`**

```typescript
'use client';

import { useHotjar } from '@/hooks/use-hotjar';
import { useState, useEffect } from 'react';

export function AgentBuilder() {
  const { trackEvent, identifyUser } = useHotjar();
  const [agentStats, setAgentStats] = useState({
    created: 0,
    executed: 0,
  });

  // Identificar usuário ao carregar
  useEffect(() => {
    const user = getCurrentUser(); // Sua função de pegar usuário
    if (user) {
      identifyUser(user.id, {
        email: user.email,
        plan: user.plan,
        company: user.company,
      });
    }
  }, [identifyUser]);

  const handleSaveAgent = async (nodes?: AgentNode[], edges?: AgentEdge[]) => {
    try {
      const response = await fetch('/api/agents/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAgent),
      });

      if (response.ok) {
        // Rastrear criação
        trackEvent('agent_created');
        
        // Atualizar stats
        setAgentStats(prev => ({
          ...prev,
          created: prev.created + 1,
        }));

        // Se é o primeiro agente, rastrear milestone
        if (agentStats.created === 0) {
          trackEvent('first_agent_created');
        }

        toast.success('Agente criado com sucesso! 🎉');
      }
    } catch (error) {
      trackEvent('agent_creation_error');
      console.error('Erro:', error);
    }
  };

  const handleExecuteAgent = async () => {
    try {
      const response = await executeAgent(agent);

      if (response.ok) {
        // Rastrear execução
        trackEvent('agent_executed');
        
        // Atualizar stats
        setAgentStats(prev => ({
          ...prev,
          executed: prev.executed + 1,
        }));

        // Se é a primeira execução após criar, rastrear
        if (agentStats.executed === 0 && agentStats.created > 0) {
          trackEvent('first_agent_execution_success');
        }

        toast.success('Agente executado com sucesso!');
      }
    } catch (error) {
      trackEvent('agent_execution_error');
      console.error('Erro:', error);
    }
  };

  return (
    <div>
      {/* Seu componente */}
    </div>
  );
}
```

---

## 📋 Eventos Recomendados para Rastrear

```typescript
// Eventos de Criação
trackEvent('agent_created');              // Qualquer agente criado
trackEvent('first_agent_created');        // Primeiro agente do usuário
trackEvent('agent_created_from_template'); // Criado de template
trackEvent('agent_created_from_scratch'); // Criado do zero

// Eventos de Execução
trackEvent('agent_executed');             // Qualquer execução
trackEvent('first_agent_execution');      // Primeira execução
trackEvent('agent_execution_success');    // Execução com sucesso
trackEvent('agent_execution_error');      // Execução com erro

// Eventos de Engajamento
trackEvent('agent_edited');               // Editou agente existente
trackEvent('agent_deleted');              // Deletou agente
trackEvent('agent_shared');               // Compartilhou agente
trackEvent('template_viewed');            // Visualizou template

// Milestones
trackEvent('5_agents_created');           // Criou 5 agentes
trackEvent('10_executions');              // 10 execuções
trackEvent('power_user');                 // Usuário avançado
```

---

## ✅ Checklist de Implementação

### **Código:**

- [ ] Hook `useHotjar` importado
- [ ] `trackEvent('agent_created')` adicionado após salvar
- [ ] Testado no console (evento sendo enviado)

### **Hotjar:**

- [ ] Survey criado com perguntas relevantes
- [ ] Targeting configurado com evento `agent_created`
- [ ] Behavior configurado (timing + frequency)
- [ ] Survey ativado (não está em draft)

### **Teste:**

- [ ] Testado em aba anônima
- [ ] Survey aparece após criar agente
- [ ] Survey NÃO aparece ao mudar de página
- [ ] Survey NÃO aparece segunda vez (frequency)

---

## 🎯 Perguntas Recomendadas para o Survey

### **Versão Curta (2 perguntas):**

```yaml
1. "Quão fácil foi criar seu agente?"
   1 (Muito difícil) ━━━━━ 10 (Muito fácil)

2. "Isso vai economizar seu tempo?"
   ○ Sim, muito!
   ○ Sim, um pouco
   ○ Não tenho certeza
   ○ Não
```

### **Versão Completa (4 perguntas):**

```yaml
1. "Quão fácil foi criar seu agente?"
   Rating 1-10

2. "Quanto tempo você acha que vai economizar?"
   ○ Mais de 10 horas/semana
   ○ 5-10 horas/semana
   ○ 1-5 horas/semana
   ○ Menos de 1 hora/semana
   ○ Não vai economizar

3. "Você recomendaria o SimplifiqueIA para outros profissionais de RH?"
   Rating 0-10 (NPS)

4. "O que quase te fez desistir?"
   [Texto livre - opcional]
```

---

## 📊 Análise dos Resultados

### **Métricas para Acompanhar:**

```yaml
Taxa de Resposta:
  Meta: > 30%
  Como calcular: Respostas / Agentes criados

Facilidade (Pergunta 1):
  Meta: Média > 7/10
  Ação se < 7: Melhorar onboarding

Economia de Tempo (Pergunta 2):
  Meta: > 70% dizem "Sim"
  Ação se < 70%: Revisar proposta de valor

NPS (Pergunta 3):
  Meta: > 50
  Como calcular: % Promotores - % Detratores
```

---

## 🚀 Próximos Passos

1. **Implementar Método 2** (evento customizado)
2. **Testar em desenvolvimento**
3. **Ativar em produção**
4. **Analisar primeiros 20 resultados**
5. **Iterar baseado em feedback**

---

**Survey configurado! Agora você vai saber exatamente o que os usuários acham após criar o primeiro agente.** 🎉
