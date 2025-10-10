# 🔧 Páginas HTML de Debug

Esta pasta contém páginas HTML de diagnóstico que foram usadas para resolver problemas de OAuth e email.

## ⚠️ ATENÇÃO

**Estas páginas NÃO devem ser acessíveis em produção!**

Elas foram movidas para `_debug` para evitar exposição de informações sensíveis.

## 📁 Conteúdo

### **1. `debug-oauth.html`**
- **Função:** Interface visual para testar OAuth
- **Acesso:** `http://localhost:3001/_debug/debug-oauth.html`
- **Recursos:**
  - Testar login OAuth
  - Verificar sessão
  - Ver logs em tempo real

### **2. `diagnose-email.html`**
- **Função:** Interface para diagnosticar problemas de email
- **Acesso:** `http://localhost:3001/_debug/diagnose-email.html`
- **Recursos:**
  - Verificar se email existe
  - Ver tokens de reset
  - Testar configuração SMTP

## 🚨 Segurança

### **Por que foram removidas:**

1. **Exposição de APIs de Debug:**
   - Chamam APIs que expõem dados sensíveis
   - Sem autenticação

2. **Informações do Sistema:**
   - Mostram configurações do servidor
   - Exibem dados de usuários

## 🔓 Como Usar em Desenvolvimento

Se precisar usar estas páginas novamente:

### **Opção 1: Acessar diretamente**
```
http://localhost:3001/_debug/debug-oauth.html
http://localhost:3001/_debug/diagnose-email.html
```

### **Opção 2: Mover temporariamente**
```bash
# Mover para public (acessível)
mv public/_debug/debug-oauth.html public/debug-oauth.html

# Acessar
http://localhost:3001/debug-oauth.html

# Mover de volta
mv public/debug-oauth.html public/_debug/debug-oauth.html
```

## 🗑️ Quando Deletar

Você pode deletar esta pasta quando:
- ✅ Não precisar mais de ferramentas de debug
- ✅ Tiver outras ferramentas de monitoramento
- ✅ Sistema estiver estável há muito tempo

## 📝 Histórico

**Data:** 10/10/2025
**Motivo:** Limpeza de páginas de debug após resolver problema OAuth
**Problema Resolvido:** OAuth "Account Not Linked" e diagnóstico de email

---

**Última atualização:** 10/10/2025
