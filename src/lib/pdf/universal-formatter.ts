/**
 * Sistema Universal de Formatação de PDF
 * Detecta automaticamente o tipo de conteúdo e gera PDF profissional
 * Funciona com qualquer agente personalizado
 */

export interface ContentAnalysis {
  type: 'structured' | 'html' | 'markdown' | 'json' | 'text'
  confidence: number
  sections: ContentSection[]
  metadata: {
    title?: string
    subtitle?: string
    category?: string
    hasTable?: boolean
    hasLists?: boolean
    hasHeaders?: boolean
  }
}

export interface ContentSection {
  type: 'header' | 'paragraph' | 'list' | 'table' | 'data' | 'summary'
  title?: string
  content: string
  importance: 'high' | 'medium' | 'low'
  data?: any
}

export class UniversalPDFFormatter {
  
  /**
   * Analisa qualquer conteúdo e detecta sua estrutura
   */
  analyzeContent(content: any): ContentAnalysis {
    console.log('🔍 [UniversalFormatter] Analyzing content type:', typeof content)
    
    // Se é string HTML completa
    if (typeof content === 'string' && content.includes('<!DOCTYPE html>')) {
      return this.analyzeHTMLContent(content)
    }
    
    // 🔧 NOVO: Se é string JSON (detectar antes de markdown)
    if (typeof content === 'string' && content.trim().startsWith('{') && content.trim().endsWith('}')) {
      try {
        const parsed = JSON.parse(content);
        // Verificar se é nosso JSON estruturado da IA
        if (parsed.metadata && parsed.metadata.tipo_documento) {
          console.log('📊 [UniversalFormatter] AI JSON detected in string format');
          return this.analyzeAIJsonContent(parsed);
        }
        // Se é JSON válido mas genérico
        console.log('📊 [UniversalFormatter] Generic JSON detected in string format');
        return this.analyzeStructuredContent(parsed);
      } catch (e) {
        console.log('⚠️ [UniversalFormatter] Failed to parse JSON string, treating as text');
      }
    }
    
    // Se é string com markdown
    if (typeof content === 'string' && this.isMarkdownContent(content)) {
      return this.analyzeMarkdownContent(content)
    }
    
    // Se é objeto JSON estruturado
    if (typeof content === 'object' && content !== null) {
      // Verificar se é nosso JSON estruturado da IA
      if (content.metadata && content.metadata.tipo_documento) {
        console.log('📊 [UniversalFormatter] AI JSON detected in object format');
        return this.analyzeAIJsonContent(content);
      }
      return this.analyzeStructuredContent(content)
    }
    
    // Se é texto simples
    if (typeof content === 'string') {
      return this.analyzeTextContent(content)
    }
    
    // Fallback para conteúdo desconhecido
    return this.createFallbackAnalysis(content)
  }

  /**
   * Gera HTML profissional baseado na análise do conteúdo
   */
  generateUniversalHTML(analysis: ContentAnalysis, originalContent: any): string {
    const { metadata, sections } = analysis
    
    // Detectar título automaticamente
    const title = metadata.title || this.extractTitle(originalContent) || 'Relatório de Análise'
    const subtitle = metadata.subtitle || `Processado em ${new Date().toLocaleDateString('pt-BR')}`
    const category = metadata.category || this.detectCategory(originalContent)
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${this.getUniversalCSS()}
    </style>
</head>
<body>
    <div class="container">
        ${this.generateHeader(title, subtitle, category)}
        ${this.generateContent(sections)}
        ${this.generateFooter()}
    </div>
</body>
</html>`
  }

  /**
   * CSS universal que funciona para qualquer tipo de conteúdo
   */
  private getUniversalCSS(): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            margin: 0;
            padding: 0;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            min-height: auto;
            padding: 0;
        }
        
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }
        
        .header h1 {
            font-size: 1.8em;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .header .subtitle {
            font-size: 1em;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        
        .header .category {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            backdrop-filter: blur(10px);
        }
        
        .content {
            padding: 40px;
        }
        
        .section {
            margin: 30px 0;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            border-left: 5px solid #3b82f6;
            background: #f8fafc;
        }
        
        .section-header {
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
            margin: -25px -25px 20px -25px;
            padding: 20px 25px;
            border-radius: 12px 12px 0 0;
            border-left: none;
        }
        
        .section-title {
            font-size: 1.4em;
            font-weight: 600;
            margin: 0;
        }
        
        .section-content {
            color: #374151;
            line-height: 1.8;
        }
        
        .data-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .data-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .data-card h4 {
            color: #1f2937;
            margin-bottom: 10px;
            font-size: 1.1em;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 5px;
        }
        
        .data-value {
            font-size: 1em;
            font-weight: bold;
            color: #1e40af;
            margin: 8px 0;
        }
        
        .universal-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .universal-table th {
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        
        .universal-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .universal-table tr:nth-child(even) {
            background: #f9fafb;
        }
        
        .universal-table tr:hover {
            background: #eff6ff;
            transition: background 0.3s ease;
        }
        
        .universal-list {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
        }
        
        .universal-list ul {
            list-style: none;
            padding: 0;
        }
        
        .universal-list li {
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
            position: relative;
            padding-left: 30px;
        }
        
        .universal-list li:before {
            content: "▶";
            color: #3b82f6;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        
        .universal-list li:last-child {
            border-bottom: none;
        }
        
        .summary-box {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
            text-align: center;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .summary-box h3 {
            margin-bottom: 15px;
            font-size: 1.5em;
        }
        
        .highlight-text {
            background: linear-gradient(120deg, #fbbf24 0%, #f59e0b 100%);
            color: white;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: 600;
        }
        
        .status-success {
            color: #059669;
            font-weight: bold;
        }
        
        .status-warning {
            color: #d97706;
            font-weight: bold;
        }
        
        .status-error {
            color: #dc2626;
            font-weight: bold;
        }
        
        .footer {
            background: #374151;
            color: white;
            padding: 30px;
            text-align: center;
            margin-top: 40px;
        }
        
        .footer p {
            margin: 5px 0;
            opacity: 0.9;
        }
        
        @media print {
            body {
                background: white;
            }
            
            .container {
                box-shadow: none;
            }
            
            .section {
                break-inside: avoid;
                page-break-inside: avoid;
            }
        }
    `
  }

