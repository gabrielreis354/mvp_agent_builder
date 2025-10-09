# 🐛 PROBLEMA REAL - Builder Perde Configuração

## ✅ O QUE JÁ EXISTE (E ESTÁ BOM)

1. ✅ **Sidebar Amigável** - Nós com nomes claros:
   - "📄 Analisar Contrato"
   - "👤 Analisar Currículo"
   - "📧 Enviar Email"
   - "📊 Gerar PDF"

2. ✅ **Modo Simples** - Interface não-técnica

3. ✅ **Templates Prontos** - "Análise de Contrato Completa"

---

## ❌ O PROBLEMA REAL

### **Quando arrasta nó do sidebar para o canvas:**

**Esperado:**
```
Sidebar: "📄 Analisar Contrato"
         ↓ (arrasta)
Canvas:  "📄 Analisar Contrato"
         + Prompt já preenchido
         + Configurações prontas
```

**Realidade:**
```
Sidebar: "📄 Analisar Contrato"
         ↓ (arrasta)
Canvas:  "AI Node" (técnico)
         + Prompt VAZIO ❌
         + Usuário precisa escrever do zero
```

---

## 🔍 CAUSA DO PROBLEMA

O nó no sidebar tem apenas **label e descrição**, mas quando é arrastado para o canvas, não carrega:
- Prompt pré-escrito
- Configurações específicas
- Contexto do tipo de análise

---

## ✅ SOLUÇÃO

### **Opção 1: Pré-preencher Prompts (Recomendado)**

Quando usuário arrasta "Analisar Contrato", o nó deve vir com:

```typescript
{
  label: "Analisar Contrato",
  nodeType: "ai",
  prompt: `Você é um especialista em Direito do Trabalho.
  
Analise o contrato e extraia:

1. Tipo de contrato (CLT, PJ, etc.)
2. Salário e benefícios
3. Jornada de trabalho
4. Cláusulas importantes
5. Riscos legais

Retorne de forma estruturada.`,
  provider: "anthropic",
  model: "claude-3-5-haiku-20241022"
}
```

---

### **Opção 2: Prompt Genérico Inteligente**

Se não quiser limitar a "Analisar Contrato", usar prompt genérico mas útil:

```typescript
{
  label: "Analisar Documento",
  prompt: `Analise o documento fornecido e extraia:

1. Informações principais
2. Dados importantes
3. Pontos de atenção
4. Resumo executivo

Organize de forma clara e estruturada.`
}
```

---

### **Opção 3: Wizard de Configuração**

Ao arrastar, abrir modal:
```
┌─────────────────────────────────┐
│  O que você quer analisar?      │
├─────────────────────────────────┤
│  ( ) Contrato de Trabalho       │
│  ( ) Currículo                   │
│  ( ) Folha de Pagamento          │
│  ( ) Outro documento             │
│                                  │
│  [Continuar]                     │
└─────────────────────────────────┘
```

---

## 🎯 RECOMENDAÇÃO

**Implementar Opção 1** - Pré-preencher prompts específicos

**Por quê?**
- ✅ Usuário arrasta e já funciona
- ✅ Não precisa escrever nada
- ✅ Pode editar se quiser
- ✅ Mantém flexibilidade

**Como?**
- Modificar a criação do nó no drag-and-drop
- Adicionar prompts padrão por tipo
- Manter opção de editar depois

---

## 📝 ONDE MODIFICAR

**Arquivo:** Provavelmente em `visual-canvas.tsx` ou onde o drag-and-drop é tratado

**O que fazer:**
1. Detectar qual nó foi arrastado
2. Se for "Analisar Contrato" → adicionar prompt de contrato
3. Se for "Analisar Currículo" → adicionar prompt de currículo
4. Se for genérico → adicionar prompt genérico útil

---

## 🎓 CONCLUSÃO

**Problema:** Nós perdem configuração ao serem arrastados  
**Solução:** Pré-preencher prompts específicos  
**Impacto:** Usuário não precisa escrever nada  
**Tempo:** 1-2 horas de implementação

---

**Próximo Passo:** Encontrar onde o drag-and-drop cria os nós e adicionar prompts padrão.
