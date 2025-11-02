/**
 * NodeAnalyzer - Analisa Nós do Agente para Extrair Requisitos
 * 
 * Examina a estrutura do agente (nodes e edges) para identificar:
 * - Campos de input obrigatórios
 * - Tipos de dados esperados
 * - Validações necessárias
 * - Fluxo de execução
 */

export interface RequiredField {
  name: string
  type: 'string' | 'file' | 'number' | 'boolean' | 'object'
  description: string
  required: boolean
  format?: string // 'pdf', 'email', 'phone', etc
  examples?: string[]
}

export interface AgentRequirements {
  fields: RequiredField[]
  needsFile: boolean
  fileTypes?: string[]
  description: string
  executionFlow: string[]
  needsOutputPreferences: boolean // Se precisa perguntar formato/método de entrega
  outputOptions?: {
    formats?: string[] // PDF, DOCX, JSON, etc
    deliveryMethods?: string[] // Email, Download, etc
  }
}

export class NodeAnalyzer {
  /**
   * Analisa agente e extrai requisitos automaticamente
   */
  analyzeAgent(agentConfig: any): AgentRequirements {
    const nodes = agentConfig.nodes || []
    const edges = agentConfig.edges || []

    console.log('[NodeAnalyzer] Analisando agente:', {
      name: agentConfig.name,
      nodeCount: nodes.length,
      edgeCount: edges.length,
    })

    // 1. Identificar nós de input
    const inputNodes = nodes.filter((node: any) => 
      node.type === 'input' || 
      node.data?.type === 'input' ||
      this.isInputNode(node)
    )

    console.log('[NodeAnalyzer] Nós de input encontrados:', inputNodes.length)

    // 2. Extrair campos de cada input node
    const fields: RequiredField[] = []
    let needsFile = false
    const fileTypes: string[] = []

    for (const node of inputNodes) {
      const nodeFields = this.extractFieldsFromNode(node)
      fields.push(...nodeFields)

      // Verificar se precisa de arquivo
      if (this.nodeRequiresFile(node)) {
        needsFile = true
        const types = this.extractFileTypes(node)
        fileTypes.push(...types)
      }
    }

    // 3. Analisar prompts dos nós AI para identificar campos adicionais
    const aiNodes = nodes.filter((node: any) => 
      node.type === 'ai' || 
      node.data?.type === 'ai'
    )

    for (const node of aiNodes) {
      const promptFields = this.extractFieldsFromPrompt(node)
      
      // Adicionar apenas se não existir
      for (const field of promptFields) {
        if (!fields.find(f => f.name === field.name)) {
          fields.push(field)
        }
      }
    }

    // 4. Construir fluxo de execução
    const executionFlow = this.buildExecutionFlow(nodes, edges)

    // 5. Gerar descrição baseada nos nós
    const description = this.generateDescription(agentConfig, nodes)

    // 6. Verificar se precisa de preferências de saída
    const needsOutputPreferences = this.checkNeedsOutputPreferences(nodes)
    const outputOptions = needsOutputPreferences ? this.getOutputOptions(nodes) : undefined

    return {
      fields,
      needsFile,
      fileTypes: needsFile ? [...new Set(fileTypes)] : undefined,
      description,
      executionFlow,
      needsOutputPreferences,
      outputOptions,
    }
  }

  /**
   * Verifica se um nó é de input
   */
  private isInputNode(node: any): boolean {
    const label = (node.data?.label || '').toLowerCase()
    const type = (node.data?.type || '').toLowerCase()
    
    return (
      label.includes('input') ||
      label.includes('receber') ||
      label.includes('upload') ||
      label.includes('entrada') ||
      type === 'input'
    )
  }

  /**
   * Extrai campos de um nó de input
   */
  private extractFieldsFromNode(node: any): RequiredField[] {
    const fields: RequiredField[] = []

    // 1. Verificar inputSchema (formato padrão)
    if (node.data?.inputSchema?.properties) {
      const schema = node.data.inputSchema
      
      for (const [fieldName, fieldDef] of Object.entries(schema.properties)) {
        const def = fieldDef as any
        
        fields.push({
          name: fieldName,
          type: this.mapSchemaType(def.type, def.format),
          description: def.description || `Campo ${fieldName}`,
          required: schema.required?.includes(fieldName) ?? true,
          format: def.format,
          examples: def.examples,
        })
      }
    }

    // 2. Verificar config.inputSchema (formato alternativo)
    if (node.config?.inputSchema?.properties) {
      const schema = node.config.inputSchema
      
      for (const [fieldName, fieldDef] of Object.entries(schema.properties)) {
        const def = fieldDef as any
        
        // Evitar duplicatas
        if (!fields.find(f => f.name === fieldName)) {
          fields.push({
            name: fieldName,
            type: this.mapSchemaType(def.type, def.format),
            description: def.description || `Campo ${fieldName}`,
            required: schema.required?.includes(fieldName) ?? true,
            format: def.format,
            examples: def.examples,
          })
        }
      }
    }

    // 3. Inferir campos do label/descrição se não houver schema
    if (fields.length === 0) {
      const inferredFields = this.inferFieldsFromLabel(node)
      fields.push(...inferredFields)
    }

    return fields
  }

