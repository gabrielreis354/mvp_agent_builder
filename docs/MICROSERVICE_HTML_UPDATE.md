# 🔧 ATUALIZAÇÃO DO MICROSERVIÇO PYTHON PARA RENDERIZAR HTML

## 🎯 PROBLEMA

O microserviço Python está recebendo HTML mas imprimindo como TEXTO:
- Tags `<h1>`, `<strong>`, `<p>` aparecem no PDF
- Conteúdo não está formatado

## ✅ SOLUÇÃO

O Next.js agora envia um flag `is_html: true` quando o conteúdo é HTML.
O microserviço Python precisa detectar esse flag e **RENDERIZAR HTML** ao invés de imprimir como texto.

---

## 📦 ESTRUTURA ENVIADA PELO NEXT.JS

```json
{
  "content": {
    "summary": "<h1>Análise Jurídica</h1><p>Texto...</p>",
    "is_html": true,
    "key_points": [],
    "recommendations": []
  },
  "output_format": "pdf",
  "title": "Análise de Contrato",
  "analysis_type": "Análise Geral"
}
```

**Campo importante:** `is_html: true`

---

## 🛠️ CÓDIGO PYTHON ATUALIZADO

### **1. Instalar Dependência**

```bash
pip install weasyprint
```

### **2. Atualizar `app.py` (ou arquivo principal)**

```python
from flask import Flask, request, send_file
from weasyprint import HTML, CSS
from io import BytesIO
import json

app = Flask(__name__)

@app.route('/generate-report', methods=['POST'])
def generate_report():
    # Extrair dados do FormData
    content_json = request.form.get('content')
    output_format = request.form.get('output_format', 'pdf')
    title = request.form.get('title', 'Relatório')
    analysis_type = request.form.get('analysis_type', 'Análise Geral')
    
    # Parse JSON
    content = json.loads(content_json)
    
    # 🆕 DETECTAR SE É HTML
    is_html = content.get('is_html', False)
    summary = content.get('summary', '')
    
    if is_html and summary:
        # 🎨 RENDERIZAR HTML
        print(f"🎨 Rendering HTML content ({len(summary)} chars)")
        pdf_buffer = render_html_to_pdf(summary, title, analysis_type)
    else:
        # 📊 RENDERIZAR ESTRUTURADO (método antigo)
        print(f"📊 Rendering structured content")
        pdf_buffer = render_structured_to_pdf(content, title, analysis_type)
    
    # Retornar PDF
    pdf_buffer.seek(0)
    return send_file(
        pdf_buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'{title}.pdf'
    )

def render_html_to_pdf(html_content, title, analysis_type):
    """
    Renderiza HTML diretamente para PDF usando WeasyPrint
    """
    # Template HTML completo com estilos
    full_html = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>{title}</title>
        <style>
            @page {{
                size: A4;
                margin: 2cm;
            }}
            
            body {{
                font-family: 'Segoe UI', 'Arial', sans-serif;
                line-height: 1.6;
                color: #1e293b;
                font-size: 12pt;
            }}
            
            h1 {{
                color: #1e40af;
                font-size: 24pt;
                margin-bottom: 10px;
                border-bottom: 3px solid #3b82f6;
                padding-bottom: 10px;
            }}
            
            h2 {{
                color: #3b82f6;
                font-size: 18pt;
                margin-top: 30px;
                margin-bottom: 15px;
                border-bottom: 2px solid #93c5fd;
                padding-bottom: 5px;
            }}
            
            h3 {{
                color: #64748b;
                font-size: 14pt;
                margin-top: 20px;
                margin-bottom: 10px;
            }}
            
            p {{
                margin-bottom: 12px;
                text-align: justify;
            }}
            
            strong {{
                color: #0f172a;
                font-weight: 600;
            }}
            
            em {{
                font-style: italic;
                color: #475569;
            }}
            
            ul, ol {{
                margin-left: 20px;
                margin-bottom: 15px;
            }}
            
            li {{
                margin-bottom: 8px;
            }}
            
            hr {{
                border: 0;
                border-top: 2px solid #e2e8f0;
                margin: 30px 0;
            }}
            
            blockquote {{
                border-left: 4px solid #3b82f6;
                padding-left: 20px;
                margin: 20px 0;
                color: #475569;
                font-style: italic;
            }}
            
            code {{
                background-color: #f1f5f9;
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 11pt;
            }}
            
            pre {{
                background-color: #f1f5f9;
                padding: 15px;
                border-radius: 6px;
                overflow-x: auto;
            }}
            
            table {{
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }}
            
            th, td {{
                border: 1px solid #e2e8f0;
                padding: 10px;
                text-align: left;
            }}
            
            th {{
                background-color: #f8fafc;
                font-weight: 600;
            }}
            
            .header {{
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 3px solid #3b82f6;
            }}
            
            .analysis-type {{
                color: #64748b;
                font-size: 11pt;
                margin-top: 5px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{title}</h1>
            <p class="analysis-type">{analysis_type}</p>
        </div>
        
        {html_content}
    </body>
    </html>
    """
    
    # Gerar PDF do HTML
    pdf_buffer = BytesIO()
    HTML(string=full_html).write_pdf(pdf_buffer)
    pdf_buffer.seek(0)
    
    return pdf_buffer

def render_structured_to_pdf(content, title, analysis_type):
    """
    Renderiza conteúdo estruturado (método antigo)
    Mantenha sua implementação existente aqui
    """
    # ... seu código existente para estruturado ...
    pass

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)
```

