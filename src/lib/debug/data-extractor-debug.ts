/**
 * Utilitário de debug para diagnosticar problemas de extração de dados
 */

export interface DataExtractionDebug {
  success: boolean
  extractedText?: string
  aiResponse?: string
  fileName?: string
  tokensUsed?: number
  confidence?: number
  method?: string
  paths: {
    [key: string]: boolean
  }
  rawData: any
}

export function diagnoseDataExtraction(data: any): DataExtractionDebug {
  // Múltiplas tentativas para encontrar finalResult
  const finalResult = data?.finalResult || data?.content?.finalResult || data?.content || data
  
  // CORREÇÃO CRÍTICA: Se finalResult é uma string HTML, tratar como aiResponse
  if (typeof finalResult === 'string' && (finalResult.includes('<!DOCTYPE html>') || finalResult.includes('<html'))) {
    console.log('🔍 [DEBUG] finalResult is HTML string, treating as aiResponse')
    return {
      success: true,
      aiResponse: finalResult,
      fileName: data?.fileName || 'HTML Document',
      tokensUsed: 0,
      confidence: 1.0,
      method: 'html-direct',
      paths: { 'finalResult (HTML string)': true },
      rawData: { finalResultType: 'html-string', length: finalResult.length }
    }
  }
  
  // Testar todos os caminhos possíveis - incluindo mais variações
  const paths = {
    // Direct paths
    'data.extractedText': !!data?.extractedText,
    'data.response': !!data?.response,
    'content.extractedText': !!data?.content?.extractedText,  
    'content.response': !!data?.content?.response,
    'finalResult.extractedText': !!finalResult?.extractedText,
    'finalResult.response': !!finalResult?.response,
    
    // CRITICAL: Double nested paths (where the data actually is!)
    'finalResult.finalResult.extractedText': !!finalResult?.finalResult?.extractedText,
    'finalResult.finalResult.response': !!finalResult?.finalResult?.response,
    'finalResult.finalResult.userInput.extractedText': !!finalResult?.finalResult?.userInput?.extractedText,
    'finalResult.finalResult.aiResponse': !!finalResult?.finalResult?.aiResponse,
    
    // Standard nested paths
    'finalResult.output.extractedText': !!finalResult?.output?.extractedText,
    'finalResult.output.response': !!finalResult?.output?.response,
    'finalResult.userInput.extractedText': !!finalResult?.userInput?.extractedText,
    'finalResult.processedFile.extractedText': !!finalResult?.processedFile?.extractedText,
    'finalResult.aiResponse': !!finalResult?.aiResponse,
    
    // File names
    'data.fileName': !!data?.fileName,
    'content.fileName': !!data?.content?.fileName,
    'finalResult.fileName': !!finalResult?.fileName,
    'finalResult.processedFile.originalName': !!finalResult?.processedFile?.originalName,
    'finalResult.userInput.processedFile.originalName': !!finalResult?.userInput?.processedFile?.originalName,
    'finalResult.input': !!finalResult?.input,
    
    // Tokens
    'finalResult.tokens_used': !!finalResult?.tokens_used,
    'finalResult.output.tokens_used': !!finalResult?.output?.tokens_used,
    'finalResult.tokensUsed': !!finalResult?.tokensUsed
  }
  
  // Extrair dados usando múltiplas tentativas - incluindo paths aninhados duplos!
  const extractedText = data?.extractedText ||
                       data?.content?.extractedText ||
                       finalResult?.extractedText || 
                       finalResult?.finalResult?.extractedText ||        // ← NOVO PATH CRÍTICO!
                       finalResult?.output?.extractedText || 
                       finalResult?.userInput?.extractedText ||
                       finalResult?.processedFile?.extractedText ||
                       finalResult?.finalResult?.userInput?.extractedText ||  // ← NOVO PATH!
                       ''
  
  const aiResponse = data?.response ||
                    data?.content?.response ||
                    finalResult?.response || 
                    finalResult?.finalResult?.response ||               // ← NOVO PATH CRÍTICO!
                    finalResult?.output?.response || 
                    finalResult?.aiResponse ||
                    finalResult?.finalResult?.aiResponse ||             // ← NOVO PATH!
                    ''
  
  const fileName = data?.fileName ||
                  data?.content?.fileName ||
                  finalResult?.fileName || 
                  finalResult?.finalResult?.input ||                           // ← NOVO PATH CRÍTICO!
                  finalResult?.finalResult?.fileName ||                       // ← NOVO PATH!
                  finalResult?.processedFile?.originalName || 
                  finalResult?.userInput?.processedFile?.originalName ||
                  finalResult?.finalResult?.userInput?.processedFile?.originalName || // ← NOVO PATH!
                  finalResult?.input ||
                  'Unknown'
  
  const tokensUsed = finalResult?.tokens_used || 
                    finalResult?.output?.tokens_used || 
                    finalResult?.tokensUsed ||
                    0
  
  const confidence = finalResult?.processedFile?.metadata?.ocrConfidence ||
                    finalResult?.userInput?.processedFile?.metadata?.ocrConfidence ||
                    finalResult?.extractedData?.confidence ||
                    finalResult?.fileMetadata?.ocrConfidence ||
                    0
  
  const method = finalResult?.processedFile?.metadata?.method ||
                finalResult?.userInput?.processedFile?.metadata?.method ||
                finalResult?.extractedData?.method ||
                finalResult?.fileMetadata?.method ||
                'unknown'
  
  const success = !!(extractedText || aiResponse)
  
  return {
    success,
    extractedText: extractedText || undefined,
    aiResponse: aiResponse || undefined,
    fileName,
    tokensUsed,
    confidence,
    method,
    paths,
    rawData: {
      dataKeys: data ? Object.keys(data) : [],
      finalResultKeys: finalResult ? Object.keys(finalResult) : [],
      userInputKeys: finalResult?.userInput ? Object.keys(finalResult.userInput) : [],
      processedFileKeys: finalResult?.processedFile ? Object.keys(finalResult.processedFile) : []
    }
  }
}

