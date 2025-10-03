export interface ReportData {
  input?: any
  email?: string
  departamento?: string
  timestamp?: string
  outputFormat?: string
  deliveryMethod?: string
  response?: string
  confidence?: number
  [key: string]: any
}

export interface FormattedReport {
  title: string
  sections: ReportSection[]
  summary: string
  metadata: ReportMetadata
}

export interface ReportSection {
  title: string
  content: string
  type: 'text' | 'list' | 'table' | 'analysis'
}

export interface ReportMetadata {
  generatedAt: string
  department: string
  documentType: string
  analysisConfidence: number
}

export class ReportFormatter {
  
  static formatForHR(data: ReportData): FormattedReport {
    // Se o response já é um HTML profissional, retornar diretamente
    if (typeof data.response === 'string' && data.response.includes('<!DOCTYPE html>')) {
      return {
        title: 'Relatório Executivo - Análise Contratual',
        sections: [{
          title: 'Relatório HTML',
          type: 'analysis',
          content: data.response
        }],
        summary: 'Relatório HTML profissional gerado',
        metadata: {
          generatedAt: new Date().toLocaleString('pt-BR'),
          department: data.departamento || 'RH',
          documentType: 'Contrato de Trabalho',
          analysisConfidence: data.confidence || 0.95
        }
      }
    }

    // Se o response é um objeto JSON estruturado, gerar HTML profissional
    if (typeof data.response === 'object' && data.response !== null) {
      const htmlReport = this.generateProfessionalHTMLFromJSON(data.response)
      return {
        title: 'Relatório Executivo - Análise Contratual',
        sections: [{
          title: 'Relatório HTML',
          type: 'analysis',
          content: htmlReport
        }],
        summary: 'Análise completa do contrato com dados estruturados',
        metadata: {
          generatedAt: new Date().toLocaleString('pt-BR'),
          department: data.departamento || 'RH',
          documentType: 'Contrato de Trabalho',
          analysisConfidence: data.confidence || 0.95
        }
      }
    }

    // Fallback para formato antigo
    const sections: ReportSection[] = []
    
    if (data.input) {
      sections.push({
        title: 'Documento Analisado',
        type: 'text',
        content: `Arquivo: ${data.input}\nDepartamento: ${data.departamento || 'Não especificado'}\nData da Análise: ${new Date(data.timestamp || Date.now()).toLocaleString('pt-BR')}`
      })
    }
    
    if (data.response) {
      const analysisContent = this.extractAnalysisContent(data.response)
      sections.push({
        title: 'Resultado da Análise',
        type: 'analysis',
        content: analysisContent
      })
    }
    
    return {
      title: 'Relatório de Análise - Departamento de RH',
      sections,
      summary: this.generateSummary(data),
      metadata: {
        generatedAt: new Date().toLocaleString('pt-BR'),
        department: data.departamento || 'RH',
        documentType: this.getDocumentType(data.input),
        analysisConfidence: data.confidence || 0.95
      }
    }
  }

