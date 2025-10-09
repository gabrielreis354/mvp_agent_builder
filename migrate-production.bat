@echo off
echo ========================================
echo  MIGRATION PRODUCAO - Password Reset
echo ========================================
echo.
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo  ATENCAO: BANCO DE PRODUCAO
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo.
echo Este comando vai aplicar migrations no banco de PRODUCAO.
echo.
echo Certifique-se de que:
echo 1. Voce tem backup do banco
echo 2. Testou a migration no ambiente local
echo 3. Esta fora do horario de pico
echo.
echo Pressione CTRL+C para CANCELAR
pause
echo.

REM Verificar se .env.production existe
if not exist .env.production (
    echo ERRO: Arquivo .env.production nao encontrado!
    pause
    exit /b 1
)

echo Carregando variaveis de .env.production...
echo.

REM Gerar Prisma Client (se necessario)
echo [1/2] Gerando Prisma Client...
call npx dotenv -e .env.production -- prisma generate
if errorlevel 1 (
    echo ERRO ao gerar Prisma Client!
    pause
    exit /b 1
)

echo.
echo [2/2] Aplicando migrations em PRODUCAO...
echo.
echo ATENCAO: Aplicando em PRODUCAO agora!
echo.
call npx dotenv -e .env.production -- prisma migrate deploy
if errorlevel 1 (
    echo ERRO ao aplicar migrations!
    pause
    exit /b 1
)

echo.
echo ========================================
echo  MIGRATION APLICADA EM PRODUCAO!
echo ========================================
echo.
echo Proximo passo: Verificar se tudo esta funcionando
echo 1. Acesse o site de producao
echo 2. Teste a funcionalidade "Esqueci minha senha"
echo 3. Monitore logs de erro
echo.
pause
