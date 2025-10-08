import { AgentTemplate } from '@/types/agent'

export const agentTemplates: AgentTemplate[] = [
  {
    id: 'contract-analyzer',
    name: 'Analisador de Contratos RH',
    description: 'Analisa contratos trabalhistas, valida conformidade com CLT, gera relatórios em PDF e envia por email automaticamente.',
    category: 'RH & Jurídico',
    useCase: 'Automatizar análise completa de contratos de admissão com relatórios e notificações',
    difficulty: 'intermediate',
    estimatedTime: '8-12 min',
    nodes: [
      {
        id: 'input-1',
        type: 'customNode',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Upload Contrato PDF', 
          nodeType: 'input',
          inputSchema: {
            type: 'object',
            properties: {
              file: { type: 'string', format: 'binary', description: 'Arquivo PDF do contrato' },
              email_gestor: { type: 'string', format: 'email', description: 'Email do gestor para notificação' },
              departamento: { type: 'string', description: 'Departamento do funcionário' }
            },
            required: ['file', 'email_gestor']
          }
        }
      },
      {
        id: 'ai-1',
        type: 'customNode',
        position: { x: 300, y: 100 },
        data: {
          label: 'Análise GPT-4',
          nodeType: 'ai',
          provider: 'openai',
          model: 'gpt-4',
          prompt: `Analise este contrato trabalhista brasileiro e gere um relatório HTML profissional completo seguindo este formato EXATO:

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Análise de Contrato Trabalhista</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
        .section { margin: 25px 0; padding: 20px; border-left: 4px solid #3498db; background: #f8f9fa; border-radius: 0 8px 8px 0; }
        .section h3 { color: #2c3e50; margin: 0 0 15px 0; font-size: 1.3em; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .info-card { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0; }
        .info-card h4 { color: #34495e; margin: 0 0 10px 0; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
        .status-ok { color: #27ae60; font-weight: bold; }
        .status-warning { color: #f39c12; font-weight: bold; }
        .status-error { color: #e74c3c; font-weight: bold; }
        ul { padding-left: 20px; }
        li { margin: 5px 0; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Análise de Contrato Trabalhista</h1>
            <p>Relatório de Conformidade CLT - ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <div class="section">
            <h3>👤 DADOS DO FUNCIONÁRIO</h3>
            <div class="info-grid">
                <div class="info-card">
                    <h4>Informações Pessoais</h4>
                    <p><strong>Nome:</strong> [EXTRAIR DO CONTRATO]</p>
                    <p><strong>CPF:</strong> [EXTRAIR DO CONTRATO]</p>
                    <p><strong>RG:</strong> [EXTRAIR DO CONTRATO]</p>
                    <p><strong>Endereço:</strong> [EXTRAIR DO CONTRATO]</p>
                </div>
                <div class="info-card">
                    <h4>Dados Profissionais</h4>
                    <p><strong>Cargo:</strong> [EXTRAIR DO CONTRATO]</p>
                    <p><strong>Salário:</strong> [EXTRAIR DO CONTRATO]</p>
                    <p><strong>Data de Admissão:</strong> [EXTRAIR DO CONTRATO]</p>
                    <p><strong>Período de Experiência:</strong> [EXTRAIR DO CONTRATO]</p>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>🏢 DADOS DA EMPRESA</h3>
            <div class="info-card">
                <p><strong>Razão Social:</strong> [EXTRAIR DO CONTRATO]</p>
                <p><strong>CNPJ:</strong> [EXTRAIR DO CONTRATO]</p>
                <p><strong>Endereço:</strong> [EXTRAIR DO CONTRATO]</p>
            </div>
        </div>

        <div class="section">
            <h3>⏰ JORNADA DE TRABALHO</h3>
            <div class="info-card">
                <p><strong>Carga Horária:</strong> [EXTRAIR JORNADA]</p>
                <p><strong>Horário:</strong> [EXTRAIR HORÁRIOS]</p>
                <p><strong>Intervalo:</strong> [EXTRAIR INTERVALOS]</p>
            </div>
        </div>

        <div class="section">
            <h3>💰 REMUNERAÇÃO E BENEFÍCIOS</h3>
            <div class="info-card">
                <h4>Remuneração</h4>
                <ul>
                    <li>[LISTAR COMPONENTES SALARIAIS]</li>
                </ul>
                <h4>Benefícios</h4>
                <ul>
                    <li>[LISTAR BENEFÍCIOS OFERECIDOS]</li>
                </ul>
            </div>
        </div>

        <div class="section">
            <h3>⚖️ CONFORMIDADE COM A CLT</h3>
            <div class="info-card">
                <h4>Cláusulas Obrigatórias</h4>
                <ul>
                    <li class="status-ok">✅ [VERIFICAR CLÁUSULAS PRESENTES]</li>
                    <li class="status-warning">⚠️ [VERIFICAR CLÁUSULAS COM ATENÇÃO]</li>
                    <li class="status-error">❌ [VERIFICAR CLÁUSULAS AUSENTES]</li>
                </ul>
            </div>
        </div>

        <div class="section">
            <h3>🚨 ANÁLISE DE RISCOS</h3>
            <div class="info-card">
                <h4>Irregularidades Identificadas</h4>
                <ul>
                    <li>[LISTAR POSSÍVEIS IRREGULARIDADES]</li>
                </ul>
                <h4>Recomendações</h4>
                <ul>
                    <li>[LISTAR RECOMENDAÇÕES DE CORREÇÃO]</li>
                </ul>
            </div>
        </div>

        <div class="section">
            <h3>📊 RESUMO EXECUTIVO</h3>
            <div class="info-card">
                <p><strong>Status Geral:</strong> <span class="[CLASSE_STATUS]">[STATUS_CONFORMIDADE]</span></p>
                <p><strong>Pontos Críticos:</strong> [NÚMERO] identificados</p>
                <p><strong>Recomendação:</strong> [RECOMENDAÇÃO_FINAL]</p>
            </div>
        </div>

        <div class="footer">
            <p>📄 Relatório gerado automaticamente pelo AutomateAI</p>
            <p>Sistema de Análise Jurídica para RH - ${new Date().toLocaleString('pt-BR')}</p>
        </div>
    </div>
</body>
</html>

IMPORTANTE: Substitua TODOS os campos entre colchetes [CAMPO] pelos dados reais extraídos do contrato. Use as classes CSS adequadas (status-ok, status-warning, status-error) para indicar conformidade.`
        }
      },
      {
        id: 'logic-1',
        type: 'customNode',
        position: { x: 500, y: 100 },
        data: { 
          label: 'Validação CLT',
          nodeType: 'logic'
        }
      },
      {
        id: 'ai-2',
        type: 'customNode',
        position: { x: 700, y: 50 },
        data: {
          label: 'Gerador Relatório',
          nodeType: 'ai',
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          prompt: 'Com base na análise do contrato, gere um relatório executivo em formato HTML para conversão em PDF contendo: resumo executivo, dados principais, conformidade legal, recomendações e próximos passos. Use formatação profissional adequada para RH.'
        }
      },
      {
        id: 'api-1',
        type: 'customNode',
        position: { x: 700, y: 150 },
        data: { 
          label: 'Envio Email',
          nodeType: 'api'
        }
      },
      {
        id: 'output-1',
        type: 'customNode',
        position: { x: 900, y: 100 },
        data: { 
          label: 'Relatório PDF + Notificação',
          nodeType: 'output',
          outputSchema: {
            type: 'object',
            properties: {
              relatorio_pdf: { type: 'string', format: 'binary', description: 'Relatório em PDF' },
              dados_extraidos: { type: 'object', description: 'Dados estruturados do contrato' },
              status_conformidade: { type: 'string', enum: ['conforme', 'nao_conforme', 'requer_revisao'] },
              email_enviado: { type: 'boolean', description: 'Status do envio do email' }
            }
          }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'ai-1' },
      { id: 'e2-3', source: 'ai-1', target: 'logic-1' },
      { id: 'e3-4', source: 'logic-1', target: 'ai-2' },
      { id: 'e3-5', source: 'logic-1', target: 'api-1' },
      { id: 'e4-6', source: 'ai-2', target: 'output-1' },
      { id: 'e5-6', source: 'api-1', target: 'output-1' }
    ],
    tags: ['contratos', 'rh', 'juridico', 'claude', 'anthropic', 'clt', 'pdf', 'email'],
    preview: 'Input (PDF) → AI (Análise) → Logic (Validação CLT) → AI (Relatório) + API (Email) → Output (PDF + Notificação)'
  },
  {
    id: 'expense-analyzer',
    name: 'Analisador de Despesas RH',
    description: 'Processa despesas de RH como vale-transporte, vale-refeição e reembolsos médicos, valida políticas e gera relatórios gerenciais.',
    category: 'RH & Jurídico',
    useCase: 'Automatizar aprovação de despesas específicas de RH',
    difficulty: 'advanced',
    estimatedTime: '10-15 min',
    nodes: [
      {
        id: 'input-1',
        type: 'customNode',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Despesas RH',
          nodeType: 'input',
          inputSchema: {
            type: 'object',
            properties: {
              planilha_despesas: { type: 'string', format: 'binary', description: 'Planilha com despesas de RH' },
              tipo_despesa: { type: 'string', enum: ['vale-transporte', 'vale-refeicao', 'reembolso-medico', 'treinamento', 'beneficios'], description: 'Categoria da despesa' },
              periodo: { type: 'string', description: 'Período de referência' },
              departamento: { type: 'string', description: 'Departamento solicitante' }
            },
            required: ['planilha_despesas', 'tipo_despesa']
          }
        }
      },
      {
        id: 'ai-1',
        type: 'customNode',
        position: { x: 300, y: 100 },
        data: {
          label: 'Análise Despesas RH',
          nodeType: 'ai',
          provider: 'google',
          model: 'gemini-pro',
          prompt: 'Analise estas despesas de RH e identifique: conformidade com políticas internas, valores dentro dos limites estabelecidos, documentação adequada, padrões suspeitos ou anômalos, sugestões de otimização de custos por funcionário/departamento.'
        }
      },
      {
        id: 'logic-1',
        type: 'customNode',
        position: { x: 500, y: 100 },
        data: { label: 'Validação Políticas RH', nodeType: 'logic' }
      },
      {
        id: 'api-1',
        type: 'customNode',
        position: { x: 700, y: 50 },
        data: { label: 'Sistema Folha', nodeType: 'api' }
      },
      {
        id: 'output-1',
        type: 'customNode',
        position: { x: 900, y: 100 },
        data: { 
          label: 'Relatório Despesas RH',
          nodeType: 'output',
          outputSchema: {
            type: 'object',
            properties: {
              relatorio_gerencial: { type: 'string', format: 'binary', description: 'Relatório por departamento/funcionário' },
              despesas_aprovadas: { type: 'array', description: 'Lista de despesas aprovadas' },
              despesas_rejeitadas: { type: 'array', description: 'Lista de despesas rejeitadas com motivos' },
              economia_sugerida: { type: 'number', description: 'Valor de economia identificado' }
            }
          }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'ai-1' },
      { id: 'e2-3', source: 'ai-1', target: 'logic-1' },
      { id: 'e3-4', source: 'logic-1', target: 'api-1' },
      { id: 'e4-5', source: 'api-1', target: 'output-1' }
    ],
    tags: ['despesas-rh', 'vale-transporte', 'vale-refeicao', 'reembolsos', 'gemini', 'rh'],
    preview: 'Input (Despesas RH) → AI (Análise) → Logic (Políticas) → API (Folha) → Output (Relatório)'
  },
  {
    id: 'document-processor',
    name: 'Processador de Documentos Trabalhistas',
    description: 'Extrai e valida dados de documentos trabalhistas (RG, CPF, carteira de trabalho, diplomas), organiza em pasta digital e monitora vencimentos.',
    category: 'RH & Jurídico',
    useCase: 'Digitalizar e validar documentos de funcionários',
    difficulty: 'intermediate',
    estimatedTime: '7-12 min',
    nodes: [
      {
        id: 'input-1',
        type: 'customNode',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Documentos Funcionário',
          nodeType: 'input',
          inputSchema: {
            type: 'object',
            properties: {
              documentos: { type: 'array', items: { type: 'string', format: 'binary' }, description: 'Documentos do funcionário' },
              funcionario_id: { type: 'string', description: 'ID do funcionário' },
              tipo_documento: { type: 'string', enum: ['rg', 'cpf', 'carteira-trabalho', 'diploma', 'certidao', 'comprovante-residencia'], description: 'Tipo do documento' }
            },
            required: ['documentos', 'funcionario_id']
          }
        }
      },
      {
        id: 'ai-1',
        type: 'customNode',
        position: { x: 300, y: 100 },
        data: {
          label: 'OCR + Validação',
          nodeType: 'ai',
          provider: 'openai',
          model: 'gpt-4-vision',
          prompt: 'Extraia dados deste documento trabalhista e identifique: tipo de documento, dados pessoais, números de registro, datas de emissão e validade, órgão emissor. Valide se os dados estão legíveis e consistentes. Para diplomas, extraia instituição, curso e data de conclusão.'
        }
      },
      {
        id: 'logic-1',
        type: 'customNode',
        position: { x: 500, y: 100 },
        data: { label: 'Validação Autenticidade', nodeType: 'logic' }
      },
      {
        id: 'api-1',
        type: 'customNode',
        position: { x: 700, y: 50 },
        data: { label: 'Sistema HRIS', nodeType: 'api' }
      },
      {
        id: 'api-2',
        type: 'customNode',
        position: { x: 700, y: 150 },
        data: { label: 'Pasta Digital', nodeType: 'api' }
      },
      {
        id: 'output-1',
        type: 'customNode',
        position: { x: 900, y: 100 },
        data: { 
          label: 'Documentos Validados',
          nodeType: 'output',
          outputSchema: {
            type: 'object',
            properties: {
              documentos_processados: { type: 'array', description: 'Lista de documentos processados' },
              dados_extraidos: { type: 'object', description: 'Dados estruturados extraídos' },
              alertas_vencimento: { type: 'array', description: 'Documentos próximos ao vencimento' },
              status_validacao: { type: 'string', enum: ['valido', 'invalido', 'requer_verificacao'] }
            }
          }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'ai-1' },
      { id: 'e2-3', source: 'ai-1', target: 'logic-1' },
      { id: 'e3-4', source: 'logic-1', target: 'api-1' },
      { id: 'e3-5', source: 'logic-1', target: 'api-2' },
      { id: 'e4-6', source: 'api-1', target: 'output-1' },
      { id: 'e5-6', source: 'api-2', target: 'output-1' }
    ],
    tags: ['documentos-trabalhistas', 'rg', 'cpf', 'carteira-trabalho', 'diplomas', 'ocr', 'rh'],
    preview: 'Input (Documentos) → AI (OCR + Validação) → Logic (Autenticidade) → API (HRIS + Pasta) → Output (Validados)'
  },
  {
    id: 'social-media-manager',
    name: 'Gerador de Comunicação Interna RH',
    description: 'Gera conteúdo profissional para comunicados internos, campanhas de engajamento e divulgação de vagas com conformidade corporativa. Você copia e publica nos seus canais.',
    category: 'RH & Jurídico',
    useCase: 'Criar conteúdo profissional para comunicação interna',
    difficulty: 'beginner',
    estimatedTime: '3-5 min',
    nodes: [
      {
        id: 'input-1',
        type: 'customNode',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Briefing Comunicação',
          nodeType: 'input',
          inputSchema: {
            type: 'object',
            properties: {
              tipo_comunicacao: { type: 'string', enum: ['comunicado-interno', 'campanha-engajamento', 'divulgacao-vaga', 'evento-rh'], description: 'Tipo de comunicação' },
              conteudo: { type: 'string', description: 'Conteúdo base da comunicação' },
              publico_alvo: { type: 'string', enum: ['todos-funcionarios', 'gestores', 'departamento-especifico'], description: 'Público-alvo' },
              tom: { type: 'string', enum: ['formal', 'informal', 'motivacional'], description: 'Tom da comunicação', default: 'formal' }
            },
            required: ['tipo_comunicacao', 'conteudo', 'publico_alvo']
          }
        }
      },
      {
        id: 'ai-1',
        type: 'customNode',
        position: { x: 300, y: 100 },
        data: {
          label: 'Geração Conteúdo',
          nodeType: 'ai',
          provider: 'anthropic',
          model: 'claude-3-haiku',
          prompt: 'Crie conteúdo profissional para comunicação interna de RH baseado no briefing. Garanta tom adequado, linguagem inclusiva, conformidade com políticas corporativas. Para vagas, inclua requisitos claros e processo seletivo. Para comunicados, seja claro e objetivo. Gere o conteúdo em formato HTML profissional pronto para copiar e usar.'
        }
      },
      {
        id: 'output-1',
        type: 'customNode',
        position: { x: 500, y: 100 },
        data: { 
          label: 'Conteúdo Pronto',
          nodeType: 'output',
          outputSchema: {
            type: 'object',
            properties: {
              conteudo_html: { type: 'string', description: 'Conteúdo em HTML profissional' },
              conteudo_texto: { type: 'string', description: 'Conteúdo em texto simples' },
              sugestoes_canais: { type: 'array', description: 'Canais recomendados para publicação' },
              checklist_publicacao: { type: 'array', description: 'Checklist antes de publicar' }
            }
          }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'ai-1' },
      { id: 'e2-3', source: 'ai-1', target: 'output-1' }
    ],
    tags: ['comunicacao-interna', 'vagas', 'comunicados', 'conteudo', 'claude', 'rh'],
    preview: 'Input (Briefing) → AI (Gera Conteúdo) → Output (HTML + Texto Pronto)'
  },
  {
    id: 'task-organizer',
    name: 'Priorizador de Processos RH',
    description: 'Analisa e prioriza processos de RH (admissão, demissão, avaliações) considerando prazos legais CLT e gera cronograma inteligente. Você usa o cronograma para distribuir tarefas.',
    category: 'RH & Jurídico',
    useCase: 'Priorizar processos e gerar cronograma com prazos legais',
    difficulty: 'intermediate',
    estimatedTime: '5-8 min',
    nodes: [
      {
        id: 'input-1',
        type: 'customNode',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Lista de Processos',
          nodeType: 'input',
          inputSchema: {
            type: 'object',
            properties: {
              processos: { type: 'array', items: { type: 'object' }, description: 'Lista de processos de RH pendentes' },
              mes_referencia: { type: 'string', description: 'Mês de referência para o cronograma' },
              equipe_disponivel: { type: 'number', description: 'Número de pessoas na equipe de RH' }
            },
            required: ['processos']
          }
        }
      },
      {
        id: 'ai-1',
        type: 'customNode',
        position: { x: 300, y: 100 },
        data: {
          label: 'Análise e Priorização',
          nodeType: 'ai',
          provider: 'openai',
          model: 'gpt-4',
          prompt: 'Analise estes processos de RH e crie um cronograma priorizado considerando: 1) Prazos legais CLT (admissão: 48h para registro, demissão: 10 dias para homologação, etc), 2) Urgência e impacto no funcionário, 3) Dependências entre processos, 4) Recursos necessários. Gere um cronograma em formato de tabela HTML com: processo, prioridade (alta/média/baixa), prazo legal, prazo sugerido, responsável sugerido, observações importantes.'
        }
      },
      {
        id: 'output-1',
        type: 'customNode',
        position: { x: 500, y: 100 },
        data: { 
          label: 'Cronograma Priorizado',
          nodeType: 'output',
          outputSchema: {
            type: 'object',
            properties: {
              cronograma_html: { type: 'string', description: 'Cronograma em HTML profissional' },
              processos_prioritarios: { type: 'array', description: 'Lista de processos com prioridade alta' },
              alertas_prazos: { type: 'array', description: 'Alertas de prazos legais próximos' },
              sugestoes_distribuicao: { type: 'object', description: 'Sugestões de distribuição por responsável' }
            }
          }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'ai-1' },
      { id: 'e2-3', source: 'ai-1', target: 'output-1' }
    ],
    tags: ['processos-rh', 'priorizacao', 'cronograma', 'prazos-legais', 'clt', 'gpt-4', 'rh'],
    preview: 'Input (Lista Processos) → AI (Priorização CLT) → Output (Cronograma HTML)'
  },
  {
    id: 'recruitment-screening',
    name: 'Triagem de Currículos',
    description: 'Analisa currículos automaticamente, pontua candidatos por critérios específicos e gera ranking para vagas.',
    category: 'RH & Jurídico',
    useCase: 'Automatizar primeira triagem de candidatos',
    difficulty: 'intermediate',
    estimatedTime: '6-8 min',
    nodes: [
      {
        id: 'input-1',
        type: 'customNode',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Upload Currículos',
          nodeType: 'input',
          inputSchema: {
            type: 'object',
            properties: {
              curriculos: { type: 'array', items: { type: 'string', format: 'binary' } },
              descricao_vaga: { type: 'string', description: 'Descrição da vaga e requisitos' },
              criterios_peso: { type: 'object', description: 'Pesos para cada critério de avaliação' }
            },
            required: ['curriculos', 'descricao_vaga']
          }
        }
      },
      {
        id: 'ai-1',
        type: 'customNode',
        position: { x: 300, y: 100 },
        data: {
          label: 'Análise IA',
          nodeType: 'ai',
          provider: 'openai',
          model: 'gpt-4',
          prompt: `Analise este currículo e retorne um JSON estruturado com os seguintes campos:

{
  "metadata": {
    "titulo_relatorio": "Análise de Currículo - [Nome do Candidato]",
    "tipo_analise": "Triagem de Currículos"
  },
  "analise_payload": {
    "resumo_executivo": "Breve resumo da análise do candidato",
    "dados_principais": {
      "nome": "Nome completo",
      "cargo_pretendido": "Cargo",
      "experiencia_anos": 5,
      "formacao": "Formação principal"
    },
    "pontuacao_geral": {
      "total": 85,
      "classificacao": "Excelente|Bom|Regular"
    },
    "criterios_avaliacao": [
      {
        "criterio": "Experiência Relevante",
        "pontuacao": 18,
        "maximo": 20,
        "observacao": "Comentário sobre o critério"
      }
    ],
    "pontos_principais": [
      "Ponto forte 1",
      "Ponto forte 2"
    ],
    "pontos_atencao": [
      "Ponto de atenção 1"
    ],
    "recomendacoes": [
      "Recomendação 1",
      "Recomendação 2"
    ]
  }
}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional antes ou depois.`
        }
      },
      {
        id: 'logic-1',
        type: 'customNode',
        position: { x: 500, y: 100 },
        data: { 
          label: 'Ranking Candidatos',
          nodeType: 'logic'
        }
      },
      {
        id: 'output-1',
        type: 'customNode',
        position: { x: 700, y: 100 },
        data: { 
          label: 'Relatório Triagem',
          nodeType: 'output',
          outputSchema: {
            type: 'object',
            properties: {
              ranking_candidatos: { type: 'array', description: 'Lista ordenada de candidatos com pontuação' },
              recomendacoes: { type: 'array', description: 'Candidatos recomendados para entrevista' },
              relatorio_detalhado: { type: 'string', format: 'binary', description: 'Relatório completo em PDF' }
            }
          }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'ai-1' },
      { id: 'e2-3', source: 'ai-1', target: 'logic-1' },
      { id: 'e3-4', source: 'logic-1', target: 'output-1' }
    ],
    tags: ['recrutamento', 'curriculos', 'triagem', 'gpt-4', 'rh'],
    preview: 'Input (Currículos) → AI (Análise) → Logic (Ranking) → Output (Relatório)'
  },
  {
    id: 'onboarding-automation',
    name: 'Onboarding Automático',
    description: 'Cria checklist personalizado de integração, agenda treinamentos e envia kit de boas-vindas automaticamente.',
    category: 'RH & Jurídico',
    useCase: 'Automatizar processo de integração de novos funcionários',
    difficulty: 'beginner',
    estimatedTime: '4-6 min',
    nodes: [
      {
        id: 'input-1',
        type: 'customNode',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Dados Funcionário',
          nodeType: 'input',
          inputSchema: {
            type: 'object',
            properties: {
              nome: { type: 'string' },
              cargo: { type: 'string' },
              departamento: { type: 'string' },
              data_inicio: { type: 'string', format: 'date' },
              email: { type: 'string', format: 'email' },
              gestor_direto: { type: 'string' }
            },
            required: ['nome', 'cargo', 'departamento', 'data_inicio', 'email']
          }
        }
      },
      {
        id: 'ai-1',
        type: 'customNode',
        position: { x: 300, y: 100 },
        data: {
          label: 'Gerador Checklist',
          nodeType: 'ai',
          provider: 'anthropic',
          model: 'claude-3-haiku',
          prompt: 'Crie um checklist personalizado de onboarding baseado no cargo e departamento. Inclua: documentação necessária, treinamentos obrigatórios, apresentações para equipe, configuração de sistemas, entrega de equipamentos.'
        }
      },
      {
        id: 'api-1',
        type: 'customNode',
        position: { x: 500, y: 50 },
        data: { 
          label: 'Sistema RH',
          nodeType: 'api'
        }
      },
      {
        id: 'api-2',
        type: 'customNode',
        position: { x: 500, y: 150 },
        data: { 
          label: 'Envio Email',
          nodeType: 'api'
        }
      },
      {
        id: 'output-1',
        type: 'customNode',
        position: { x: 700, y: 100 },
        data: { 
          label: 'Kit Onboarding',
          nodeType: 'output',
          outputSchema: {
            type: 'object',
            properties: {
              checklist_personalizado: { type: 'object', description: 'Checklist específico para o cargo' },
              cronograma_treinamentos: { type: 'array', description: 'Agenda de treinamentos' },
              kit_boas_vindas: { type: 'string', description: 'Email de boas-vindas enviado' }
            }
          }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'ai-1' },
      { id: 'e2-3', source: 'ai-1', target: 'api-1' },
      { id: 'e2-4', source: 'ai-1', target: 'api-2' },
      { id: 'e3-5', source: 'api-1', target: 'output-1' },
      { id: 'e4-5', source: 'api-2', target: 'output-1' }
    ],
    tags: ['onboarding', 'integracao', 'novos-funcionarios', 'claude', 'rh'],
    preview: 'Input (Dados) → AI (Checklist) → API (Sistema + Email) → Output (Kit)'
  },
  {
    id: 'performance-evaluation',
    name: 'Avaliação de Desempenho',
    description: 'Analisa feedbacks 360°, calcula métricas de performance e gera planos de desenvolvimento individualizados.',
    category: 'RH & Jurídico',
    useCase: 'Automatizar processo de avaliação de desempenho',
    difficulty: 'advanced',
    estimatedTime: '10-15 min',
    nodes: [
      {
        id: 'input-1',
        type: 'customNode',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Dados Avaliação',
          nodeType: 'input',
          inputSchema: {
            type: 'object',
            properties: {
              funcionario: { type: 'string' },
              autoavaliacao: { type: 'object' },
              feedback_gestor: { type: 'object' },
              feedback_pares: { type: 'array' },
              metas_periodo: { type: 'array' },
              resultados_alcancados: { type: 'array' }
            },
            required: ['funcionario', 'autoavaliacao', 'feedback_gestor']
          }
        }
      },
      {
        id: 'ai-1',
        type: 'customNode',
        position: { x: 300, y: 100 },
        data: {
          label: 'Análise 360°',
          nodeType: 'ai',
          provider: 'openai',
          model: 'gpt-4',
          prompt: 'Analise todos os feedbacks e dados de performance. Identifique: pontos fortes, áreas de melhoria, consistência entre avaliações, atingimento de metas, competências desenvolvidas. Calcule score geral de performance.'
        }
      },
      {
        id: 'ai-2',
        type: 'customNode',
        position: { x: 500, y: 100 },
        data: {
          label: 'Plano Desenvolvimento',
          nodeType: 'ai',
          provider: 'anthropic',
          model: 'claude-3-sonnet',
          prompt: 'Com base na análise de performance, crie um plano de desenvolvimento personalizado com: objetivos específicos, ações de desenvolvimento, treinamentos recomendados, cronograma, métricas de acompanhamento.'
        }
      },
      {
        id: 'output-1',
        type: 'customNode',
        position: { x: 700, y: 100 },
        data: { 
          label: 'Relatório Avaliação',
          nodeType: 'output',
          outputSchema: {
            type: 'object',
            properties: {
              score_performance: { type: 'number', description: 'Pontuação geral de 0-100' },
              relatorio_completo: { type: 'string', format: 'binary', description: 'Relatório detalhado em PDF' },
              plano_desenvolvimento: { type: 'object', description: 'Plano personalizado de desenvolvimento' },
              recomendacoes_rh: { type: 'array', description: 'Recomendações para ações de RH' }
            }
          }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'ai-1' },
      { id: 'e2-3', source: 'ai-1', target: 'ai-2' },
      { id: 'e3-4', source: 'ai-2', target: 'output-1' }
    ],
    tags: ['avaliacao', 'performance', 'desenvolvimento', 'feedback-360', 'gpt-4', 'rh'],
    preview: 'Input (Feedbacks) → AI (Análise 360°) → AI (Plano) → Output (Relatório)'
  }
]
