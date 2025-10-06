"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Mail, Download, Play, FileText, FileSpreadsheet } from 'lucide-react';
import { Agent, ExecutionResult } from '@/types/agent';
import { ErrorAlert, useErrorAlert } from '@/components/ui/error-alert';
import { createUserFriendlyError } from '@/lib/errors/runtime-error-handler';

interface ExecutionPanelProps {
  agent: Agent | null;
  onExecute: (result: ExecutionResult) => void;
}

export function ExecutionPanel({ agent, onExecute }: ExecutionPanelProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'download'>('download');
  const [outputFormat, setOutputFormat] = useState<'pdf' | 'docx' | 'excel'>('pdf');
  const [fileError, setFileError] = useState<string | null>(null);
  const { error, showError, clearError } = useErrorAlert();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB
        setFileError('Arquivo muito grande. Máximo: 50MB');
        setUploadedFile(null);
      } else {
        setFileError(null);
        setUploadedFile(file);
      }
    }
  };

  const handleExecute = async () => {
    if (!agent) return;

    // 🎯 VALIDAÇÃO ADICIONAL: Verificar se o agent tem estrutura mínima necessária
    if (!agent.id || !agent.name || !agent.nodes) {
      console.error('❌ [ExecutionPanel] Agent inválido:', agent);
      alert('Erro: Configuração do agente incompleta. Por favor, salve o agente primeiro.');
      return;
    }

    if (agent.nodes.length === 0) {
      alert('Erro: O agente precisa ter pelo menos um nó para ser executado.');
      return;
    }

    setIsExecuting(true);

    try {
      console.log('🚀 [ExecutionPanel] Iniciando execução com agent:', {
        id: agent.id,
        name: agent.name,
        nodeCount: agent.nodes.length,
        edgeCount: agent.edges.length,
        hasFile: !!uploadedFile
      });

      // 1. Preparar dados para a API unificada em um FormData
      const executionData = new FormData();
      
      // Adicionar o agente completo como uma string JSON
      executionData.append('agent', JSON.stringify(agent));

      // Adicionar os parâmetros do formulário
      executionData.append('outputFormat', outputFormat);
      executionData.append('deliveryMethod', deliveryMethod);
      if (recipientEmail) executionData.append('email', recipientEmail);
      if (department) executionData.append('department', department);
      
      // Adicionar o arquivo se ele existir
      if (uploadedFile) {
        executionData.append('file', uploadedFile);
      }

      // 2. Chamar a API unificada /api/agents/execute
      console.log(`🚀 [ExecutionPanel] Chamando API unificada: /api/agents/execute`);
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        body: executionData, // FormData é enviado sem o header 'Content-Type'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Erro no servidor: ${response.status}` }));
        
        // 🎯 TRATAMENTO ESPECIAL: Erro de extração de texto
        if (response.status === 422 && errorData.details) {
          alert(`❌ Erro na Extração do Arquivo:\n\n${errorData.details}\n\nSugestões:\n• Verifique se o PDF não está corrompido\n• Tente um arquivo diferente\n• Verifique se o PDF contém texto (não apenas imagens)`);
          return;
        }
        
        throw new Error(errorData.details || errorData.error || 'Falha na execução do agente');
      }

      // 3. Tratar a resposta (lógica idêntica ao AgentExecutionModalV2)
      const contentType = response.headers.get('content-type');

      // A API sempre retorna JSON agora. A lógica de download foi movida para o modal de resultados.
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.details || result.error || 'A execução retornou um erro inesperado');
      }
      
      // Inicia o download direto em vez de abrir o modal
      handleDirectDownload(result as ExecutionResult, agent.name || 'Agente');

    } catch (error) {
      console.error('Erro na execução do ExecutionPanel:', error);
      
      // Criar mensagem amigável com o sistema de erros
      const friendly = createUserFriendlyError(error);
      
      // Mostrar alerta de erro
      showError({
        title: friendly.title,
        message: friendly.message,
        suggestedAction: friendly.suggestedAction,
        canRetry: friendly.canRetry,
        onRetry: friendly.canRetry ? handleExecute : undefined,
        severity: 'error'
      });
      
      // Também passar para o callback (compatibilidade)
      const errorResult: ExecutionResult = {
        success: false,
        output: null,
        executionId: 'error-' + Date.now(),
        executionTime: 0,
        cost: 0, tokensUsed: 0, logs: [],
        error: {
          message: friendly.message,
          stack: error instanceof Error ? error.stack : undefined,
        },
      };
      onExecute(errorResult);
    } finally {
      setIsExecuting(false);
    }
  };

  // Função auxiliar para extrair nome do arquivo
  const getFilenameFromResponse = (response: Response): string | null => {
    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match) {
        return match[1].replace(/['"]/g, '');
      }
    }
    return null;
  };

  const handleDirectDownload = async (result: ExecutionResult, agentName: string) => {
    if (!result.output) return;

    try {
      const response = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: typeof result.output === 'string' ? JSON.parse(result.output) : result.output,
          format: outputFormat,
          fileName: `${agentName}`,
        }),
      });

      if (response.ok) {
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `${agentName.replace(/\s+/g, '_')}.${outputFormat}`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Erro ao gerar o documento para download.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Ocorreu um erro ao tentar baixar o arquivo.');
    }
  };

  return (
    <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Painel de Execução
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Alert */}
          {error && (
            <ErrorAlert
              title={error.title}
              message={error.message}
              suggestedAction={error.suggestedAction}
              canRetry={error.canRetry}
              onRetry={error.onRetry}
              onDismiss={clearError}
              severity={error.severity}
            />
          )}

          {/* Upload */}
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900/50">
            <Label htmlFor="file-upload-builder" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800">
              <Upload className="w-8 h-8 mb-3 text-gray-400" />
              {uploadedFile ? <p className="text-sm text-green-400">{uploadedFile.name}</p> : <p className="text-sm text-gray-400">Clique para enviar</p>}
              <input id="file-upload-builder" type="file" className="hidden" onChange={handleFileChange} />
            </Label>
            {fileError && <p className="mt-2 text-sm text-red-500">{fileError}</p>}
          </div>

          {/* Departamento */}
          <div>
            <Label htmlFor="department-builder">Departamento</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger id="department-builder"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="RH">Recursos Humanos</SelectItem>
                <SelectItem value="TI">Tecnologia</SelectItem>
                <SelectItem value="Financeiro">Financeiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Método de Entrega */}
          <div>
            <Label className="text-sm font-medium">Método de Entrega</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div 
                onClick={() => setDeliveryMethod('download')} 
                className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors border ${
                  deliveryMethod === 'download' 
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300' 
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Download className="h-4 w-4" />
                <span className="text-sm">Download</span>
              </div>
              <div 
                onClick={() => setDeliveryMethod('email')} 
                className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors border ${
                  deliveryMethod === 'email' 
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300' 
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Mail className="h-4 w-4" />
                <span className="text-sm">Email</span>
              </div>
            </div>
          </div>

          {/* Email (só aparece se método for email) */}
          {deliveryMethod === 'email' && (
            <div>
              <Label htmlFor="email-builder">Email para Envio</Label>
              <Input 
                id="email-builder" 
                type="email" 
                placeholder="exemplo@email.com" 
                value={recipientEmail} 
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>
          )}

          {/* Formato do Relatório */}
          <div>
            <Label className="text-sm font-medium">Formato do Relatório</Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div 
                onClick={() => setOutputFormat('pdf')} 
                className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-colors border ${
                  outputFormat === 'pdf' 
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300' 
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FileText className="h-5 w-5 mb-1" />
                <span className="text-xs">PDF</span>
              </div>
              <div 
                onClick={() => setOutputFormat('docx')} 
                className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-colors border ${
                  outputFormat === 'docx' 
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300' 
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FileText className="h-5 w-5 mb-1" />
                <span className="text-xs">DOCX</span>
              </div>
              <div 
                onClick={() => setOutputFormat('excel')} 
                className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-colors border ${
                  outputFormat === 'excel' 
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300' 
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FileSpreadsheet className="h-5 w-5 mb-1" />
                <span className="text-xs">Excel</span>
              </div>
            </div>
          </div>

          <Button onClick={handleExecute} disabled={!agent || isExecuting} className="w-full bg-blue-600 hover:bg-blue-700">
            {isExecuting ? 'Executando...' : 'Executar Agente'}
          </Button>
        </CardContent>

    </Card>
  );
}
