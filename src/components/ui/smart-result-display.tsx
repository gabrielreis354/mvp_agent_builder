"use client";

import React from 'react';
import { FileText, Calendar, CheckCircle, AlertTriangle, Info, TrendingUp, DollarSign, Users, Briefcase } from 'lucide-react';

interface SmartResultDisplayProps {
  result: any;
}

export function SmartResultDisplay({ result }: SmartResultDisplayProps) {
  // Detectar tipo de conteúdo
  const detectContentType = (data: any): string => {
    if (!data) return 'unknown';
    
    const dataStr = JSON.stringify(data).toLowerCase();
    
    if (dataStr.includes('contrato') || dataStr.includes('cláusula') || dataStr.includes('jurídic')) {
      return 'contract';
    }
    if (dataStr.includes('currículo') || dataStr.includes('experiência') || dataStr.includes('formação')) {
      return 'resume';
    }
    if (dataStr.includes('despesa') || dataStr.includes('pagamento') || dataStr.includes('salário')) {
      return 'expense';
    }
    if (dataStr.includes('análise') || dataStr.includes('relatório')) {
      return 'analysis';
    }
    
    return 'generic';
  };

  const contentType = detectContentType(result);

  // Extrair dados principais
  const extractMainData = (data: any) => {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        return { text: data };
      }
    }

    const metadata = data?.metadata || {};
    const payload = data?.analise_payload || data?.payload || data;

    return {
      title: metadata.titulo_relatorio || metadata.title || 'Resultado da Análise',
      date: metadata.data_analise || metadata.date || new Date().toLocaleDateString('pt-BR'),
      type: metadata.tipo_documento || metadata.type || 'Análise',
      analysisType: metadata.tipo_analise || 'Completa',
      summary: payload.resumo_executivo || payload.summary || '',
      details: payload,
      metadata
    };
  };

  const data = extractMainData(result);

  // Renderizar cards baseado no tipo
  const renderContent = () => {
    switch (contentType) {
      case 'contract':
        return <ContractView data={data} />;
      case 'resume':
        return <ResumeView data={data} />;
      case 'expense':
        return <ExpenseView data={data} />;
      default:
        return <GenericView data={data} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{data.title}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {data.date}
              </span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                {data.type}
              </span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                {data.analysisType}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}

// Visualização para Contratos
function ContractView({ data }: { data: any }) {
  const details = data.details;
  
  return (
    <div className="space-y-4">
      {/* Resumo Executivo */}
      {data.summary && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Resumo Executivo
          </h4>
          <p className="text-gray-300 text-sm leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Partes Envolvidas */}
      {(details.empregador || details.empregado) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {details.empregador && (
            <DataCard
              icon={<Briefcase className="w-5 h-5" />}
              title="Empregador"
              data={details.empregador}
              color="blue"
            />
          )}
          {details.empregado && (
            <DataCard
              icon={<Users className="w-5 h-5" />}
              title="Empregado"
              data={details.empregado}
              color="purple"
            />
          )}
        </div>
      )}

      {/* Análise de Riscos */}
      {details.analise_riscos && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Análise de Riscos
          </h4>
          <div className="space-y-2">
            {Array.isArray(details.analise_riscos) ? (
              details.analise_riscos.map((risco: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>{risco}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-300">{details.analise_riscos}</p>
            )}
          </div>
        </div>
      )}

      {/* Conformidade CLT */}
      {details.conformidade_clt && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Conformidade CLT
          </h4>
          <p className="text-sm text-gray-300">{details.conformidade_clt}</p>
        </div>
      )}

      {/* Recomendações */}
      {details.recomendacoes && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recomendações
          </h4>
          <div className="space-y-2">
            {Array.isArray(details.recomendacoes) ? (
              details.recomendacoes.map((rec: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-blue-400 mt-1">→</span>
                  <span>{rec}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-300">{details.recomendacoes}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Visualização para Currículos
function ResumeView({ data }: { data: any }) {
  const details = data.details;
  
  return (
    <div className="space-y-4">
      {/* Pontuação */}
      {details.pontuacao && (
        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-green-400 mb-1">Pontuação Geral</h4>
              <p className="text-3xl font-bold text-white">{details.pontuacao}/100</p>
            </div>
            <div className="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-green-400">{details.pontuacao}</span>
            </div>
          </div>
        </div>
      )}

      {/* Experiência */}
      {details.experiencia && (
        <DataCard
          icon={<Briefcase className="w-5 h-5" />}
          title="Experiência Profissional"
          data={details.experiencia}
          color="blue"
        />
      )}

      {/* Formação */}
      {details.formacao && (
        <DataCard
          icon={<FileText className="w-5 h-5" />}
          title="Formação Acadêmica"
          data={details.formacao}
          color="purple"
        />
      )}

      {/* Recomendação */}
      {details.recomendacao && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-400 mb-2">Recomendação Final</h4>
          <p className="text-gray-300 text-sm">{details.recomendacao}</p>
        </div>
      )}
    </div>
  );
}

// Visualização para Despesas
function ExpenseView({ data }: { data: any }) {
  const details = data.details;
  
  return (
    <div className="space-y-4">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {details.total_despesas && (
          <MetricCard
            label="Total de Despesas"
            value={formatCurrency(details.total_despesas)}
            icon={<DollarSign className="w-5 h-5" />}
            color="blue"
          />
        )}
        {details.gastos_suspeitos && (
          <MetricCard
            label="Gastos Suspeitos"
            value={details.gastos_suspeitos}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="yellow"
          />
        )}
        {details.economia_potencial && (
          <MetricCard
            label="Economia Potencial"
            value={formatCurrency(details.economia_potencial)}
            icon={<TrendingUp className="w-5 h-5" />}
            color="green"
          />
        )}
      </div>

      {/* Alertas */}
      {details.alertas && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alertas de Compliance
          </h4>
          <div className="space-y-2">
            {Array.isArray(details.alertas) ? (
              details.alertas.map((alerta: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-red-400 mt-1">⚠</span>
                  <span>{alerta}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-300">{details.alertas}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Visualização Genérica
function GenericView({ data }: { data: any }) {
  const renderValue = (value: any): React.ReactNode => {
    if (typeof value === 'object' && value !== null) {
      return (
        <div className="space-y-2 ml-4">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="text-sm">
              <span className="text-gray-400">{k}:</span>{' '}
              <span className="text-gray-300">{renderValue(v)}</span>
            </div>
          ))}
        </div>
      );
    }
    return <span className="text-gray-300">{String(value)}</span>;
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-400 mb-3">Dados da Análise</h4>
      <div className="space-y-3">
        {Object.entries(data.details).map(([key, value]) => (
          <div key={key}>
            <div className="text-sm font-medium text-blue-400 mb-1">
              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
            {renderValue(value)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de Card de Dados
function DataCard({ icon, title, data, color }: { icon: React.ReactNode; title: string; data: any; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-900/20 border-blue-500/30 text-blue-400',
    purple: 'bg-purple-900/20 border-purple-500/30 text-purple-400',
    green: 'bg-green-900/20 border-green-500/30 text-green-400',
    yellow: 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400',
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h4>
      <div className="space-y-1">
        {typeof data === 'object' ? (
          Object.entries(data).map(([key, value]) => (
            <div key={key} className="text-sm">
              <span className="text-gray-400">{key}:</span>{' '}
              <span className="text-gray-300">{String(value)}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-300">{String(data)}</p>
        )}
      </div>
    </div>
  );
}

// Componente de Métrica
function MetricCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-900/20 border-blue-500/30 text-blue-400',
    green: 'bg-green-900/20 border-green-500/30 text-green-400',
    yellow: 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400',
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

// Utilitário para formatar moeda
function formatCurrency(value: any): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  if (isNaN(num)) return String(value);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}
