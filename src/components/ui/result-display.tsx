import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { renderMarkdownToHTML } from '@/lib/markdown-formatter';
import DOMPurify from 'dompurify';
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, FileText, User, Calendar, TrendingUp } from "lucide-react"

export interface ExecutionResultDisplay {
  success: boolean
  error?: string
  executionId: string
  executionTime: number
  nodeResults: Record<string, any>
  agent: {
    id: string
    name: string
    category: string
  }
  output?: any
}

interface ResultDisplayProps {
  result: ExecutionResultDisplay
  className?: string
}

export function ResultDisplay({ result, className }: ResultDisplayProps) {

  if (!result.success) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <CardTitle className="text-red-700">Erro na Execução</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{result.error}</p>
        </CardContent>
      </Card>
    )
  }

  const formatOutput = (output: any) => {
    if (!output) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">⚠️ Nenhum resultado foi gerado. Verifique se o arquivo foi processado corretamente.</p>
        </div>
      );
    }

    // Sanitize string output that contains HTML
    if (typeof output === 'string' && /<[a-z][\s\S]*>/i.test(output)) {
        const sanitizedHtml = DOMPurify.sanitize(output);
        // If it's a full HTML document, render in an iframe
        if (sanitizedHtml.includes('<!DOCTYPE html>')) {
            return (
                <iframe
                    srcDoc={sanitizedHtml}
                    className="w-full h-[600px] border-0 rounded-lg"
                    title="Relatório de Análise"
                    sandbox="allow-same-origin"
                />
            );
        }
        // Otherwise, render as a div
        return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} className="prose prose-sm max-w-none" />;
    }

    // Handle object responses
    if (typeof output === 'object' && output !== null) {
        if (output.response && typeof output.response === 'string') {
            const sanitizedHtml = DOMPurify.sanitize(renderMarkdownToHTML(output.response));
            return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} className="prose prose-sm max-w-none" />;
        }
        // Fallback for other objects
        return <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto">{JSON.stringify(output, null, 2)}</pre>;
    }

    // Fallback for plain text or other types
    return <p className="text-gray-700 whitespace-pre-wrap">{String(output)}</p>;
  };

  return (
    <Card className={`border-green-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-700">Execução Concluída</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {result.executionTime || 0}ms
            </Badge>
            <Badge variant="outline">
              {result.agent?.category === 'rh_juridico' ? 'RH & Jurídico' : 'Personalizado'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informações do Agente */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Agente:</span>
          <span className="font-medium">{result.agent?.name || 'Agente Desconhecido'}</span>
          <span>•</span>
          <span>ID: {result.executionId?.slice(0, 8) || 'N/A'}</span>
        </div>

        {/* Output Formatado */}
        {result.output && (
          <div>
            <h4 className="font-medium mb-3">Resultado:</h4>
            {formatOutput(result.output)}
          </div>
        )}

        {/* Status dos Nós (resumido) */}
        {Object.keys(result.nodeResults).length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Status do Processamento:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(result.nodeResults).map(([nodeId, nodeResult]: [string, any]) => (
                <Badge 
                  key={nodeId} 
                  variant={nodeResult?.success ? "default" : "destructive"}
                  className="text-xs"
                >
                  {nodeResult?.success ? '✓' : '✗'} {nodeId.slice(0, 8)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
