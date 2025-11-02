'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, FileText, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File, content: string) => void
  disabled?: boolean
}

export function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]

    if (!validTypes.includes(file.type)) {
      alert('Tipo de arquivo não suportado. Use PDF, DOC, DOCX ou TXT.')
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 5MB.')
      return
    }

    setSelectedFile(file)
    setIsProcessing(true)

    try {
      // Ler conteúdo do arquivo
      const content = await readFileContent(file)
      onFileSelect(file, content)
    } catch (error) {
      console.error('Erro ao ler arquivo:', error)
      alert('Erro ao processar arquivo. Tente novamente.')
      setSelectedFile(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const content = e.target?.result as string
        resolve(content)
      }

      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'))
      }

      // Para PDF, precisaríamos de uma biblioteca como pdf-parse
      // Por enquanto, apenas texto
      if (file.type === 'text/plain') {
        reader.readAsText(file)
      } else {
        // Para PDF/DOC, enviar como base64 e processar no backend
        reader.readAsDataURL(file)
      }
    })
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
        disabled={disabled || isProcessing}
        className="hidden"
      />

      {selectedFile ? (
        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
          <FileText className="h-4 w-4 text-blue-400" />
          <span className="text-sm text-gray-300 truncate max-w-[150px]">
            {selectedFile.name}
          </span>
          <button
            onClick={handleRemoveFile}
            disabled={disabled}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Button
          onClick={handleButtonClick}
          disabled={disabled || isProcessing}
          variant="outline"
          size="icon"
          className="flex-shrink-0"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  )
}
