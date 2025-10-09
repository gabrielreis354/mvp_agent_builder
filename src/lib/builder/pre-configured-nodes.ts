/**
 * Biblioteca de Nós Pré-Configurados para RH
 * Nós prontos para arrastar e usar, sem necessidade de configuração técnica
 */

export interface PreConfiguredNode {
  id: string;
  category: 'rh' | 'financeiro' | 'juridico' | 'geral';
  name: string;
  description: string;
  icon: string;
  nodeType: 'input' | 'ai' | 'logic' | 'api' | 'output';
  config: {
    label: string;
    prompt?: string;
    inputSchema?: any;
    condition?: string;
    apiEndpoint?: string;
  };
}

export const preConfiguredNodes: PreConfiguredNode[] = [
  // ===== CATEGORIA: RH =====
  {
    id: 'rh-upload-curriculo',
    category: 'rh',
    name: 'Receber Currículo',
    description: 'Permite o upload de currículos em PDF ou Word',
    icon: '📄',
    nodeType: 'input',
    config: {
      label: 'Upload de Currículo',
      inputSchema: {
        type: 'object',
        properties: {
          curriculo: {
            type: 'string',
            format: 'binary',
            description: 'Arquivo do currículo (PDF ou DOCX)'
          },
          nome_candidato: {
            type: 'string',
            description: 'Nome do candidato (opcional)'
          },
          vaga: {
            type: 'string',
            description: 'Vaga pretendida (opcional)'
          }
        }
      }
    }
  },
  
  {
    id: 'rh-analisar-curriculo',
    category: 'rh',
    name: 'Analisar Currículo',
    description: 'Extrai informações do currículo: nome, experiência, formação, habilidades',
    icon: '🔍',
    nodeType: 'ai',
    config: {
      label: 'Análise de Currículo',
      prompt: `Você é um especialista em Recursos Humanos. Analise o currículo fornecido e extraia as seguintes informações:

1. **Dados Pessoais:**
   - Nome completo
   - Email
   - Telefone
   - LinkedIn (se houver)

2. **Formação Acadêmica:**
   - Cursos (graduação, pós, MBA, etc.)
   - Instituições
   - Anos de conclusão

3. **Experiência Profissional:**
   - Empresas onde trabalhou
   - Cargos ocupados
   - Período de cada experiência
   - Principais responsabilidades

4. **Habilidades e Competências:**
   - Habilidades técnicas (hard skills)
   - Habilidades comportamentais (soft skills)
   - Idiomas
   - Certificações

5. **Resumo Profissional:**
   - Breve resumo da trajetória
   - Pontos fortes
   - Áreas de especialização

Retorne as informações de forma estruturada e objetiva.`
    }
  },

  {
    id: 'rh-pontuar-candidato',
    category: 'rh',
    name: 'Pontuar Candidato',
    description: 'Avalia e dá uma nota de 0 a 100 para o candidato',
    icon: '⭐',
    nodeType: 'ai',
    config: {
      label: 'Pontuação do Candidato',
      prompt: `Você é um especialista em recrutamento e seleção. Com base nas informações do currículo, avalie o candidato e atribua uma pontuação de 0 a 100, considerando:

**Critérios de Avaliação (peso de cada um):**

1. **Experiência Relevante (30 pontos)**
   - Anos de experiência na área
   - Empresas de renome no currículo
   - Progressão de carreira

2. **Formação Acadêmica (25 pontos)**
   - Nível de escolaridade
   - Qualidade das instituições
   - Cursos complementares

3. **Habilidades Técnicas (25 pontos)**
   - Domínio de ferramentas/tecnologias relevantes
   - Certificações
   - Conhecimentos específicos

4. **Habilidades Comportamentais (10 pontos)**
   - Liderança
   - Trabalho em equipe
   - Comunicação

5. **Adequação Cultural (10 pontos)**
   - Valores alinhados
   - Experiências em ambientes similares

**Retorne:**
- Pontuação total (0-100)
- Pontuação de cada critério
- Justificativa da nota
- Recomendação (Aprovado/Em Análise/Reprovado)`
    }
  },

  {
    id: 'rh-verificar-aprovacao',
    category: 'rh',
    name: 'Verificar se Aprovado',
    description: 'Decide se o candidato foi aprovado (nota >= 70)',
    icon: '✅',
    nodeType: 'logic',
    config: {
      label: 'Candidato Aprovado?',
      condition: 'output.pontuacao >= 70'
    }
  },

  {
    id: 'rh-upload-contrato',
    category: 'rh',
    name: 'Receber Contrato',
    description: 'Permite o upload de contratos de trabalho',
    icon: '📋',
    nodeType: 'input',
    config: {
      label: 'Upload de Contrato',
      inputSchema: {
        type: 'object',
        properties: {
          contrato: {
            type: 'string',
            format: 'binary',
            description: 'Arquivo do contrato (PDF ou DOCX)'
          },
          tipo_contrato: {
            type: 'string',
            enum: ['CLT', 'PJ', 'Estágio', 'Temporário'],
            description: 'Tipo de contrato'
          }
        }
      }
    }
  },

  {
    id: 'rh-analisar-contrato',
    category: 'rh',
    name: 'Analisar Contrato',
    description: 'Verifica cláusulas, valores e conformidade legal do contrato',
    icon: '⚖️',
    nodeType: 'ai',
    config: {
      label: 'Análise de Contrato',
      prompt: `Você é um especialista em Direito do Trabalho. Analise o contrato fornecido e verifique:

1. **Informações Básicas:**
   - Tipo de contrato (CLT, PJ, etc.)
   - Partes envolvidas (empregador e empregado)
   - Data de início
   - Duração (determinado ou indeterminado)

2. **Remuneração:**
   - Salário base
   - Benefícios (VT, VR, plano de saúde, etc.)
   - Bônus ou comissões
   - Forma de pagamento

3. **Jornada de Trabalho:**
   - Horas semanais
   - Horário de trabalho
   - Horas extras
   - Banco de horas

4. **Cláusulas Importantes:**
   - Período de experiência
   - Aviso prévio
   - Confidencialidade
   - Não-competição
   - Rescisão

5. **Conformidade Legal:**
   - Está de acordo com a CLT?
   - Há cláusulas abusivas?
   - Faltam informações obrigatórias?
   - Riscos legais identificados

6. **Recomendações:**
   - Pontos que precisam ser ajustados
   - Sugestões de melhorias
   - Alertas importantes

Retorne uma análise completa e objetiva.`
    }
  },

  {
    id: 'rh-verificar-conformidade',
    category: 'rh',
    name: 'Verificar Conformidade',
    description: 'Verifica se o contrato está em conformidade com a CLT',
    icon: '✔️',
    nodeType: 'logic',
    config: {
      label: 'Contrato Conforme?',
      condition: 'output.conforme_clt === true && output.clausulas_abusivas === 0'
    }
  },

  {
    id: 'rh-upload-folha-pagamento',
    category: 'rh',
    name: 'Receber Folha de Pagamento',
    description: 'Permite o upload de planilhas de folha de pagamento',
    icon: '💰',
    nodeType: 'input',
    config: {
      label: 'Upload de Folha',
      inputSchema: {
        type: 'object',
        properties: {
          folha: {
            type: 'string',
            format: 'binary',
            description: 'Planilha da folha de pagamento (Excel ou PDF)'
          },
          mes_referencia: {
            type: 'string',
            description: 'Mês de referência (ex: Janeiro/2025)'
          }
        }
      }
    }
  },

  {
    id: 'rh-analisar-folha',
    category: 'rh',
    name: 'Analisar Folha de Pagamento',
    description: 'Verifica valores, descontos e conformidade da folha',
    icon: '📊',
    nodeType: 'ai',
    config: {
      label: 'Análise de Folha',
      prompt: `Você é um especialista em Departamento Pessoal. Analise a folha de pagamento e verifique:

1. **Resumo Geral:**
   - Total de funcionários
   - Total de proventos
   - Total de descontos
   - Valor líquido total

2. **Proventos:**
   - Salários
   - Horas extras
   - Comissões
   - Bônus
   - Outros

3. **Descontos:**
   - INSS
   - IRRF
   - Vale transporte
   - Vale refeição
   - Plano de saúde
   - Outros

4. **Verificações:**
   - Cálculos estão corretos?
   - Descontos dentro dos limites legais?
   - Há inconsistências?
   - Valores divergentes do esperado?

5. **Alertas:**
   - Funcionários com desconto acima de 30%
   - Valores zerados ou negativos
   - Possíveis erros de cálculo

Retorne uma análise detalhada e aponte qualquer irregularidade.`
    }
  },

  {
    id: 'rh-gerar-relatorio',
    category: 'rh',
    name: 'Gerar Relatório',
    description: 'Cria um relatório profissional com os resultados',
    icon: '📄',
    nodeType: 'output',
    config: {
      label: 'Relatório Final'
    }
  },

  // ===== CATEGORIA: GERAL =====
  {
    id: 'geral-enviar-email',
    category: 'geral',
    name: 'Enviar Email',
    description: 'Envia o relatório por email automaticamente',
    icon: '📧',
    nodeType: 'api',
    config: {
      label: 'Enviar por Email',
      apiEndpoint: '/api/send-report-email',
    }
  },

  {
    id: 'geral-salvar-arquivo',
    category: 'geral',
    name: 'Salvar Arquivo',
    description: 'Salva o resultado em PDF ou Excel',
    icon: '💾',
    nodeType: 'output',
    config: {
      label: 'Salvar Resultado'
    }
  },

  {
    id: 'geral-notificar-equipe',
    category: 'geral',
    name: 'Notificar Equipe',
    description: 'Envia notificação para a equipe de RH',
    icon: '🔔',
    nodeType: 'api',
    config: {
      label: 'Notificar Equipe',
      apiEndpoint: '/api/notifications/team'
    }
  }
];

