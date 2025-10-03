/**
 * Utilitário para JSON.parse seguro
 */

export function safeJsonParse<T = any>(str: string | null | undefined, fallback: T = null as T): T {
  if (!str || typeof str !== 'string') {
    return fallback
  }
  
  try {
    return JSON.parse(str)
  } catch (error) {
    console.warn('JSON parse error:', error)
    return fallback
  }
}

export function safeJsonStringify(obj: any, fallback = '{}'): string {
  try {
    return JSON.stringify(obj)
  } catch (error) {
    console.warn('JSON stringify error:', error)
    return fallback
  }
}
