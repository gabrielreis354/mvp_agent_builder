# 🚀 Backend Simples para MVP Agent Builder

## 📋 Visão Geral

Este backend foi criado para resolver o problema de integração entre o MVP Agent Builder e o sistema backend do AutomateAI. É uma versão simplificada e funcional baseada nos arquivos `simple_app.py` e `app_simple.py` do projeto original.

## 🎯 Problema Resolvido

- **Problema**: O backend complexo em `projects/original` não estava funcionando com o MVP Agent Builder
- **Solução**: Backend simplificado com endpoints específicos para o frontend Next.js
- **Integração**: CORS configurado para comunicação com as portas 3002 e 3000

## 🚀 Como Usar

### Opção 1: Executar com Script Automático (Recomendado)

```bash
# No diretório mvp-agent-builder
./start-backend.bat
```

### Opção 2: Executar Manualmente

```bash
# Instalar dependências
pip install -r requirements-backend.txt

# Executar backend
python backend-simple.py
```

## 🔗 Endpoints Disponíveis

### 1. **Health Check**

- **URL**: `GET /health`
- **Descrição**: Verificar status do backend
- **Resposta**: Status, versão e configurações

### 2. **Executar Agentes**

- **URL**: `POST /api/agents/execute`
- **Descrição**: Endpoint principal para execução de agentes
- **Compatível**: Runtime engine do MVP Agent Builder
- **Resposta**: Resultados de execução com HTML profissional

### 3. **Chamadas LLM**

- **URL**: `POST /api/llm/call`
- **Descrição**: Simulação de chamadas para provedores de IA
- **Compatível**: Sistema de fallback do runtime engine

### 4. **Página Inicial**

- **URL**: `GET /`
- **Descrição**: Interface web com status e links úteis

## 🔧 Configuração

### Portas

- **Backend**: `http://localhost:8000`
- **Frontend MVP**: `http://localhost:3002`
- **Frontend Alternativo**: `http://localhost:3000`

### CORS

Configurado automaticamente para permitir:

- Todas as origens do localhost nas portas 3000 e 3002
- Todos os métodos HTTP
- Todos os headers

## 🎨 Funcionalidades

### ✅ Implementado

- [x] Execução de agentes com respostas realistas
- [x] Geração de relatórios HTML profissionais
- [x] Simulação de análise de contratos RH
- [x] CORS configurado para desenvolvimento
- [x] Health checks e monitoramento básico
- [x] Compatibilidade total com MVP Agent Builder

### 🔄 Simulações Inteligentes

- **Agentes de RH/Contratos**: Gera relatórios HTML profissionais
- **Agentes Genéricos**: Respostas estruturadas baseadas no input
- **LLM Calls**: Respostas contextuais baseadas no prompt

## 🧪 Testando a Integração

1. **Iniciar Backend**:

   ```bash
   ./start-backend.bat
   ```

2. **Iniciar Frontend**:

   ```bash
   npm run dev
   ```

3. **Testar Execução**:
   - Abrir MVP Agent Builder em `http://localhost:3002`
   - Carregar template "Analisador de Contratos RH"
   - Executar agente no painel de execução
   - Verificar geração de relatório HTML

## 📊 Monitoramento

### Logs do Backend

- Todas as requisições são logadas
- Erros detalhados para debugging
- Status de execução em tempo real

### Health Check

```bash
curl http://localhost:8000/health
```

### API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔍 Troubleshooting

### Backend não inicia

```bash
# Verificar Python
python --version

# Instalar dependências manualmente
pip install fastapi uvicorn pydantic python-multipart
```

### CORS Errors

- Verificar se backend está rodando na porta 8000
- Confirmar que frontend está nas portas 3000 ou 3002

### Agentes não executam

- Verificar logs do backend no terminal
- Testar health check: `http://localhost:8000/health`
- Verificar se endpoints estão respondendo

## 🚀 Próximos Passos

### Melhorias Futuras

- [ ] Integração com APIs reais de IA
- [ ] Banco de dados para persistência
- [ ] Sistema de autenticação
- [ ] Rate limiting
- [ ] Logs estruturados

### Migração para Produção

- [ ] Docker container
- [ ] Variáveis de ambiente
- [ ] HTTPS/SSL
- [ ] Monitoramento avançado

## 📝 Notas Técnicas

- **Framework**: FastAPI (alta performance, async)
- **Compatibilidade**: Python 3.8+
- **Dependências**: Mínimas para facilitar instalação
- **Arquitetura**: Stateless, pronto para escalar
