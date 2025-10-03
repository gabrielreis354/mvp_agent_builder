export interface ConnectorConfig {
  [key: string]: any
}

export interface ConnectorResult {
  success: boolean
  data?: any
  error?: string
  metadata?: {
    duration: number
    timestamp: string
    [key: string]: any
  }
}

export abstract class BaseConnector {
  abstract name: string
  abstract description: string
  abstract configSchema: any

  abstract execute(config: ConnectorConfig, input: any): Promise<ConnectorResult>
  abstract validate(config: ConnectorConfig): boolean
  abstract test(config: ConnectorConfig): Promise<boolean>

  protected createResult(success: boolean, data?: any, error?: string): ConnectorResult {
    return {
      success,
      data,
      error,
      metadata: {
        duration: 0,
        timestamp: new Date().toISOString()
      }
    }
  }
}

export class ConnectorRegistry {
  private connectors: Map<string, BaseConnector> = new Map()

  register(connector: BaseConnector) {
    this.connectors.set(connector.name, connector)
  }

  get(name: string): BaseConnector | undefined {
    return this.connectors.get(name)
  }

  list(): string[] {
    return Array.from(this.connectors.keys())
  }

  async execute(name: string, config: ConnectorConfig, input: any): Promise<ConnectorResult> {
    const connector = this.get(name)
    if (!connector) {
      return {
        success: false,
        error: `Connector '${name}' not found`,
        metadata: {
          duration: 0,
          timestamp: new Date().toISOString()
        }
      }
    }

    const startTime = Date.now()
    try {
      const result = await connector.execute(config, input)
      result.metadata = {
        ...result.metadata,
        duration: Date.now() - startTime,
        timestamp: result.metadata?.timestamp || new Date().toISOString()
      }
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      }
    }
  }
}

export const connectorRegistry = new ConnectorRegistry()
