# 📋 Plano de Reorganização - Arquivos .md na Raiz

**Data:** 20/10/2025  
**Objetivo:** Organizar 28 arquivos markdown dispersos na raiz do projeto

---

## 📊 Análise dos Arquivos

### **✅ MANTER NA RAIZ (3 arquivos)**

Arquivos essenciais que devem permanecer na raiz:

1. **README.md** ✅
   - Documentação principal do projeto
   - **Ação:** Atualizar para v2.0.0

2. **CHANGELOG.md** ✅
   - Histórico de versões
   - **Ação:** Manter e atualizar

3. **CHECKLIST_PRE_PRODUCAO.md** ✅
   - Checklist importante para deploy
   - **Ação:** Mover para `/docs/deployment/`

---

## 🗑️ EXCLUIR (Obsoletos - 15 arquivos)

### **Correções Já Implementadas:**
- ❌ `CORRECAO_ERRO_ESQUECI_SENHA.md`
- ❌ `CORRIGIR_ERRO_503.md`
- ❌ `CORRIGIR_OAUTH_ACCOUNT_NOT_LINKED.md`
- ❌ `CORRIGIR_OAUTH_GOOGLE.md`
- ❌ `LIMPEZA_DEBUG_OAUTH.md`
- ❌ `RESOLVER_OAUTH_NAO_REDIRECIONA.md`
- ❌ `RESUMO_CORRECAO_OAUTH.md`
- ❌ `SOLUCAO_IMPLEMENTADA_BUILDER.md`

### **Resumos Temporais:**
- ❌ `RESUMO_FINAL_IMPLEMENTACOES_09_10.md`
- ❌ `SESSAO_COMPLETA_09_10_2025.md`

### **Problemas Resolvidos:**
- ❌ `PROBLEMA_REAL_BUILDER.md`
- ❌ `MELHORIAS_UX_BUILDER.md`

### **Diagnósticos Antigos:**
- ❌ `DIAGNOSTICO_PRODUCAO.md`

### **Comandos Manuais:**
- ❌ `COMANDO_MANUAL_PRODUCAO.md`

### **Testes Temporários:**
- ❌ `TESTE_AGENTKIT.md`

---

## 📦 MOVER PARA /docs (10 arquivos)

### **→ /docs/architecture/**
1. `ANALISE_COMPATIBILIDADE_JSON.md`
   - Análise técnica de compatibilidade
   
2. `ANALISE_IMPACTO_E_SOLID.md`
   - Análise de impacto e princípios SOLID

### **→ /docs/reference/**
3. `AUDITORIA_BUILDER_E_NL.md`
   - Auditoria do builder e linguagem natural
   
4. `AUDITORIA_MULTI_TENANCY.md`
   - Auditoria de multi-tenancy (9.5/10)
   
5. `AUDITORIA_SISTEMA_CONVITES.md`
   - Auditoria do sistema de convites

### **→ /docs/deployment/**
6. `DEPLOY_ESQUECI_SENHA_PRODUCAO.md`
   - Deploy de funcionalidade específica
   
7. `DEPLOY_PARA_PRODUCAO.md`
   - Guia de deploy geral
   
8. `GUIA_DEPLOY_VERCEL.md`
   - Guia específico para Vercel
   
9. `CHECKLIST_PRE_PRODUCAO.md`
   - Checklist pré-deploy

### **→ /docs/features/**
10. `FUNCIONALIDADE_ESQUECI_SENHA.md`
    - Documentação da funcionalidade
    
11. `RENDERIZADOR_DINAMICO_EMAIL.md`
    - Sistema de email dinâmico

### **→ /docs/troubleshooting/**
12. `SOLUCAO_SMTP_VERCEL.md`
    - Solução para problemas SMTP

---

## 🎯 Nova Estrutura Proposta

```
mvp-agent-builder/
├── README.md (atualizado)
├── CHANGELOG.md (mantido)
│
└── docs/
    ├── architecture/
    │   ├── ANALISE_COMPATIBILIDADE_JSON.md
    │   ├── ANALISE_IMPACTO_E_SOLID.md
    │   └── OVERVIEW.md (novo)
    │
    ├── reference/
    │   ├── AUDITORIA_BUILDER_E_NL.md
    │   ├── AUDITORIA_MULTI_TENANCY.md
    │   ├── AUDITORIA_SISTEMA_CONVITES.md
    │   └── SISTEMA_COMPLETO_STATUS.md (existente)
    │
    ├── deployment/
    │   ├── CHECKLIST_PRE_PRODUCAO.md
    │   ├── DEPLOY_ESQUECI_SENHA_PRODUCAO.md
    │   ├── DEPLOY_PARA_PRODUCAO.md
    │   ├── GUIA_DEPLOY_VERCEL.md
    │   └── GUIA_IMPLANTACAO.md (existente)
    │
    ├── features/
    │   ├── FUNCIONALIDADE_ESQUECI_SENHA.md
    │   ├── RENDERIZADOR_DINAMICO_EMAIL.md
    │   ├── INTELLIGENT_MODEL_SELECTION.md (novo)
    │   └── agentkit/ (existente)
    │
    └── troubleshooting/
        ├── SOLUCAO_SMTP_VERCEL.md
        └── EMAIL.md (existente)
```

---

## 📊 Resumo das Ações

| Ação | Quantidade | Arquivos |
|------|-----------|----------|
| **Manter na raiz** | 2 | README.md, CHANGELOG.md |
| **Mover para /docs** | 12 | Organizados por categoria |
| **Excluir** | 15 | Obsoletos/temporais |
| **Total** | 29 | - |

---

## ✅ Benefícios

1. **Raiz Limpa**: Apenas arquivos essenciais (README, CHANGELOG)
2. **Documentação Organizada**: Tudo em `/docs` por categoria
3. **Fácil Navegação**: Estrutura lógica e intuitiva
4. **Manutenibilidade**: Mais fácil encontrar e atualizar docs
5. **Profissionalismo**: Projeto mais organizado

---

## 🚀 Execução

Executar script PowerShell que:
1. Move arquivos para `/docs` nas categorias corretas
2. Exclui arquivos obsoletos
3. Atualiza README.md com nova estrutura
4. Cria índice atualizado em `/docs/INDICE_DOCUMENTACAO.md`

---

**Status:** 📋 Planejado - Aguardando aprovação
