@echo off
echo ====================================
echo Limpeza de Documentacao - AgentKit
echo ====================================
echo.

REM Deletar arquivos obsoletos de debug/correcao
del /F /Q "CORRECAO_ERRO_ESQUECI_SENHA.md" 2>nul
del /F /Q "CORRIGIR_OAUTH_ACCOUNT_NOT_LINKED.md" 2>nul
del /F /Q "CORRIGIR_OAUTH_GOOGLE.md" 2>nul
del /F /Q "LIMPEZA_DEBUG_OAUTH.md" 2>nul
del /F /Q "RESOLVER_OAUTH_NAO_REDIRECIONA.md" 2>nul
del /F /Q "RESUMO_CORRECAO_OAUTH.md" 2>nul
del /F /Q "DIAGNOSTICO_PRODUCAO.md" 2>nul
del /F /Q "PROBLEMA_REAL_BUILDER.md" 2>nul
del /F /Q "SOLUCAO_IMPLEMENTADA_BUILDER.md" 2>nul
del /F /Q "SOLUCAO_SMTP_VERCEL.md" 2>nul

REM Deletar documentos de deploy especificos (consolidar em docs/)
del /F /Q "DEPLOY_ESQUECI_SENHA_PRODUCAO.md" 2>nul
del /F /Q "DEPLOY_PARA_PRODUCAO.md" 2>nul
del /F /Q "COMANDO_MANUAL_PRODUCAO.md" 2>nul

REM Deletar auditorias antigas (mover info importante para docs/ se necessario)
del /F /Q "ANALISE_COMPATIBILIDADE_JSON.md" 2>nul
del /F /Q "ANALISE_IMPACTO_E_SOLID.md" 2>nul
del /F /Q "AUDITORIA_BUILDER_E_NL.md" 2>nul
del /F /Q "AUDITORIA_MULTI_TENANCY.md" 2>nul
del /F /Q "AUDITORIA_SISTEMA_CONVITES.md" 2>nul
del /F /Q "MELHORIAS_UX_BUILDER.md" 2>nul

REM Deletar documentos de features especificas ja implementadas
del /F /Q "FUNCIONALIDADE_ESQUECI_SENHA.md" 2>nul
del /F /Q "RENDERIZADOR_DINAMICO_EMAIL.md" 2>nul
del /F /Q "CHECKLIST_PRE_PRODUCAO.md" 2>nul
del /F /Q "GUIA_DEPLOY_VERCEL.md" 2>nul
del /F /Q "RESUMO_FINAL_IMPLEMENTACOES_09_10.md" 2>nul
del /F /Q "SESSAO_COMPLETA_09_10_2025.md" 2>nul

REM Mover documentos AgentKit para docs/
echo.
echo Movendo documentacao AgentKit para docs/...
move /Y "PHASE1_SETUP.md" "docs\AGENTKIT_PHASE1_SETUP.md" 2>nul
move /Y "AGENTKIT_QUICKSTART.md" "docs\AGENTKIT_QUICKSTART.md" 2>nul
move /Y "IMPLEMENTATION_STATUS.md" "docs\AGENTKIT_IMPLEMENTATION_STATUS.md" 2>nul

echo.
echo ====================================
echo Limpeza concluida!
echo ====================================
echo.
echo Arquivos mantidos na raiz:
echo - README.md
echo - CHANGELOG.md
echo.
echo Documentacao AgentKit em docs/:
echo - docs/ROADMAP_AGENTKIT_INTEGRATION.md
echo - docs/IMPLEMENTATION_GUIDE_PHASE1.md
echo - docs/AGENTKIT_PHASE1_SETUP.md
echo - docs/AGENTKIT_QUICKSTART.md
echo - docs/AGENTKIT_IMPLEMENTATION_STATUS.md
echo.
pause
