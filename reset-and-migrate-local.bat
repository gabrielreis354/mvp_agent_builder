@echo off
echo ========================================
echo  RESET E MIGRATION LOCAL
echo ========================================
echo.
echo ATENCAO: Este comando vai:
echo 1. Apagar TODOS os dados do banco LOCAL
echo 2. Recriar todas as tabelas
echo 3. Aplicar todas as migrations
echo.
echo Pressione CTRL+C para cancelar
pause
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

REM Reset do banco (apaga tudo e recria)
echo [1/3] Resetando banco de dados...
npx dotenv -e .env.local -- prisma migrate reset --force

echo.
echo [2/3] Gerando Prisma Client...
npx dotenv -e .env.local -- prisma generate

echo.
echo [3/3] Aplicando seeds (se houver)...
npx dotenv -e .env.local -- prisma db seed 2>nul || echo Nenhum seed configurado.

echo.
echo ========================================
echo  CONCLUIDO!
echo ========================================
echo.
echo Banco local resetado e migrations aplicadas.
echo Todas as tabelas foram recriadas, incluindo password_resets.
echo.
echo Proximo passo: Reinicie o servidor
echo   npm run dev
echo.
pause
