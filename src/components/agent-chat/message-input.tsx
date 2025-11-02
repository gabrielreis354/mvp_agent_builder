'use client'

import { useState, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import { FileUpload } from './file-upload'

interface MessageInputProps {
  onSend: (message: string, fileContent?: string) => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({ onSend, disabled, placeholder }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [fileContent, setFileContent] = useState<string | undefined>()

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim(), fileContent)
      setMessage('')
      setFileContent(undefined)
    }
  }

  const handleFileSelect = (file: File, content: string) => {
    setFileContent(content)
    setMessage((prev) => 
      prev + `\n\n[Arquivo anexado: ${file.name}]\n`
    )
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-gray-700 bg-gray-800 p-4">
      <div className="flex gap-2">
        <FileUpload 
          onFileSelect={handleFileSelect}
          disabled={disabled}
        />
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Digite sua mensagem... (Enter para enviar)'}
          disabled={disabled}
          className="min-h-[60px] max-h-[200px] resize-none bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
          rows={2}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="self-end"
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        📎 Anexe PDF, DOC ou TXT • Enter para enviar • Shift+Enter para nova linha
      </p>
    </div>
  )
}
