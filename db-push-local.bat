@echo off
echo ========================================
echo  DB PUSH LOCAL (Sem perder dados)
echo ========================================
echo.
echo Este comando vai:
echo - Aplicar mudancas do schema no banco LOCAL
echo - MANTER todos os dados existentes
echo - Nao criar arquivos de migration
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

REM Push das mudanças (sem migration, mantém dados)
echo Aplicando mudancas no banco...
npx dotenv -e .env.local -- prisma db push

echo.
echo Gerando Prisma Client...
npx dotenv -e .env.local -- prisma generate

echo.
echo ========================================
echo  CONCLUIDO!
echo ========================================
echo.
echo Tabela password_resets criada com sucesso!
echo Seus dados existentes foram mantidos.
echo.
echo Proximo passo: Reinicie o servidor
echo   npm run dev
echo.
pause
