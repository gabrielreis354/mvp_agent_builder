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
    id: 'customer-support',
    name: 'Suporte RH Automático',
    description: 'Classifica dúvidas de funcionários sobre benefícios, férias e folha de pagamento, gera respostas automáticas e roteia para especialistas.',
    category: 'RH & Jurídico',
    useCase: 'Automatizar atendimento de dúvidas internas de RH',
    difficulty: 'beginner',
    estimatedTime: '3-5 min',
    nodes: [
      {
        id: 'input-1',
        type: 'customNode',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Dúvida Funcionário',
          nodeType: 'input',
          inputSchema: {
            type: 'object',
            properties: {
              funcionario: { type: 'string', description: 'Nome do funcionário' },
              departamento: { type: 'string', description: 'Departamento do funcionário' },
              duvida: { type: 'string', description: 'Descrição da dúvida' },
              canal: { type: 'string', enum: ['email', 'chat', 'telefone'], description: 'Canal de atendimento' }
            },
            required: ['funcionario', 'duvida']
          }
        }
      },
      {
        id: 'ai-1',
        type: 'customNode',
        position: { x: 300, y: 100 },
        data: {
          label: 'Classificação RH',
          nodeType: 'ai',
          provider: 'openai',
          model: 'gpt-4',
          prompt: 'Classifique esta dúvida de RH por: categoria (benefícios/férias/folha-pagamento/documentos/políticas), urgência (baixa/média/alta), complexidade (simples/intermediária/complexa), se pode ser respondida automaticamente ou precisa de especialista.'
        }
      },
      {
        id: 'logic-1',
        type: 'customNode',
        position: { x: 500, y: 100 },
        data: { label: 'Roteamento Especialista', nodeType: 'logic' }
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
        data: { label: 'Base Conhecimento', nodeType: 'api' }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'ai-1' },
      { id: 'e2-3', source: 'ai-1', target: 'logic-1' },
      { id: 'e3-4', source: 'logic-1', target: 'api-1' },
      { id: 'e3-5', source: 'logic-1', target: 'api-2' }
    ],
    tags: ['suporte-rh', 'beneficios', 'ferias', 'folha-pagamento', 'gpt-4', 'rh'],
    preview: 'Input (Dúvida) → AI (Classificação RH) → Logic (Roteamento) → API (HRIS + Base Conhecimento)'
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
    name: 'Comunicação Interna RH',
    description: 'Cria comunicados internos, campanhas de engajamento e posts sobre vagas, garantindo conformidade com políticas corporativas.',
    category: 'RH & Jurídico',
    useCase: 'Automatizar comunicação interna e divulgação de vagas',
    difficulty: 'beginner',
    estimatedTime: '4-8 min',
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
              canais: { type: 'array', items: { type: 'string', enum: ['slack', 'teams', 'intranet', 'email'] }, description: 'Canais de comunicação' }
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
          label: 'Geração Conteúdo RH',
          nodeType: 'ai',
          provider: 'anthropic',
          model: 'claude-3-haiku',
          prompt: 'Crie conteúdo para comunicação interna de RH baseado no briefing. Garanta tom profissional, linguagem inclusiva, conformidade com políticas corporativas. Para vagas, inclua requisitos claros e processo seletivo. Para comunicados, seja claro e objetivo.'
        }
      },
      {
        id: 'logic-1',
        type: 'customNode',
        position: { x: 500, y: 100 },
        data: { label: 'Validação Compliance', nodeType: 'logic' }
      },
      {
        id: 'api-1',
        type: 'customNode',
        position: { x: 700, y: 100 },
        data: { label: 'Canais Internos', nodeType: 'api' }
      },
      {
        id: 'output-1',
        type: 'customNode',
        position: { x: 900, y: 100 },
        data: { 
          label: 'Comunicação Publicada',
          nodeType: 'output',
          outputSchema: {
            type: 'object',
            properties: {
              conteudo_aprovado: { type: 'string', description: 'Conteúdo final aprovado' },
              canais_publicados: { type: 'array', description: 'Lista de canais onde foi publicado' },
              alcance_estimado: { type: 'number', description: 'Número estimado de funcionários alcançados' },
              status_compliance: { type: 'boolean', description: 'Aprovação de compliance' }
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
    tags: ['comunicacao-interna', 'vagas', 'comunicados', 'compliance', 'claude', 'rh'],
    preview: 'Input (Briefing) → AI (Conteúdo RH) → Logic (Compliance) → API (Canais) → Output (Publicado)'
  },
  {
    id: 'task-organizer',
    name: 'Gestor de Processos RH',
    description: 'Prioriza e organiza processos de RH (admissão, demissão, avaliações), considera prazos legais e distribui tarefas para equipe.',
    category: 'RH & Jurídico',
    useCase: 'Otimizar gestão de processos e prazos de RH',
    difficulty: 'intermediate',
    estimatedTime: '6-10 min',
    nodes: [
      {
        id: 'input-1',
        type: 'customNode',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Processos RH',
          nodeType: 'input',
          inputSchema: {
            type: 'object',
            properties: {
              processos: { type: 'array', items: { type: 'object' }, description: 'Lista de processos de RH' },
              tipo_processo: { type: 'string', enum: ['admissao', 'demissao', 'avaliacao', 'promocao', 'transferencia'], description: 'Tipo do processo' },
              prazo_legal: { type: 'string', format: 'date', description: 'Prazo legal obrigatório' },
              responsavel: { type: 'string', description: 'Responsável pelo processo' }
            },
            required: ['processos', 'tipo_processo']
          }
        }
      },
      {
        id: 'ai-1',
        type: 'customNode',
        position: { x: 300, y: 100 },
        data: {
          label: 'Priorização RH',
          nodeType: 'ai',
          provider: 'openai',
          model: 'gpt-4',
          prompt: 'Analise e priorize estes processos de RH considerando: prazos legais trabalhistas, urgência do processo, impacto no funcionário, recursos necessários, dependências entre processos. Considere CLT e legislação trabalhista brasileira.'
        }
      },
      {
        id: 'logic-1',
        type: 'customNode',
        position: { x: 500, y: 100 },
        data: { label: 'Distribuição Equipe RH', nodeType: 'logic' }
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
        data: { label: 'Workflow Aprovação', nodeType: 'api' }
      },
      {
        id: 'output-1',
        type: 'customNode',
        position: { x: 900, y: 100 },
        data: { 
          label: 'Processos Organizados',
          nodeType: 'output',
          outputSchema: {
            type: 'object',
            properties: {
              cronograma_processos: { type: 'array', description: 'Cronograma priorizado de processos' },
              alertas_prazos: { type: 'array', description: 'Alertas de prazos legais' },
              distribuicao_equipe: { type: 'object', description: 'Atribuição de responsabilidades' },
              workflow_aprovacao: { type: 'array', description: 'Fluxo de aprovações necessárias' }
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
    tags: ['processos-rh', 'admissao', 'demissao', 'avaliacao', 'prazos-legais', 'gpt-4', 'rh'],
    preview: 'Input (Processos) → AI (Priorização RH) → Logic (Distribuição) → API (HRIS + Workflow) → Output (Organizados)'
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
          prompt: `Analise este currículo e gere um relatório HTML profissional completo seguindo este formato EXATO. O HTML deve ser self-contained, com CSS inline ou em uma tag <style>.

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Análise de Currículo - Triagem RH</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f0fdf4; color: #1f2937; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
        .score-box { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .score-number { font-size: 3em; font-weight: bold; margin: 10px 0; }
        .section { margin: 25px 0; padding: 20px; border-left: 4px solid #10b981; background: #f0fdf4; border-radius: 0 8px 8px 0; }
        .section h3 { color: #065f46; margin: 0 0 15px 0; font-size: 1.3em; }
        .criteria-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .criteria-item { background: white; padding: 15px; border-radius: 8px; border: 1px solid #d1fae5; text-align: center; }
        .criteria-score { font-size: 1.5em; font-weight: bold; color: #059669; }
        .strengths { background: #dcfce7; border-left: 4px solid #16a34a; }
        .weaknesses { background: #fef2f2; border-left: 4px solid #dc2626; }
        .recommendation { background: #dbeafe; border-left: 4px solid #2563eb; }
        .status-excellent { color: #16a34a; font-weight: bold; }
        .status-good { color: #ca8a04; font-weight: bold; }
        .status-poor { color: #dc2626; font-weight: bold; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; }
        ul { padding-left: 20px; } li { margin-bottom: 0.5rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>👤 Análise de Currículo</h1>
            <p>Triagem Automatizada - ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <div class="score-box">
            <h2>Pontuação Geral</h2>
            <div class="score-number">[PONTUAÇÃO]/100</div>
            <p>Classificação: <span class="[CLASSE_STATUS]">[STATUS_CANDIDATO]</span></p>
        </div>

        <div class="section">
            <h3>📋 DADOS DO CANDIDATO</h3>
            <p><strong>Nome:</strong> [NOME_CANDIDATO]</p>
            <p><strong>Cargo Pretendido:</strong> [CARGO_PRETENDIDO]</p>
            <p><strong>Experiência Total:</strong> [ANOS_EXPERIENCIA] anos</p>
            <p><strong>Formação:</strong> [FORMACAO_PRINCIPAL]</p>
        </div>

        <div class="section">
            <h3>📊 AVALIAÇÃO POR CRITÉRIOS</h3>
            <div class="criteria-grid">
                <div class="criteria-item">
                    <h4>Experiência Relevante</h4>
                    <div class="criteria-score">[SCORE_EXPERIENCIA]/20</div>
                </div>
                <div class="criteria-item">
                    <h4>Formação Acadêmica</h4>
                    <div class="criteria-score">[SCORE_FORMACAO]/20</div>
                </div>
                <div class="criteria-item">
                    <h4>Habilidades Técnicas</h4>
                    <div class="criteria-score">[SCORE_HABILIDADES]/20</div>
                </div>
            </div>
        </div>

        <div class="section strengths">
            <h3>✅ PONTOS FORTES</h3>
            <ul><li>[LISTAR_PONTOS_FORTES]</li></ul>
        </div>

        <div class="section weaknesses">
            <h3>⚠️ PONTOS DE ATENÇÃO</h3>
            <ul><li>[LISTAR_PONTOS_FRACOS]</li></ul>
        </div>

        <div class="section recommendation">
            <h3>🎯 RECOMENDAÇÃO FINAL</h3>
            <p><strong>Status:</strong> <span class="[CLASSE_RECOMENDACAO]">[RECOMENDACAO_STATUS]</span></p>
            <p><strong>Justificativa:</strong> [JUSTIFICATIVA_DETALHADA]</p>
            <p><strong>Próximos Passos:</strong> [PROXIMOS_PASSOS]</p>
        </div>

        <div class="footer">
            <p>📄 Relatório gerado automaticamente pelo AutomateAI</p>
        </div>
    </div>
</body>
</html>
`
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
