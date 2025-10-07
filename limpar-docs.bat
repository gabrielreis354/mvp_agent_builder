@echo off
echo ========================================
echo  Limpeza da Documentacao SimplifiqueIA
echo ========================================
echo.
echo Este script vai remover 37 arquivos de documentacao desnecessarios
echo Mantendo apenas 4 arquivos essenciais
echo.
pause

echo.
echo Removendo arquivos da raiz...
del /F /Q "README_PT.md" 2>nul
del /F /Q "COMANDOS_BANCO.md" 2>nul
del /F /Q "SETUP_BANCO_LOCAL.md" 2>nul
del /F /Q "COMECE_AQUI_REBRANDING.md" 2>nul
del /F /Q "MUDANCAS_REBRANDING.md" 2>nul
del /F /Q "STATUS_REBRANDING.md" 2>nul
del /F /Q "GERAR_ICONES.md" 2>nul
del /F /Q "PLANO_LIMPEZA_DOCS.md" 2>nul

echo Removendo arquivos de docs/...
del /F /Q "docs\README_DOCS.md" 2>nul
del /F /Q "docs\SETUP.md" 2>nul
del /F /Q "docs\troubleshooting.md" 2>nul
del /F /Q "docs\IMPLEMENTACOES.md" 2>nul
del /F /Q "docs\IMPLEMENTACAO_FINAL_CONSOLIDADA.md" 2>nul
del /F /Q "docs\production-checklist.md" 2>nul
del /F /Q "docs\REBRANDING_FRONTEND.md" 2>nul
del /F /Q "docs\REBRANDING_PASSO_A_PASSO.md" 2>nul
del /F /Q "docs\REBRANDING_RESUMO.md" 2>nul
del /F /Q "docs\CORRECOES_ERROS_TESTES_BUILD.md" 2>nul
del /F /Q "docs\CORRECOES_FINAIS_BUILD.md" 2>nul
del /F /Q "docs\SOLUCAO_ERRO_BUILD_EPERM.md" 2>nul
del /F /Q "docs\SOLUCAO_ERRO_PRISMA_STUDIO.md" 2>nul
del /F /Q "docs\BUILD_E_DEPLOY_EXPLICADO.md" 2>nul
del /F /Q "docs\CONFIGURACAO_LOCAL_VS_NUVEM.md" 2>nul
del /F /Q "docs\GUIA_CONFIGURACAO_SUPABASE.md" 2>nul

echo Removendo arquivos de docs/deployment/...
del /F /Q "docs\deployment\IMPLEMENTATION_GUIDE.md" 2>nul
del /F /Q "docs\deployment\GUIA_SEGURANCA.md" 2>nul

echo Removendo pastas vazias...
rmdir /Q "docs\architecture" 2>nul
rmdir /Q "docs\development" 2>nul
rmdir /Q "docs\reference" 2>nul
rmdir /Q "docs\integrations" 2>nul
rmdir /Q "docs\features" 2>nul

echo.
echo ========================================
echo  Limpeza Concluida!
echo ========================================
echo.
echo Arquivos mantidos:
echo   - README.md (raiz)
echo   - docs/README.md
echo   - docs/DESENVOLVIMENTO.md
echo   - docs/deployment/GUIA_IMPLANTACAO.md
echo.
echo Total removido: 37 arquivos
echo Total mantido: 4 arquivos essenciais
echo.
pause