  /**
   * Analisa conteúdo HTML
   */
  private analyzeHTMLContent(html: string): ContentAnalysis {
    const sections: ContentSection[] = []
    
    // Extrair título do HTML
    const titleMatch = html.match(/<title>(.*?)<\/title>/i)
    const title = titleMatch ? titleMatch[1] : undefined
    
    // Detectar se tem tabelas
    const hasTable = html.includes('<table')
    
    // Detectar se tem listas
    const hasLists = html.includes('<ul') || html.includes('<ol')
    
    // Detectar cabeçalhos
    const hasHeaders = html.includes('<h1') || html.includes('<h2') || html.includes('<h3')
    
    sections.push({
      type: 'summary',
      title: 'Conteúdo HTML Processado',
      content: 'Documento HTML completo detectado e processado automaticamente.',
      importance: 'high'
    })
    
    return {
      type: 'html',
      confidence: 0.95,
      sections,
      metadata: {
        title,
        hasTable,
        hasLists,
        hasHeaders,
        category: 'Documento HTML'
      }
    }
  }

  /**
   * Analisa JSON estruturado específico da IA (com metadata, resumo_executivo, etc.)
   */
  private analyzeAIJsonContent(aiData: any): ContentAnalysis {
    const sections: ContentSection[] = []
    
    // Resumo Executivo
    if (aiData.resumo_executivo) {
      sections.push({
        type: 'summary',
        title: 'Resumo Executivo', 
        content: aiData.resumo_executivo,
        importance: 'high'
      })
    }
    
    // Dados Principais
    if (aiData.dados_principais) {
      sections.push({
        type: 'data',
        title: 'Dados Principais',
        content: 'Informações principais extraídas da análise.',
        importance: 'high',
        data: this.extractDataFields(aiData.dados_principais)
      })
    }
    
    // Detalhes Contratuais (Nova seção)
    if (aiData.detalhes_contratuais) {
      sections.push({
        type: 'data',
        title: 'Detalhes Contratuais',
        content: 'Informações específicas sobre o contrato analisado.',
        importance: 'high',
        data: this.extractDataFields(aiData.detalhes_contratuais)
      })
    }
    
    // Análise Detalhada (Nova seção)
    if (aiData.analise_detalhada) {
      sections.push({
        type: 'summary',
        title: 'Análise Detalhada',
        content: aiData.analise_detalhada.conformidade_legal || 'Análise jurídica completa do documento.',
        importance: 'high'
      })
      
      // Cláusulas Principais
      if (aiData.analise_detalhada.clausulas_principais) {
        sections.push({
          type: 'list',
          title: 'Cláusulas Principais',
          content: 'Principais cláusulas identificadas no contrato.',
          importance: 'medium',
          data: aiData.analise_detalhada.clausulas_principais.map((clausula: any, index: number) => ({
            label: `Cláusula ${index + 1}`,
            value: clausula
          }))
        })
      }
      
      // Direitos do Trabalhador
      if (aiData.analise_detalhada.direitos_trabalhador) {
        sections.push({
          type: 'list',
          title: 'Direitos do Trabalhador',
          content: 'Direitos garantidos pela legislação trabalhista.',
          importance: 'medium',
          data: aiData.analise_detalhada.direitos_trabalhador.map((direito: any, index: number) => ({
            label: `Direito ${index + 1}`,
            value: direito
          }))
        })
      }
      
      // Obrigações do Empregador
      if (aiData.analise_detalhada.obrigacoes_empregador) {
        sections.push({
          type: 'list',
          title: 'Obrigações do Empregador',
          content: 'Responsabilidades e obrigações da empresa.',
          importance: 'medium',
          data: aiData.analise_detalhada.obrigacoes_empregador.map((obrigacao: any, index: number) => ({
            label: `Obrigação ${index + 1}`,
            value: obrigacao
          }))
        })
      }
    }
    
    // Conformidade CLT (Nova seção)
    if (aiData.conformidade_clt) {
      sections.push({
        type: 'data',
        title: 'Conformidade com a CLT',
        content: 'Análise de conformidade com a Consolidação das Leis do Trabalho.',
        importance: 'medium',
        data: this.extractDataFields(aiData.conformidade_clt)
      })
    }
    
    // Pontos Principais
    if (aiData.pontos_principais && Array.isArray(aiData.pontos_principais)) {
      sections.push({
        type: 'list', 
        title: 'Pontos Principais',
        content: 'Aspectos mais relevantes identificados na análise.',
        importance: 'high',
        data: aiData.pontos_principais.map((ponto: any, index: number) => ({
          label: `Ponto ${index + 1}`,
          value: ponto
        }))
      })
    }
    
    // Riscos Potenciais (Nova seção)
    if (aiData.riscos_potenciais && Array.isArray(aiData.riscos_potenciais)) {
      sections.push({
        type: 'list',
        title: 'Riscos Potenciais',
        content: 'Pontos de atenção e possíveis riscos identificados.',
        importance: 'medium',
        data: aiData.riscos_potenciais.map((risco: any, index: number) => ({
          label: `Risco ${index + 1}`,
          value: risco
        }))
      })
    }
    
    // Recomendações
    if (aiData.recomendacoes && Array.isArray(aiData.recomendacoes)) {
      sections.push({
        type: 'list',
        title: 'Recomendações', 
        content: 'Ações sugeridas baseadas na análise realizada.',
        importance: 'medium',
        data: aiData.recomendacoes.map((rec: any, index: number) => ({
          label: `Recomendação ${index + 1}`,
          value: rec
        }))
      })
    }
    
    // Conclusão (Nova seção)
    if (aiData.conclusao) {
      sections.push({
        type: 'summary',
        title: 'Conclusão',
        content: aiData.conclusao,
        importance: 'high'
      })
    }
    
    // Nota Final (Nova seção)
    if (aiData.nota_final) {
      sections.push({
        type: 'data',
        title: 'Avaliação Final',
        content: 'Pontuação e classificação geral da análise.',
        importance: 'high',
        data: this.extractDataFields(aiData.nota_final)
      })
    }
    
    return {
      type: 'structured',
      confidence: 0.95,
      sections,
      metadata: {
        title: aiData.metadata?.titulo_relatorio || 'Relatório de Análise IA',
        subtitle: aiData.metadata?.tipo_analise || 'Análise Automatizada',
        category: aiData.metadata?.tipo_documento || 'Documento Analisado'
      }
    }
  }

