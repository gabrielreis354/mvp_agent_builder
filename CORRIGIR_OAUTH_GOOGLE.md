# 🔧 Guia de Correção: OAuth Google - redirect_uri_mismatch

## ❌ Erro Identificado

```
Error 400: redirect_uri_mismatch
```

**Causa:** A URL de redirecionamento configurada no Google Cloud Console não corresponde à URL que o NextAuth está tentando usar.

---

## 🎯 Solução Passo a Passo

### **1. Identificar a URL Atual do Sistema**

Verifique qual URL o sistema está usando:

**Desenvolvimento:**
```
http://localhost:3001
```

**Produção:**
```
https://seu-dominio.com
```

---

### **2. Configurar Google Cloud Console**

#### **A. Acessar o Console:**
1. Vá para: https://console.cloud.google.com/
2. Selecione seu projeto: **SimplifiqueAI RH** (ou o nome do seu projeto)
3. Menu lateral → **APIs e Serviços** → **Credenciais**

#### **B. Editar Credenciais OAuth:**
1. Clique no **ID do cliente OAuth 2.0** existente
2. Na seção **URIs de redirecionamento autorizados**, adicione:

**Para Desenvolvimento:**
```
http://localhost:3001/api/auth/callback/google
```

**Para Produção:**
```
https://seu-dominio.com/api/auth/callback/google
```

**⚠️ IMPORTANTE:** A URL deve terminar EXATAMENTE com `/api/auth/callback/google`

#### **C. Origens JavaScript Autorizadas:**
Adicione também:

**Desenvolvimento:**
```
http://localhost:3001
```

**Produção:**
```
https://seu-dominio.com
```

#### **D. Salvar:**
Clique em **SALVAR** no final da página.

---

### **3. Verificar Variáveis de Ambiente**

#### **Arquivo: `.env.production`**

Certifique-se que as variáveis estão corretas:

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=sua-chave-secreta-aqui

# Google OAuth
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
```

#### **Arquivo: `.env.local` (Desenvolvimento)**

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=sua-chave-secreta-aqui

# Google OAuth
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
```

---

### **4. Obter Credenciais Google (Se Necessário)**

Se você ainda não tem as credenciais:

#### **A. Criar Novo Projeto (se necessário):**
1. Google Cloud Console → **Selecionar Projeto** → **Novo Projeto**
2. Nome: **SimplifiqueAI RH**
3. Clique em **Criar**

#### **B. Ativar Google+ API:**
1. Menu → **APIs e Serviços** → **Biblioteca**
2. Buscar: **Google+ API**
3. Clique em **ATIVAR**

#### **C. Criar Credenciais OAuth:**
1. Menu → **APIs e Serviços** → **Credenciais**
2. Clique em **+ CRIAR CREDENCIAIS** → **ID do cliente OAuth**
3. Tipo de aplicativo: **Aplicativo da Web**
4. Nome: **SimplifiqueAI RH - Web Client**

5. **URIs de redirecionamento autorizados:**
   ```
   http://localhost:3001/api/auth/callback/google
   https://seu-dominio.com/api/auth/callback/google
   ```

6. **Origens JavaScript autorizadas:**
   ```
   http://localhost:3001
   https://seu-dominio.com
   ```

7. Clique em **CRIAR**

8. **Copie as credenciais:**
   - **ID do cliente** → Vai para `GOOGLE_CLIENT_ID`
   - **Chave secreta do cliente** → Vai para `GOOGLE_CLIENT_SECRET`

---

### **5. Configurar Tela de Consentimento OAuth**

1. Menu → **APIs e Serviços** → **Tela de consentimento OAuth**
2. Tipo de usuário: **Externo** (ou **Interno** se for Google Workspace)
3. Clique em **CRIAR**

4. **Informações do app:**
   - Nome do app: **SimplifiqueAI RH**
   - Email de suporte do usuário: seu-email@empresa.com
   - Logo do app: (opcional)

5. **Domínio do app:**
   - Domínios autorizados: `seu-dominio.com`

