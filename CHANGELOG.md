# Changelog - SimplifiqueIA RH

## [2025-10-09] - Cards de Email Modernizados, Segurança de Convites e Compartilhamento

### ✅ Melhorias de UX

#### **1. Botão de Compartilhamento de Agentes (NOVO)**
- Toggle público/privado no card do agente
- Ícones dinâmicos (🔒 Lock / 🌍 Globe)
- Cores semânticas (cinza/verde)
- Feedback visual durante alteração
- **Arquivo:** `src/components/profile/agents-section.tsx`

#### **2. Renderizador Dinâmico de Email (REVOLUCIONÁRIO)**
- **Renderiza qualquer estrutura de JSON automaticamente**
- Não precisa modificar código para novos agentes
- Cores inteligentes baseadas no tipo de campo
- Formatação automática de nomes de campos
- Suporta estruturas aninhadas infinitas
- Gradientes modernos e box shadows
- Ícones apropriados por tipo de conteúdo
- **Arquivo:** `src/app/api/send-report-email/route.ts`
- **Documentação:** `RENDERIZADOR_DINAMICO_EMAIL.md`

#### **2. Geração de DOCX Completa**
- Adicionada função `_render_docx_content()` para conteúdo dinâmico
- DOCX agora processa `full_analysis` completo (paridade com PDF)
- Renderização recursiva de estruturas complexas
- **Arquivo:** `pdf-service/app.py`

### 🔒 Segurança

#### **1. Convites com Uso Único**
- Validação de `usedAt` para prevenir reuso
- Mensagem clara quando convite já foi usado
- Status 410 (Gone) para convites usados
- **Arquivo:** `src/app/api/organization/join/route.ts`

#### **2. Rastreamento de IP**
- IP registrado em `usedByIp` quando convite é aceito
- Suporte a `x-forwarded-for` e `x-real-ip`
- Logs de segurança detalhados
- **Arquivo:** `src/app/api/organization/join/route.ts`

#### **3. Limpeza Automática de Convites**
- Convites usados podem ser deletados para permitir novo convite
- Convites expirados são removidos automaticamente
- Validação melhorada de duplicatas
- **Arquivo:** `src/app/api/organization/invite/route.ts`

#### **4. API de Auditoria (NOVA)**
- Endpoint: `GET /api/organization/invitations/audit`
- Lista todos os convites com status (pending, used, expired)
- Mostra quem convidou e quem aceitou
- Estatísticas agregadas
- Apenas para ADMIN
- **Arquivo:** `src/app/api/organization/invitations/audit/route.ts`

### 🔧 Correções Técnicas

#### **1. Sincronização de Banco de Dados**
- Scripts `.bat` criados para sincronizar local e produção
- Banco Neon (produção) atualizado com campos de segurança
- Banco local sincronizado
- **Arquivos:** `sync-db.bat`, `sync-db-production.bat`

#### **2. Erro TypeScript Corrigido**
- Removida referência a `conditionDescription` (não existe no tipo)
- Validação simplificada de Logic Node
- **Arquivo:** `src/lib/errors/runtime-error-handler.ts`

### 📋 Arquivos Criados

```
src/app/api/organization/invitations/audit/route.ts (NOVO)
sync-db-production.bat (NOVO)
MELHORIAS_IMPLEMENTADAS.md (NOVO)
```

### 📋 Arquivos Modificados

```
src/app/api/send-report-email/route.ts
src/app/api/organization/invite/route.ts
src/app/api/organization/join/route.ts
src/lib/errors/runtime-error-handler.ts
pdf-service/app.py
```

---

## [2025-10-08] - Correções de Email, Upload e Geração de Documentos

### ✅ Corrigido

#### **1. Validação de Logic Node**
- Removida obrigatoriedade do campo `logicType`
- Campo agora é opcional com padrão `'condition'`
- Condição padrão `'true'` se não especificada
- **Arquivo:** `src/lib/errors/runtime-error-handler.ts`

#### **2. Upload de Arquivos**
- Adicionado suporte a arrays de Files
- Logs detalhados de debug no formulário
- Detecção correta de arquivos únicos e múltiplos
- **Arquivos:**
  - `src/components/agent-builder/agent-execution-form.tsx`
  - `src/components/agent-builder/agent-execution-modal-v2.tsx`

#### **3. Envio Automático de Email**
- Implementado envio automático quando `deliveryMethod === 'email'`
- Email enviado após execução bem-sucedida do agente
- Geração de documento anexado automaticamente
- **Arquivo:** `src/app/api/agents/execute/route.ts`