  /**
   * Analisa conteúdo estruturado (JSON/Object)
   */
  private analyzeStructuredContent(obj: any): ContentAnalysis {
    const sections: ContentSection[] = []
    
    // Tentar extrair dados estruturados
    const keys = Object.keys(obj)
    
    // Procurar por campos comuns
    const dataFields = this.extractDataFields(obj)
    
    if (dataFields.length > 0) {
      sections.push({
        type: 'data',
        title: 'Dados Extraídos',
        content: 'Informações estruturadas identificadas automaticamente.',
        importance: 'high',
        data: dataFields
      })
    }
    
    // Procurar por listas/arrays
    const lists = this.extractLists(obj)
    if (lists.length > 0) {
      sections.push({
        type: 'list',
        title: 'Informações Listadas',
        content: 'Listas e arrays identificados no conteúdo.',
        importance: 'medium',
        data: lists
      })
    }
    
    return {
      type: 'structured',
      confidence: 0.9,
      sections,
      metadata: {
        title: obj.title || obj.nome || obj.name || 'Dados Estruturados',
        category: 'Análise de Dados'
      }
    }
  }

  /**
   * Analisa conteúdo markdown
   */
  private analyzeMarkdownContent(text: string): ContentAnalysis {
    const sections: ContentSection[] = []
    
    // Extrair cabeçalhos
    const headers = text.match(/^#+\s+(.+)$/gm) || []
    
    // Extrair listas
    const lists = text.match(/^[\s]*[-*+]\s+(.+)$/gm) || []
    
    // Extrair tabelas
    const tables = text.match(/\|(.+)\|/g) || []
    
    sections.push({
      type: 'summary',
      title: 'Conteúdo Markdown Processado',
      content: `Documento markdown com ${headers.length} cabeçalhos, ${lists.length} itens de lista e ${tables.length} tabelas.`,
      importance: 'high'
    })
    
    return {
      type: 'markdown',
      confidence: 0.85,
      sections,
      metadata: {
        title: this.extractTitle(text),
        hasHeaders: headers.length > 0,
        hasLists: lists.length > 0,
        hasTable: tables.length > 0,
        category: 'Documento Markdown'
      }
    }
  }

  /**
   * Analisa texto simples
   */
  private analyzeTextContent(text: string): ContentAnalysis {
    const sections: ContentSection[] = []
    
    // Dividir em parágrafos
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0)
    
    paragraphs.forEach((paragraph, index) => {
      sections.push({
        type: 'paragraph',
        title: `Seção ${index + 1}`,
        content: paragraph.trim(),
        importance: index === 0 ? 'high' : 'medium'
      })
    })
    
    return {
      type: 'text',
      confidence: 0.7,
      sections,
      metadata: {
        title: this.extractTitle(text),
        category: 'Documento de Texto'
      }
    }
  }

