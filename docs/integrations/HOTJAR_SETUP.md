# 🎯 Configuração do Hotjar - SimplifiqueIA RH

**Data:** 13/10/2025  
**Versão:** 2.0.0

---

## 📋 O Que é o Hotjar?

O Hotjar é uma ferramenta de análise de comportamento do usuário que permite:

- 🎥 **Gravações de sessões** - Veja como os usuários navegam no site
- 🔥 **Mapas de calor** - Identifique onde os usuários clicam e rolam
- 📊 **Funis de conversão** - Analise onde os usuários abandonam o processo
- 💬 **Feedback direto** - Colete opiniões dos usuários
- 📝 **Pesquisas** - Faça perguntas aos visitantes

---

## 🚀 Passo a Passo de Instalação

### **1. Criar Conta no Hotjar**

1. Acesse: https://www.hotjar.com/
2. Clique em "Sign up free"
3. Preencha os dados da empresa
4. Confirme o email

### **2. Adicionar Novo Site**

1. No dashboard do Hotjar, clique em "Add new site"
2. Digite a URL: `https://simplifiqueia.com.br` (ou sua URL)
3. Selecione a categoria: "SaaS / Software"
4. Clique em "Add site"

### **3. Obter o Site ID**

Após criar o site, você verá uma tela como a da imagem fornecida:

```
Site ID: 6545642
```

**Importante:** Anote este número, você precisará dele!

### **4. Configurar Variáveis de Ambiente**

#### **Desenvolvimento (.env.local):**

```bash
# Hotjar Analytics
NEXT_PUBLIC_HOTJAR_ID=6545642
NEXT_PUBLIC_HOTJAR_SNIPPET_VERSION=6
```

#### **Produção (Vercel/Servidor):**

No painel da Vercel (ou seu servidor):

1. Vá em **Settings** → **Environment Variables**
2. Adicione:
   - `NEXT_PUBLIC_HOTJAR_ID` = `6545642`
   - `NEXT_PUBLIC_HOTJAR_SNIPPET_VERSION` = `6`

### **5. Testar a Instalação**

#### **Opção 1: Verificar no Hotjar**

1. No dashboard do Hotjar, clique em "Verify installation"
2. Acesse seu site em produção
3. O Hotjar detectará automaticamente

#### **Opção 2: Verificar no Console do Navegador**

```javascript
// Abra o console (F12) e digite:
console.log(window.hj);

// Se retornar uma função, está funcionando!
```

#### **Opção 3: Verificar no Network**

1. Abra DevTools (F12)
2. Vá na aba **Network**
3. Filtre por "hotjar"
4. Recarregue a página
5. Você deve ver requisições para `static.hotjar.com`

---

## ⚙️ Configuração Avançada

### **1. Desabilitar Questionários Automáticos**

**Problema:** Questionários aparecem toda vez que você muda de página.

**Solução:** No `layout.tsx`, adicione `disableFeedback={true}`:

```typescript
<Hotjar 
  hjid={hotjarId} 
  hjsv={hotjarVersion}
  disableFeedback={true} // ✅ Desabilita questionários automáticos
/>
```

**Opções disponíveis:**

- `disableFeedback={true}` - Desabilita questionários automáticos
- `disableRecordings={true}` - Desabilita gravações de sessão
- `disableHeatmaps={true}` - Desabilita mapas de calor

### **2. Controle Manual de Questionários**

Use o hook `useHotjar()` para mostrar questionários apenas quando você quiser:

```tsx
import { useHotjar } from '@/hooks/use-hotjar';

function MeuComponente() {
  const { showFeedback, trackEvent } = useHotjar();

  return (
    <div>
      {/* Botão para mostrar feedback manualmente */}
      <button onClick={() => showFeedback()}>
        💬 Dar Feedback
      </button>

      {/* Rastrear evento quando agente é criado */}
      <button onClick={() => {
        criarAgente();
        trackEvent('agent_created');
      }}>
        Criar Agente
      </button>
    </div>
  );
}
```

### **3. Desabilitar em Desenvolvimento**

