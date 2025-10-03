import { NextRequest, NextResponse } from 'next/server'
import { AgentExecution, ExecutionLog } from '@/types/agent'

// Simulated executions storage
let executions: AgentExecution[] = []

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { input } = body
    
    const executionId = `exec-${Date.now()}`
    
    // Create execution record
    const execution: AgentExecution = {
      id: executionId,
      agentId: params.id,
      status: 'running',
      input,
      startTime: new Date(),
      logs: [],
      cost: {
        total: 0,
        breakdown: []
      }
    }
    
    executions.push(execution)
    
    // Start async execution (simulate real processing)
    executeAgentAsync(executionId, params.id, input)
    
    return NextResponse.json(execution, { status: 201 })
  } catch (error) {
    console.error('Error starting agent execution:', error)
    return NextResponse.json(
      { error: 'Failed to start execution' },
      { status: 500 }
    )
  }
}

async function executeAgentAsync(executionId: string, agentId: string, input: any) {
  const execution = executions.find(e => e.id === executionId)
  if (!execution) return
  
  try {
    // Simulate processing steps
    const steps = [
      { step: 'input-validation', message: 'Validating input data' },
      { step: 'ai-processing', message: 'Processing with AI model' },
      { step: 'output-generation', message: 'Generating output' }
    ]
    
    for (const step of steps) {
      // Add log entry
      const log: ExecutionLog = {
        id: `log-${Date.now()}`,
        nodeId: step.step,
        timestamp: new Date(),
        level: 'info',
        message: step.message
      }
      execution.logs.push(log)
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Simulate AI call cost
    const aiCost = Math.random() * 0.05 // $0.00-$0.05
    execution.cost = {
      total: aiCost,
      breakdown: [{
        provider: 'openai',
        model: 'gpt-4',
        tokens: Math.floor(Math.random() * 1000) + 500,
        cost: aiCost
      }]
    }
    
    // Complete execution
    execution.status = 'completed'
    execution.endTime = new Date()
    execution.output = {
      result: 'Agent execution completed successfully',
      processed_data: input,
      confidence: 0.95,
      summary: 'The agent processed the input and generated the expected output.'
    }
    
    const finalLog: ExecutionLog = {
      id: `log-${Date.now()}`,
      nodeId: 'completion',
      timestamp: new Date(),
      level: 'info',
      message: `Execution completed successfully. Cost: $${aiCost.toFixed(4)}`
    }
    execution.logs.push(finalLog)
    
  } catch (error) {
    execution.status = 'failed'
    execution.error = error instanceof Error ? error.message : 'Unknown error'
    execution.endTime = new Date()
    
    const errorLog: ExecutionLog = {
      id: `log-${Date.now()}`,
      nodeId: 'error',
      timestamp: new Date(),
      level: 'error',
      message: `Execution failed: ${execution.error}`
    }
    execution.logs.push(errorLog)
  }
}
