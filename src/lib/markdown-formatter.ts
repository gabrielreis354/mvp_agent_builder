// Função para processar tabelas markdown com estilo profissional
const processTable = (rows: string[]): string => {
  if (rows.length < 2) return rows.join('\n')

  const headerRow = rows[0].split('|').map(cell => cell.trim()).filter(cell => cell)
  const dataRows = rows.slice(2).map(row => 
    row.split('|').map(cell => cell.trim()).filter(cell => cell)
  )

  let tableHtml = `
    <div style="overflow-x: auto; margin-bottom: 1.5rem; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <table style="min-width: 100%; background-color: white; border-radius: 0.75rem; overflow: hidden;">
        <thead style="background: linear-gradient(to right, #4a90e2, #50e3c2); color: white;">
          <tr>`
  
  // Header com ícones
  headerRow.forEach((header, index) => {
    const icon = index === 0 ? '📋' : index === 1 ? '💰' : '📊'
    tableHtml += `
      <th style="padding: 1rem 1.5rem; text-align: left; font-weight: bold; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em;">
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 0.5rem;">${icon}</span>
          ${header}
        </div>
      </th>`
  })
  
  tableHtml += `
        </tr>
      </thead>
      <tbody style="border-top: 1px solid #e5e7eb;">`
  
  // Body com alternância de cores
  dataRows.forEach((row, index) => {
    const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb'
    tableHtml += `
      <tr style="background-color: ${bgColor}; transition: background-color 0.2s ease-in-out;" onmouseover="this.style.backgroundColor='#f0f9ff'" onmouseout="this.style.backgroundColor='${bgColor}'">`
    
    row.forEach((cell) => {
      const isMonetary = cell.includes('R$') || cell.includes('%') || /^\d+[.,]\d+$/.test(cell)
      const cellStyle = isMonetary 
        ? 'font-weight: bold; color: #059669;'
        : 'color: #1f2937;'
      
      tableHtml += `
        <td style="padding: 1rem 1.5rem; white-space: nowrap; font-size: 0.875rem; ${cellStyle}">
          ${isMonetary ? `<span style="background-color: #d1fae5; padding: 0.25rem 0.5rem; border-radius: 9999px;">${cell}</span>` : cell}
        </td>`
    })
    
    tableHtml += '</tr>'
  })
  
  tableHtml += `
      </tbody>
    </table>
  </div>`

  return tableHtml
}

// Função para converter markdown simples em HTML profissional
export const renderMarkdownToHTML = (text: string): string => {
  if (!text || typeof text !== 'string') return text
  
  // Sanitizar texto para evitar problemas de encoding
  const sanitizedText = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const isMarkdown = sanitizedText.includes('#') || sanitizedText.includes('**') || sanitizedText.includes('---') || sanitizedText.includes('|') || sanitizedText.startsWith('- ')
  
  if (!isMarkdown) {
      // Mesmo se não for markdown, aplicar quebras de parágrafo
      return sanitizedText
        .split('\n\n')
        .map(p => `<p style="margin-bottom: 1rem; color: #374151; line-height: 1.6; text-align: justify;">${p.replace(/\n/g, '<br>')}</p>`)
        .join('')
  }

  let html = sanitizedText
  
  // 1. Processar tabelas primeiro para evitar conflitos
  const lines = html.split('\n')
  let inTable = false
  let tableRows: string[] = []
  let processedLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (line.includes('|') && line.split('|').length > 2) {
      if (!inTable) {
        inTable = true
        tableRows = []
      }
      tableRows.push(line)
    } else {
      if (inTable) {
        if (tableRows.length > 0) {
          const tableHtml = processTable(tableRows)
          processedLines.push(tableHtml)
          tableRows = []
        }
        inTable = false
      }
      processedLines.push(lines[i]) // Manter a linha original para outros processadores
    }
  }

  if (inTable && tableRows.length > 0) {
    const tableHtml = processTable(tableRows)
    processedLines.push(tableHtml)
  }

  html = processedLines.join('\n')

  // 2. Processar cabeçalhos
  html = html.replace(/^### (.*$)/gm, '<h3 style="font-size: 1.25rem; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem; color: #1e3a8a; border-bottom: 2px solid #93c5fd; padding-bottom: 0.5rem;">$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2 style="font-size: 1.5rem; font-weight: bold; margin-top: 2.5rem; margin-bottom: 1.25rem; color: #1e40af; border-bottom: 3px solid #60a5fa; padding-bottom: 0.75rem;">$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1 style="font-size: 1.875rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 1.5rem; color: #172554; border-bottom: 4px solid #3b82f6; padding-bottom: 1rem;">$1</h1>')
  
  // 3. Processar texto em negrito
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold; color: #1f2937; background-color: #fef3c7; padding: 0.125rem 0.375rem; border-radius: 0.25rem;">$1</strong>')
  
  // 4. Processar separadores
  html = html.replace(/^---$/gm, '<hr style="margin-top: 2rem; margin-bottom: 2rem; border: 0; height: 2px; background: linear-gradient(to right, #93c5fd, #3b82f6, #93c5fd);">')

  // 5. Processar listas
  html = html.replace(/^- (.*$)/gm, '<li style="margin-bottom: 0.5rem; padding-left: 1rem; display: flex; align-items: flex-start;"><span style="color: #3b82f6; margin-right: 0.75rem; margin-top: 0.25rem;">\u25B6</span><span>$1</span></li>')
  html = html.replace(/(<li.*<\/li>\s*)+/g, (match) => {
    return `<ul style="list-style: none; margin-bottom: 1.5rem; background-color: #f0f9ff; border-radius: 0.75rem; padding: 1.5rem; border-left: 4px solid #60a5fa;">${match}</ul>`
  })

  // 6. Processar parágrafos
  html = html
    .split('\n\n')
    .map(p => {
        if (p.startsWith('<') && p.endsWith('>')) return p; // Não envolver HTML já existente em <p>
        return `<p style="margin-bottom: 1rem; color: #374151; line-height: 1.6; text-align: justify;">${p.replace(/\n/g, '<br>')}</p>`
    })
    .join('')

  return html
}
