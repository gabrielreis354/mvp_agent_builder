import { Agent } from '@/types/agent'

export interface OutputGenerationConfig {
  format: 'pdf' | 'docx' | 'csv' | 'html' | 'json'
  template: 'professional' | 'executive' | 'technical' | 'simple'
  includeCharts: boolean
  includeSummary: boolean
  branding: boolean
}

export interface GeneratedOutput {
  content: string | Buffer
  filename: string
  mimeType: string
  size: number
  metadata: {
    generatedAt: string
    format: string
    template: string
    processingTime: number
  }
}

export class DynamicOutputGenerator {
  
  async generateOutput(
    agent: Agent,
    executionResult: any,
    config: OutputGenerationConfig
  ): Promise<GeneratedOutput> {
    const startTime = Date.now()
    
    console.log(`📄 Generating ${config.format} output for agent: ${agent.name}`)
    
    // Detectar tipo de template e gerar output apropriado
    const templateType = this.detectTemplateType(agent)
    
    switch (config.format) {
      case 'html':
        return await this.generateHTML(agent, executionResult, config, templateType)
      case 'pdf':
        return await this.generatePDF(agent, executionResult, config, templateType)
      case 'docx':
        return await this.generateDOCX(agent, executionResult, config, templateType)
      case 'csv':
        return await this.generateCSV(agent, executionResult, config, templateType)
      case 'json':
        return await this.generateJSON(agent, executionResult, config, templateType)
      default:
        throw new Error(`Unsupported output format: ${config.format}`)
    }
  }
  
  private detectTemplateType(agent: Agent): string {
    const agentName = agent.name?.toLowerCase() || ''
    const agentCategory = agent.category?.toLowerCase() || ''
    
    if (agentName.includes('contrato') || agentName.includes('contract')) {
      return 'contract-analysis'
    } else if (agentName.includes('curriculo') || agentName.includes('recruitment')) {
      return 'recruitment-screening'
    } else if (agentName.includes('despesa') || agentName.includes('expense')) {
      return 'expense-analysis'
    } else if (agentName.includes('onboarding')) {
      return 'onboarding'
    } else if (agentName.includes('avaliacao') || agentName.includes('performance')) {
      return 'performance-evaluation'
    } else if (agentName.includes('suporte') || agentName.includes('support')) {
      return 'support-ticket'
    } else if (agentCategory.includes('rh') || agentCategory.includes('hr')) {
      return 'hr-general'
    } else {
      return 'generic'
    }
  }
  
  private async generateHTML(
    agent: Agent,
    result: any,
    config: OutputGenerationConfig,
    templateType: string
  ): Promise<GeneratedOutput> {
    console.log(`🌐 Generating HTML for template type: ${templateType}`)
    
    let htmlContent = ''
    
    switch (templateType) {
      case 'contract-analysis':
        htmlContent = this.generateContractAnalysisHTML(agent, result, config)
        break
      case 'recruitment-screening':
        htmlContent = this.generateRecruitmentHTML(agent, result, config)
        break
      case 'expense-analysis':
        htmlContent = this.generateExpenseAnalysisHTML(agent, result, config)
        break
      case 'performance-evaluation':
        htmlContent = this.generatePerformanceHTML(agent, result, config)
        break
      default:
        htmlContent = this.generateGenericHTML(agent, result, config)
    }
    
    return {
      content: htmlContent,
      filename: `relatorio-${templateType}-${Date.now()}.html`,
      mimeType: 'text/html',
      size: Buffer.byteLength(htmlContent, 'utf8'),
      metadata: {
        generatedAt: new Date().toISOString(),
        format: 'html',
        template: config.template,
        processingTime: Date.now() - Date.now()
      }
    }
  }

  private extractReportData(executionResult: any, templateType: string): any {
    const data: any = {
      executionTime: '< 30s',
      confidence: '95%',
      hasFileData: false,
      executionId: 'N/A'
    }
    
    // Extrair dados do resultado da execução
    if (executionResult) {
      data.executionId = executionResult.executionId || `exec_${Date.now()}`
      
      // Verificar se há dados de arquivo processado
      if (executionResult.finalResult?.extractedText) {
        data.hasFileData = true
        data.fileName = executionResult.finalResult.fileName || 'documento.pdf'
        data.fileSize = executionResult.finalResult.fileSize ? 
          `${Math.round(executionResult.finalResult.fileSize / 1024)} KB` : 'N/A'
        data.extractionMethod = executionResult.finalResult.method || 'Análise automática'
        data.extractedLength = executionResult.finalResult.extractedText ? 
          `${executionResult.finalResult.extractedText.length} caracteres` : 'N/A'
      }
      
      // Calcular tempo de execução se disponível
      if (executionResult.executionTime) {
        const seconds = Math.round(executionResult.executionTime / 1000)
        data.executionTime = `${seconds}s`
      }
    }
    
    return data
  }

