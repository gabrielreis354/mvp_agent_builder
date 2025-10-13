# 📚 Índice da Documentação - SimplifiqueIA RH

**Última Atualização:** 13/10/2025  
**Versão:** 2.0.0

---

## 🚀 INÍCIO RÁPIDO

### **Para Desenvolvedores Novos:**

1. **Leia primeiro:** [`README.md`](../README.md) - Visão geral do projeto
2. **Configure ambiente:** Siga instruções de instalação no README
3. **Entenda os princípios:** [`DEVELOPMENT_GUIDELINES.md`](DEVELOPMENT_GUIDELINES.md) ⭐ **ESSENCIAL**
4. **Comece a desenvolver:** Use os padrões estabelecidos

### **Para Deploy em Produção:**

1. **Checklist pré-deploy:** [`CHECKLIST_PRE_PRODUCAO.md`](../CHECKLIST_PRE_PRODUCAO.md)
2. **Guia de deploy:** [`DEPLOY_PARA_PRODUCAO.md`](../DEPLOY_PARA_PRODUCAO.md)
3. **Deploy Vercel:** [`GUIA_DEPLOY_VERCEL.md`](../GUIA_DEPLOY_VERCEL.md)

---

## 📋 DOCUMENTAÇÃO POR CATEGORIA

### **⭐ ESSENCIAL - Leitura Obrigatória**

| Documento | Descrição | Quando Ler |
|-----------|-----------|------------|
| [`README.md`](../README.md) | Visão geral do projeto | Primeiro contato |
| [`DEVELOPMENT_GUIDELINES.md`](DEVELOPMENT_GUIDELINES.md) | Princípios e padrões de desenvolvimento | Antes de codificar |
| [`CHANGELOG.md`](../CHANGELOG.md) | Histórico de mudanças | Ao atualizar código |

---

### **🏗️ Arquitetura e Design**

| Documento | Descrição | Prioridade |
|-----------|-----------|------------|
| [`AUDITORIA_MULTI_TENANCY.md`](../AUDITORIA_MULTI_TENANCY.md) | Isolamento entre organizações (9.5/10) | ⭐⭐⭐ |
| [`AUDITORIA_SISTEMA_CONVITES.md`](../AUDITORIA_SISTEMA_CONVITES.md) | Sistema de convites e segurança | ⭐⭐⭐ |
| [`RENDERIZADOR_DINAMICO_EMAIL.md`](../RENDERIZADOR_DINAMICO_EMAIL.md) | Email universal com JSON dinâmico | ⭐⭐⭐ |
| [`AUDITORIA_BUILDER_E_NL.md`](../AUDITORIA_BUILDER_E_NL.md) | Builder visual e linguagem natural | ⭐⭐ |
| [`ANALISE_IMPACTO_E_SOLID.md`](../ANALISE_IMPACTO_E_SOLID.md) | Princípios SOLID aplicados | ⭐ |
| [`ANALISE_COMPATIBILIDADE_JSON.md`](../ANALISE_COMPATIBILIDADE_JSON.md) | Compatibilidade de estruturas JSON | ⭐ |

---

### **🚀 Deploy e Produção**

| Documento | Descrição | Quando Usar |
|-----------|-----------|-------------|
| [`CHECKLIST_PRE_PRODUCAO.md`](../CHECKLIST_PRE_PRODUCAO.md) | Validação antes do deploy | Antes de cada deploy |
| [`DEPLOY_PARA_PRODUCAO.md`](../DEPLOY_PARA_PRODUCAO.md) | Guia completo de deploy | Deploy geral |
| [`GUIA_DEPLOY_VERCEL.md`](../GUIA_DEPLOY_VERCEL.md) | Deploy específico Vercel | Deploy Vercel |
| [`COMANDO_MANUAL_PRODUCAO.md`](../COMANDO_MANUAL_PRODUCAO.md) | Comandos manuais de produção | Troubleshooting |
| [`DIAGNOSTICO_PRODUCAO.md`](../DIAGNOSTICO_PRODUCAO.md) | Diagnóstico de problemas | Debugging produção |

---

### **🔧 Correções e Soluções**

| Documento | Descrição | Quando Usar |
|-----------|-----------|-------------|
| [`CORRECAO_ERRO_ESQUECI_SENHA.md`](../CORRECAO_ERRO_ESQUECI_SENHA.md) | Correção de "Esqueci Senha" | Problema com reset |
| [`CORRIGIR_OAUTH_ACCOUNT_NOT_LINKED.md`](../CORRIGIR_OAUTH_ACCOUNT_NOT_LINKED.md) | Erro de OAuth não vinculado | OAuth issues |
| [`CORRIGIR_OAUTH_GOOGLE.md`](../CORRIGIR_OAUTH_GOOGLE.md) | Correção OAuth Google | Google login issues |
| [`RESOLVER_OAUTH_NAO_REDIRECIONA.md`](../RESOLVER_OAUTH_NAO_REDIRECIONA.md) | OAuth não redireciona | Redirect issues |
| [`LIMPEZA_DEBUG_OAUTH.md`](../LIMPEZA_DEBUG_OAUTH.md) | Limpeza de logs OAuth | Após debug OAuth |
| [`RESUMO_CORRECAO_OAUTH.md`](../RESUMO_CORRECAO_OAUTH.md) | Resumo de correções OAuth | Referência OAuth |

