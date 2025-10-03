"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import { ExecutionResult } from '@/types/agent';

interface ExecutionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ExecutionResult | null;
  agentName: string;
  outputFormat: 'pdf' | 'docx' | 'excel';
}

export function ExecutionResultModal({ isOpen, onClose, result, agentName, outputFormat }: ExecutionResultModalProps) {
  if (!isOpen || !result) return null;

  const handleDownload = async () => {
    if (!result.output) return;

    try {
      const response = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: result.output,
          format: outputFormat,
          fileName: `${agentName}.${outputFormat}`,
          template: 'professional-report',
          download: true,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${agentName.replace(/\s+/g, '_')}.${outputFormat}`;
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-gray-900 border-gray-700 text-white mt-0">
        <DialogHeader>
          <DialogTitle className="text-2xl">Resultado da Execução: {agentName}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-4 bg-gray-800 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(result.output, null, 2)}
          </pre>
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} className="text-white border-gray-600 hover:bg-gray-700">
            <X className="mr-2 h-4 w-4" /> Fechar
          </Button>
          <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
            <Download className="mr-2 h-4 w-4" /> Baixar {outputFormat.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
