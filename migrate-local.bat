@echo off
echo ========================================
echo  MIGRATION LOCAL - Password Reset
echo ========================================
echo.

REM Verificar se .env.local existe
if not exist .env.local (
    echo ERRO: Arquivo .env.local nao encontrado!
    echo Crie o arquivo .env.local com DATABASE_URL do banco local.
    pause
    exit /b 1
)

echo Carregando variaveis de .env.local...
echo.

REM Executar migration com .env.local
npx dotenv -e .env.local -- prisma migrate dev --name add_password_reset

echo.
echo ========================================
echo  Migration concluida!
echo ========================================
echo.

REM Gerar Prisma Client
echo Gerando Prisma Client...
npx dotenv -e .env.local -- prisma generate

echo.
echo ========================================
echo  PRONTO! Reinicie o servidor.
echo ========================================
pause
