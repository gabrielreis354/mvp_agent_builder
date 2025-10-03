"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Copy, Sparkles } from "lucide-react";
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

interface GenericResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  result: any;
  executedAt: string;
}

// ✅ CORRIGIDO: Aba de Relatório agora usa `marked` para renderizar o payload como HTML
function ProfessionalReportView({ analysisPayload }: { analysisPayload: any }) {
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const generateMarkdownFromPayload = (data: any): string => {
    if (!data) return '';
    if (typeof data === 'string') return data;

    let markdown = '';
    for (const [key, value] of Object.entries(data)) {
      const title = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      markdown += `### ${title}\n\n`; // Título de nível 3

      if (typeof value === 'string') {
        markdown += `${value.replace(/\n/g, '  \n')}\n\n`; // Adiciona quebras de linha
      } else if (Array.isArray(value)) {
        markdown += value.map(item => `* ${item}`).join('\n');
        markdown += '\n\n';
      } else if (typeof value === 'object' && value !== null) {
        markdown += `${JSON.stringify(value, null, 2)}\n\n`;
      }
    }
    return markdown;
  };

  useEffect(() => {
    const renderMarkdown = async () => {
      if (!analysisPayload) {
        setIsLoading(false);
        return;
      }

      const markdown = generateMarkdownFromPayload(analysisPayload);
      const html = await marked(markdown);
      setHtmlContent(html);
      setIsLoading(false);
    };

    renderMarkdown();
  }, [analysisPayload]);

  if (isLoading) {
    return <div className="text-center py-8">Carregando relatório...</div>;
  }

  return (
    <div className="prose prose-invert max-w-none bg-gray-900/50 p-6 rounded-lg border border-gray-700">
      <div
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }}
      />
    </div>
  );
}

