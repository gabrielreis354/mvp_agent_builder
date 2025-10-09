@echo off
echo ========================================
echo  Sincronizando Schema com Banco Local
echo ========================================
echo.

REM Renomear .env temporariamente
if exist .env (
    echo [1/4] Renomeando .env para .env.backup...
    ren .env .env.backup
)

REM Executar db:push
echo [2/4] Aplicando schema ao banco...
call npm run db:push

REM Restaurar .env
if exist .env.backup (
    echo [3/4] Restaurando .env...
    ren .env.backup .env
)

echo [4/4] Verificando tipos TypeScript...
call npm run type-check

echo.
echo ========================================
echo  Sincronizacao concluida!
echo ========================================
pause