6. **Informações de contato do desenvolvedor:**
   - Email: seu-email@empresa.com

7. Clique em **SALVAR E CONTINUAR**

8. **Escopos:**
   - Adicione: `userinfo.email`
   - Adicione: `userinfo.profile`
   - Clique em **SALVAR E CONTINUAR**

9. **Usuários de teste (se modo Teste):**
   - Adicione emails de teste
   - Clique em **SALVAR E CONTINUAR**

10. **Resumo:**
    - Revise e clique em **VOLTAR AO PAINEL**

---

### **6. Reiniciar Aplicação**

Após configurar tudo:

```bash
# Parar servidor
Ctrl + C

# Limpar cache
rm -rf .next

# Rebuild
npm run build

# Reiniciar
npm start
```

---

## 🧪 Testar OAuth

1. Acesse: `http://localhost:3001/auth/signin`
2. Clique em **Sign in with Google**
3. Selecione sua conta Google
4. Deve redirecionar corretamente para a aplicação

---

## 🔍 Troubleshooting

### **Erro persiste após configuração:**

1. **Limpar cookies do navegador:**
   - Pressione F12 → Application → Cookies → Deletar todos

2. **Verificar URL exata no erro:**
   - O erro mostra qual URL foi tentada
   - Compare com a configurada no Google Console

3. **Verificar NEXTAUTH_URL:**
   ```bash
   # Deve corresponder exatamente ao domínio usado
   echo $NEXTAUTH_URL
   ```

4. **Logs do servidor:**
   ```bash
   # Verificar logs para ver qual URL está sendo usada
   npm run dev
   ```

### **Erro "Access blocked: SimplifiqueAI RH's request is invalid":**

Isso significa que a URL de redirecionamento está incorreta. Verifique:
- ✅ URL termina com `/api/auth/callback/google`
- ✅ Protocolo correto (http vs https)
- ✅ Porta correta (3001 em dev)
- ✅ Sem barra final extra

---

## 📋 Checklist Final

- [ ] Google Cloud Console configurado
- [ ] URIs de redirecionamento adicionados
- [ ] Origens JavaScript autorizadas
- [ ] Tela de consentimento configurada
- [ ] Variáveis de ambiente corretas
- [ ] NEXTAUTH_URL corresponde ao domínio
- [ ] Aplicação reiniciada
- [ ] Cache limpo
- [ ] Teste de login funcionando

---

## 🎯 URLs Corretas por Ambiente

### **Desenvolvimento:**
```
NEXTAUTH_URL=http://localhost:3001
Redirect URI: http://localhost:3001/api/auth/callback/google
Origin: http://localhost:3001
```

### **Produção:**
```
NEXTAUTH_URL=https://seu-dominio.com
Redirect URI: https://seu-dominio.com/api/auth/callback/google
Origin: https://seu-dominio.com
```

---

## 💡 Dicas Importantes

1. **Múltiplos Ambientes:**
   - Adicione TODAS as URLs (dev + prod) no Google Console
   - Isso permite testar em ambos sem reconfigurar

2. **HTTPS em Produção:**
   - Google OAuth exige HTTPS em produção
   - Use Vercel, Netlify ou configure SSL no servidor

3. **Domínio Personalizado:**
   - Se usar domínio personalizado, adicione-o também
   - Exemplo: `app.simplifiqueai.com`

4. **Tempo de Propagação:**
   - Mudanças no Google Console podem levar 5-10 minutos
   - Aguarde antes de testar novamente

---

## 🆘 Suporte

Se o erro persistir após seguir todos os passos:

1. **Verificar logs do servidor:**
   ```bash
   npm run dev
   # Procurar por erros relacionados a OAuth
   ```

2. **Testar com curl:**
   ```bash
   curl -I http://localhost:3001/api/auth/callback/google
   ```

3. **Verificar NextAuth debug:**
   Adicione ao `.env.local`:
   ```bash
   NEXTAUTH_DEBUG=true
   ```

---

**Última atualização:** 10/10/2025
**Versão:** 1.0
