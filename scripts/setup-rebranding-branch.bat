@echo off
REM Script para criar branch de rebranding - SimplifiqueIA RH
REM Windows Batch Script

echo.
echo ========================================
echo   SimplifiqueIA RH - Setup Rebranding
echo ========================================
echo.

REM Verificar se está no diretório correto
if not exist "package.json" (
    echo [ERRO] Execute este script no diretorio mvp-agent-builder
    echo.
    pause
    exit /b 1
)

echo [1/5] Verificando status do Git...
git status
if errorlevel 1 (
    echo [ERRO] Git nao esta inicializado ou nao esta instalado
    pause
    exit /b 1
)

echo.
echo [2/5] Verificando mudancas pendentes...
git diff --quiet
if errorlevel 1 (
    echo.
    echo [AVISO] Existem mudancas nao commitadas!
    echo.
    choice /C SN /M "Deseja fazer commit dessas mudancas antes de continuar"
    if errorlevel 2 goto skip_commit
    if errorlevel 1 goto do_commit
    
    :do_commit
    echo.
    echo Fazendo commit das mudancas pendentes...
    git add .
    git commit -m "Checkpoint antes do rebranding"
    echo [OK] Commit realizado!
    goto continue_setup
    
    :skip_commit
    echo.
    echo [AVISO] Continuando sem commit. Mudancas serao incluidas na branch rebranding.
)

:continue_setup
echo.
echo [3/5] Verificando se branch rebranding ja existe...
git rev-parse --verify rebranding >nul 2>&1
if not errorlevel 1 (
    echo.
    echo [AVISO] Branch 'rebranding' ja existe!
    echo.
    choice /C SN /M "Deseja deletar a branch existente e criar uma nova"
    if errorlevel 2 goto use_existing
    if errorlevel 1 goto delete_existing
    
    :delete_existing
    echo.
    echo Deletando branch rebranding existente...
    git checkout main 2>nul || git checkout master
    git branch -D rebranding
    echo [OK] Branch deletada!
    goto create_branch
    
    :use_existing
    echo.
    echo Usando branch rebranding existente...
    git checkout rebranding
    goto branch_ready
)

:create_branch
echo.
echo [4/5] Criando branch rebranding...
git checkout -b rebranding
if errorlevel 1 (
    echo [ERRO] Falha ao criar branch rebranding
    pause
    exit /b 1
)
echo [OK] Branch rebranding criada!

:branch_ready
echo.
echo [5/5] Verificando branch ativa...
git branch
echo.

echo ========================================
echo   Branch Rebranding Pronta!
echo ========================================
echo.
echo Branch ativa: rebranding
echo.
echo Proximos passos:
echo   1. Executar: node scripts/rebranding.js
echo   2. Revisar: git diff
echo   3. Testar: npm run dev
echo   4. Build: npm run build
echo   5. Commit: git add . ^&^& git commit -m "Rebranding para SimplifiqueIA RH"
echo.
echo Para voltar para branch principal:
echo   git checkout main
echo.
echo Para ver diferenças entre branches:
echo   git diff main rebranding --name-only
echo.

pause