export function logDataExtractionDebug(data: any, context: string = 'Unknown'): DataExtractionDebug {
  const debug = diagnoseDataExtraction(data)
  
  console.log(`🔍 [${context}] Data Extraction Debug:`)
  console.log('📊 Success:', debug.success)
  console.log('📄 Extracted Text Length:', debug.extractedText?.length || 0)
  console.log('🤖 AI Response Length:', debug.aiResponse?.length || 0)
  console.log('📁 File Name:', debug.fileName)
  console.log('🎯 Tokens Used:', debug.tokensUsed)
  console.log('✅ Confidence:', debug.confidence)
  console.log('🔧 Method:', debug.method)
  
  console.log('🛤️ Available Paths:')
  Object.entries(debug.paths).forEach(([path, available]) => {
    console.log(`  ${available ? '✅' : '❌'} ${path}`)
  })
  
  console.log('📋 Raw Data Structure:')
  console.log('  Data Keys:', debug.rawData.dataKeys)
  console.log('  Final Result Keys:', debug.rawData.finalResultKeys)
  console.log('  User Input Keys:', debug.rawData.userInputKeys)
  console.log('  Processed File Keys:', debug.rawData.processedFileKeys)
  
  if (!debug.success) {
    console.error('❌ Data extraction failed! Available data:')
    console.error(JSON.stringify(data, null, 2).substring(0, 2000) + '...')
  }
  
  return debug
}

export function createDataReport(debug: DataExtractionDebug): string {
  return `
# 📊 Data Extraction Report

**Status:** ${debug.success ? '✅ Success' : '❌ Failed'}
**File:** ${debug.fileName}
**Method:** ${debug.method}
**Confidence:** ${((debug.confidence || 0) * 100).toFixed(1)}%
**Tokens:** ${debug.tokensUsed}

## Content Summary
- **Extracted Text:** ${debug.extractedText?.length || 0} characters
- **AI Response:** ${debug.aiResponse?.length || 0} characters

## Available Data Paths
${Object.entries(debug.paths)
  .map(([path, available]) => `- ${available ? '✅' : '❌'} ${path}`)
  .join('\n')}

## Raw Structure
- **Data Keys:** ${debug.rawData.dataKeys.join(', ')}
- **Final Result Keys:** ${debug.rawData.finalResultKeys.join(', ')}
- **User Input Keys:** ${debug.rawData.userInputKeys.join(', ')}
- **Processed File Keys:** ${debug.rawData.processedFileKeys.join(', ')}
  `.trim()
}