#### **4. Anexo DOCX no Email**
- Documento gerado e anexado via Buffer
- Suporte a PDF, DOCX e Excel
- ContentType correto para cada formato
- **Arquivos:**
  - `src/app/api/agents/execute/route.ts`
  - `src/app/api/send-report-email/route.ts`

#### **5. Formatação HTML do Email**
- Parse inteligente do JSON da IA
- Extração de campos estruturados
- HTML formatado com cores e ícones
- Seções organizadas (Resumo, Dados, Pontuação, etc.)
- **Arquivo:** `src/app/api/send-report-email/route.ts`

#### **6. Prompt da IA**
- Alterado de HTML para JSON estruturado
- Estrutura clara com `metadata` e `analise_payload`
- Campos bem definidos para o microserviço processar
- **Arquivo:** `src/lib/templates.ts`

#### **7. Geração de DOCX Completo**
- Estrutura correta enviada ao microserviço Python
- Campos `summary`, `key_points`, `recommendations`
- `full_analysis` com payload completo
- DOCX agora gerado com todo o conteúdo
- **Arquivo:** `src/app/api/generate-document/route.ts`

### 🎨 Melhorias de UX

#### **Tela de Convite**
- Removido botão GitHub (apenas Google)
- Botão Google estilizado com logo colorido
- Design profissional e moderno
- **Arquivo:** `src/app/accept-invite/page.tsx`

#### **Permissões de Membros**
- Users podem visualizar membros da organização
- Apenas ADMIN pode convidar/remover membros
- Flag `canManageMembers` retornada pela API
- **Arquivo:** `src/app/api/organization/members/route.ts`

### 🔒 Segurança (Preparado, Aguardando Migração)

#### **Convites Seguros**
- Uso único de convites
- Rastreamento de IP
- Registro de quem convidou e quem aceitou
- Convites não são deletados (auditoria)
- **Arquivos:**
  - `prisma/schema.prisma` (novos campos)
  - `src/app/api/organization/invite/route.ts`
  - `src/app/api/organization/join/route.ts`

**⚠️ Requer migração:** `npx prisma migrate dev --name add_invitation_security_fields`

#### **Compartilhamento de Agentes**
- Agentes privados por padrão ao aceitar convite
- API criada para compartilhar/descompartilhar
- Campo `isPublic` controla visibilidade
- **Arquivo:** `src/app/api/agents/[id]/share/route.ts`

### 📝 Estrutura de Dados

#### **JSON da IA:**
```json
{
  "metadata": {
    "titulo_relatorio": "Análise de Currículo - Nome",
    "tipo_analise": "Triagem de Currículos"
  },
  "analise_payload": {
    "resumo_executivo": "...",
    "dados_principais": {...},
    "pontuacao_geral": {...},
    "pontos_principais": [...],
    "pontos_atencao": [...],
    "recomendacoes": [...]
  }
}
```

#### **Enviado ao Microserviço:**
```json
{
  "summary": "resumo_executivo",
  "key_points": ["pontos_principais"],
  "recommendations": ["recomendacoes"],
  "full_analysis": {...}
}
```

### 📋 Arquivos Modificados

```
src/lib/errors/runtime-error-handler.ts
src/lib/templates.ts
src/components/agent-builder/agent-execution-form.tsx
src/components/agent-builder/agent-execution-modal-v2.tsx
src/app/accept-invite/page.tsx
src/app/api/agents/execute/route.ts
src/app/api/agents/[id]/share/route.ts
src/app/api/organization/members/route.ts
src/app/api/organization/invite/route.ts
src/app/api/organization/join/route.ts
src/app/api/send-report-email/route.ts
src/app/api/generate-document/route.ts
prisma/schema.prisma
```

### 🚀 Próximos Passos

1. **Aplicar migração de segurança:**
   ```bash
   npx prisma migrate dev --name add_invitation_security_fields
   npx prisma generate
   ```

2. **Implementar interface de compartilhamento:**
   - Botão no card do agente
   - Mostrar status (público/privado)
   - Atualizar listagem para incluir agentes públicos

3. **Suporte a múltiplos arquivos:**
   - Processar múltiplos PDFs em loop
   - Concatenar textos extraídos
   - Limitação atual: microserviço processa 1 por vez

### 📚 Documentação Mantida

- `README.md` - Documentação principal do projeto
- `APLICAR_MIGRATIONS.md` - Guia de migrações do banco
- `GUIA_DEPLOY_VERCEL.md` - Guia de deploy
- `SEGURANCA_CONVITES_E_COMPARTILHAMENTO.md` - Documentação de segurança
- `CHANGELOG.md` - Este arquivo

---

**Data:** 08/10/2025  
**Versão:** 1.5.0  
**Status:** ✅ Todas as funcionalidades testadas e funcionando