/**
 * Categorias organizadas para exibição
 */
export const nodeCategories = {
  rh: {
    name: 'Recursos Humanos',
    icon: '👥',
    description: 'Processos de RH: currículos, contratos, folha de pagamento',
    nodes: preConfiguredNodes.filter(n => n.category === 'rh')
  },
  financeiro: {
    name: 'Financeiro',
    icon: '💰',
    description: 'Processos financeiros: despesas, reembolsos, orçamentos',
    nodes: preConfiguredNodes.filter(n => n.category === 'financeiro')
  },
  juridico: {
    name: 'Jurídico',
    icon: '⚖️',
    description: 'Processos jurídicos: contratos, conformidade, análises legais',
    nodes: preConfiguredNodes.filter(n => n.category === 'juridico')
  },
  geral: {
    name: 'Ações Gerais',
    icon: '⚙️',
    description: 'Ações comuns: enviar email, salvar arquivo, notificar',
    nodes: preConfiguredNodes.filter(n => n.category === 'geral')
  }
};

/**
 * Buscar nó pré-configurado por ID
 */
export function getPreConfiguredNode(id: string): PreConfiguredNode | undefined {
  return preConfiguredNodes.find(n => n.id === id);
}

/**
 * Buscar nós por categoria
 */
export function getNodesByCategory(category: string): PreConfiguredNode[] {
  return preConfiguredNodes.filter(n => n.category === category);
}

/**
 * Buscar nós por termo de busca
 */
export function searchNodes(query: string): PreConfiguredNode[] {
  const lowerQuery = query.toLowerCase();
  return preConfiguredNodes.filter(n => 
    n.name.toLowerCase().includes(lowerQuery) ||
    n.description.toLowerCase().includes(lowerQuery)
  );
}
