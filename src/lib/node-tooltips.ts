/**
 * Sistema de Tooltips Expandidos para Cards do Builder
 * Descrições detalhadas e exemplos práticos para usuários leigos
 */

export interface NodeTooltip {
  title: string
  shortDescription: string
  detailedDescription: string
  whatItDoes: string[]
  example: string
  whenToUse: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export const nodeTooltips: Record<string, NodeTooltip> = {
  // ===== RECEBER DADOS =====
  'receive-document': {
    title: '📄 Receber Documento',
    shortDescription: 'Recebe arquivos PDF, Word ou Excel para análise',
    detailedDescription: 'Este componente permite que você faça upload de documentos para serem processados pelo agente. O sistema extrai automaticamente o texto do arquivo.',
    whatItDoes: [
      '✓ Aceita arquivos PDF, DOCX e XLSX',
      '✓ Extrai texto automaticamente do documento',
      '✓ Valida o tamanho e formato do arquivo',
      '✓ Prepara os dados para análise pela IA'
    ],
    example: 'Exemplo: Você faz upload de um contrato em PDF. O sistema lê todo o conteúdo e passa para o próximo passo.',
    whenToUse: 'Use quando precisar analisar contratos, currículos, relatórios ou qualquer documento em arquivo.',
    difficulty: 'beginner'
  },

  'receive-text': {
    title: '✍️ Receber Texto',
    shortDescription: 'Recebe texto digitado pelo usuário',
    detailedDescription: 'Permite que o usuário digite ou cole texto diretamente, sem precisar de um arquivo. Ideal para informações curtas ou quando você já tem o texto copiado.',
    whatItDoes: [
      '✓ Campo de texto livre para digitação',
      '✓ Aceita textos copiados e colados',
      '✓ Sem limite de caracteres',
      '✓ Processa imediatamente o conteúdo'
    ],
    example: 'Exemplo: Cole uma descrição de vaga de emprego para que a IA analise os requisitos.',
    whenToUse: 'Use quando tiver textos curtos, descrições, ou informações que não estão em arquivo.',
    difficulty: 'beginner'
  },

  // ===== ANALISAR COM IA =====
  'analyze-contract': {
    title: '📋 Analisar Contrato',
    shortDescription: 'Analisa contratos trabalhistas e valida CLT',
    detailedDescription: 'Especializado em contratos de trabalho brasileiros. Extrai informações importantes e verifica se está de acordo com a CLT (Consolidação das Leis do Trabalho).',
    whatItDoes: [
      '✓ Extrai nome, cargo e salário do funcionário',
      '✓ Identifica data de admissão e benefícios',
      '✓ Verifica cláusulas obrigatórias da CLT',
      '✓ Detecta possíveis irregularidades legais',
      '✓ Gera relatório profissional de análise'
    ],
    example: 'Exemplo: Envia um contrato de trabalho → Sistema identifica: "João Silva, Analista de RH, R$ 5.000,00, admissão 01/01/2024" e valida se tem férias, 13º salário, etc.',
    whenToUse: 'Use para revisar contratos antes de assinar, validar conformidade legal, ou extrair dados de múltiplos contratos.',
    difficulty: 'beginner'
  },

  'analyze-resume': {
    title: '👤 Analisar Currículo',
    shortDescription: 'Avalia currículos e pontua candidatos',
    detailedDescription: 'Analisa currículos de forma objetiva, pontuando candidatos de 0 a 100 baseado em critérios profissionais. Ajuda a triar grandes volumes de candidaturas.',
    whatItDoes: [
      '✓ Extrai experiência profissional e tempo de atuação',
      '✓ Identifica formação acadêmica e certificações',
      '✓ Lista habilidades técnicas relevantes',
      '✓ Avalia idiomas e nível de proficiência',
      '✓ Calcula pontuação final (0-100)',
      '✓ Recomenda aprovação ou reprovação'
    ],
    example: 'Exemplo: Currículo de desenvolvedor → Sistema pontua: Experiência (30/40), Formação (25/30), Habilidades (20/30) = 75/100 → Recomenda "Aprovar para entrevista"',
    whenToUse: 'Use em processos seletivos para triar candidatos de forma rápida e objetiva, especialmente quando há muitas candidaturas.',
    difficulty: 'beginner'
  },

  // ===== VALIDAR E VERIFICAR =====
  'validate-clt': {
    title: '⚖️ Validar CLT',
    shortDescription: 'Verifica se o contrato está de acordo com a CLT',
    detailedDescription: 'Valida automaticamente se um contrato de trabalho contém todas as cláusulas obrigatórias da CLT (Consolidação das Leis do Trabalho brasileira).',
    whatItDoes: [
      '✓ Verifica férias remuneradas (30 dias)',
      '✓ Confirma 13º salário',
      '✓ Valida FGTS (8% do salário)',
      '✓ Checa jornada de trabalho (máx 44h semanais)',
      '✓ Identifica cláusulas ilegais ou abusivas',
      '✓ Gera lista de conformidades e não-conformidades'
    ],
    example: 'Exemplo: Contrato sem menção a férias → Sistema alerta: "❌ Cláusula de férias ausente - obrigatório pela CLT Art. 129"',
    whenToUse: 'Use após analisar um contrato para garantir que está tudo legal e proteger tanto empresa quanto funcionário.',
    difficulty: 'intermediate'
  },

  'decide-path': {
    title: '🔀 Decidir Caminho',
    shortDescription: 'Escolhe o próximo passo baseado em regras',
    detailedDescription: 'Cria uma bifurcação no fluxo: se uma condição for verdadeira, segue um caminho; se não, segue outro. Como um "SE/SENÃO" em português.',
    whatItDoes: [
      '✓ Avalia uma condição (ex: pontuação > 70)',
      '✓ Se verdadeiro: segue caminho A',
      '✓ Se falso: segue caminho B',
      '✓ Permite automação de decisões',
      '✓ Reduz trabalho manual de triagem'
    ],
    example: 'Exemplo: SE pontuação do currículo > 70 → Enviar email de aprovação | SENÃO → Enviar email de reprovação',
    whenToUse: 'Use quando precisar automatizar decisões baseadas em critérios objetivos (pontuação, valores, datas, etc).',
    difficulty: 'intermediate'
  },

  // ===== ENVIAR E GERAR =====
  'send-email': {
    title: '📧 Enviar Email',
    shortDescription: 'Envia email automático com relatório ou notificação',
    detailedDescription: 'Envia emails automaticamente para destinatários específicos. Pode incluir relatórios, notificações ou resultados de análises.',
    whatItDoes: [
      '✓ Envia email para um ou múltiplos destinatários',
      '✓ Personaliza assunto e corpo do email',
      '✓ Anexa relatórios em PDF (opcional)',
      '✓ Usa template profissional da empresa',
      '✓ Registra envio para auditoria'
    ],
    example: 'Exemplo: Após analisar contrato → Envia email para gestor: "Contrato de João Silva analisado. Conformidade: 95%. Relatório em anexo."',
    whenToUse: 'Use para notificar pessoas sobre resultados, enviar relatórios automáticos ou comunicar decisões.',
    difficulty: 'beginner'
  },

  'generate-pdf': {
    title: '📄 Gerar PDF',
    shortDescription: 'Cria relatório profissional em PDF',
    detailedDescription: 'Transforma os resultados da análise em um documento PDF formatado e profissional, pronto para impressão ou compartilhamento.',
    whatItDoes: [
      '✓ Formata dados em layout profissional',
      '✓ Adiciona logo e identidade visual',
      '✓ Organiza informações em seções',
      '✓ Gera gráficos e tabelas (quando aplicável)',
      '✓ Cria arquivo pronto para download'
    ],
    example: 'Exemplo: Análise de currículo → Gera PDF com: cabeçalho da empresa, dados do candidato, pontuação detalhada, recomendação final.',
    whenToUse: 'Use quando precisar de um documento formal para arquivar, compartilhar com terceiros ou apresentar resultados.',
    difficulty: 'beginner'
  },

  // ===== AVANÇADO =====
  'api-call': {
    title: '🌐 Chamada de API',
    shortDescription: 'Integra com sistemas externos via API',
    detailedDescription: 'Conecta com outros sistemas (ATS, ERP, CRM) para buscar ou enviar dados. Requer conhecimento técnico de APIs.',
    whatItDoes: [
      '✓ Envia requisições HTTP para APIs externas',
      '✓ Busca dados de outros sistemas',
      '✓ Atualiza informações em plataformas integradas',
      '✓ Suporta autenticação e tokens',
      '✓ Processa respostas JSON/XML'
    ],
    example: 'Exemplo: Após aprovar candidato → Envia dados para sistema ATS da empresa via API para criar perfil automaticamente.',
    whenToUse: 'Use quando precisar integrar com sistemas que sua empresa já usa (ex: Gupy, Kenoby, SAP).',
    difficulty: 'advanced'
  }
}

/**
 * Retorna tooltip baseado no tipo do nó
 */
export function getNodeTooltip(nodeType: string, label: string): NodeTooltip | null {
  // Mapeia labels para IDs de tooltip
  const labelMap: Record<string, string> = {
    '📄 Receber Documento': 'receive-document',
    '✍️ Receber Texto': 'receive-text',
    '📋 Analisar Contrato': 'analyze-contract',
    '👤 Analisar Currículo': 'analyze-resume',
    '⚖️ Validar CLT': 'validate-clt',
    '🔀 Decidir Caminho': 'decide-path',
    '📧 Enviar Email': 'send-email',
    '📄 Gerar PDF': 'generate-pdf',
    '🌐 API Call': 'api-call'
  }

  const tooltipId = labelMap[label]
  return tooltipId ? nodeTooltips[tooltipId] : null
}
