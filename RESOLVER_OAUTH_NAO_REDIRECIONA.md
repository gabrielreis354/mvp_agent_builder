# 🔧 Resolver: OAuth Não Redireciona Após Login

## ❌ Problema

- Login OAuth (Google) completa com sucesso nos logs
- Usuário é autenticado no banco de dados
- Mas a página fica em loading infinito
- Não redireciona para `/builder` ou callback URL

---

## ✅ Correções Implementadas

### **1. Forçar Redirecionamento Automático**

**Arquivo:** `src/components/auth/signin-form.tsx`

```typescript
const result = await signIn(provider, { 
  callbackUrl,
  redirect: true, // ← ADICIONADO: Força redirecionamento
});
```

### **2. Logs Detalhados**

Adicionados logs em:
- `[SIGNIN]` - Frontend (signin-form.tsx)
- `[AUTH]` - Backend (auth-config.ts)
- `[AUTH EVENT]` - Eventos NextAuth

### **3. Debug Mode Ativado**

```typescript
debug: process.env.NODE_ENV === 'development',
```

---

## 🔍 Diagnóstico

### **Verificar se o problema persiste:**

1. **Rebuild da aplicação:**
   ```bash
   npm run build
   npm start
   ```

2. **Limpar cache do navegador:**
   - Pressione F12
   - Application → Storage → Clear site data

3. **Testar login novamente:**
   - Clique em "Continuar com Google"
   - Observe os logs do terminal

### **Logs Esperados (Sucesso):**

```
[SIGNIN] Iniciando OAuth com: google
[SIGNIN] Callback URL: /builder
[AUTH] SignIn callback iniciado { provider: 'google', email: '...' }
[AUTH] Verificando usuário existente: ...
[AUTH] Usuário existente encontrado: ...
[AUTH] SignIn bem-sucedido para: ...
[AUTH EVENT] signIn: ...
[AUTH EVENT] session: ...
```

Após isso, deve redirecionar automaticamente.

---

## 🚨 Se Ainda Não Funcionar

### **Problema 1: NEXTAUTH_URL Incorreto**

Verifique `.env.production`:
```bash
NEXTAUTH_URL=https://simplifiqueia.com.br
```

**Deve ser EXATAMENTE o domínio usado, sem barra final.**

### **Problema 2: Cookies Bloqueados**

Verifique se cookies estão habilitados:
1. Configurações do navegador → Privacidade
2. Permitir cookies de terceiros (temporariamente)
3. Adicionar exceção para `simplifiqueia.com.br`

### **Problema 3: CORS/CSP Headers**

Se estiver usando proxy reverso (Nginx, Cloudflare):

**Nginx:**
```nginx
location / {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Cloudflare:**
- Desabilitar "Rocket Loader"
- Desabilitar "Auto Minify" (temporariamente)

### **Problema 4: Session Storage**

Adicione ao `.env.production`:
```bash
NEXTAUTH_SESSION_MAXAGE=2592000  # 30 dias
NEXTAUTH_SESSION_UPDATE_AGE=86400  # 1 dia
```

---

## 🧪 Teste Manual do Fluxo OAuth

### **1. Testar Callback Direto:**

Acesse manualmente:
```
https://simplifiqueia.com.br/api/auth/callback/google
```

Deve retornar erro, mas confirma que a rota existe.

### **2. Testar Session:**

Após fazer login, acesse:
```
https://simplifiqueia.com.br/api/auth/session
```

Deve retornar:
```json
{
  "user": {
    "email": "...",
    "name": "...",
    "id": "...",
    "role": "..."
  },
  "expires": "..."
}
```

Se retornar `null` ou `{}`, a sessão não está sendo criada.

### **3. Testar CSRF Token:**

```
https://simplifiqueia.com.br/api/auth/csrf
```

Deve retornar:
```json
{
  "csrfToken": "..."
}
```

---

## 🔧 Solução Alternativa: Redirecionamento Manual

Se o problema persistir, adicione redirecionamento manual:

**Arquivo:** `src/components/auth/signin-form.tsx`

```typescript
const handleOAuthSignIn = async (provider: 'google') => {
  setIsLoading(true);
  setError('');

  try {
    // Salvar callback URL antes de redirecionar
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_callback', callbackUrl);
    }
    
    const result = await signIn(provider, { 
      callbackUrl,
      redirect: false, // Não redirecionar automaticamente
    });
    
    if (result?.ok) {
      // Aguardar sessão ser criada
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirecionar manualmente
      const savedCallback = sessionStorage.getItem('oauth_callback') || '/builder';
      window.location.href = savedCallback;
    } else if (result?.error) {
      setError(`Erro: ${result.error}`);
      setIsLoading(false);
    }
  } catch (err) {
    setError('Erro ao fazer login com Google');
    setIsLoading(false);
  }
};
```

---

## 📋 Checklist de Verificação

- [ ] NEXTAUTH_URL correto no `.env.production`
- [ ] NEXTAUTH_SECRET configurado (mínimo 32 caracteres)
- [ ] URLs corretas no Google Cloud Console
- [ ] Cookies habilitados no navegador
- [ ] Cache do navegador limpo
- [ ] Rebuild da aplicação feito
- [ ] Logs mostram "SignIn bem-sucedido"
- [ ] Teste de `/api/auth/session` retorna dados
- [ ] Teste de `/api/auth/csrf` retorna token

---

## 🆘 Última Opção: Desabilitar OAuth Temporariamente

Se nada funcionar, use apenas login com email/senha:

**Arquivo:** `src/lib/auth/auth-config.ts`

Comente os providers OAuth:
```typescript
providers: [
  // GoogleProvider({
  //   clientId: process.env.GOOGLE_CLIENT_ID!,
  //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  // }),
  CredentialsProvider({
    // ...
  }),
],
```

E crie senha para o usuário OAuth existente:

```sql
-- No banco de dados
UPDATE users 
SET password = '$2a$10$...' -- Hash bcrypt da senha
WHERE email = '1gabrielireis09@gmail.com';
```

---

## 📞 Suporte

Se o problema persistir após todas as tentativas:

1. **Envie os logs completos** do terminal
2. **Resultado de** `/api/auth/debug-oauth`
3. **Resultado de** `/api/auth/session` (após tentar login)
4. **Screenshot** do console do navegador (F12)

---

**Última atualização:** 10/10/2025