---

### **✨ Features e Melhorias**

| Documento | Descrição | Status |
|-----------|-----------|--------|
| [`FUNCIONALIDADE_ESQUECI_SENHA.md`](../FUNCIONALIDADE_ESQUECI_SENHA.md) | Sistema de reset de senha | ✅ Implementado |
| [`DEPLOY_ESQUECI_SENHA_PRODUCAO.md`](../DEPLOY_ESQUECI_SENHA_PRODUCAO.md) | Deploy da feature | ✅ Em produção |
| [`MELHORIAS_UX_BUILDER.md`](../MELHORIAS_UX_BUILDER.md) | Melhorias de UX no builder | ✅ Implementado |
| [`SOLUCAO_IMPLEMENTADA_BUILDER.md`](../SOLUCAO_IMPLEMENTADA_BUILDER.md) | Soluções do builder | ✅ Implementado |
| [`PROBLEMA_REAL_BUILDER.md`](../PROBLEMA_REAL_BUILDER.md) | Problemas identificados | 📋 Documentado |
| [`SOLUCAO_SMTP_VERCEL.md`](../SOLUCAO_SMTP_VERCEL.md) | Configuração SMTP Vercel | ✅ Implementado |

---

### **📝 Resumos e Sessões**

| Documento | Descrição | Data |
|-----------|-----------|------|
| [`RESUMO_FINAL_IMPLEMENTACOES_09_10.md`](../RESUMO_FINAL_IMPLEMENTACOES_09_10.md) | Resumo executivo v2.0.0 | 09/10/2025 |
| [`SESSAO_COMPLETA_09_10_2025.md`](../SESSAO_COMPLETA_09_10_2025.md) | Sessão completa de trabalho | 09/10/2025 |

---

## 🗂️ ESTRUTURA DE PASTAS

```text
mvp-agent-builder/
├── docs/
│   ├── INDICE_DOCUMENTACAO.md          # Este arquivo - índice completo
│   ├── DEVELOPMENT_GUIDELINES.md       # ⭐ Princípios e padrões (ESSENCIAL)
│   ├── DESENVOLVIMENTO.md              # Guia de desenvolvimento
│   ├── README.md                       # Visão geral da documentação
│   ├── architecture/                   # Arquitetura do sistema
│   │   └── README-BACKEND.md
│   ├── development/                    # Guias de desenvolvimento
│   │   └── TESTING_GUIDE.md
│   ├── features/                       # Documentação de features
│   │   └── simulated.md
│   ├── deployment/                     # Guias de deploy
│   ├── integrations/                   # Integrações externas
│   ├── reference/                      # Referências técnicas
│   └── archive/                        # Documentos arquivados
│       ├── MELHORIAS_09_10_FINAL.md
│       └── MELHORIAS_IMPLEMENTADAS.md
│
├── README.md                           # ⭐ Documentação principal
├── CHANGELOG.md                        # ⭐ Histórico de mudanças
│
├── Auditorias e Arquitetura:
│   ├── AUDITORIA_MULTI_TENANCY.md      # ⭐⭐⭐ Isolamento organizacional
│   ├── AUDITORIA_SISTEMA_CONVITES.md   # ⭐⭐⭐ Segurança de convites
│   ├── RENDERIZADOR_DINAMICO_EMAIL.md  # ⭐⭐⭐ Sistema de email
│   ├── AUDITORIA_BUILDER_E_NL.md       # Builder e linguagem natural
│   ├── ANALISE_IMPACTO_E_SOLID.md      # Princípios SOLID
│   └── ANALISE_COMPATIBILIDADE_JSON.md # Compatibilidade JSON
│
├── Deploy e Produção:
│   ├── CHECKLIST_PRE_PRODUCAO.md       # ⭐ Checklist pré-deploy
│   ├── DEPLOY_PARA_PRODUCAO.md         # ⭐ Guia de deploy
│   ├── GUIA_DEPLOY_VERCEL.md           # Deploy Vercel
│   ├── COMANDO_MANUAL_PRODUCAO.md      # Comandos manuais
│   └── DIAGNOSTICO_PRODUCAO.md         # Diagnóstico
│
├── Correções e Soluções:
│   ├── CORRECAO_ERRO_ESQUECI_SENHA.md
│   ├── CORRIGIR_OAUTH_ACCOUNT_NOT_LINKED.md
│   ├── CORRIGIR_OAUTH_GOOGLE.md
│   ├── RESOLVER_OAUTH_NAO_REDIRECIONA.md
│   ├── LIMPEZA_DEBUG_OAUTH.md
│   └── RESUMO_CORRECAO_OAUTH.md
│
├── Features e Melhorias:
│   ├── FUNCIONALIDADE_ESQUECI_SENHA.md
│   ├── DEPLOY_ESQUECI_SENHA_PRODUCAO.md
│   ├── MELHORIAS_UX_BUILDER.md
│   ├── SOLUCAO_IMPLEMENTADA_BUILDER.md
│   ├── PROBLEMA_REAL_BUILDER.md
│   └── SOLUCAO_SMTP_VERCEL.md
│
└── Resumos:
    ├── RESUMO_FINAL_IMPLEMENTACOES_09_10.md  # ⭐ Resumo v2.0.0
    └── SESSAO_COMPLETA_09_10_2025.md         # Sessão completa
```