---

## 📊 LOGS ESPERADOS

### **Next.js (após correção):**

```bash
📦 [API Generate] Transformed content: {
  is_html_mode: true,           ← Flag ativada
  is_html_flag: true,           ← Flag no payload
  summary_length: 3925,
  key_points_count: 0,
  recommendations_count: 0,
}

🎨 [API Generate] HTML MODE - Summary preview: <h1>Análise Jurídica...
```

### **Python (após atualização):**

```bash
🎨 Rendering HTML content (3925 chars)
✅ PDF generated successfully
```

---

## 🧪 TESTE

### **1. Atualizar microserviço:**

```bash
cd ../pdf-service  # ou pasta do microserviço
pip install weasyprint
```

### **2. Atualizar código:**

- Copiar função `render_html_to_pdf` acima
- Adicionar lógica `if is_html` no handler

### **3. Reiniciar microserviço:**

```bash
python app.py
```

### **4. Reiniciar Next.js:**

```bash
cd ../mvp-agent-builder
npm run dev
```

### **5. Testar download:**

1. http://localhost:3001/chat
2. Execute agente
3. Clique **"PDF"**
4. Abra PDF

**✅ Resultado esperado:**
- Títulos formatados (negrito, tamanhos)
- Parágrafos espaçados
- Listas com bullets
- **SEM** tags `<h1>`, `<strong>`, `<p>`

---

## ⚠️ ALTERNATIVA: DOCKER PARA WEASYPRINT

Se WeasyPrint der problemas de instalação:

### **Dockerfile:**

```dockerfile
FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libjpeg-dev \
    libopenjp2-7-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "app.py"]
```

### **requirements.txt:**

```
flask==2.3.0
weasyprint==59.0
```

### **Rodar:**

```bash
docker build -t pdf-service .
docker run -p 8001:8001 pdf-service
```

---

## 🔍 TROUBLESHOOTING

### **Problema 1: WeasyPrint não instala**

**Erro:** `cairo` ou `pango` não encontrado

**Solução:**

**Ubuntu/Debian:**
```bash
sudo apt-get install python3-pip python3-dev libpango-1.0-0 libpangoft2-1.0-0
pip install weasyprint
```

**macOS:**
```bash
brew install python3 cairo pango gdk-pixbuf libffi
pip install weasyprint
```

**Windows:**
- Use Docker (recomendado)
- Ou instale via: https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#windows

---

### **Problema 2: Fontes não aparecem**

**Solução:** Especificar fontes do sistema

```python
CSS(string='''
    @font-face {
        font-family: 'Arial';
        src: local('Arial');
    }
''')
```

---

### **Problema 3: PDF muito grande**

**Solução:** Comprimir imagens

```python
HTML(string=full_html).write_pdf(
    pdf_buffer,
    optimize_images=True,
    jpeg_quality=80
)
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

- [ ] WeasyPrint instalado
- [ ] Função `render_html_to_pdf` criada
- [ ] Lógica `if is_html` adicionada
- [ ] Microserviço reiniciado
- [ ] Next.js reiniciado
- [ ] PDF testado e funcionando
- [ ] HTML renderizado (sem tags visíveis)
- [ ] Conteúdo NÃO duplicado

---

## 🎯 RESULTADO FINAL

**ANTES:**
```
<h1>Análise Jurídica</h1>
<p>Texto...</p>
```

**DEPOIS:**
```
━━━━━━━━━━━━━━━━━━━━
  Análise Jurídica
━━━━━━━━━━━━━━━━━━━━

Texto formatado aqui...
```

✅ PDF profissional e formatado!
