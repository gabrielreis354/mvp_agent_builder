# 📧 Estratégia de Entregabilidade de Email - Anti-Spam

## 🎯 Objetivo

Garantir que emails do SimplifiqueIA RH cheguem na caixa de entrada principal, não em spam/lixeira.

---

## 🚀 Curto Prazo (1-7 dias) - IMPLEMENTAR AGORA

### 1. **Avisos na Interface** ✅ PRIORIDADE MÁXIMA

#### Locais para adicionar avisos

**A. Após Cadastro (signup-form.tsx)**

```
✅ Conta criada com sucesso!
⚠️ IMPORTANTE: Verifique sua caixa de SPAM/LIXEIRA
📧 Enviamos um email de verificação para: seu@empresa.com.br

Dica: Adicione suporte@simplifiqueai.com.br aos contatos da sua empresa
```

**B. Página de Verificação de Email (verify-email/page.tsx)**

```
📬 Email de verificação enviado!

⚠️ Não recebeu? Verifique:
1. Caixa de SPAM/Lixo Eletrônico
2. Pasta de Promoções (Gmail)
3. Aguarde até 5 minutos

💡 Dica: Marque como "Não é spam" e adicione aos contatos
```

**C. Após Execução de Agente com Email**

```
✅ Relatório enviado para: seu@email.com

⚠️ Verifique sua caixa de SPAM se não receber em 2 minutos
📎 Anexo: relatorio.pdf
```

**D. Página de Esqueci Senha**

```
📧 Link de redefinição enviado!

⚠️ Não encontrou? Verifique SPAM/Lixeira
⏱️ O link expira em 1 hora
```

### 2. **Melhorias no Conteúdo do Email** ✅

#### Headers Anti-Spam (JÁ IMPLEMENTADO)

```typescript
headers: {
  'X-Mailer': 'SimplifiqueIA RH',
  'X-Priority': '3',
  'List-Unsubscribe': '<mailto:suporte@simplifiqueai.com.br?subject=Unsubscribe>',
  'Precedence': 'bulk'
}
```

#### Melhorias Adicionais

- ✅ Usar nome amigável no remetente: `SimplifiqueIA RH <noreply@simplifiqueai.com.br>`
- ✅ Assuntos claros e profissionais (sem CAPS, sem muitos emojis)
- ✅ Incluir link de unsubscribe visível no rodapé
- ✅ Texto alternativo (plain text) além do HTML

### 3. **Configurações SMTP Otimizadas**

```env
# Gmail (Desenvolvimento)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=senha-de-app-google  # NÃO usar senha normal!
EMAIL_FROM=seu-email@gmail.com
EMAIL_FROM_NAME=SimplifiqueIA RH

# ⚠️ IMPORTANTE: Ativar "Acesso a apps menos seguros" ou usar "Senhas de app"
```

---

## 📅 Médio Prazo (1-4 semanas)

### 4. **Domínio Próprio + Autenticação**

#### A. Registrar Domínio Profissional

```
simplifiqueai.com.br (ou similar)
```

#### B. Configurar Registros DNS (CRÍTICO)

**SPF (Sender Policy Framework)**

```dns
TXT @ "v=spf1 include:_spf.google.com ~all"
```

**DKIM (DomainKeys Identified Mail)**

```dns
TXT default._domainkey "v=DKIM1; k=rsa; p=SUA_CHAVE_PUBLICA"
```

**DMARC (Domain-based Message Authentication)**

```dns
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@simplifiqueai.com.br"
```

**Exemplo Completo:**

```
Domínio: simplifiqueai.com.br
Email: noreply@simplifiqueai.com.br

DNS Records:
- SPF: v=spf1 include:_spf.google.com ~all
- DKIM: Gerado pelo provedor SMTP
- DMARC: v=DMARC1; p=quarantine; rua=mailto:admin@simplifiqueai.com.br
- MX: Configurado pelo provedor
```

