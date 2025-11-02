@echo off
echo ====================================
echo Limpeza da pasta docs/
echo ====================================
echo.

cd docs

REM === DELETAR: Correcoes/Problemas ja resolvidos ===
del /F /Q "ANALISE_PROBLEMAS_PRODUCAO.md" 2>nul
del /F /Q "AUDITORIA_SEGURANCA_URGENTE.md" 2>nul
del /F /Q "CORRECAO_ANTI_SPAM.md" 2>nul
del /F /Q "CORRECAO_EMAIL_BOTAO_DOMINIO.md" 2>nul
del /F /Q "CORRECAO_EMAIL_CORPORATIVO.md" 2>nul
del /F /Q "CORRECAO_EMAIL_IMEDIATA.md" 2>nul
del /F /Q "CORRECOES_IMPLEMENTADAS_URGENTE.md" 2>nul
del /F /Q "CORRECOES_SEGURANCA_CRITICAS.md" 2>nul
del /F /Q "SOLUCAO_ERRO_MIGRACAO.md" 2>nul
del /F /Q "MIGRACAO_CORRIGIDA.md" 2>nul
del /F /Q "MELHORIAS_TRATAMENTO_ERROS.md" 2>nul
del /F /Q "MELHORIA_CONTRASTE_ERROS.md" 2>nul

REM === DELETAR: Features ja implementadas (info no codigo) ===
del /F /Q "IMPLEMENTACAO_VERIFICACAO_EMAIL.md" 2>nul
del /F /Q "VERIFICACAO_EMAIL_COMPLETA.md" 2>nul
del /F /Q "EMAIL_BOAS_VINDAS.md" 2>nul
del /F /Q "CONFIGURAR_LOGO_SENDGRID.md" 2>nul
del /F /Q "LOGO_IMPLEMENTADO.md" 2>nul
del /F /Q "LIMPAR_CACHE_FAVICON.md" 2>nul

REM === DELETAR: Resumos/Reorganizacoes antigas ===
del /F /Q "IMPLEMENTACOES_COMPLETAS_FINAL.md" 2>nul
del /F /Q "RESUMO_IMPLEMENTACOES_14_10_2025.md" 2>nul
del /F /Q "REORGANIZACAO_DOCUMENTACAO.md" 2>nul
del /F /Q "RESUMO_REORGANIZACAO.md" 2>nul
del /F /Q "INDICE_DOCUMENTACAO.md" 2>nul

REM === DELETAR: Duplicados/Versoes antigas ===
del /F /Q "README_NOVO.md" 2>nul
del /F /Q "COPILOT_PROMPT_COMPARISON.md" 2>nul
del /F /Q "ANALISE_OPENAI_AGENTKIT_IMPACTO.md" 2>nul

REM === DELETAR: Propostas nao implementadas ===
del /F /Q "PROPOSTA_REBRANDING.md" 2>nul
del /F /Q "ANALISE_REALISTA_COMPETICAO.md" 2>nul

cd ..

echo.
echo ====================================
echo Limpeza concluida!
echo ====================================
echo.
echo MANTIDOS em docs/:
echo.
echo === AgentKit ===
echo - ROADMAP_AGENTKIT_INTEGRATION.md
echo - IMPLEMENTATION_GUIDE_PHASE1.md
echo - AGENTKIT_PHASE1_SETUP.md
echo - AGENTKIT_QUICKSTART.md
echo - AGENTKIT_IMPLEMENTATION_STATUS.md
echo.
echo === Configuracao ===
echo - ENV_VARIABLES.md
echo - EMAIL_DELIVERABILITY_STRATEGY.md
echo - EMAIL_CORPORATIVO_SETUP.md
echo - COPILOT_PROMPT_V2.md
echo.
echo === Deploy/Dev ===
echo - DEPLOY_PRODUCAO.md
echo - DESENVOLVIMENTO.md
echo - DEVELOPMENT_GUIDELINES.md
echo.
echo === Subpastas ===
echo - architecture/
echo - deployment/
echo - features/
echo - integrations/
echo - reference/
echo - troubleshooting/
echo - archive/
echo.
pause
