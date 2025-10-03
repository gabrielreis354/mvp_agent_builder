import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-config'
import { getRedisClient } from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de arquivo não suportado. Use PDF, DOC, DOCX ou TXT.' 
      }, { status: 400 })
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 10MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Gerar ID único para o arquivo
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')

    // Salvar arquivo no Redis (em base64) e metadados no banco
    const redis = getRedisClient()
    
    const fileData = {
      id: fileId,
      originalName: file.name,
      fileName,
      size: file.size,
      type: file.type,
      uploadedBy: session.user.id,
      uploadedAt: new Date().toISOString(),
      content: buffer.toString('base64'), // Arquivo em base64
      status: 'uploaded'
    }

    // Salvar no Redis com TTL de 24 horas
    const fileKey = `file:${fileId}`
    await redis.setex(fileKey, 24 * 60 * 60, JSON.stringify(fileData))

    // Adicionar à lista de arquivos do usuário
    const userFilesKey = `user:${session.user.id}:files`
    await redis.lpush(userFilesKey, fileId)
    await redis.expire(userFilesKey, 24 * 60 * 60)

    console.log(`📁 Arquivo ${fileName} salvo no banco para usuário ${session.user.id}`)

    // Retornar informações do arquivo (sem o conteúdo base64)
    return NextResponse.json({
      success: true,
      fileId,
      fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: fileData.uploadedAt,
      url: `/api/files/${fileId}` // URL para acessar o arquivo
    })

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