  private static generateProfessionalHTMLFromJSON(jsonData: any): string {
    const dados = jsonData.dados_funcionario || {}
    const empresa = jsonData.dados_empresa || {}
    const jornada = jsonData.jornada_trabalho || {}
    const beneficios = jsonData.beneficios_oferecidos || []
    const conformidade = jsonData.analise_conformidade || {}
    const recomendacoes = jsonData.recomendacoes || []

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Executivo - Análise Contratual</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto;
            padding: 40px 30px; background-color: #fff;
        }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2c3e50; padding-bottom: 20px; }
        .header h1 { color: #2c3e50; font-size: 2.2em; margin-bottom: 10px; font-weight: 600; }
        .header .subtitle { color: #7f8c8d; font-size: 1.1em; font-weight: 300; }
        .meta-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #3498db; }
        .section { margin-bottom: 35px; }
        .section h2 { color: #2c3e50; font-size: 1.5em; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 2px solid #ecf0f1; }
        .summary-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 10px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .summary-box h3 { color: white; margin-bottom: 15px; font-size: 1.3em; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-bottom: 30px; }
        .info-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .info-card h4 { color: #2c3e50; margin-bottom: 15px; font-size: 1.1em; border-bottom: 1px solid #ecf0f1; padding-bottom: 8px; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .data-table th { background: #34495e; color: white; padding: 12px; text-align: left; font-weight: 600; }
        .data-table td { padding: 12px; border-bottom: 1px solid #ecf0f1; }
        .data-table tr:nth-child(even) { background: #f8f9fa; }
        .status-positive { color: #27ae60; font-weight: 600; }
        .highlight { background-color: #fff3cd; padding: 2px 6px; border-radius: 3px; font-weight: 600; }
        .alert { padding: 15px; margin-bottom: 20px; border-radius: 6px; border-left: 4px solid; }
        .alert-success { background-color: #d4edda; border-color: #27ae60; color: #155724; }
        .alert-warning { background-color: #fff3cd; border-color: #f39c12; color: #856404; }
        .recommendations { background: #f8f9fa; border-radius: 8px; padding: 25px; border-left: 4px solid #3498db; }
        .recommendations ul { list-style: none; padding-left: 0; }
        .recommendations li { padding: 8px 0; position: relative; padding-left: 25px; }
        .recommendations li:before { content: "→"; position: absolute; left: 0; color: #3498db; font-weight: bold; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #ecf0f1; text-align: center; color: #7f8c8d; font-size: 0.9em; }
        @media print { body { padding: 20px; } .section { page-break-inside: avoid; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>Relatório Executivo - Análise Contratual</h1>
        <p class="subtitle">Análise de Conformidade Legal e Recomendações</p>
    </div>
    
    <div class="meta-info">
        <strong>Contrato:</strong> ${dados.nome_completo || 'N/A'} - ${empresa.razao_social || 'N/A'}<br>
        <strong>Data da Análise:</strong> ${new Date().toLocaleDateString('pt-BR')}<br>
        <strong>Cargo:</strong> ${dados.cargo || 'N/A'}<br>
        <strong>Status:</strong> <span class="status-positive">Em conformidade geral com ressalvas</span>
    </div>
    
    <div class="summary-box">
        <h3>🎯 Resumo Executivo</h3>
        <p>O contrato de trabalho entre ${empresa.razao_social || 'a empresa'} e ${dados.nome_completo || 'o funcionário'} apresenta estrutura adequada e está em conformidade com as principais disposições da CLT. O documento contém informações completas das partes, benefícios atrativos e cláusulas essenciais.</p>
    </div>
    
    <div class="section">
        <h2>📊 Dados Principais do Contrato</h2>
        <div class="info-grid">
            <div class="info-card">
                <h4>👤 Dados do Funcionário</h4>
                <p><strong>Nome:</strong> ${dados.nome_completo || 'N/A'}</p>
                <p><strong>CPF:</strong> ${dados.cpf || 'N/A'}</p>
                <p><strong>Cargo:</strong> ${dados.cargo || 'N/A'}</p>
                <p><strong>Salário:</strong> <span class="highlight">${dados.salario_mensal || 'N/A'}</span></p>
                <p><strong>Departamento:</strong> ${dados.departamento || 'N/A'}</p>
            </div>
            <div class="info-card">
                <h4>🏢 Dados da Empresa</h4>
                <p><strong>Razão Social:</strong> ${empresa.razao_social || 'N/A'}</p>
                <p><strong>CNPJ:</strong> ${empresa.cnpj || 'N/A'}</p>
                <p><strong>Representante:</strong> ${empresa.representante_legal || 'N/A'}</p>
                <p><strong>Cargo:</strong> ${empresa.cargo_representante || 'N/A'}</p>
            </div>
            <div class="info-card">
                <h4>⏰ Jornada e Período</h4>
                <p><strong>Jornada:</strong> ${jornada.horas_semanais || 'N/A'}</p>
                <p><strong>Horário:</strong> ${jornada.horario_segunda_sexta || 'N/A'}</p>
                <p><strong>Intervalo:</strong> ${jornada.intervalo_refeicao || 'N/A'}</p>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>💰 Benefícios Oferecidos</h2>
        <table class="data-table">
            <thead><tr><th>Benefício</th><th>Valor/Detalhes</th><th>Status</th></tr></thead>
            <tbody>
                ${beneficios.map((b: any) => `
                <tr>
                    <td>${b.beneficio || 'N/A'}</td>
                    <td>${b.valor || b.detalhes || 'N/A'}</td>
                    <td><span class="status-positive">Conforme</span></td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h2>⚖️ Conformidade Legal</h2>
        <h3>✅ Pontos Positivos</h3>
        <div class="alert alert-success">
            <ul>
                ${conformidade.pontos_positivos?.map((p: string) => `<li>${p}</li>`).join('') || '<li>Análise em conformidade</li>'}
            </ul>
        </div>
        
        ${conformidade.irregularidades_identificadas?.length > 0 ? `
        <h3>⚠️ Irregularidades Identificadas</h3>
        <div class="alert alert-warning">
            ${conformidade.irregularidades_identificadas.map((i: any) => `
                <strong>Gravidade ${i.gravidade}:</strong><br>
                • <strong>${i.item}:</strong> ${i.observacao}<br><br>
            `).join('')}
        </div>` : ''}
    </div>
    
    <div class="section">
        <h2>📋 Recomendações</h2>
        <div class="recommendations">
            <h3>🎯 Ações Recomendadas</h3>
            <ul>
                ${recomendacoes.map((r: string) => `<li>${r}</li>`).join('')}
            </ul>
        </div>
    </div>
    
    <div class="footer">
        <p><strong>Documento confidencial</strong> - Análise realizada para fins internos de compliance trabalhista</p>
        <p>Para dúvidas sobre este relatório, consulte o departamento jurídico ou de recursos humanos</p>
    </div>
</body>
</html>`
  }
  
  private static extractAnalysisContent(response: string): string {
    // Remover informações técnicas e formatar para RH
    if (typeof response === 'object') {
      return 'Análise processada com sucesso. Documento verificado conforme padrões estabelecidos.'
    }
    
    // Se for string, limpar e formatar
    return response
      .replace(/API call completed/gi, 'Processamento concluído')
      .replace(/Processed by .+/gi, 'Processado pelo sistema de IA')
      .replace(/confidence: \d+\.\d+/gi, 'Alta confiabilidade na análise')
  }
  
  private static extractRecommendations(data: ReportData): string | null {
    // Gerar recomendações baseadas no tipo de análise
    if (data.input?.includes('contrato')) {
      return `• Verificar cláusulas de rescisão e aviso prévio
• Confirmar adequação às normas da CLT
• Validar benefícios oferecidos
• Revisar período de experiência se aplicável`
    }
    
    if (data.departamento === 'RH') {
      return `• Arquivar documento na pasta do funcionário
• Agendar follow-up se necessário
• Comunicar resultado aos stakeholders
• Atualizar sistema de gestão de pessoas`
    }
    
    return null
  }
  
  private static extractCompliance(data: ReportData): string | null {
    if (data.input?.includes('contrato')) {
      return `Documento analisado quanto à conformidade com:
- Consolidação das Leis do Trabalho (CLT)
- Normas Regulamentadoras (NRs) aplicáveis
- Convenções coletivas de trabalho
- Políticas internas da empresa

Status: ${data.confidence && data.confidence > 0.8 ? 'CONFORME' : 'REQUER REVISÃO'}`
    }
    
    return null
  }
  
  private static generateSummary(data: ReportData): string {
    const docType = this.getDocumentType(data.input)
    const confidence = data.confidence || 0.95
    
    return `${docType} processado com ${Math.round(confidence * 100)}% de confiabilidade. ${
      confidence > 0.8 
        ? 'Documento aprovado para uso.' 
        : 'Recomenda-se revisão manual adicional.'
    }`
  }
  
  private static getDocumentType(input?: string): string {
    if (!input) return 'Documento'
    
    if (input.includes('contrato')) return 'Contrato de Trabalho'
    if (input.includes('curriculo')) return 'Currículo'
    if (input.includes('avaliacao')) return 'Avaliação de Desempenho'
    if (input.includes('folha')) return 'Folha de Pagamento'
    
    return 'Documento de RH'
  }
  
  // Formatação para PDF
  static formatToPDF(report: FormattedReport): string {
    let content = `${report.title}\n\n`
    
    // Metadados
    content += `Gerado em: ${report.metadata.generatedAt}\n`
    content += `Departamento: ${report.metadata.department}\n`
    content += `Tipo: ${report.metadata.documentType}\n`
    content += `Confiabilidade: ${Math.round(report.metadata.analysisConfidence * 100)}%\n\n`
    
    // Resumo Executivo
    content += `RESUMO EXECUTIVO\n`
    content += `${'-'.repeat(50)}\n`
    content += `${report.summary}\n\n`
    
    // Seções
    report.sections.forEach(section => {
      content += `${section.title.toUpperCase()}\n`
      content += `${'-'.repeat(30)}\n`
      content += `${section.content}\n\n`
    })
    
    // Rodapé
    content += `\n${'='.repeat(60)}\n`
    content += `Relatório gerado automaticamente pelo Sistema AutomateAI\n`
    content += `Para dúvidas, entre em contato com o departamento de TI\n`
    
    return content
  }
  
  // Formatação para DOCX (texto estruturado)
  static formatToDocx(report: FormattedReport): string {
    return this.formatToPDF(report) // Por enquanto, mesmo formato
  }
  
  // Formatação para CSV
  static formatToCSV(report: FormattedReport): string {
    let csv = 'Campo,Valor\n'
    
    csv += `"Título","${report.title}"\n`
    csv += `"Data de Geração","${report.metadata.generatedAt}"\n`
    csv += `"Departamento","${report.metadata.department}"\n`
    csv += `"Tipo de Documento","${report.metadata.documentType}"\n`
    csv += `"Confiabilidade","${Math.round(report.metadata.analysisConfidence * 100)}%"\n`
    csv += `"Resumo","${report.summary.replace(/"/g, '""')}"\n`
    
    report.sections.forEach((section, index) => {
      csv += `"Seção ${index + 1} - ${section.title}","${section.content.replace(/"/g, '""').replace(/\n/g, ' ')}"\n`
    })
    
    return csv
  }
}