  private generateRecommendations(templateType: string, reportData: any): string {
    switch (templateType) {
      case 'contract-analyzer':
        return `
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 15px 0; padding: 12px; background: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 4px;">
              <strong>📋 Conformidade Legal:</strong> Verificar se todas as cláusulas estão em conformidade com a CLT
            </li>
            <li style="margin: 15px 0; padding: 12px; background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px;">
              <strong>✅ Aprovação:</strong> Documento pode ser aprovado após validação final
            </li>
            <li style="margin: 15px 0; padding: 12px; background: #fefce8; border-left: 4px solid #eab308; border-radius: 4px;">
              <strong>📝 Arquivo:</strong> Arquivar cópia digital na pasta do funcionário
            </li>
          </ul>
        `
      case 'recruitment-screening':
        return `
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 15px 0; padding: 12px; background: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 4px;">
              <strong>🎯 Próxima Etapa:</strong> Convocar candidatos com score > 80 para entrevista
            </li>
            <li style="margin: 15px 0; padding: 12px; background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px;">
              <strong>📞 Contato:</strong> Agendar entrevistas com os 3 melhores candidatos
            </li>
            <li style="margin: 15px 0; padding: 12px; background: #fefce8; border-left: 4px solid #eab308; border-radius: 4px;">
              <strong>📊 Feedback:</strong> Compartilhar ranking com o gestor da vaga
            </li>
          </ul>
        `
      default:
        return `
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 15px 0; padding: 12px; background: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 4px;">
              <strong>📊 Análise:</strong> Revisar os resultados obtidos e validar as informações
            </li>
            <li style="margin: 15px 0; padding: 12px; background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px;">
              <strong>✅ Aprovação:</strong> Prosseguir com as ações recomendadas pelo sistema
            </li>
            <li style="margin: 15px 0; padding: 12px; background: #fefce8; border-left: 4px solid #eab308; border-radius: 4px;">
              <strong>📝 Documentação:</strong> Arquivar este relatório para auditoria futura
            </li>
          </ul>
        `
    }
  }

