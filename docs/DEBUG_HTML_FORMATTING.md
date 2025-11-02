# 🔍 DEBUG: Formatação HTML em Relatórios

## 🎯 OBJETIVO

Verificar se o HTML convertido está chegando corretamente ao microserviço Python.

---

## 📊 FLUXO COMPLETO

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Chat retorna markdown                                    │
│    **Título**, ### Seção, --- separadores                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. /api/reports/download ou /api/reports/email              │
│    Converte markdown → HTML usando marked()                 │
│    htmlContent = "<h1>Título</h1><h3>Seção</h3>"           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Envia para /api/generate-document                        │
│    content: {                                               │
│      metadata: {...},                                       │
│      analise_payload: {                                     │
│        texto_formatado: htmlContent,                        │
│        conteudo_html: htmlContent,                          │
│        resumo: htmlContent,                                 │
│        full_analysis: { html: htmlContent }                 │
│      }                                                      │
│    }                                                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. /api/generate-document processa                          │
│    analysisPayload = content.analise_payload                │
│    transformedContent = {                                   │
│      summary: analysisPayload.resumo,                       │
│      html_content: analysisPayload.conteudo_html,           │
│      formatted_text: analysisPayload.texto_formatado,       │
│      full_analysis: analysisPayload                         │
│    }                                                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Envia FormData ao microserviço Python                    │
│    formData.append('content', JSON.stringify(transformed))  │
│    POST http://localhost:8001/generate-report              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Microserviço Python processa                             │
│    Deve usar html_content ou formatted_text                 │
│    ao invés de summary (que pode ser texto simples)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 TESTE E VERIFICAÇÃO

### **Passo 1: Reiniciar Servidor Next.js**

```bash
# Parar (Ctrl+C) e reiniciar
npm run dev
```

### **Passo 2: Executar Chat e Baixar Relatório**

1. Acesse: http://localhost:3001/chat
2. Execute um agente qualquer
3. Clique em **"PDF"** ou **"DOCX"**

### **Passo 3: Verificar Logs do Console**

**Procure por estas linhas no terminal:**

```bash
📦 [API Generate] Transformed content: {
  summary_length: XXXX,
  has_html_content: true,        ← Deve ser TRUE
  html_content_length: XXXX,     ← Deve ser > 0
  formatted_text_length: XXXX,   ← Deve ser > 0
}

📦 [API Generate] Analysis payload keys: [ ... ]
🔍 [API Generate] HTML Content preview: <h1>... ou <p>... ou <strong>...
```

---

## ✅ CENÁRIOS E DIAGNÓSTICOS

### **CENÁRIO 1: HTML Chegando Corretamente**

**Logs:**
```bash
has_html_content: true
html_content_length: 3000
HTML Content preview: <h1>Análise Jurídica</h1><p>Data...
```

**✅ Diagnóstico:** HTML está sendo gerado e enviado corretamente.

**🔧 Próximo passo:** Verificar se o microserviço Python está USANDO o campo `html_content`.

**Ação:**
- Abrir arquivo do microserviço Python
- Verificar se ele prioriza `html_content` ou `formatted_text`
- Se não, atualizar para processar HTML

---

### **CENÁRIO 2: HTML NÃO Chegando**

**Logs:**
```bash
has_html_content: false
html_content_length: 0
HTML Content preview: undefined
```

**❌ Diagnóstico:** Conversão markdown → HTML falhou ou payload está errado.

**🔧 Debug:**

1. Verificar se `marked` está instalado:
```bash
npm list marked
```

2. Adicionar log em `/api/reports/download`:
```typescript
console.log('🔍 HTML converted:', htmlContent.substring(0, 200))
```

3. Verificar se o payload está correto:
```typescript
console.log('🔍 Payload sendo enviado:', JSON.stringify(content, null, 2).substring(0, 500))
```

---

### **CENÁRIO 3: Payload com 'text' apenas**

**Logs:**
```bash
Analysis payload keys: [ 'text' ]
```

**❌ Diagnóstico:** O payload está chegando simplificado como `{ text: "..." }`.

**🔧 Causa:** 
- `/api/reports/download` pode estar enviando estrutura errada
- Ou conversão não está acontecendo

**Solução:**
Verificar o body do fetch em `/api/reports/download`:
```typescript
console.log('📤 Enviando para /api/generate-document:', 
  JSON.stringify({ content, format, fileName }).substring(0, 500))
```

---

## 🛠️ CORREÇÃO DO MICROSERVIÇO PYTHON

Se o HTML está chegando mas o PDF ainda mostra markdown, **o microserviço Python precisa ser atualizado:**

