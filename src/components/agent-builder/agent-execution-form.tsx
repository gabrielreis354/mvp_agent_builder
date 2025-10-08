"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  Mail,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Agent } from "@/types/agent";

export interface AgentExecutionFormData {
  [key: string]: any;
}

interface AgentExecutionFormProps {
  agent: Agent;
  onSubmit: (formData: AgentExecutionFormData) => void;
  isExecuting: boolean;
}

export function AgentExecutionForm({
  agent,
  onSubmit,
  isExecuting,
}: AgentExecutionFormProps) {
  const [formData, setFormData] = useState<AgentExecutionFormData>({});
  const [formSchema, setFormSchema] = useState<any[]>([]);
  const [department, setDepartment] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"email" | "download">(
    "download"
  );
  const [outputFormat, setOutputFormat] = useState<"pdf" | "docx" | "excel">(
    "pdf"
  );
  const [recipientEmail, setRecipientEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Função para formatar label de forma amigável
  const formatLabel = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const inputNode = agent.nodes?.find(
      (node) => node.data.nodeType === "input"
    );
    if (inputNode && inputNode.data.inputSchema) {
      const properties = inputNode.data.inputSchema.properties || {};
      const schema = Object.keys(properties).map((key) => ({
        name: key,
        ...properties[key],
      }));
      setFormSchema(schema);
      const initialData: AgentExecutionFormData = {};
      schema.forEach((field) => {
        // Detectar se é array de arquivos
        const isFileArray =
          field.type === "array" &&
          field.items?.type === "string" &&
          field.items?.format === "binary";

        initialData[field.name] =
          field.type === "string" && field.format === "binary"
            ? null
            : isFileArray
            ? []
            : "";
      });
      setFormData(initialData);
    } else {
      setFormSchema([]);
      setFormData({});
    }
  }, [agent]);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name: string, file: File | null) => {
    console.log(`📎 [Form] File changed: ${name}`, file);
    setFormData((prev) => {
      const newData = { ...prev, [name]: file };
      console.log(`📋 [Form] Updated formData:`, newData);
      return newData;
    });
  };

  const handleMultipleFilesChange = (name: string, files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      console.log(`📎 [Form] Multiple files changed: ${name}`, fileArray);
      setFormData((prev) => {
        const newData = { ...prev, [name]: fileArray };
        console.log(`📋 [Form] Updated formData:`, newData);
        return newData;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 [Form] Submit triggered');
    console.log('📋 [Form] Current formData:', formData);
    console.log('📋 [Form] FormData keys:', Object.keys(formData));
    console.log('📋 [Form] FormData entries:', Object.entries(formData).map(([key, value]) => ({
      key,
      type: value instanceof File ? 'File' : Array.isArray(value) ? 'Array' : typeof value,
      value: value instanceof File ? `File(${value.name})` : value
    })));
    
    // ✅ Validar campos obrigatórios
    const newErrors: Record<string, string> = {};
    
    formSchema.forEach((field) => {
      if (field.required) {
        const value = formData[field.name];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          newErrors[field.name] = `${field.title || formatLabel(field.name)} é obrigatório`;
        }
      }
    });
    
    // Validar email se método de entrega for email
    if (deliveryMethod === 'email' && !recipientEmail.trim()) {
      newErrors['email'] = 'Email é obrigatório para envio';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.error('❌ [Form] Validation errors:', newErrors);
      return;
    }
    
    setErrors({});
    const submitData = {
      ...formData,
      department,
      deliveryMethod,
      outputFormat,
      email: recipientEmail,
    };
    console.log('✅ [Form] Submitting data:', submitData);
    onSubmit(submitData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[60vh] overflow-y-auto pr-2"
    >
      {formSchema.map((field) => {
        // Detectar se é array de arquivos
        const isFileArray =
          field.type === "array" &&
          field.items?.type === "string" &&
          field.items?.format === "binary";

        const isSingleFile =
          field.type === "string" && field.format === "binary";

        return (
          <div key={field.name} className="grid w-full items-center gap-2">
            <Label htmlFor={field.name} className="text-gray-300">
              {field.title || formatLabel(field.name)}
              {field.required && <span className="text-red-400 ml-1">*</span>}
              {field.description && (
                <p className="text-xs text-gray-500 font-light mt-1">
                  {field.description}
                </p>
              )}
            </Label>
            {isFileArray ? (
              <div className="relative flex items-center justify-center w-full">
                <Label
                  htmlFor={`file-upload-${field.name}`}
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800/50 hover:bg-gray-800"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">
                        Clique para enviar múltiplos arquivos
                      </span>{" "}
                      ou arraste e solte
                    </p>
                    <p
                      className={`text-xs ${
                        formData[field.name] &&
                        Array.isArray(formData[field.name]) &&
                        formData[field.name].length > 0
                          ? "text-green-400"
                          : "text-gray-600"
                      }`}
                    >
                      {formData[field.name] &&
                      Array.isArray(formData[field.name]) &&
                      formData[field.name].length > 0
                        ? `${
                            formData[field.name].length
                          } arquivo(s) selecionado(s)`
                        : "Nenhum arquivo selecionado"}
                    </p>
                    {formData[field.name] &&
                      Array.isArray(formData[field.name]) &&
                      formData[field.name].length > 0 && (
                        <div className="mt-2 text-xs text-gray-400">
                          {formData[field.name].map(
                            (file: File, idx: number) => (
                              <div key={idx}>• {file.name}</div>
                            )
                          )}
                        </div>
                      )}
                  </div>
                  <input
                    id={`file-upload-${field.name}`}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) =>
                      handleMultipleFilesChange(field.name, e.target.files)
                    }
                  />
                </Label>
              </div>
            ) : isSingleFile ? (
              <div className="relative flex items-center justify-center w-full">
                <Label
                  htmlFor={`file-upload-${field.name}`}
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800/50 hover:bg-gray-800"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Clique para enviar</span>{" "}
                      ou arraste e solte
                    </p>
                    <p
                      className={`text-xs ${
                        formData[field.name]
                          ? "text-green-400"
                          : "text-gray-600"
                      }`}
                    >
                      {formData[field.name]
                        ? (formData[field.name] as File).name
                        : "Nenhum arquivo selecionado"}
                    </p>
                  </div>
                  <input
                    id={`file-upload-${field.name}`}
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(
                        field.name,
                        e.target.files ? e.target.files[0] : null
                      )
                    }
                  />
                </Label>
              </div>
            ) : field.type === "string" && field.widget === "textarea" ? (
              <>
                <Textarea
                  id={field.name}
                  value={formData[field.name] || ""}
                  onChange={(e) => {
                    handleInputChange(field.name, e.target.value);
                    if (errors[field.name]) {
                      setErrors(prev => ({ ...prev, [field.name]: '' }));
                    }
                  }}
                  className={`bg-gray-800 border-gray-600 text-white ${
                    errors[field.name] ? 'border-red-500' : ''
                  }`}
                  placeholder={field.description || ""}
                  required={field.required}
                />
                {errors[field.name] && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors[field.name]}
                  </p>
                )}
              </>
            ) : (
              <>
                <Input
                  id={field.name}
                  type={field.type === "number" ? "number" : "text"}
                  value={formData[field.name] || ""}
                  onChange={(e) => {
                    handleInputChange(field.name, e.target.value);
                    if (errors[field.name]) {
                      setErrors(prev => ({ ...prev, [field.name]: '' }));
                    }
                  }}
                  className={`bg-gray-800 border-gray-600 text-white ${
                    errors[field.name] ? 'border-red-500' : ''
                  }`}
                  placeholder={field.description || ""}
                  required={field.required}
                />
                {errors[field.name] && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors[field.name]}
                  </p>
                )}
              </>
            )}
          </div>
        );
      })}

      <div>
        <Label htmlFor="department-builder" className="text-gray-300">
          Departamento
        </Label>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger
            id="department-builder"
            className="bg-gray-800 border-gray-600 text-white"
          >
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-white border-gray-600">
            <SelectItem value="RH">Recursos Humanos</SelectItem>
            <SelectItem value="TI">Tecnologia</SelectItem>
            <SelectItem value="Financeiro">Financeiro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-300">
          Método de Entrega
        </Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div
            onClick={() => setDeliveryMethod("download")}
            className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors border ${
              deliveryMethod === "download"
                ? "bg-blue-600/20 border-blue-500 text-blue-300"
                : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <Download className="h-4 w-4" />
            <span className="text-sm">Download</span>
          </div>
          <div
            onClick={() => setDeliveryMethod("email")}
            className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors border ${
              deliveryMethod === "email"
                ? "bg-blue-600/20 border-blue-500 text-blue-300"
                : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <Mail className="h-4 w-4" />
            <span className="text-sm">Email</span>
          </div>
        </div>
      </div>

      {deliveryMethod === "email" && (
        <div>
          <Label htmlFor="email-builder" className="text-gray-300">
            Email para Envio
            <span className="text-red-400 ml-1">*</span>
          </Label>
          <Input
            id="email-builder"
            type="email"
            placeholder="exemplo@email.com"
            value={recipientEmail}
            onChange={(e) => {
              setRecipientEmail(e.target.value);
              if (errors['email']) {
                setErrors(prev => ({ ...prev, email: '' }));
              }
            }}
            className={`bg-gray-800 border-gray-600 text-white ${
              errors['email'] ? 'border-red-500' : ''
            }`}
            required
          />
          {errors['email'] && (
            <p className="text-xs text-red-400 mt-1">
              {errors['email']}
            </p>
          )}
        </div>
      )}

      <div>
        <Label className="text-sm font-medium text-gray-300">
          Formato do Relatório
        </Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div
            onClick={() => setOutputFormat("pdf")}
            className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-colors border ${
              outputFormat === "pdf"
                ? "bg-blue-600/20 border-blue-500 text-blue-300"
                : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <FileText className="h-5 w-5 mb-1" />
            <span className="text-xs">PDF</span>
          </div>
          <div
            onClick={() => setOutputFormat("docx")}
            className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-colors border ${
              outputFormat === "docx"
                ? "bg-blue-600/20 border-blue-500 text-blue-300"
                : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <FileText className="h-5 w-5 mb-1" />
            <span className="text-xs">DOCX</span>
          </div>
          <div
            onClick={() => setOutputFormat("excel")}
            className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-colors border ${
              outputFormat === "excel"
                ? "bg-blue-600/20 border-blue-500 text-blue-300"
                : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <FileSpreadsheet className="h-5 w-5 mb-1" />
            <span className="text-xs">Excel</span>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isExecuting}
        >
          {isExecuting ? "Executando..." : "Executar Agente"}
        </Button>
      </div>
    </form>
  );
}
