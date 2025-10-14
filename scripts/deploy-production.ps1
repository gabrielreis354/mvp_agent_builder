# Script de Deploy em Produção (PowerShell)
# Aplica migrações no banco de produção

Write-Host "🚀 Iniciando deploy em produção..." -ForegroundColor Cyan
Write-Host ""

# Verificar se DATABASE_URL está configurada
if (-not $env:DATABASE_URL) {
    Write-Host "❌ Erro: DATABASE_URL não está configurada" -ForegroundColor Red
    Write-Host "Configure a variável de ambiente DATABASE_URL com a string de conexão de produção" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Exemplo:" -ForegroundColor Yellow
    Write-Host '$env:DATABASE_URL="postgresql://user:pass@host:5432/db"' -ForegroundColor Gray
    exit 1
}

Write-Host "✅ DATABASE_URL configurada" -ForegroundColor Green
Write-Host ""

# Gerar Prisma Client
Write-Host "📦 Gerando Prisma Client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao gerar Prisma Client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma Client gerado" -ForegroundColor Green
Write-Host ""

# Aplicar migrações
Write-Host "🔄 Aplicando migrações no banco de produção..." -ForegroundColor Cyan
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao aplicar migrações" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Migrações aplicadas" -ForegroundColor Green
Write-Host ""

# Verificar status
Write-Host "📊 Verificando status das migrações..." -ForegroundColor Cyan
npx prisma migrate status
Write-Host ""

Write-Host "🎉 Deploy concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Lembre-se de:" -ForegroundColor Yellow
Write-Host "  1. Reiniciar a aplicação" -ForegroundColor Gray
Write-Host "  2. Verificar logs" -ForegroundColor Gray
Write-Host "  3. Testar cadastro de novo usuário" -ForegroundColor Gray