  /**
   * Cria análise de fallback para conteúdo desconhecido
   */
  private createFallbackAnalysis(content: any): ContentAnalysis {
    return {
      type: 'text',
      confidence: 0.5,
      sections: [{
        type: 'summary',
        title: 'Conteúdo Processado',
        content: 'Conteúdo detectado e processado automaticamente pelo sistema.',
        importance: 'medium'
      }],
      metadata: {
        title: 'Relatório Automático',
        category: 'Processamento Geral'
      }
    }
  }

  /**
   * Utilitários de detecção e extração
   */
  private isMarkdownContent(text: string): boolean {
    return text.includes('#') || text.includes('**') || text.includes('- ') || text.includes('* ')
  }

  private extractTitle(content: any): string | undefined {
    if (typeof content === 'string') {
      // Tentar extrair primeira linha como título
      const firstLine = content.split('\n')[0].trim()
      if (firstLine.length > 0 && firstLine.length < 100) {
        return firstLine.replace(/^#+\s*/, '') // Remove markdown headers
      }
    }
    
    if (typeof content === 'object' && content) {
      return content.title || content.nome || content.name || content.titulo
    }
    
    return undefined
  }

  private detectCategory(content: any): string {
    const text = JSON.stringify(content).toLowerCase()
    
    if (text.includes('contrato') || text.includes('clt')) return 'Jurídico'
    if (text.includes('currículo') || text.includes('candidato')) return 'RH'
    if (text.includes('despesa') || text.includes('financeiro')) return 'Financeiro'
    if (text.includes('relatório') || text.includes('análise')) return 'Análise'
    
    return 'Geral'
  }

  private extractDataFields(obj: any): Array<{key: string, value: any, type: string}> {
    const fields: Array<{key: string, value: any, type: string}> = []
    
    const traverse = (o: any, prefix = '') => {
      Object.keys(o).forEach(key => {
        const value = o[key]
        const fullKey = prefix ? `${prefix}.${key}` : key
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          traverse(value, fullKey)
        } else if (!Array.isArray(value)) {
          fields.push({
            key: fullKey,
            value,
            type: typeof value
          })
        }
      })
    }
    
    traverse(obj)
    return fields.slice(0, 20) // Limitar a 20 campos
  }

  private extractLists(obj: any): Array<{title: string, items: any[]}> {
    const lists: Array<{title: string, items: any[]}> = []
    
    const traverse = (o: any, path = '') => {
      Object.keys(o).forEach(key => {
        const value = o[key]
        if (Array.isArray(value)) {
          lists.push({
            title: path ? `${path}.${key}` : key,
            items: value
          })
        } else if (typeof value === 'object' && value !== null) {
          traverse(value, path ? `${path}.${key}` : key)
        }
      })
    }
    
    traverse(obj)
    return lists
  }

  /**
   * Gera cabeçalho universal
   */
  private generateHeader(title: string, subtitle: string, category: string): string {
    return `
      <div class="header">
        <div class="category">${category}</div>
        <h1>${title}</h1>
        <div class="subtitle">${subtitle}</div>
      </div>
    `
  }

  /**
   * Gera conteúdo baseado nas seções analisadas
   */
  private generateContent(sections: ContentSection[]): string {
    let html = '<div class="content">'
    
    sections.forEach((section, index) => {
      html += `<div class="section">`
      
      if (section.title) {
        html += `<div class="section-header"><h3 class="section-title">${section.title}</h3></div>`
      }
      
      html += `<div class="section-content">`
      
      if (section.type === 'data' && section.data) {
        html += this.generateDataGrid(section.data)
      } else if (section.type === 'list' && section.data) {
        html += this.generateLists(section.data)
      } else {
        html += `<p>${section.content}</p>`
      }
      
      html += `</div></div>`
    })
    
    html += '</div>'
    return html
  }

  /**
   * Gera grid de dados
   */
  private generateDataGrid(fields: Array<{key: string, value: any, type: string}>): string {
    let html = '<div class="data-grid">'
    
    fields.forEach(field => {
      html += `
        <div class="data-card">
          <h4>${this.formatFieldName(field.key)}</h4>
          <div class="data-value">${this.formatFieldValue(field.value)}</div>
        </div>
      `
    })
    
    html += '</div>'
    return html
  }

  /**
   * Gera listas
   */
  private generateLists(lists: Array<{title: string, items: any[]}>): string {
    let html = ''
    
    lists.forEach(list => {
      html += `
        <div class="universal-list">
          <h4>${this.formatFieldName(list.title)}</h4>
          <ul>
            ${list.items.map(item => `<li>${this.formatFieldValue(item)}</li>`).join('')}
          </ul>
        </div>
      `
    })
    
    return html
  }

