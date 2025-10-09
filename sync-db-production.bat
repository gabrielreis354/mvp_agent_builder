@echo off
echo ========================================
echo  Sincronizar Schema com Banco Neon (Producao)
echo ========================================
echo.
echo ATENCAO: Este script vai modificar o banco de PRODUCAO!
echo.

REM Connection string do Neon (hardcoded)
set NEON_URL=postgresql://neondb_owner:npg_TjzhwEFS3k0n@ep-calm-brook-acou6n8f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

echo ========================================
echo  Confirmacao
echo ========================================
echo.
echo Voce esta prestes a aplicar mudancas no banco de PRODUCAO.
echo.
echo Banco: Neon (aws-1-sa-east-1.pooler.supabase.com)
echo.
set /p CONFIRM="Tem certeza? (S/N): "

if /i not "%CONFIRM%"=="S" (
    echo.
    echo [CANCELADO] Operacao cancelada pelo usuario.
    pause
    exit /b 0
)

echo.
echo ========================================
echo  Aplicando mudancas...
echo ========================================
echo.

REM Aplicar schema ao banco Neon
set DATABASE_URL=%NEON_URL%
npx prisma db push

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  Sucesso!
    echo ========================================
    echo.
    echo Schema sincronizado com banco Neon.
    echo.
    echo Proximos passos:
    echo 1. Fazer redeploy na Vercel (se aplicavel)
    echo 2. Testar funcionalidades em producao
    echo.
) else (
    echo.
    echo ========================================
    echo  ERRO!
    echo ========================================
    echo.
    echo Falha ao sincronizar schema.
    echo Verifique a connection string e tente novamente.
    echo.
)

pause