---

## 🔍 BUSCA RÁPIDA

### **Preciso de...**

| Necessidade | Documento |
|-------------|-----------|
| **Entender os princípios do projeto** | [`DEVELOPMENT_GUIDELINES.md`](DEVELOPMENT_GUIDELINES.md) ⭐ |
| **Fazer deploy em produção** | [`DEPLOY_PARA_PRODUCAO.md`](../DEPLOY_PARA_PRODUCAO.md) |
| **Validar antes do deploy** | [`CHECKLIST_PRE_PRODUCAO.md`](../CHECKLIST_PRE_PRODUCAO.md) |
| **Entender multi-tenancy** | [`AUDITORIA_MULTI_TENANCY.md`](../AUDITORIA_MULTI_TENANCY.md) |
| **Entender sistema de convites** | [`AUDITORIA_SISTEMA_CONVITES.md`](../AUDITORIA_SISTEMA_CONVITES.md) |
| **Entender emails dinâmicos** | [`RENDERIZADOR_DINAMICO_EMAIL.md`](../RENDERIZADOR_DINAMICO_EMAIL.md) |
| **Ver mudanças recentes** | [`CHANGELOG.md`](../CHANGELOG.md) |
| **Resumo da versão 2.0.0** | [`RESUMO_FINAL_IMPLEMENTACOES_09_10.md`](../RESUMO_FINAL_IMPLEMENTACOES_09_10.md) |
| **Configurar ambiente local** | [`README.md`](../README.md) - Seção "Início Rápido" |
| **Resolver problema OAuth** | Ver seção "Correções e Soluções" acima |
| **Diagnosticar produção** | [`DIAGNOSTICO_PRODUCAO.md`](../DIAGNOSTICO_PRODUCAO.md) |

---

## 📚 DOCUMENTAÇÃO POR SUBDIRETORIOS

### **docs/architecture/**
- `README-BACKEND.md` - Arquitetura do backend

### **docs/development/**
- `TESTING_GUIDE.md` - Guia de testes

### **docs/features/**
- `simulated.md` - Features simuladas

### **docs/archive/**
- `MELHORIAS_09_10_FINAL.md` - Melhorias arquivadas
- `MELHORIAS_IMPLEMENTADAS.md` - Implementações arquivadas

---

## 🗑️ ARQUIVOS PARA LIMPEZA

### **Candidatos à Remoção:**

Estes arquivos podem ser movidos para `docs/archive/` ou removidos:

1. **Arquivos de correção específica (já resolvidos):**
   - `CORRECAO_ERRO_ESQUECI_SENHA.md` → Mover para archive
   - `CORRIGIR_OAUTH_*.md` (5 arquivos) → Consolidar em 1 e arquivar
   - `LIMPEZA_DEBUG_OAUTH.md` → Remover (temporário)

2. **Arquivos de sessão/resumo antigos:**
   - `SESSAO_COMPLETA_09_10_2025.md` → Mover para archive
   - Manter apenas `RESUMO_FINAL_IMPLEMENTACOES_09_10.md`

3. **Arquivos duplicados:**
   - `docs/DESENVOLVIMENTO.md` vs `DEVELOPMENT_GUIDELINES.md` → Consolidar

### **Ação Recomendada:**

```bash
# Mover para archive
mv CORRECAO_ERRO_ESQUECI_SENHA.md docs/archive/
mv CORRIGIR_OAUTH_*.md docs/archive/
mv SESSAO_COMPLETA_09_10_2025.md docs/archive/

# Consolidar OAuth em um único documento
# Criar: docs/archive/HISTORICO_CORRECOES_OAUTH.md
```

---

## 📞 SUPORTE E CONTRIBUIÇÃO

### **Dúvidas sobre documentação?**

1. Consulte este índice primeiro
2. Leia [`DEVELOPMENT_GUIDELINES.md`](DEVELOPMENT_GUIDELINES.md) para princípios
3. Verifique [`CHANGELOG.md`](../CHANGELOG.md) para mudanças recentes
4. Consulte [`README.md`](../README.md) para visão geral

### **Contribuindo com a documentação:**

- **Sempre atualize** este índice ao criar novos documentos
- **Siga os princípios** do `DEVELOPMENT_GUIDELINES.md`
- **Mantenha** o `CHANGELOG.md` atualizado
- **Arquive** documentos obsoletos em `docs/archive/`

---

**Última Revisão:** 13/10/2025  
**Próxima Revisão:** 20/10/2025  
**Responsável:** Equipe SimplifiqueIA RH
