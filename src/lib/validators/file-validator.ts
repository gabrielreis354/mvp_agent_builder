/**
 * 🔐 VALIDADOR DE ARQUIVOS
 * 
 * Garante que apenas arquivos válidos e seguros sejam processados.
 * 
 * Validações:
 * 1. Tamanho máximo (10MB padrão)
 * 2. Tipos MIME permitidos
 * 3. Extensões válidas
 * 4. Verificação de conteúdo (magic bytes)
 */

export interface FileValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
  fileInfo?: {
    name: string
    size: number
    type: string
    extension: string
  }
}

// 📏 TAMANHOS MÁXIMOS POR TIPO
export const MAX_FILE_SIZES = {
  pdf: 10 * 1024 * 1024,      // 10MB
  docx: 10 * 1024 * 1024,     // 10MB
  doc: 10 * 1024 * 1024,      // 10MB
  xlsx: 5 * 1024 * 1024,      // 5MB
  xls: 5 * 1024 * 1024,       // 5MB
  txt: 1 * 1024 * 1024,       // 1MB
  csv: 5 * 1024 * 1024,       // 5MB
  image: 5 * 1024 * 1024,     // 5MB (jpg, png, etc.)
  default: 10 * 1024 * 1024   // 10MB
}

// ✅ TIPOS MIME PERMITIDOS
export const ALLOWED_MIME_TYPES = [
  // PDFs
  'application/pdf',
  
  // Word
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  
  // Excel
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  
  // Texto
  'text/plain',
  'text/csv',
  
  // Imagens (para OCR)
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/tiff'
]

// 📎 EXTENSÕES PERMITIDAS
export const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc', '.docx',
  '.xls', '.xlsx',
  '.txt', '.csv',
  '.jpg', '.jpeg', '.png', '.webp', '.tiff'
]

// 🔍 MAGIC BYTES (primeiros bytes do arquivo para verificar tipo real)
const MAGIC_BYTES: Record<string, number[]> = {
  pdf: [0x25, 0x50, 0x44, 0x46],                    // %PDF
  docx: [0x50, 0x4B, 0x03, 0x04],                   // PK.. (ZIP)
  xlsx: [0x50, 0x4B, 0x03, 0x04],                   // PK.. (ZIP)
  jpg: [0xFF, 0xD8, 0xFF],                          // JPEG
  png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG
}

/**
 * Valida arquivo completo (tamanho, tipo, extensão, magic bytes)
 */
export async function validateFile(file: File): Promise<FileValidationResult> {
  const warnings: string[] = []
  
  // 1. Validar nome do arquivo
  if (!file.name || file.name.trim() === '') {
    return {
      isValid: false,
      error: 'Nome do arquivo inválido'
    }
  }
  
  // 2. Extrair extensão
  const extension = getFileExtension(file.name)
  if (!extension) {
    return {
      isValid: false,
      error: 'Arquivo sem extensão'
    }
  }
  
  // 3. Verificar se extensão é permitida
  if (!ALLOWED_EXTENSIONS.includes(extension.toLowerCase())) {
    return {
      isValid: false,
      error: `Tipo de arquivo não permitido: ${extension}`,
      warnings: [
        `Extensões permitidas: ${ALLOWED_EXTENSIONS.join(', ')}`
      ]
    }
  }
  
  // 4. Verificar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    // Alguns navegadores não definem type corretamente, então apenas warning
    warnings.push(`Tipo MIME não reconhecido: ${file.type}. Validando por extensão.`)
  }
  
  // 5. Verificar tamanho
  const maxSize = getMaxFileSize(extension)
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Arquivo muito grande: ${formatFileSize(file.size)}. Máximo permitido: ${formatFileSize(maxSize)}`
    }
  }
  
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'Arquivo vazio'
    }
  }
  
  // 6. Verificar magic bytes (primeiros bytes do arquivo)
  try {
    const isValidContent = await verifyMagicBytes(file, extension)
    if (!isValidContent) {
      warnings.push('Conteúdo do arquivo não corresponde à extensão. Pode estar corrompido.')
    }
  } catch (error) {
    console.warn('🔍 [FileValidator] Erro ao verificar magic bytes:', error)
    warnings.push('Não foi possível verificar integridade do arquivo')
  }
  
  // ✅ Arquivo válido
  console.log(`✅ [FileValidator] Arquivo válido: ${file.name} (${formatFileSize(file.size)})`)
  
  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      extension
    }
  }
}

/**
 * Validação rápida (sem magic bytes)
 */
export function validateFileQuick(file: File): FileValidationResult {
  const extension = getFileExtension(file.name)
  
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension.toLowerCase())) {
    return {
      isValid: false,
      error: `Tipo de arquivo não permitido: ${extension || 'desconhecido'}`
    }
  }
  
  const maxSize = getMaxFileSize(extension)
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Arquivo muito grande: ${formatFileSize(file.size)}. Máximo: ${formatFileSize(maxSize)}`
    }
  }
  
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'Arquivo vazio'
    }
  }
  
  return {
    isValid: true,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      extension
    }
  }
}