### 5. **Migrar para Provedor SMTP Profissional**

#### Opções Recomendadas

**A. SendGrid (Recomendado para SaaS)**

```
✅ 100 emails/dia GRÁTIS
✅ SPF/DKIM automático
✅ Analytics de entrega
✅ IP dedicado (plano pago)
✅ Reputação de domínio gerenciada

Preço: Grátis até 100/dia, depois $19.95/mês (40k emails)
```

**B. Amazon SES**

```
✅ $0.10 por 1000 emails
✅ Alta entregabilidade
✅ Integração AWS
✅ Requer verificação de domínio

Preço: Pay-as-you-go, muito barato
```

**C. Mailgun**

```
✅ 5000 emails/mês GRÁTIS (3 meses)
✅ API simples
✅ Validação de email
✅ Logs detalhados

Preço: $35/mês após trial (50k emails)
```

**D. Resend (Moderno, para Devs)**

```
✅ 100 emails/dia GRÁTIS
✅ API moderna
✅ React Email templates
✅ Ótima DX

Preço: Grátis até 3k/mês, depois $20/mês
```

#### Implementação SendGrid (Exemplo)

```typescript
// .env.local
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.sua-api-key-aqui
EMAIL_FROM=noreply@simplifiqueai.com.br
EMAIL_FROM_NAME=SimplifiqueIA RH
```

### 6. **Warm-up de IP/Domínio**

Quando migrar para domínio próprio:

```
Semana 1: 50 emails/dia
Semana 2: 100 emails/dia
Semana 3: 250 emails/dia
Semana 4: 500 emails/dia
Semana 5+: Volume normal
```

**Por quê?** Provedores de email monitoram novos domínios. Aumentar volume gradualmente constrói reputação.

---

## 🏆 Longo Prazo (1-3 meses)

### 7. **Monitoramento de Reputação**

#### Ferramentas

- **Google Postmaster Tools**: <https://postmaster.google.com>
- **Microsoft SNDS**: <https://sendersupport.olc.protection.outlook.com>
- **MXToolbox**: <https://mxtoolbox.com/blacklists.aspx>

#### Métricas para Monitorar

- Taxa de abertura (>20% é bom)
- Taxa de bounce (<5%)
- Taxa de spam (<0.1%)
- Taxa de unsubscribe (<0.5%)

### 8. **Segmentação e Personalização**

```typescript
// Categorizar emails por tipo
enum EmailType {
  TRANSACTIONAL = "transactional", // Verificação, reset senha
  NOTIFICATION = "notification", // Relatórios, alertas
  MARKETING = "marketing", // Novidades, features
}

// Usar IPs diferentes para cada tipo (plano enterprise)
```

### 9. **Double Opt-In (Confirmação Dupla)**

```
1. Usuário se cadastra
2. Recebe email de confirmação
3. Clica no link
4. Email confirmado ✅
5. Só então recebe emails regulares
```

**Benefícios:**

- ✅ Lista limpa (emails válidos)
- ✅ Menor taxa de bounce
- ✅ Melhor reputação
- ✅ Compliance LGPD/GDPR

### 10. **Feedback Loop**

Configurar com provedores para receber notificações quando usuários marcam como spam:

```typescript
// Webhook para receber feedback
POST /api/email/feedback
{
  "type": "spam_complaint",
  "email": "usuario@example.com",
  "timestamp": "2025-10-15T12:00:00Z"
}

// Ação: Remover automaticamente da lista
```

---

## 📊 Checklist de Implementação

### Fase 1 - Imediato (Esta Semana)

- [ ] Adicionar avisos de spam em todas as telas
- [ ] Melhorar assuntos dos emails
- [ ] Adicionar texto alternativo (plain text)
- [ ] Testar com Gmail, Outlook, Yahoo

### Fase 2 - Curto Prazo (2 semanas)

- [ ] Registrar domínio próprio
- [ ] Configurar DNS (SPF, DKIM, DMARC)
- [ ] Migrar para SendGrid/SES
- [ ] Implementar warm-up gradual