### **Arquivo:** `pdf-service/app.py` (ou equivalente)

```python
@app.route('/generate-report', methods=['POST'])
def generate_report():
    content_json = request.form.get('content')
    content = json.loads(content_json)
    
    # 🆕 PRIORIZAR HTML CONTENT
    html_content = content.get('html_content') or content.get('formatted_text')
    
    if html_content:
        # Renderizar HTML diretamente
        pdf_content = render_html_to_pdf(html_content, title, analysis_type)
    else:
        # Fallback para estrutura antiga
        summary = content.get('summary', '')
        pdf_content = render_text_to_pdf(summary, title, analysis_type)
    
    return send_file(pdf_content, mimetype='application/pdf')
```

### **Função para renderizar HTML:**

```python
from weasyprint import HTML
from io import BytesIO

def render_html_to_pdf(html_content, title, analysis_type):
    """Renderiza HTML para PDF usando WeasyPrint"""
    
    # Template HTML completo
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>{title}</title>
        <style>
            body {{ 
                font-family: 'Segoe UI', Arial, sans-serif; 
                line-height: 1.6;
                padding: 40px;
            }}
            h1 {{ color: #1e293b; font-size: 24px; margin-bottom: 20px; }}
            h2 {{ color: #3b82f6; font-size: 20px; margin-top: 30px; }}
            h3 {{ color: #64748b; font-size: 16px; margin-top: 20px; }}
            p {{ margin-bottom: 15px; }}
            strong {{ color: #1e293b; }}
            hr {{ border: 0; border-top: 2px solid #e2e8f0; margin: 30px 0; }}
        </style>
    </head>
    <body>
        <h1>{title}</h1>
        <p style="color: #64748b;">{analysis_type}</p>
        <hr>
        {html_content}
    </body>
    </html>
    """
    
    pdf_buffer = BytesIO()
    HTML(string=full_html).write_pdf(pdf_buffer)
    pdf_buffer.seek(0)
    
    return pdf_buffer
```

### **Instalar dependência:**

```bash
pip install weasyprint
```

---

## 📋 CHECKLIST DE VALIDAÇÃO

Execute o teste e marque:

- [ ] **Servidor Next.js reiniciado**
- [ ] **Chat executado e PDF baixado**
- [ ] **Logs verificados no console**
- [ ] **`has_html_content: true` nos logs?**
- [ ] **`html_content_length > 0` nos logs?**
- [ ] **Preview HTML visível nos logs?**
- [ ] **PDF aberto e verificado**
- [ ] **Markdown ainda aparece no PDF?**

---

## 🔍 LOGS ESPERADOS (COMPLETO)

```bash
✅ Conversão Markdown → HTML (em /api/reports/download)
🔍 HTML converted: <h1>Análise Jurídica do Contrato...

✅ Envio para /api/generate-document
📤 Enviando para /api/generate-document: {
  "content": {
    "metadata": {...},
    "analise_payload": {
      "texto_formatado": "<h1>...",
      "conteudo_html": "<h1>...",
      ...
    }
  }
}

✅ Transformação em /api/generate-document
📦 [API Generate] Transformed content: {
  summary_length: 3000,
  has_html_content: true,
  html_content_length: 3000,
  formatted_text_length: 3000,
}
📦 [API Generate] Analysis payload keys: [ 
  'texto_formatado',
  'conteudo_html', 
  'resumo',
  'full_analysis'
]
🔍 [API Generate] HTML Content preview: <h1>Análise Jurídica...

✅ Envio ao microserviço
🚀 [API Generate] Forwarding request to microservice: http://localhost:8001/generate-report
```

---

## ⚠️ PROBLEMAS COMUNS

### **1. `marked` não instalado**
```bash
npm install marked
```

### **2. Microserviço Python offline**
```bash
# Verificar status
curl http://localhost:8001/health

# Se offline, iniciar
cd ../pdf-service
python app.py
```

### **3. Microserviço não processa HTML**
- Atualizar código Python conforme seção anterior
- Reiniciar microserviço Python

---

## 🎯 RESULTADO ESPERADO FINAL

**PDF gerado deve mostrar:**
- ✅ Títulos formatados (negrito, tamanhos diferentes)
- ✅ Parágrafos espaçados
- ✅ Listas com bullets
- ✅ Linhas horizontais para separadores
- ❌ **SEM** `**texto**`, `### título`, `---`

---

**Após executar o teste, compartilhe:**
1. Logs completos do console
2. Screenshot do PDF gerado
3. Confirme qual cenário você está vendo
