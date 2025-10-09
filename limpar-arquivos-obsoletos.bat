@echo off
echo ========================================
echo   LIMPEZA DE ARQUIVOS OBSOLETOS
echo ========================================
echo.

echo [1/5] Removendo arquivos obsoletos...
if exist "CODIGO_CORRETO_AGENT_EXECUTION_FORM.tsx" (
    del "CODIGO_CORRETO_AGENT_EXECUTION_FORM.tsx"
    echo   - CODIGO_CORRETO_AGENT_EXECUTION_FORM.tsx removido
)

if exist "APLICAR_MIGRATIONS.md" (
    del "APLICAR_MIGRATIONS.md"
    echo   - APLICAR_MIGRATIONS.md removido
)

if exist "SEGURANCA_CONVITES_E_COMPARTILHAMENTO.md" (
    del "SEGURANCA_CONVITES_E_COMPARTILHAMENTO.md"
    echo   - SEGURANCA_CONVITES_E_COMPARTILHAMENTO.md removido
)

if exist "backup_pre_migration_$(date" (
    del "backup_pre_migration_$(date"
    echo   - backup_pre_migration_$(date removido
)

if exist "test-import.ts" (
    del "test-import.ts"
    echo   - test-import.ts removido
)

echo.
echo [2/5] Criando pasta de arquivos antigos...
if not exist "docs\archive" mkdir "docs\archive"

echo.
echo [3/5] Movendo documentos antigos para arquivo...
if exist "MELHORIAS_IMPLEMENTADAS.md" (
    move "MELHORIAS_IMPLEMENTADAS.md" "docs\archive\" >nul 2>&1
    echo   - MELHORIAS_IMPLEMENTADAS.md arquivado
)

if exist "MELHORIAS_09_10_FINAL.md" (
    move "MELHORIAS_09_10_FINAL.md" "docs\archive\" >nul 2>&1
    echo   - MELHORIAS_09_10_FINAL.md arquivado
)

echo.
echo [4/5] Limpando cache e temporários...
if exist ".next" (
    rmdir /s /q ".next" >nul 2>&1
    echo   - .next limpo
)

if exist "tsconfig.tsbuildinfo" (
    del "tsconfig.tsbuildinfo"
    echo   - tsconfig.tsbuildinfo removido
)

if exist "tmp" (
    rmdir /s /q "tmp" >nul 2>&1
    echo   - tmp limpo
)

if exist "uploads" (
    rmdir /s /q "uploads" >nul 2>&1
    echo   - uploads limpo
)

echo.
echo [5/5] Limpando node_modules/.cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache" >nul 2>&1
    echo   - node_modules/.cache limpo
)

echo.
echo ========================================
echo   LIMPEZA CONCLUIDA!
echo ========================================
echo.
echo Arquivos removidos:
echo   - Codigo obsoleto
echo   - Documentos duplicados
echo   - Cache e temporarios
echo.
echo Documentos arquivados em: docs\archive\
echo.
pause
