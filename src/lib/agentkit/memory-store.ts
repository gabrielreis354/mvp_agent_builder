/**
 * MemoryStore - Armazenamento de Memória de Longo Prazo
 * 
 * Usa Pinecone para armazenar e buscar memórias de conversas anteriores
 * permitindo que agentes tenham contexto histórico.
 */

import { Pinecone } from '@pinecone-database/pinecone'
import { MemorySearchResult } from './types'

export class MemoryStore {
  private pinecone: Pinecone | null = null
  private indexName: string
  private enabled: boolean

  constructor() {
    this.indexName = process.env.PINECONE_INDEX_NAME || 'simplifiqueia-memory'
    this.enabled = process.env.ENABLE_MEMORY_STORE === 'true'

    // Inicializar Pinecone apenas se habilitado
    if (this.enabled && process.env.PINECONE_API_KEY) {
      try {
        this.pinecone = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY,
        })
      } catch (error) {
        console.error('[MemoryStore] Erro ao inicializar Pinecone:', error)
        this.enabled = false
      }
    }
  }

  /**
   * Verifica se o memory store está habilitado
   */
  isEnabled(): boolean {
    return this.enabled && this.pinecone !== null
  }

  /**
   * Armazena uma mensagem no vector store para busca semântica
   */
  async storeMessage(
    threadId: string,
    messageId: string,
    content: string,
    metadata: Record<string, any>
  ): Promise<void> {
    if (!this.isEnabled()) {
      console.log('[MemoryStore] Desabilitado, pulando armazenamento')
      return
    }

    try {
      const index = this.pinecone!.index(this.indexName)
      
      // Gerar embedding usando OpenAI
      const embedding = await this.generateEmbedding(content)
      
      await index.upsert([
        {
          id: messageId,
          values: embedding,
          metadata: {
            threadId,
            content: content.substring(0, 1000), // Limitar tamanho
            timestamp: Date.now(),
            ...metadata,
          },
        },
      ])

      console.log('[MemoryStore] Mensagem armazenada:', messageId)
    } catch (error) {
      console.error('[MemoryStore] Erro ao armazenar mensagem:', error)
      // Não lançar erro para não quebrar o fluxo principal
    }
  }

  /**
   * Busca mensagens relevantes de threads anteriores
   */
  async searchRelevantMemories(
    query: string,
    userId: string,
    limit: number = 5
  ): Promise<MemorySearchResult[]> {
    if (!this.isEnabled()) {
      console.log('[MemoryStore] Desabilitado, retornando array vazio')
      return []
    }

    try {
      const index = this.pinecone!.index(this.indexName)
      const queryEmbedding = await this.generateEmbedding(query)

      const results = await index.query({
        vector: queryEmbedding,
        topK: limit,
        filter: { userId },
        includeMetadata: true,
      })

      return results.matches.map((match) => ({
        content: match.metadata?.content as string,
        metadata: match.metadata as Record<string, any>,
        score: match.score,
      }))
    } catch (error) {
      console.error('[MemoryStore] Erro ao buscar memórias:', error)
      return []
    }
  }

  /**
   * Gera embedding usando OpenAI
   * NOTA: text-embedding-3-small gera vetores de 1536 dimensões
   * Certifique-se que seu índice Pinecone está configurado para 1536 dimensões
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small', // 1536 dimensões
        input: text.substring(0, 8000), // Limitar tamanho do input
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const embedding = data.data[0].embedding
    
    console.log(`[MemoryStore] Embedding gerado: ${embedding.length} dimensões`)
    return embedding
  }

  /**
   * Limpa memórias antigas (LGPD compliance)
   */
  async cleanOldMemories(daysOld: number = 90): Promise<number> {
    if (!this.isEnabled()) {
      return 0
    }

    try {
      const cutoffDate = Date.now() - daysOld * 24 * 60 * 60 * 1000
      const index = this.pinecone!.index(this.indexName)

      // Buscar IDs antigos
      // Nota: Pinecone não tem delete by filter direto
      // Esta é uma implementação simplificada
      // Em produção, considere usar um job separado

      console.log(`[MemoryStore] Limpeza de memórias antigas (>${daysOld} dias)`)
      
      // TODO: Implementar lógica de limpeza completa
      // Por enquanto, apenas log
      
      return 0
    } catch (error) {
      console.error('[MemoryStore] Erro ao limpar memórias:', error)
      return 0
    }
  }

  /**
   * Deleta todas as memórias de um usuário (LGPD - direito ao esquecimento)
   */
  async deleteUserMemories(userId: string): Promise<void> {
    if (!this.isEnabled()) {
      return
    }

    try {
      const index = this.pinecone!.index(this.indexName)
      
      // Buscar todos os IDs do usuário
      const results = await index.query({
        vector: new Array(1536).fill(0), // Vector dummy
        topK: 10000,
        filter: { userId },
        includeMetadata: false,
      })

      const ids = results.matches.map((match) => match.id)
      
      if (ids.length > 0) {
        await index.deleteMany(ids)
        console.log(`[MemoryStore] Deletadas ${ids.length} memórias do usuário ${userId}`)
      }
    } catch (error) {
      console.error('[MemoryStore] Erro ao deletar memórias do usuário:', error)
      throw error // Lançar erro pois é operação crítica (LGPD)
    }
  }

  /**
   * Estatísticas do memory store
   */
  async getStats(): Promise<{
    enabled: boolean
    indexName: string
    totalVectors?: number
  }> {
    if (!this.isEnabled()) {
      return {
        enabled: false,
        indexName: this.indexName,
      }
    }

    try {
      const index = this.pinecone!.index(this.indexName)
      const stats = await index.describeIndexStats()

      return {
        enabled: true,
        indexName: this.indexName,
        totalVectors: stats.totalRecordCount,
      }
    } catch (error) {
      console.error('[MemoryStore] Erro ao obter estatísticas:', error)
      return {
        enabled: true,
        indexName: this.indexName,
      }
    }
  }
}