/**
 * Extrai extensão do arquivo
 */
function getFileExtension(filename: string): string | null {
  const match = filename.match(/\.[^.]+$/)
  return match ? match[0].toLowerCase() : null
}

/**
 * Retorna tamanho máximo permitido para o tipo de arquivo
 */
function getMaxFileSize(extension: string): number {
  const ext = extension.toLowerCase().replace('.', '')
  
  if (ext === 'pdf') return MAX_FILE_SIZES.pdf
  if (ext === 'doc' || ext === 'docx') return MAX_FILE_SIZES.docx
  if (ext === 'xls' || ext === 'xlsx') return MAX_FILE_SIZES.xlsx
  if (ext === 'txt') return MAX_FILE_SIZES.txt
  if (ext === 'csv') return MAX_FILE_SIZES.csv
  if (['jpg', 'jpeg', 'png', 'webp', 'tiff'].includes(ext)) return MAX_FILE_SIZES.image
  
  return MAX_FILE_SIZES.default
}

/**
 * Formata tamanho de arquivo para exibição
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Verifica magic bytes do arquivo
 */
async function verifyMagicBytes(file: File, extension: string): Promise<boolean> {
  const ext = extension.toLowerCase().replace('.', '')
  const expectedBytes = MAGIC_BYTES[ext]
  
  if (!expectedBytes) {
    // Se não temos magic bytes definidos para este tipo, aceitar
    return true
  }
  
  // Ler primeiros bytes do arquivo
  const buffer = await file.slice(0, 16).arrayBuffer()
  const bytes = new Uint8Array(buffer)
  
  // Comparar com magic bytes esperados
  for (let i = 0; i < expectedBytes.length; i++) {
    if (bytes[i] !== expectedBytes[i]) {
      console.warn(`🔍 [FileValidator] Magic bytes não correspondem. Esperado: ${expectedBytes}, Recebido: ${Array.from(bytes.slice(0, expectedBytes.length))}`)
      return false
    }
  }
  
  return true
}

/**
 * Valida múltiplos arquivos
 */
export async function validateFiles(files: File[]): Promise<{
  valid: File[]
  invalid: Array<{ file: File; error: string }>
}> {
  const valid: File[] = []
  const invalid: Array<{ file: File; error: string }> = []
  
  for (const file of files) {
    const result = await validateFile(file)
    
    if (result.isValid) {
      valid.push(file)
    } else {
      invalid.push({
        file,
        error: result.error || 'Arquivo inválido'
      })
    }
  }
  
  return { valid, invalid }
}

/**
 * Verifica se arquivo é PDF
 */
export function isPDF(file: File): boolean {
  const extension = getFileExtension(file.name)
  return extension === '.pdf' || file.type === 'application/pdf'
}

/**
 * Verifica se arquivo é imagem
 */
export function isImage(file: File): boolean {
  const extension = getFileExtension(file.name)
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.tiff']
  return extension ? imageExtensions.includes(extension) : false
}

/**
 * Verifica se arquivo é documento Word
 */
export function isWord(file: File): boolean {
  const extension = getFileExtension(file.name)
  return extension === '.doc' || extension === '.docx'
}

/**
 * Verifica se arquivo é planilha Excel
 */
export function isExcel(file: File): boolean {
  const extension = getFileExtension(file.name)
  return extension === '.xls' || extension === '.xlsx'
}