  /**
   * Gera rodapé
   */
  private generateFooter(): string {
    return `
      <div class="footer">
        <p>📄 Relatório gerado automaticamente pelo AutomateAI</p>
        <p>Sistema Universal de Formatação - ${new Date().toLocaleString('pt-BR')}</p>
        <p>Processamento inteligente para qualquer tipo de agente personalizado</p>
      </div>
    `
  }

  /**
   * Utilitários de formatação
   */
  private formatFieldName(key: string): string {
    return key
      .split('.')
      .pop()!
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
  }

  private formatFieldValue(value: any): string {
    if (typeof value === 'boolean') {
      return value ? '✅ Sim' : '❌ Não'
    }
    
    if (typeof value === 'number') {
      return value.toLocaleString('pt-BR')
    }
    
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...'
    }
    
    return String(value)
  }
}

/**
 * Função principal para uso externo
 */
import { renderMarkdownToHTML } from '@/lib/markdown-formatter'

/**
 * Converte JSON da IA para HTML profissional
 */
function generateHTMLFromJSON(jsonData: any): string {
  const { metadata, resumo_executivo, dados_principais, pontos_principais, avaliacao, recomendacoes, conclusao } = jsonData;
  
  return `<!DOCTYPE html><html lang="pt-BR"><head>
    <meta charset="UTF-8">
    <title>${metadata?.titulo_relatorio || 'Relatório de Análise'}</title>
    <style>
      body { 
        font-family: 'Segoe UI', Arial, sans-serif; 
        line-height: 1.6; 
        margin: 40px; 
        color: #333;
        background: white;
      }
      .header {
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 3px solid #2563eb;
      }
      .header h1 {
        margin: 0;
        color: #1f2937;
        font-size: 28px;
        font-weight: bold;
      }
      .header .meta {
        margin-top: 15px;
        color: #6b7280;
        font-size: 14px;
      }
      .section {
        margin: 30px 0;
        padding: 25px;
        background: #f9fafb;
        border-radius: 8px;
        border-left: 4px solid #2563eb;
      }
      .section h2 {
        color: #2563eb;
        font-size: 22px;
        margin-top: 0;
        margin-bottom: 15px;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 8px;
      }
      .section h3 {
        color: #1f2937;
        font-size: 18px;
        margin-top: 20px;
        margin-bottom: 10px;
      }
      .highlight-box {
        background: #dbeafe;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
        border-left: 4px solid #3b82f6;
      }
      .data-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin: 20px 0;
      }
      .data-item {
        background: white;
        padding: 15px;
        border-radius: 6px;
        border: 1px solid #e5e7eb;
      }
      .data-item strong {
        color: #1f2937;
        font-weight: 600;
      }
      ul, ol { 
        padding-left: 25px;
      }
      li { 
        margin: 8px 0;
        line-height: 1.5;
      }
      .points-positive {
        background: #ecfdf5;
        border-left: 4px solid #10b981;
      }
      .points-attention {
        background: #fef3c7;
        border-left: 4px solid #f59e0b;
      }
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #d1d5db;
        text-align: center;
        color: #6b7280;
        font-size: 12px;
      }
    </style>
  </head><body>
    
    <div class="header">
      <h1>${metadata?.titulo_relatorio || 'RELATÓRIO DE ANÁLISE'}</h1>
      <div class="meta">
        <div>📄 ${metadata?.tipo_analise || 'Análise Automatizada'}</div>
        <div>📅 Gerado em ${metadata?.data_analise || new Date().toLocaleDateString('pt-BR')}</div>
        <div>🏷️ Tipo: ${metadata?.tipo_documento || 'Documento'}</div>
      </div>
    </div>

    ${resumo_executivo ? `
    <div class="section highlight-box">
      <h2>📋 RESUMO EXECUTIVO</h2>
      <p>${resumo_executivo}</p>
    </div>
    ` : ''}

    ${dados_principais ? `
    <div class="section">
      <h2>📊 DADOS PRINCIPAIS</h2>
      <div class="data-grid">
        ${Object.entries(dados_principais).map(([key, value]) => {
          if (typeof value === 'object') {
            return `
              <div class="data-item">
                <h3>${key.replace(/_/g, ' ').toUpperCase()}</h3>
                ${Object.entries(value as any).map(([subKey, subValue]) => 
                  `<div><strong>${subKey.replace(/_/g, ' ')}:</strong> ${subValue}</div>`
                ).join('')}
              </div>
            `;
          } else {
            return `
              <div class="data-item">
                <strong>${key.replace(/_/g, ' ')}:</strong> ${value}
              </div>
            `;
          }
        }).join('')}
      </div>
    </div>
    ` : ''}

    ${pontos_principais?.length ? `
    <div class="section">
      <h2>🎯 PONTOS PRINCIPAIS</h2>
      <ol>
        ${pontos_principais.map((ponto: string) => `<li>${ponto}</li>`).join('')}
      </ol>
    </div>
    ` : ''}

    ${avaliacao ? `
    <div class="section">
      <h2>📈 AVALIAÇÃO</h2>
      ${avaliacao.pontuacao_geral ? `<div class="highlight-box"><strong>Pontuação Geral:</strong> ${avaliacao.pontuacao_geral}</div>` : ''}
      
      ${avaliacao.pontos_fortes?.length ? `
        <div class="section points-positive">
          <h3>✅ PONTOS FORTES</h3>
          <ul>
            ${avaliacao.pontos_fortes.map((ponto: string) => `<li>${ponto}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${avaliacao.pontos_atencao?.length ? `
        <div class="section points-attention">
          <h3>⚠️ PONTOS DE ATENÇÃO</h3>
          <ul>
            ${avaliacao.pontos_atencao.map((ponto: string) => `<li>${ponto}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
    ` : ''}

    ${recomendacoes?.length ? `
    <div class="section">
      <h2>💡 RECOMENDAÇÕES</h2>
      <ol>
        ${recomendacoes.map((rec: string) => `<li>${rec}</li>`).join('')}
      </ol>
    </div>
    ` : ''}

    ${conclusao ? `
    <div class="section highlight-box">
      <h2>🎯 CONCLUSÃO</h2>
      <p>${conclusao}</p>
    </div>
    ` : ''}

    <div class="footer">
      <p>Relatório gerado pelo Sistema AutomateAI - Análise Inteligente de Documentos</p>
      <p>Sistema Flexível e Universal - Adaptável para Qualquer Tipo de Documento</p>
    </div>
  </body></html>`;
};

export function generateUniversalPDF(content: any): string {
  console.log('🔧 [UniversalFormatter] Starting universal PDF generation...')
  console.log('📊 [UniversalFormatter] Content type:', typeof content)
  console.log('📋 [UniversalFormatter] Content preview:', 
    typeof content === 'string' ? content.substring(0, 100) + '...' : 
    typeof content === 'object' ? Object.keys(content) : content)
  
  // 🔧 DEBUG: Log detalhado se é objeto
  if (typeof content === 'object' && content !== null) {
    console.log('🔍 [UniversalFormatter] Object analysis:', {
      hasAnalysis: !!content.analysis,
      analysisType: typeof content.analysis,
      analysisPreview: content.analysis ? content.analysis.substring(0, 200) + '...' : 'null',
      hasMetadata: !!content.metadata,
      hasJsonData: !!content.json_data
    });
  }
  
  // Lógica de Roteamento Inteligente de Formatação
  if (typeof content === 'string') {
    // 1. Se for HTML completo, usar diretamente (pass-through)
    if (content.trim().toLowerCase().startsWith('<!doctype html>') || content.trim().toLowerCase().startsWith('<html>')) {
      console.log('✅ [UniversalFormatter] Full HTML detected. Passing through without modification.');
      return content;
    }
    
    // 🔧 NOVO: 2. Se for string JSON da IA, parsear e formatar
    if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
      try {
        const parsed = JSON.parse(content);
        if (parsed.metadata && parsed.metadata.tipo_documento) {
          console.log('📊 [UniversalFormatter] AI JSON string detected. Parsing and formatting.');
          console.log('📊 [UniversalFormatter] Document type:', parsed.metadata.tipo_documento);
          return generateHTMLFromJSON(parsed);
        }
      } catch (e) {
        console.log('⚠️ [UniversalFormatter] Failed to parse JSON string, treating as text');
      }
    }
    
    // 3. Se for Markdown ou texto simples, usar o formatador de Markdown
    console.log('🎨 [UniversalFormatter] Markdown or plain text detected. Applying markdown formatter.');
    const formattedHtml = renderMarkdownToHTML(content);
    // Envolver com uma estrutura HTML mínima para garantir a renderização correta no PDF
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório</title></head><body>${formattedHtml}</body></html>`;
  }

  // 3. Se for um objeto, verificar se é JSON ou reportContent
  if (typeof content === 'object' && content !== null) {
    // 🔧 CORREÇÃO CRÍTICA: Detectar se o analysis field contém JSON da IA
    if (content.analysis && typeof content.analysis === 'string' && 
        content.analysis.trim().startsWith('{') && content.analysis.trim().endsWith('}')) {
      try {
        const parsed = JSON.parse(content.analysis);
        if (parsed.metadata && parsed.metadata.tipo_documento) {
          console.log('📊 [UniversalFormatter] AI JSON detected in analysis field. Converting to professional HTML.');
          console.log('📊 [UniversalFormatter] Document type:', parsed.metadata.tipo_documento);
          return generateHTMLFromJSON(parsed);
        }
      } catch (e) {
        console.log('⚠️ [UniversalFormatter] Failed to parse JSON in analysis field, treating as regular content');
      }
    }
    
    // 3A. Detectar se é um JSON da IA (tem metadata ou json_data) - Objeto direto
    if (content.metadata && content.metadata.tipo_documento) {
      console.log('📊 [UniversalFormatter] AI JSON detected. Converting to professional HTML.');
      console.log('📊 [UniversalFormatter] Document type:', content.metadata.tipo_documento);
      return generateHTMLFromJSON(content);
    }
    
    // 3A2. Detectar se é um reportContent com json_data
    if (content.json_data && content.json_data.metadata) {
      console.log('📊 [UniversalFormatter] ReportContent with JSON data detected.');
      console.log('📊 [UniversalFormatter] Document type:', content.json_data.metadata.tipo_documento);
      return generateHTMLFromJSON(content.json_data);
    }
    
    // 3B. Detectar se é um objeto estruturado moderno (tem key_points, recommendations, etc.)
    if (content.summary || content.key_points || content.recommendations || content.analysis_type) {
      console.log('📊 [UniversalFormatter] Modern structured object detected. Converting to professional HTML.');
      console.log('📊 [UniversalFormatter] Object keys:', Object.keys(content));
      
      // Usar o novo sistema de formatação estruturada
      return generateModernStructuredHTML(content);
    }
    
    // Se não tem summary, usar a lógica estruturada original
    console.log('📊 [UniversalFormatter] Generic structured object detected. Using class-based formatter.');
    const formatter = new UniversalPDFFormatter();
    const analysis = formatter.analyzeContent(content);
    const html = formatter.generateUniversalHTML(analysis, content);
    console.log('✅ [UniversalFormatter] HTML generated successfully from object, length:', html.length);
    return html;
  }

  // Fallback: Se não for nenhum dos tipos esperados, tentar formatar como texto
  console.log('⚠️ [UniversalFormatter] Unknown content type. Using fallback text formatter.');
  return renderMarkdownToHTML(String(content));
}

/**
 * Gera HTML profissional para objetos estruturados modernos
 * Funciona com dados do tipo: { summary, key_points, recommendations, analysis_type, etc. }
 */
function generateModernStructuredHTML(content: any): string {
  console.log('🎨 [ModernStructuredHTML] Generating professional HTML for structured data');
  console.log('🎨 [ModernStructuredHTML] Content type:', typeof content);
  console.log('🎨 [ModernStructuredHTML] Content keys:', Object.keys(content));
  console.log('🎨 [ModernStructuredHTML] Full content preview:', JSON.stringify(content, null, 2).substring(0, 500));
  
  // 🔧 NOVO: Se o analysis é uma string JSON, parsear primeiro
  if (content.analysis && typeof content.analysis === 'string' && content.analysis.trim().startsWith('{')) {
    try {
      const parsedAnalysis = JSON.parse(content.analysis);
      console.log('🎨 [ModernStructuredHTML] Parsed JSON analysis:', Object.keys(parsedAnalysis));
      
      // Usar dados parseados em vez do JSON bruto
      content = {
        ...content,
        ...parsedAnalysis,
        originalAnalysis: content.analysis // Manter original como backup
      };
    } catch (e) {
      console.log('⚠️ [ModernStructuredHTML] Failed to parse analysis JSON');
    }
  }
  
  const title = content.title || content.agentName || content.titulo_relatorio || 'Relatório de Análise';
  const timestamp = content.timestamp || new Date().toLocaleString('pt-BR');
  
  let sectionsHTML = '';
  
  // 🔧 NOVO: Processar resumo_executivo específico do JSON
  if (content.resumo_executivo && content.resumo_executivo.trim()) {
    console.log('🎨 [ModernStructuredHTML] Found resumo_executivo:', content.resumo_executivo.substring(0, 100));
    sectionsHTML += `
      <div class="section">
        <h2>📋 Resumo Executivo</h2>
        <p class="summary-text">${content.resumo_executivo}</p>
      </div>
    `;
  }
  
  // Fallback para summary genérico
  if (!content.resumo_executivo && content.summary && typeof content.summary === 'string' && content.summary.trim()) {
    console.log('🎨 [ModernStructuredHTML] Found summary:', content.summary.substring(0, 100));
    sectionsHTML += `
      <div class="section">
        <h2>📋 Resumo Executivo</h2>
        <p class="summary-text">${content.summary}</p>
      </div>
    `;
  }
  
  // 🔥 NOVO: Se não tem resumo, mas tem raw_content, tentar extrair
  if (!sectionsHTML && content.raw_content && typeof content.raw_content === 'string') {
    console.log('🎨 [ModernStructuredHTML] Trying to parse raw_content as JSON');
    try {
      const rawData = JSON.parse(content.raw_content);
      if (rawData.resumo_executivo) {
        sectionsHTML += `
          <div class="section">
            <h2>📋 Resumo Executivo</h2>
            <p class="summary-text">${rawData.resumo_executivo}</p>
          </div>
        `;
      }
      // Processar outros campos do raw_content
      content = { ...content, ...rawData };
    } catch (e) {
      console.log('⚠️ [ModernStructuredHTML] Failed to parse raw_content as JSON');
    }
  }
  
  // 🔧 NOVO: Processar dados_principais específicos
  if (content.dados_principais && typeof content.dados_principais === 'object') {
    sectionsHTML += `
      <div class="section">
        <h2>🎯 Dados Principais</h2>
        <div class="data-grid">
    `;
    
    // Processar empregador
    if (content.dados_principais.empregador) {
      const emp = content.dados_principais.empregador;
      sectionsHTML += `
        <div class="data-card">
          <h3>🏢 Empregador</h3>
          <p><strong>Razão Social:</strong> ${emp.razao_social || 'N/A'}</p>
          <p><strong>CNPJ:</strong> ${emp.cnpj || 'N/A'}</p>
          <p><strong>Endereço:</strong> ${emp.endereco || 'N/A'}</p>
        </div>
      `;
    }
    
    // Processar empregado
    if (content.dados_principais.empregado) {
      const emp = content.dados_principais.empregado;
      sectionsHTML += `
        <div class="data-card">
          <h3>👤 Empregado</h3>
          <p><strong>Nome:</strong> ${emp.nome || 'N/A'}</p>
          <p><strong>CPF:</strong> ${emp.cpf || 'N/A'}</p>
          <p><strong>Cargo:</strong> ${emp.cargo || 'N/A'}</p>
          <p><strong>Salário:</strong> ${emp.salario || 'N/A'}</p>
        </div>
      `;
    }
    
    sectionsHTML += `
        </div>
      </div>
    `;
  }
  
  // Análise Principal (se disponível)
  if (content.analysis) {
    sectionsHTML += `
      <div class="section">
        <h2>🔍 Análise Detalhada</h2>
        <div class="analysis-content">${renderMarkdownToHTML(content.analysis)}</div>
      </div>
    `;
  }
  
  // Pontos Principais
  if (content.key_points && Array.isArray(content.key_points)) {
    sectionsHTML += `
      <div class="section">
        <h2>💡 Pontos Principais</h2>
        <ul class="key-points">
          ${content.key_points.map((point: string) => `<li>${point}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  // Recomendações
  if (content.recommendations && Array.isArray(content.recommendations)) {
    sectionsHTML += `
      <div class="section">
        <h2>🎯 Recomendações</h2>
        <ol class="recommendations">
          ${content.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
        </ol>
      </div>
    `;
  }
  
  // Dados Adicionais (todos os outros campos)
  const excludeFields = ['summary', 'key_points', 'recommendations', 'analysis', 'title', 'agentName', 'timestamp', 'confidence', 'executionId'];
  const additionalFields = Object.entries(content).filter(([key]) => !excludeFields.includes(key));
  
  if (additionalFields.length > 0) {
    sectionsHTML += `
      <div class="section">
        <h2>📊 Informações Adicionais</h2>
        <div class="additional-data">
          ${additionalFields.map(([key, value]) => `
            <div class="data-item">
              <strong>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong>
              <span>${typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 40px;
            background: #f8fafc;
            color: #1e293b;
        }
        
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        }
        
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 2.2em;
            font-weight: 700;
        }
        
        .header .meta {
            opacity: 0.9;
            font-size: 1.1em;
        }
        
        .section {
            background: white;
            margin: 25px 0;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
            border-left: 5px solid #3b82f6;
        }
        
        .section h2 {
            color: #1e40af;
            margin: 0 0 20px 0;
            font-size: 1.4em;
            font-weight: 600;
        }
        
        .summary-text {
            font-size: 1.1em;
            line-height: 1.7;
            color: #374151;
        }
        
        .key-points, .recommendations {
            margin: 0;
            padding-left: 20px;
        }
        
        .key-points li, .recommendations li {
            margin: 10px 0;
            color: #374151;
        }
        
        .additional-data .data-item {
            margin: 15px 0;
            padding: 15px;
            background: #f1f5f9;
            border-radius: 8px;
            border-left: 3px solid #64748b;
        }
        
        .additional-data .data-item strong {
            display: block;
            color: #475569;
            margin-bottom: 5px;
            font-weight: 600;
        }
        
        .additional-data .data-item span {
            color: #64748b;
        }
        
        .analysis-content {
            color: #374151;
        }
        
        .data-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 15px;
        }
        
        .data-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        
        .data-card h3 {
            margin: 0 0 15px 0;
            color: #1e40af;
            font-size: 1.1em;
        }
        
        .data-card p {
            margin: 8px 0;
            color: #374151;
        }
        
        .json-content {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #475569;
            overflow-x: auto;
        }
        
        .analysis-content h1, .analysis-content h2, .analysis-content h3 {
            color: #1e40af;
            margin-top: 25px;
        }
        
        @media print {
            body { background: white; }
            .section { box-shadow: none; border: 1px solid #e2e8f0; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <div class="meta">Gerado em ${timestamp}</div>
    </div>
    
    ${sectionsHTML || `
      <div class="section">
        <h2>📄 Conteúdo do Relatório</h2>
        <div class="analysis-content">
          ${content.analysis ? renderMarkdownToHTML(content.analysis) : 
            content.raw_content ? `<pre class="json-content">${content.raw_content}</pre>` :
            '<p class="text-gray-600">Dados estruturados processados com sucesso.</p>'}
        </div>
      </div>
    `}
    
    <div style="margin-top: 40px; text-align: center; color: #64748b; font-size: 0.9em;">
        Relatório gerado automaticamente pelo AutomateAI
    </div>
</body>
</html>`;
}