  /**
   * Mapeia tipo do schema para tipo simplificado
   */
  private mapSchemaType(type: string, format?: string): RequiredField['type'] {
    if (format === 'binary' || format === 'file') return 'file'
    
    switch (type) {
      case 'string':
        return 'string'
      case 'number':
      case 'integer':
        return 'number'
      case 'boolean':
        return 'boolean'
      case 'object':
        return 'object'
      default:
        return 'string'
    }
  }

  /**
   * Infere campos do label/descrição do nó
   */
  private inferFieldsFromLabel(node: any): RequiredField[] {
    const label = (node.data?.label || '').toLowerCase()
    const fields: RequiredField[] = []

    // Padrões comuns
    if (label.includes('currículo') || label.includes('curriculo')) {
      fields.push({
        name: 'curriculo',
        type: 'file',
        description: 'Currículo do candidato em PDF',
        required: true,
        format: 'pdf',
      })
    }

    if (label.includes('contrato')) {
      fields.push({
        name: 'contrato',
        type: 'file',
        description: 'Contrato em PDF',
        required: true,
        format: 'pdf',
      })
    }

    if (label.includes('vaga')) {
      fields.push({
        name: 'vaga',
        type: 'string',
        description: 'Nome ou descrição da vaga',
        required: true,
        examples: ['Desenvolvedor Python', 'Analista de RH'],
      })
    }

    if (label.includes('candidato')) {
      fields.push({
        name: 'nome_candidato',
        type: 'string',
        description: 'Nome do candidato',
        required: false,
      })
    }

    return fields
  }

  /**
   * Extrai campos mencionados em prompts de nós AI
   */
  private extractFieldsFromPrompt(node: any): RequiredField[] {
    const prompt = node.data?.prompt || node.config?.prompt || ''
    const fields: RequiredField[] = []

    // Buscar padrões como {campo}, {{campo}}, [campo]
    const patterns = [
      /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g,
      /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g,
      /\[([a-zA-Z_][a-zA-Z0-9_]*)\]/g,
    ]

    for (const pattern of patterns) {
      const matches = prompt.matchAll(pattern)
      for (const match of matches) {
        const fieldName = match[1]
        
        // Evitar duplicatas
        if (!fields.find(f => f.name === fieldName)) {
          fields.push({
            name: fieldName,
            type: 'string',
            description: `Campo ${fieldName} usado no prompt`,
            required: true,
          })
        }
      }
    }

    return fields
  }

  /**
   * Verifica se nó requer arquivo
   */
  private nodeRequiresFile(node: any): boolean {
    // Verificar schema
    if (node.data?.inputSchema?.properties) {
      const props = node.data.inputSchema.properties
      return Object.values(props).some((prop: any) => 
        prop.format === 'binary' || 
        prop.format === 'file' ||
        prop.type === 'file'
      )
    }

    // Verificar label
    const label = (node.data?.label || '').toLowerCase()
    return (
      label.includes('upload') ||
      label.includes('arquivo') ||
      label.includes('pdf') ||
      label.includes('documento')
    )
  }

  /**
   * Extrai tipos de arquivo aceitos
   */
  private extractFileTypes(node: any): string[] {
    const types: string[] = []

    // Verificar schema
    if (node.data?.inputSchema?.properties) {
      const props = node.data.inputSchema.properties
      for (const prop of Object.values(props) as any[]) {
        if (prop.format === 'binary' || prop.format === 'file') {
          if (prop.accept) {
            types.push(...prop.accept.split(','))
          } else {
            types.push('pdf') // padrão
          }
        }
      }
    }

    // Inferir do label
    const label = (node.data?.label || '').toLowerCase()
    if (label.includes('pdf')) types.push('pdf')
    if (label.includes('word') || label.includes('docx')) types.push('docx')
    if (label.includes('excel') || label.includes('xlsx')) types.push('xlsx')

    return types.length > 0 ? types : ['pdf']
  }