O código já está configurado para **apenas rodar em produção**:

```typescript
{
  hotjarId && process.env.NODE_ENV === "production" && (
    <Hotjar hjid={hotjarId} hjsv={hotjarVersion} />
  );
}
```

### **2. Testar em Desenvolvimento (Opcional)**

Se quiser testar localmente, remova a verificação de `NODE_ENV`:

```typescript
// Apenas para testes - NÃO COMMITAR
{
  hotjarId && <Hotjar hjid={hotjarId} hjsv={hotjarVersion} />;
}
```

### **3. Configurar Eventos Personalizados**

Para rastrear eventos específicos:

```typescript
// Exemplo: Rastrear quando um agente é criado
if (typeof window !== "undefined" && (window as any).hj) {
  (window as any).hj("event", "agent_created");
}
```

### **4. Identificar Usuários**

Para associar sessões a usuários específicos:

```typescript
// Exemplo: Identificar usuário logado
if (typeof window !== "undefined" && (window as any).hj) {
  (window as any).hj("identify", userId, {
    email: userEmail,
    company: userCompany,
    plan: userPlan,
  });
}
```

---

## 📊 Recursos Recomendados

### **1. Gravações de Sessões**

**Como configurar:**

1. No Hotjar, vá em **Recordings** → **Settings**
2. Ative "Record sessions automatically"
3. Configure filtros (ex: apenas usuários logados)

**Boas práticas:**

- Grave apenas páginas importantes (builder, agents, profile)
- Exclua páginas de pagamento (privacidade)
- Limite a 1000 gravações/mês (plano free)

### **2. Mapas de Calor**

**Como configurar:**

1. Vá em **Heatmaps** → **New heatmap**
2. Selecione as páginas:
   - `/` (Landing page)
   - `/builder` (Construtor de agentes)
   - `/agents` (Lista de agentes)
   - `/profile` (Perfil do usuário)

**O que analisar:**

- Onde os usuários clicam mais
- Até onde eles rolam a página
- Elementos ignorados

### **3. Funis de Conversão**

**Exemplo de funil:**

1. Landing page (`/`)
2. Cadastro (`/auth/signup`)
3. Builder (`/builder`)
4. Criação de agente (evento: `agent_created`)
5. Execução (evento: `agent_executed`)

### **4. Feedback Widgets**

**Como adicionar:**

1. Vá em **Feedback** → **New widget**
2. Escolha tipo: "Emotion" ou "Question"
3. Configure gatilho: "After 30 seconds"
4. Personalize mensagem em português

**Exemplo de pergunta:**

> "O que você achou da experiência de criar um agente?"

---

## 🔒 Privacidade e LGPD

### **Dados Coletados pelo Hotjar:**

- ✅ Movimentos do mouse
- ✅ Cliques e toques
- ✅ Rolagem de página
- ✅ Tamanho da tela
- ❌ **NÃO coleta:** Senhas, dados de cartão, informações sensíveis

### **Conformidade LGPD:**

#### **1. Adicionar ao Aviso de Privacidade**

Inclua na política de privacidade:

> "Utilizamos o Hotjar para entender como os usuários interagem com nossa plataforma. O Hotjar pode coletar informações sobre seu comportamento de navegação, incluindo páginas visitadas, cliques e movimentos do mouse. Nenhuma informação pessoal identificável é coletada sem seu consentimento."

#### **2. Cookie Consent (Opcional)**

Se quiser ser mais rigoroso:

```typescript
// Apenas carregar Hotjar após consentimento
const [cookieConsent, setCookieConsent] = useState(false);

{
  cookieConsent && hotjarId && <Hotjar hjid={hotjarId} hjsv={hotjarVersion} />;
}
```

#### **3. Anonimizar Dados Sensíveis**

Adicione classes CSS para ocultar elementos:

```html
<!-- Ocultar do Hotjar -->
<input type="password" className="data-hj-suppress" />

<!-- Ocultar área inteira -->
<div className="data-hj-suppress">Informações sensíveis aqui</div>
```

---

## 📈 Métricas Importantes