### Fase 3 - Médio Prazo (1 mês)

- [ ] Configurar Google Postmaster Tools
- [ ] Implementar double opt-in
- [ ] Monitorar métricas de entrega
- [ ] Ajustar templates baseado em feedback

### Fase 4 - Longo Prazo (3 meses)

- [ ] IP dedicado (se volume justificar)
- [ ] Segmentação avançada
- [ ] Feedback loops automáticos
- [ ] A/B testing de assuntos

---

## 🔧 Código de Exemplo - Avisos na Interface

### Componente de Alerta de Spam

```typescript
// components/ui/spam-warning.tsx
"use client";

import { AlertTriangle, Mail, Inbox } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SpamWarning({ email }: { email: string }) {
  return (
    <Alert className="bg-yellow-500/10 border-yellow-500/50">
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
      <AlertDescription className="text-sm text-gray-300">
        <strong className="text-white">⚠️ Não recebeu o email?</strong>
        <ul className="mt-2 space-y-1 text-xs">
          <li>
            📧 Verifique sua caixa de <strong>SPAM/Lixo Eletrônico</strong>
          </li>
          <li>
            📁 Confira a pasta de <strong>Promoções</strong> (Gmail)
          </li>
          <li>
            ⏱️ Aguarde até <strong>5 minutos</strong>
          </li>
          <li>
            ✅ Adicione <strong>noreply@simplifiqueai.com.br</strong> aos
            contatos
          </li>
        </ul>
        <p className="mt-2 text-xs text-gray-400">
          Email enviado para: <strong className="text-white">{email}</strong>
        </p>
      </AlertDescription>
    </Alert>
  );
}
```

---

## 📈 Métricas de Sucesso

### Antes (Situação Atual)

- ❌ ~50% dos emails em spam
- ❌ Usuários não conseguem verificar conta
- ❌ Baixa confiança no sistema

### Depois (Meta)

- ✅ >90% dos emails na caixa de entrada
- ✅ <5% de bounce rate
- ✅ >80% de taxa de abertura (emails transacionais)
- ✅ Reputação de domínio "Boa" no Google Postmaster

---

## 💡 Dicas Extras

### O que EVITAR

- ❌ Palavras spam: "GRÁTIS", "GANHE", "CLIQUE AQUI"
- ❌ CAPS LOCK excessivo
- ❌ Muitos links/imagens
- ❌ Anexos muito grandes (>10MB)
- ❌ Enviar de IP residencial
- ❌ Comprar listas de email

### O que FAZER

- ✅ Assuntos claros e profissionais
- ✅ Remetente consistente
- ✅ Conteúdo relevante
- ✅ Fácil de dar unsubscribe
- ✅ Respeitar frequência (não spammar)
- ✅ Manter lista limpa (remover bounces)

---

## 🎯 Prioridades por Impacto

### Alto Impacto, Baixo Esforço (FAZER AGORA)

1. ✅ Adicionar avisos de spam na UI
2. ✅ Melhorar assuntos dos emails
3. ✅ Usar senha de app do Gmail (não senha normal)

### Alto Impacto, Médio Esforço (2 SEMANAS)

4. ✅ Registrar domínio próprio
5. ✅ Configurar SPF/DKIM/DMARC
6. ✅ Migrar para SendGrid

### Alto Impacto, Alto Esforço (1-3 MESES)

7. ✅ IP dedicado
8. ✅ Monitoramento avançado
9. ✅ Segmentação de emails

---

## 📞 Suporte

Se emails continuarem em spam após implementar Fase 1 e 2:

1. Verificar DNS com: <https://mxtoolbox.com>
2. Testar entregabilidade: <https://www.mail-tester.com>
3. Contatar suporte do provedor SMTP
4. Considerar consultoria especializada

---

**Última atualização:** 15/10/2025
**Responsável:** Equipe SimplifiqueIA RH