// 🎨 NOVO: Componente Universal para renderizar qualquer tipo de dado
const UniversalRenderer = ({ data }: { data: any }) => {
  if (typeof data === "string") {
    return (
      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
        {data}
      </p>
    );
  }

  if (Array.isArray(data)) {
    return (
      <ul className="space-y-2 list-disc list-inside">
        {data.map((item, index) => (
          <li key={index} className="text-gray-300">
            {typeof item === "object" && item !== null ? (
              <pre className="text-xs whitespace-pre-wrap font-mono bg-gray-900 p-2 rounded-md border border-gray-700">
                {JSON.stringify(item, null, 2)}
              </pre>
            ) : (
              String(item)
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof data === "object" && data !== null) {
    return (
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="text-sm">
            <span className="font-semibold text-gray-400 capitalize">
              {key.replace(/_/g, " ")}:
            </span>
            <div className="pl-4 mt-1 border-l-2 border-gray-700">
              <UniversalRenderer data={value} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <p className="text-gray-500">Formato de dado não suportado.</p>;
};

// 🎨 NOVO: Componente principal da Visão Geral, agora usando o UniversalRenderer
function OverviewTab({ analysisPayload }: { analysisPayload: any }) {
  if (
    !analysisPayload ||
    typeof analysisPayload !== "object" ||
    Object.keys(analysisPayload).length === 0
  ) {
    return (
      <div className="text-center py-8 text-gray-400">
        Nenhuma análise disponível para exibição.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(analysisPayload).map(([key, value]) => (
        <div
          key={key}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-blue-400 mb-3 capitalize">
            {key.replace(/_/g, " ")}
          </h3>
          <UniversalRenderer data={value} />
        </div>
      ))}
    </div>
  );
}

// 🚀 NOVA LÓGICA: Parser robusto e simplificado para a nova arquitetura
function parseAndExtractPayload(result: any): {
  analysisPayload: any | null;
  fullText: string | null;
  metadata: any | null;
} {
  console.log(
    "⚡️ [GenericResultsModal] Parsing result with new logic:",
    result
  );

  const output = result?.output;
  if (typeof output !== "string") {
    console.error("❌ [Parser] Result output is not a string:", output);
    return { analysisPayload: null, fullText: null, metadata: null };
  }

  try {
    const data = JSON.parse(output);

    // Tenta extrair o payload da análise e o texto completo de várias chaves possíveis
    const analysisPayload = data?.analise_payload || data?.analysis_payload || data?.analysis || null;
    const fullText = data?.conteudo_extraido || data?.extracted_content || data?.full_text || data?.original_text || null;
    const metadata = data?.metadata || null;

    console.log("✅ [Parser] Successfully parsed new architecture payload:", {
      hasAnalysis: !!analysisPayload,
      hasFullText: !!fullText,
    });

    return { analysisPayload, fullText, metadata };
  } catch (error) {
    console.error("❌ [Parser] Failed to parse result output JSON:", error);
    return {
      analysisPayload: {
        error: "Falha ao processar a resposta da IA.",
        response: output,
      },
      fullText: output,
      metadata: null,
    };
  }
}

export function GenericResultsModal({
  isOpen,
  onClose,
  agentName,
  result,
  executedAt,
}: GenericResultsModalProps) {
  // 🚀 NOVOS ESTADOS: Separados para clareza e robustez
  const [analysisPayload, setAnalysisPayload] = useState<any>(null);
  const [fullText, setFullText] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (result) {
      const { analysisPayload, fullText, metadata } =
        parseAndExtractPayload(result);
      setAnalysisPayload(analysisPayload);
      setFullText(fullText);
      setMetadata(metadata);
    }
  }, [result]);

  const executionTime = new Date(executedAt).toLocaleString("pt-BR");

  const handleDownloadReport = async (format: "pdf" | "docx" | "excel") => {
    if (!analysisPayload) {
      toast({
        title: "Erro",
        description: "Não há dados de análise para gerar o relatório.",
        variant: "destructive",
      });
      return;
    }

    setDownloading(true);
    toast({
      title: "Gerando relatório...",
      description: `Seu arquivo ${format.toUpperCase()} está sendo preparado.`,
    });

    try {
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: {
            metadata: metadata || {},
            analise_payload: analysisPayload,
          },
          format: format,
          fileName: metadata?.titulo_relatorio || agentName,
        }),
      });

      if (response.ok) {
        const contentDisposition = response.headers.get("content-disposition");
        let filename = `${agentName.replace(/\s+/g, "_")}.${format}`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Download iniciado!",
          description: `O arquivo ${filename} foi salvo.`,
        });
      } else {
        const error = await response.json();
        throw new Error(error.details || "Falha ao gerar o documento.");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Erro no Download",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  // Função recursiva para gerar texto legível a partir do payload
const generateTextFromPayload = (payload: any, indentLevel = 0): string => {
  const indent = "  ".repeat(indentLevel);
  let text = "";

  if (Array.isArray(payload)) {
    text += payload.map(item => generateTextFromPayload(item, indentLevel + 1)).join("\n");
  } else if (typeof payload === 'object' && payload !== null) {
    for (const key in payload) {
      const title = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      text += `${indent}${title}:\n`;
      text += generateTextFromPayload(payload[key], indentLevel + 1) + "\n";
    }
  } else {
    text += `${indent}${payload}\n`;
  }

  return text;
};

const handleCopyContent = () => {
  if (analysisPayload) {
    const textToCopy = generateTextFromPayload(analysisPayload);
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Copiado!",
      description: "A análise formatada foi copiada para a área de transferência.",
    });
  } else if (fullText) {
    navigator.clipboard.writeText(fullText);
    toast({
      title: "Copiado!",
      description: "O texto completo foi copiado.",
    });
  } else {
    toast({
      title: "Nada para copiar",
      description: "Não há conteúdo disponível.",
      variant: "destructive",
    });
  }
};

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-6xl max-h-[90vh] bg-gray-800 text-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Sparkles className="text-blue-400" />
                {agentName}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Relatório gerado em: {executionTime}
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              <X />
            </Button>
          </div>

          <div className="flex-grow overflow-y-auto p-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-900">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="report">📄 Relatório</TabsTrigger>
                <TabsTrigger value="full-text">Texto Completo</TabsTrigger>
              </TabsList>

              <div className="mt-4">
                {analysisPayload ? (
                  <>
                    <TabsContent value="overview">
                      <OverviewTab analysisPayload={analysisPayload} />
                    </TabsContent>
                    <TabsContent value="report">
                      <ProfessionalReportView
                        analysisPayload={analysisPayload}
                      />
                    </TabsContent>
                    <TabsContent value="full-text">
                      <div className="bg-gray-900 p-4 rounded-lg max-h-96 overflow-y-auto border border-gray-700">
                        <h3 className="text-lg font-semibold text-blue-400 mb-3">
                          Texto Completo Original
                        </h3>
                        {fullText ? (
                          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                            {fullText}
                          </pre>
                        ) : (
                          <p className="text-gray-400">
                            Nenhum texto completo foi extraído nesta execução.
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p>Processando resultados...</p>
                  </div>
                )}
              </div>
            </Tabs>
          </div>

          <div className="p-6 border-t border-gray-700 bg-gray-900">
            <div className="flex gap-3 justify-end">
              <Button
                onClick={handleCopyContent}
                variant="outline"
                className="text-gray-300 border-gray-600 hover:bg-gray-800"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Análise
              </Button>
              <Button
                onClick={() => handleDownloadReport("pdf")}
                disabled={downloading || !analysisPayload}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600"
              >
                {downloading ? "Gerando..." : "Baixar PDF"}
              </Button>
              <Button
                onClick={() => handleDownloadReport("docx")}
                disabled={downloading || !analysisPayload}
                className="bg-sky-600 hover:bg-sky-700 text-white disabled:bg-gray-600"
              >
                {downloading ? "Gerando..." : "Baixar DOCX"}
              </Button>
              <Button
                onClick={() => handleDownloadReport("excel")}
                disabled={downloading || !analysisPayload}
                className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600"
              >
                {downloading ? "Gerando..." : "Baixar XLSX"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export { GenericResultsModal as default };