### **KPIs para Acompanhar:**

| Métrica                | Meta   | Como Medir                     |
| ---------------------- | ------ | ------------------------------ |
| **Taxa de Conversão**  | >10%   | Funil: Landing → Cadastro      |
| **Tempo no Builder**   | >5 min | Gravações de sessão            |
| **Taxa de Conclusão**  | >70%   | Funil: Criar agente → Executar |
| **Páginas por Sessão** | >3     | Dashboard Hotjar               |
| **Taxa de Rejeição**   | <40%   | Dashboard Hotjar               |

### **Perguntas para Responder:**

1. **Onde os usuários travam?**

   - Analise mapas de calor e gravações
   - Identifique elementos confusos

2. **Qual página tem mais abandono?**

   - Configure funis de conversão
   - Otimize páginas problemáticas

3. **O que os usuários procuram?**

   - Veja cliques em elementos não-clicáveis
   - Adicione funcionalidades solicitadas

4. **Mobile vs Desktop:**
   - Compare comportamento por dispositivo
   - Otimize experiência mobile

---

## 🛠️ Troubleshooting

### **Problema: Hotjar não está carregando**

**Verificações:**

1. **Variáveis de ambiente configuradas?**

   ```bash
   echo $NEXT_PUBLIC_HOTJAR_ID
   ```

2. **Build de produção?**

   ```bash
   npm run build
   npm run start
   ```

3. **Console do navegador:**
   - Abra F12
   - Procure por erros relacionados a "hotjar"

### **Problema: Gravações não aparecem**

**Soluções:**

1. Verifique se está em produção (`NODE_ENV=production`)
2. Aguarde 5-10 minutos (pode haver delay)
3. Verifique filtros no dashboard do Hotjar
4. Confirme que não está bloqueado por AdBlock

### **Problema: Dados sensíveis sendo gravados**

**Solução:**

Adicione classes de supressão:

```tsx
<input type="text" className="data-hj-suppress" placeholder="CPF" />
```

---

## 📚 Recursos Adicionais

### **Documentação Oficial:**

- [Hotjar Documentation](https://help.hotjar.com/)
- [Hotjar API](https://help.hotjar.com/hc/en-us/articles/115011819488)
- [GDPR Compliance](https://www.hotjar.com/gdpr-compliance/)

### **Tutoriais:**

- [Como analisar mapas de calor](https://www.hotjar.com/heatmaps/)
- [Como usar gravações de sessão](https://www.hotjar.com/session-recordings/)
- [Como criar funis](https://www.hotjar.com/funnels/)

### **Comunidade:**

- [Hotjar Community](https://community.hotjar.com/)
- [YouTube Channel](https://www.youtube.com/c/Hotjar)

---

## ✅ Checklist de Implementação

- [ ] Conta Hotjar criada
- [ ] Site adicionado no Hotjar
- [ ] Site ID obtido (ex: 6545642)
- [ ] Variáveis de ambiente configuradas
- [ ] Componente Hotjar criado
- [ ] Layout atualizado
- [ ] Build de produção testado
- [ ] Instalação verificada no Hotjar
- [ ] Gravações de sessão ativadas
- [ ] Mapas de calor configurados
- [ ] Funis de conversão criados
- [ ] Política de privacidade atualizada
- [ ] Dados sensíveis protegidos

---

## 🎯 Próximos Passos

### **Semana 1:**

1. Configurar gravações de sessão
2. Criar mapas de calor para páginas principais
3. Observar comportamento dos primeiros usuários

### **Semana 2:**

1. Configurar funis de conversão
2. Adicionar feedback widgets
3. Analisar primeiros insights

### **Semana 3:**

1. Implementar melhorias baseadas em dados
2. Criar eventos personalizados
3. Configurar alertas para problemas

### **Mensal:**

1. Revisar métricas de conversão
2. Comparar com mês anterior
3. Planejar otimizações

---

## **Hotjar configurado com sucesso! 🎉**

**Última Atualização:** 13/10/2025  
**Próxima Revisão:** 20/10/2025
