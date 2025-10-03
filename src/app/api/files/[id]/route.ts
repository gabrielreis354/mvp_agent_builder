import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-config'
import { getRedisClient } from '@/lib/redis'

interface FileData {
  uploadedBy: string
  content: string
  type: string
  size: number
  originalName: string
  [key: string]: any
}

// Helper function for safe JSON parsing
function safeJsonParse<T = any>(str: string | null | undefined, fallback: T): T {
  if (!str || typeof str !== 'string') return fallback
  try {
    return JSON.parse(str)
  } catch (error) {
    console.warn('JSON parse error:', error)
    return fallback
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const fileId = params.id
    const redis = getRedisClient()
    
    // Buscar arquivo no Redis
    const fileKey = `file:${fileId}`
    const fileDataStr = await redis.get(fileKey)
    
    if (!fileDataStr) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado ou expirado' },
        { status: 404 }
      )
    }

    const fileData = safeJsonParse<FileData>(fileDataStr, {} as FileData)
    
    // Verificar se o usuário tem permissão para acessar o arquivo
    if (fileData.uploadedBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Converter base64 de volta para buffer
    const buffer = Buffer.from(fileData.content, 'base64')
    
    // Retornar arquivo com headers apropriados
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': fileData.type,
        'Content-Length': fileData.size.toString(),
        'Content-Disposition': `attachment; filename="${fileData.originalName}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    })

  } catch (error) {
    console.error('Erro ao acessar arquivo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// API para obter metadados do arquivo (sem o conteúdo)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const fileId = params.id
    const redis = getRedisClient()
    
    const fileKey = `file:${fileId}`
    const fileDataStr = await redis.get(fileKey)
    
    if (!fileDataStr) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      )
    }

    const fileData = safeJsonParse<FileData>(fileDataStr, {} as FileData)
    
    if (fileData.uploadedBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Retornar apenas metadados (sem o conteúdo base64)
    const { content, ...metadata } = fileData
    
    return NextResponse.json({
      success: true,
      file: metadata
    })

  } catch (error) {
    console.error('Erro ao buscar metadados do arquivo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