  /**
   * Constrói fluxo de execução baseado nos edges
   */
  private buildExecutionFlow(nodes: any[], edges: any[]): string[] {
    const flow: string[] = []

    // Encontrar nó inicial (sem edges de entrada)
    const nodeIds = new Set(nodes.map(n => n.id))
    const targetIds = new Set(edges.map(e => e.target))
    const startNodes = nodes.filter(n => !targetIds.has(n.id))

    if (startNodes.length === 0 && nodes.length > 0) {
      // Se não encontrar, usar primeiro nó
      flow.push(nodes[0].data?.label || 'Início')
    } else {
      for (const node of startNodes) {
        flow.push(node.data?.label || node.id)
      }
    }

    // Seguir edges para construir fluxo
    let currentNodes = startNodes
    const visited = new Set<string>()

    while (currentNodes.length > 0) {
      const nextNodes: any[] = []

      for (const node of currentNodes) {
        if (visited.has(node.id)) continue
        visited.add(node.id)

        // Encontrar próximos nós
        const outgoingEdges = edges.filter(e => e.source === node.id)
        for (const edge of outgoingEdges) {
          const targetNode = nodes.find(n => n.id === edge.target)
          if (targetNode && !visited.has(targetNode.id)) {
            flow.push(targetNode.data?.label || targetNode.id)
            nextNodes.push(targetNode)
          }
        }
      }

      currentNodes = nextNodes
    }

    return flow
  }

  /**
   * Gera descrição baseada nos nós
   */
  private generateDescription(agentConfig: any, nodes: any[]): string {
    const name = agentConfig.name || 'Agente'
    const description = agentConfig.description

    if (description) {
      return description
    }

    // Gerar descrição baseada nos nós
    const nodeLabels = nodes
      .map(n => n.data?.label)
      .filter(Boolean)
      .slice(0, 3)

    if (nodeLabels.length > 0) {
      return `${name} - Fluxo: ${nodeLabels.join(' → ')}`
    }

    return `${name} - Agente de automação`
  }

  /**
   * Verifica se agente precisa de preferências de saída
   */
  private checkNeedsOutputPreferences(nodes: any[]): boolean {
    // Se tem nó de output, provavelmente precisa de preferências
    return nodes.some(node => 
      node.type === 'output' || 
      node.data?.type === 'output' ||
      (node.data?.label || '').toLowerCase().includes('relatório') ||
      (node.data?.label || '').toLowerCase().includes('resultado')
    )
  }

  /**
   * Obtém opções de saída disponíveis
   */
  private getOutputOptions(nodes: any[]): { formats: string[], deliveryMethods: string[] } {
    return {
      formats: ['PDF', 'DOCX', 'JSON', 'Excel'],
      deliveryMethods: ['Visualizar aqui', 'Download', 'Email'],
    }
  }

  /**
   * Formata requisitos para prompt da IA
   */
  formatRequirementsForPrompt(requirements: AgentRequirements): string {
    const lines: string[] = []

    lines.push('INFORMAÇÕES NECESSÁRIAS:')
    lines.push('')

    for (const field of requirements.fields) {
      const required = field.required ? '(OBRIGATÓRIO)' : '(OPCIONAL)'
      lines.push(`- **${field.name}** ${required}`)
      lines.push(`  Tipo: ${field.type}`)
      lines.push(`  Descrição: ${field.description}`)
      
      if (field.examples && field.examples.length > 0) {
        lines.push(`  Exemplos: ${field.examples.join(', ')}`)
      }
      
      lines.push('')
    }

    if (requirements.needsFile) {
      lines.push('ARQUIVO NECESSÁRIO:')
      lines.push(`- Tipos aceitos: ${requirements.fileTypes?.join(', ') || 'PDF'}`)
      lines.push('')
    }

    if (requirements.needsOutputPreferences) {
      lines.push('PREFERÊNCIAS DE SAÍDA (OBRIGATÓRIO):')
      lines.push(`- Formato desejado: ${requirements.outputOptions?.formats?.join(', ')}`)
      lines.push(`- Método de entrega: ${requirements.outputOptions?.deliveryMethods?.join(', ')}`)
      lines.push('')
    }

    lines.push('FLUXO DE EXECUÇÃO:')
    lines.push(requirements.executionFlow.map((step, i) => `${i + 1}. ${step}`).join('\n'))

    return lines.join('\n')
  }
}
