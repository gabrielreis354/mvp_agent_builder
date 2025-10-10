# 🔧 Ferramentas de Debug - OAuth

Esta pasta contém ferramentas de diagnóstico e debug que foram usadas para resolver problemas de OAuth.

## ⚠️ ATENÇÃO

**Estas APIs NÃO devem ser expostas em produção!**

Elas foram movidas para `_debug` para:
- ✅ Preservar o código para referência futura
- ✅ Permitir uso em desenvolvimento se necessário
- ❌ Evitar exposição de informações sensíveis em produção

## 📁 Conteúdo

### **1. `/api/auth/_debug/debug-oauth`**
- **Função:** Verifica configuração OAuth (variáveis de ambiente, URLs, etc)
- **Uso:** `GET /api/auth/_debug/debug-oauth`
- **Expõe:** Configurações do NextAuth (parcialmente mascaradas)

### **2. `/api/auth/_debug/diagnose-email`**
- **Função:** Diagnostica problemas com email (reset de senha)
- **Uso:** `GET /api/auth/_debug/diagnose-email?email=xxx`
- **Expõe:** Dados do usuário, tokens, configuração SMTP

### **3. `/api/auth/_debug/fix-oauth-account`**
- **Função:** Diagnostica e corrige problema "Account Not Linked"
- **Uso:** 
  - `GET /api/auth/_debug/fix-oauth-account?email=xxx` (diagnóstico)
  - `POST /api/auth/_debug/fix-oauth-account` (correção)
- **Expõe:** Dados do usuário e accounts vinculados
- **Ações:** Pode deletar usuário ou criar account

## 🚨 Segurança

### **Por que foram removidas da produção:**

1. **Exposição de Dados Sensíveis:**
   - Informações de usuários
   - Configurações do servidor
   - Tokens e credenciais

2. **Ações Destrutivas:**
   - `fix-oauth-account` pode deletar usuários
   - Sem autenticação ou autorização

3. **Informações do Sistema:**
   - Versões de software
   - Estrutura do banco de dados
   - Variáveis de ambiente

## 🔓 Como Usar em Desenvolvimento

Se precisar usar estas ferramentas novamente:

### **Opção 1: Mover temporariamente**
```bash
# Mover de volta para uso
mv src/app/api/auth/_debug/debug-oauth src/app/api/auth/debug-oauth

# Usar a API
curl http://localhost:3001/api/auth/debug-oauth

# Mover de volta após uso
mv src/app/api/auth/debug-oauth src/app/api/auth/_debug/debug-oauth
```

### **Opção 2: Adicionar autenticação**
Modificar as rotas para exigir autenticação de ADMIN:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';

export async function GET(request: NextRequest) {
  // Verificar autenticação
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... resto do código
}
```

### **Opção 3: Usar apenas em ambiente de desenvolvimento**
```typescript
export async function GET(request: NextRequest) {
  // Bloquear em produção
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }
  
  // ... resto do código
}
```

## 📚 Documentação

Guias relacionados:
- `CORRIGIR_OAUTH_GOOGLE.md` - Como configurar OAuth do zero
- `CORRIGIR_OAUTH_ACCOUNT_NOT_LINKED.md` - Problema resolvido automaticamente
- `RESOLVER_OAUTH_NAO_REDIRECIONA.md` - Troubleshooting de redirecionamento

## 🗑️ Quando Deletar

Você pode deletar esta pasta quando:
- ✅ OAuth estiver funcionando perfeitamente há muito tempo
- ✅ Não houver mais problemas relacionados
- ✅ Documentação estiver completa
- ✅ Não precisar mais de referência do código

## 📝 Histórico

**Data:** 10/10/2025
**Motivo:** Limpeza de rotas de debug após resolver problema OAuth
**Problema Resolvido:** "Account Not Linked" - usuário existia mas não tinha account vinculado
**Solução:** Correção automática implementada em `auth-config.ts`

---

**Última atualização:** 10/10/2025