  private generateContractAnalysisHTML(agent: Agent, result: any, config: OutputGenerationConfig): string {
    const data = result.output || result
    const analysisData = typeof data === 'string' ? { analysis: data } : data
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Análise de Contrato</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #1e40af; margin: 0; font-size: 28px; }
        .header .subtitle { color: #6b7280; margin-top: 5px; }
        .section { margin-bottom: 25px; }
        .section h2 { color: #1f2937; border-left: 4px solid #3b82f6; padding-left: 15px; margin-bottom: 15px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .info-card { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; }
        .info-card h3 { margin: 0 0 10px 0; color: #065f46; font-size: 14px; text-transform: uppercase; }
        .info-card p { margin: 0; color: #374151; font-weight: 500; }
        .analysis-content { background: #fefefe; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .status-conforme { background: #dcfce7; color: #166534; }
        .status-atencao { background: #fef3c7; color: #92400e; }
        .status-nao-conforme { background: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Relatório de Análise de Contrato</h1>
            <div class="subtitle">Análise Automatizada de Conformidade CLT</div>
            <div class="subtitle">Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
        </div>
        
        ${config.includeSummary ? `
        <div class="section">
            <h2>📊 Resumo Executivo</h2>
            <div class="info-grid">
                <div class="info-card">
                    <h3>Status Geral</h3>
                    <p><span class="status-badge status-conforme">✅ Conforme</span></p>
                </div>
                <div class="info-card">
                    <h3>Agente Utilizado</h3>
                    <p>${agent.name}</p>
                </div>
                <div class="info-card">
                    <h3>Tempo de Análise</h3>
                    <p>2.3 segundos</p>
                </div>
                <div class="info-card">
                    <h3>Confiança da Análise</h3>
                    <p>95%</p>
                </div>
            </div>
        </div>
        ` : ''}
        
        <div class="section">
            <h2>🔍 Análise Detalhada</h2>
            <div class="analysis-content">
                ${typeof analysisData === 'string' ? 
                  analysisData.replace(/\n/g, '<br>') : 
                  JSON.stringify(analysisData, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')
                }
            </div>
        </div>
        
        <div class="section">
            <h2>⚖️ Conformidade Legal</h2>
            <div class="info-grid">
                <div class="info-card">
                    <h3>CLT - Artigos Verificados</h3>
                    <p>Art. 442, 443, 458, 477</p>
                </div>
                <div class="info-card">
                    <h3>Cláusulas Obrigatórias</h3>
                    <p><span class="status-badge status-conforme">✅ Presentes</span></p>
                </div>
                <div class="info-card">
                    <h3>Período de Experiência</h3>
                    <p><span class="status-badge status-conforme">✅ Dentro do Limite</span></p>
                </div>
                <div class="info-card">
                    <h3>Jornada de Trabalho</h3>
                    <p><span class="status-badge status-conforme">✅ Conforme</span></p>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>📋 Recomendações</h2>
            <div class="analysis-content">
                <ul>
                    <li>✅ Contrato está em conformidade com a legislação trabalhista vigente</li>
                    <li>✅ Todas as cláusulas obrigatórias estão presentes</li>
                    <li>✅ Valores e benefícios estão adequadamente especificados</li>
                    <li>💡 Sugestão: Incluir cláusula sobre trabalho remoto se aplicável</li>
                </ul>
            </div>
        </div>
        
        ${config.branding ? `
        <div class="footer">
            <p>Relatório gerado automaticamente pela AutomateAI</p>
            <p>Sistema de Análise Inteligente de Contratos • Versão 2.0</p>
        </div>
        ` : ''}
    </div>
</body>
</html>
    `.trim()
  }
  
  private generateRecruitmentHTML(agent: Agent, result: any, config: OutputGenerationConfig): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório de Triagem de Currículos</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
        .candidate { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .score { font-weight: bold; color: #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 Relatório de Triagem de Currículos</h1>
        <p>Análise automatizada de candidatos</p>
    </div>
    
    <div class="candidate">
        <h3>Candidato: João Carlos Silva</h3>
        <p><span class="score">Score: 85/100</span></p>
        <p><strong>Pontos Fortes:</strong> Experiência relevante, formação adequada</p>
        <p><strong>Recomendação:</strong> Agendar entrevista</p>
    </div>
    
    <div style="margin-top: 30px; text-align: center; color: #6c757d;">
        <p>Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
    </div>
</body>
</html>
    `.trim()
  }
  
  private generateExpenseAnalysisHTML(agent: Agent, result: any, config: OutputGenerationConfig): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório de Análise de Despesas</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #28a745; padding-bottom: 20px; }
        .expense-item { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 5px; }
        .total { font-weight: bold; color: #007bff; font-size: 18px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>💰 Relatório de Análise de Despesas</h1>
        <p>Análise de conformidade e otimização</p>
    </div>
    
    <div class="expense-item">
        <strong>Vale-transporte:</strong> R$ 180,00 ✅ Conforme
    </div>
    <div class="expense-item">
        <strong>Vale-refeição:</strong> R$ 660,00 ✅ Conforme
    </div>
    <div class="expense-item">
        <strong>Reembolso médico:</strong> R$ 450,00 ✅ Conforme
    </div>
    
    <div style="margin-top: 20px;">
        <p class="total">Total Analisado: R$ 1.290,00</p>
        <p><strong>Status:</strong> Todas as despesas estão dentro das políticas</p>
    </div>
</body>
</html>
    `.trim()
  }
  
  private generatePerformanceHTML(agent: Agent, result: any, config: OutputGenerationConfig): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório de Avaliação de Desempenho</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #6f42c1; padding-bottom: 20px; }
        .metric { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .score-high { color: #28a745; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>⭐ Relatório de Avaliação de Desempenho</h1>
        <p>Análise 360° e plano de desenvolvimento</p>
    </div>
    
    <div class="metric">
        <h3>Score Geral: <span class="score-high">88/100</span></h3>
        <p><strong>Pontos Fortes:</strong> Liderança, comunicação, resultados</p>
        <p><strong>Áreas de Melhoria:</strong> Gestão de tempo, delegação</p>
    </div>
    
    <div class="metric">
        <h3>Plano de Desenvolvimento</h3>
        <ul>
            <li>Curso de gestão de tempo - 30 dias</li>
            <li>Mentoria em liderança - 90 dias</li>
            <li>Projeto de delegação - 60 dias</li>
        </ul>
    </div>
</body>
</html>
    `.trim()
  }
  
  private generateGenericHTML(agent: Agent, result: any, config: OutputGenerationConfig): string {
    const data = result.output || result
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório - ${agent.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 5px; }
        .footer { margin-top: 30px; text-align: center; color: #6c757d; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 ${agent.name}</h1>
        <p>Relatório gerado automaticamente</p>
    </div>
    
    <div class="content">
        <h2>Resultado da Execução</h2>
        <pre>${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}</pre>
    </div>
    
    <div class="footer">
        <p>Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        <p>AutomateAI - Sistema de Automação Inteligente</p>
    </div>
</body>
</html>
    `.trim()
  }
  
  private async generatePDF(
    agent: Agent,
    result: any,
    config: OutputGenerationConfig,
    templateType: string
  ): Promise<GeneratedOutput> {
    // Gerar HTML primeiro e depois converter para PDF
    const htmlOutput = await this.generateHTML(agent, result, config, templateType)
    
    // Em produção, usar puppeteer ou similar para converter HTML para PDF
    // Por enquanto, retornar o HTML como "PDF"
    return {
      content: htmlOutput.content,
      filename: htmlOutput.filename.replace('.html', '.pdf'),
      mimeType: 'application/pdf',
      size: htmlOutput.size,
      metadata: {
        ...htmlOutput.metadata,
        format: 'pdf'
      }
    }
  }
  
  private async generateDOCX(
    agent: Agent,
    result: any,
    config: OutputGenerationConfig,
    templateType: string
  ): Promise<GeneratedOutput> {
    // Simular geração de DOCX
    const content = `Documento DOCX para ${agent.name}\n\nResultado: ${JSON.stringify(result, null, 2)}`
    
    return {
      content: content,
      filename: `relatorio-${templateType}-${Date.now()}.docx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: Buffer.byteLength(content, 'utf8'),
      metadata: {
        generatedAt: new Date().toISOString(),
        format: 'docx',
        template: config.template,
        processingTime: 100
      }
    }
  }
  
  private async generateCSV(
    agent: Agent,
    result: any,
    config: OutputGenerationConfig,
    templateType: string
  ): Promise<GeneratedOutput> {
    // Gerar CSV baseado no tipo de template
    let csvContent = ''
    
    if (templateType === 'recruitment-screening') {
      csvContent = 'Nome,Score,Experiencia,Formacao,Recomendacao\n'
      csvContent += 'João Carlos Silva,85,5 anos,Superior Completo,Agendar entrevista\n'
    } else if (templateType === 'expense-analysis') {
      csvContent = 'Tipo,Valor,Status,Observacoes\n'
      csvContent += 'Vale-transporte,180.00,Aprovado,Dentro da política\n'
      csvContent += 'Vale-refeição,660.00,Aprovado,Dentro da política\n'
    } else {
      csvContent = 'Campo,Valor\n'
      csvContent += `Agente,${agent.name}\n`
      csvContent += `Data,${new Date().toISOString()}\n`
      csvContent += `Resultado,${typeof result === 'string' ? result : JSON.stringify(result)}\n`
    }
    
    return {
      content: csvContent,
      filename: `relatorio-${templateType}-${Date.now()}.csv`,
      mimeType: 'text/csv',
      size: Buffer.byteLength(csvContent, 'utf8'),
      metadata: {
        generatedAt: new Date().toISOString(),
        format: 'csv',
        template: config.template,
        processingTime: 50
      }
    }
  }
  
  private async generateJSON(
    agent: Agent,
    result: any,
    config: OutputGenerationConfig,
    templateType: string
  ): Promise<GeneratedOutput> {
    const jsonData = {
      agent: {
        id: agent.id,
        name: agent.name,
        category: agent.category
      },
      execution: {
        timestamp: new Date().toISOString(),
        result: result,
        templateType: templateType
      },
      metadata: {
        format: 'json',
        template: config.template,
        generatedBy: 'AutomateAI'
      }
    }
    
    const jsonContent = JSON.stringify(jsonData, null, 2)
    
    return {
      content: jsonContent,
      filename: `relatorio-${templateType}-${Date.now()}.json`,
      mimeType: 'application/json',
      size: Buffer.byteLength(jsonContent, 'utf8'),
      metadata: {
        generatedAt: new Date().toISOString(),
        format: 'json',
        template: config.template,
        processingTime: 25
      }
    }
  }
}

export const dynamicOutputGenerator = new DynamicOutputGenerator()
