"""
Backend simples para MVP Agent Builder
Baseado no app_simple.py do projeto original, adaptado para integração
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import Any, Dict, Optional
import uvicorn
import json

app = FastAPI(
    title="AutomateAI Backend - MVP Agent Builder",
    version="1.0.0",
    description="Backend simples para integração com MVP Agent Builder"
)

# Configurar CORS para permitir conexões do frontend Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic
class AgentExecutionRequest(BaseModel):
    agent: Dict[str, Any]
    input: Dict[str, Any]
    userId: Optional[str] = "anonymous"

class LLMCallRequest(BaseModel):
    provider: str
    model: str
    prompt: str
    temperature: float = 0.3
    maxTokens: int = 2000

@app.get("/")
async def root():
    """Página inicial do backend"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>AutomateAI Backend - MVP Agent Builder</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 40px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                min-height: 100vh;
            }
            .container { 
                max-width: 800px; 
                margin: 0 auto; 
                background: white; 
                padding: 40px; 
                border-radius: 15px; 
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { 
                font-size: 2.5em; 
                background: linear-gradient(45deg, #2563eb, #7c3aed);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-weight: bold; 
                margin-bottom: 10px;
            }
            .status { 
                background: linear-gradient(45deg, #10b981, #059669); 
                color: white; 
                padding: 20px; 
                border-radius: 10px; 
                margin: 30px 0; 
                text-align: center;
                font-size: 1.1em;
            }
            .endpoints {
                background: #f8fafc;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            }
            .endpoint {
                background: white;
                padding: 15px;
                margin: 10px 0;
                border-left: 4px solid #2563eb;
                border-radius: 0 8px 8px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🚀 AutomateAI Backend</div>
                <p>Backend simples para MVP Agent Builder</p>
            </div>
            
            <div class="status">
                ✅ Backend rodando na porta 8000 - Pronto para integração!
            </div>
            
            <div class="endpoints">
                <h3>🔗 Endpoints Disponíveis:</h3>
                <div class="endpoint">
                    <strong>GET /health</strong> - Health check do sistema
                </div>
                <div class="endpoint">
                    <strong>POST /api/agents/execute</strong> - Executar agentes
                </div>
                <div class="endpoint">
                    <strong>POST /api/llm/call</strong> - Chamadas para LLMs
                </div>
                <div class="endpoint">
                    <strong>GET /docs</strong> - Documentação interativa da API
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #666;">
                <p>Integrado com MVP Agent Builder (porta 3002)</p>
                <p>CORS configurado para desenvolvimento</p>
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "message": "AutomateAI Backend is running!",
        "service": "mvp-agent-builder-backend",
        "cors_enabled": True,
        "frontend_ports": ["3002", "3000"]
    }

@app.post("/api/agents/execute")
async def execute_agent(request: AgentExecutionRequest):
    """
    Endpoint para executar agentes - compatível com o MVP Agent Builder
    """
    try:
        agent = request.agent
        input_data = request.input
        user_id = request.userId
        
        # Simular execução do agente com resposta realista
        execution_id = f"exec_{hash(str(agent.get('id', 'unknown')))}"
        
        # Gerar resposta baseada no tipo de agente
        if "contrato" in str(agent).lower() or "rh" in str(agent).lower():
            # Resposta para agentes de RH/Contratos
            output = {
                "relatorio_html": generate_contract_analysis_html(),
                "status": "success",
                "dados_processados": input_data,
                "timestamp": "2025-01-15T17:20:00Z"
            }
        else:
            # Resposta genérica
            output = {
                "resultado": "Agente executado com sucesso",
                "input_processado": input_data,
                "agente": agent.get("name", "Agente Desconhecido"),
                "timestamp": "2025-01-15T17:20:00Z"
            }
        
        return {
            "executionId": execution_id,
            "success": True,
            "output": output,
            "executionTime": 2500,
            "nodeResults": {},
            "agent": {
                "id": agent.get("id", "unknown"),
                "name": agent.get("name", "Agente"),
                "category": agent.get("category", "geral")
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na execução do agente: {str(e)}")

@app.post("/api/llm/call")
async def llm_call(request: LLMCallRequest):
    """
    Endpoint para chamadas de LLM - compatível com o runtime engine
    """
    try:
        provider = request.provider
        model = request.model
        prompt = request.prompt
        
        # Simular resposta de LLM baseada no prompt
        if "contrato" in prompt.lower() and "analis" in prompt.lower():
            response_content = generate_contract_analysis_response()
        elif "relatório" in prompt.lower() or "html" in prompt.lower():
            response_content = generate_contract_analysis_html()
        else:
            response_content = f"Resposta simulada do {provider}/{model} para: {prompt[:100]}..."
        
        return {
            "response": response_content,
            "content": response_content,
            "confidence": 0.95,
            "tokens_used": len(prompt.split()) * 2,
            "provider": provider,
            "model": model
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na chamada LLM: {str(e)}")

def generate_contract_analysis_response():
    """Gera resposta estruturada para análise de contratos"""
    return {
        "dados_funcionario": {
            "nome_completo": "Maria Silva Santos",
            "cpf": "123.456.789-00",
            "cargo": "Analista de Sistemas Pleno",
            "salario_mensal": "R$ 8.500,00"
        },
        "dados_empresa": {
            "razao_social": "TechSolutions Ltda.",
            "cnpj": "12.345.678/0001-90"
        },
        "analise_conformidade": {
            "status": "conforme_com_ressalvas",
            "irregularidades": [
                {"item": "CEP incompleto", "gravidade": "baixa"},
                {"item": "Cláusula de não concorrência genérica", "gravidade": "média"}
            ],
            "pontos_positivos": [
                "Período de experiência dentro do limite legal",
                "Jornada conforme CLT",
                "Benefícios adequados"
            ]
        }
    }

def generate_contract_analysis_html():
    """Gera relatório HTML profissional para análise de contratos"""
    return """<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Executivo - Análise Contratual</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 30px;
            background-color: #fff;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #2c3e50;
            font-size: 2.2em;
            margin-bottom: 10px;
            font-weight: 600;
        }
        .summary-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        .info-card {
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .status-positive { color: #27ae60; font-weight: 600; }
        .status-warning { color: #f39c12; font-weight: 600; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Relatório Executivo - Análise Contratual</h1>
        <p>Análise de Conformidade Legal e Recomendações</p>
    </div>
    
    <div class="summary-box">
        <h3>🎯 Resumo Executivo</h3>
        <p>O contrato analisado apresenta estrutura adequada e está em conformidade com as principais disposições da CLT. Identificadas algumas irregularidades menores que requerem atenção.</p>
    </div>
    
    <div class="info-grid">
        <div class="info-card">
            <h4>👤 Dados do Funcionário</h4>
            <p><strong>Nome:</strong> Maria Silva Santos</p>
            <p><strong>CPF:</strong> 123.456.789-00</p>
            <p><strong>Cargo:</strong> Analista de Sistemas Pleno</p>
            <p><strong>Salário:</strong> R$ 8.500,00</p>
        </div>
        
        <div class="info-card">
            <h4>🏢 Dados da Empresa</h4>
            <p><strong>Razão Social:</strong> TechSolutions Ltda.</p>
            <p><strong>CNPJ:</strong> 12.345.678/0001-90</p>
        </div>
        
        <div class="info-card">
            <h4>⚖️ Status de Conformidade</h4>
            <p><span class="status-positive">✅ Conforme com ressalvas</span></p>
            <p><strong>Irregularidades:</strong> 2 identificadas</p>
            <p><strong>Pontos positivos:</strong> 5 identificados</p>
        </div>
    </div>
    
    <div style="text-align: center; margin-top: 40px; color: #666; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        <p><strong>Relatório gerado pelo AutomateAI Backend</strong></p>
        <p>Data: 15 de Janeiro de 2025</p>
    </div>
</body>
</html>"""

if __name__ == "__main__":
    print("🚀 Iniciando AutomateAI Backend para MVP Agent Builder...")
    print("🌐 Frontend MVP Agent Builder: http://localhost:3002")
    print("🔗 Backend API: http://localhost:8000")
    print("📊 API Docs: http://localhost:8000/docs")
    print("❤️ Health Check: http://localhost:8000/health")
    print("🔧 Pressione Ctrl+C para parar")
    
    uvicorn.run(
        "backend-simple:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
