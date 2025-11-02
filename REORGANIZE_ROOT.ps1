# Script de Reorganizacao - Arquivos .md na Raiz
# SimplifiqueIA RH v2.0.0
# Data: 20/10/2025

Write-Host "Iniciando reorganizacao dos arquivos .md na raiz..." -ForegroundColor Cyan

$rootPath = $PSScriptRoot
$docsPath = Join-Path $rootPath "docs"

# ============================================
# FASE 1: MOVER PARA /docs/architecture
# ============================================

Write-Host "`nMovendo para /docs/architecture..." -ForegroundColor Yellow

$architectureFiles = @(
    "ANALISE_COMPATIBILIDADE_JSON.md",
    "ANALISE_IMPACTO_E_SOLID.md"
)

foreach ($file in $architectureFiles) {
    $source = Join-Path $rootPath $file
    $dest = Join-Path $docsPath "architecture/$file"
    
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "  [OK] Movido: $file" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Nao encontrado: $file" -ForegroundColor Yellow
    }
}

# ============================================
# FASE 2: MOVER PARA /docs/reference
# ============================================

Write-Host "`nMovendo para /docs/reference..." -ForegroundColor Yellow

$referenceFiles = @(
    "AUDITORIA_BUILDER_E_NL.md",
    "AUDITORIA_MULTI_TENANCY.md",
    "AUDITORIA_SISTEMA_CONVITES.md"
)

foreach ($file in $referenceFiles) {
    $source = Join-Path $rootPath $file
    $dest = Join-Path $docsPath "reference/$file"
    
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "  [OK] Movido: $file" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Nao encontrado: $file" -ForegroundColor Yellow
    }
}

# ============================================
# FASE 3: MOVER PARA /docs/deployment
# ============================================

Write-Host "`nMovendo para /docs/deployment..." -ForegroundColor Yellow

$deploymentFiles = @(
    "CHECKLIST_PRE_PRODUCAO.md",
    "DEPLOY_ESQUECI_SENHA_PRODUCAO.md",
    "DEPLOY_PARA_PRODUCAO.md",
    "GUIA_DEPLOY_VERCEL.md"
)

foreach ($file in $deploymentFiles) {
    $source = Join-Path $rootPath $file
    $dest = Join-Path $docsPath "deployment/$file"
    
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "  [OK] Movido: $file" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Nao encontrado: $file" -ForegroundColor Yellow
    }
}

# ============================================
# FASE 4: MOVER PARA /docs/features
# ============================================

Write-Host "`nMovendo para /docs/features..." -ForegroundColor Yellow

$featuresFiles = @(
    "FUNCIONALIDADE_ESQUECI_SENHA.md",
    "RENDERIZADOR_DINAMICO_EMAIL.md"
)

foreach ($file in $featuresFiles) {
    $source = Join-Path $rootPath $file
    $dest = Join-Path $docsPath "features/$file"
    
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "  [OK] Movido: $file" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Nao encontrado: $file" -ForegroundColor Yellow
    }
}

# ============================================
# FASE 5: MOVER PARA /docs/troubleshooting
# ============================================

Write-Host "`nMovendo para /docs/troubleshooting..." -ForegroundColor Yellow

$troubleshootingFiles = @(
    "SOLUCAO_SMTP_VERCEL.md"
)

foreach ($file in $troubleshootingFiles) {
    $source = Join-Path $rootPath $file
    $dest = Join-Path $docsPath "troubleshooting/$file"
    
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "  [OK] Movido: $file" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Nao encontrado: $file" -ForegroundColor Yellow
    }
}

# ============================================
# FASE 6: EXCLUIR ARQUIVOS OBSOLETOS
# ============================================

Write-Host "`nExcluindo arquivos obsoletos..." -ForegroundColor Yellow

$filesToDelete = @(
    # Correcoes implementadas
    "CORRECAO_ERRO_ESQUECI_SENHA.md",
    "CORRIGIR_ERRO_503.md",
    "CORRIGIR_OAUTH_ACCOUNT_NOT_LINKED.md",
    "CORRIGIR_OAUTH_GOOGLE.md",
    "LIMPEZA_DEBUG_OAUTH.md",
    "RESOLVER_OAUTH_NAO_REDIRECIONA.md",
    "RESUMO_CORRECAO_OAUTH.md",
    "SOLUCAO_IMPLEMENTADA_BUILDER.md",
    
    # Resumos temporais
    "RESUMO_FINAL_IMPLEMENTACOES_09_10.md",
    "SESSAO_COMPLETA_09_10_2025.md",
    
    # Problemas resolvidos
    "PROBLEMA_REAL_BUILDER.md",
    "MELHORIAS_UX_BUILDER.md",
    
    # Diagnosticos antigos
    "DIAGNOSTICO_PRODUCAO.md",
    
    # Comandos manuais
    "COMANDO_MANUAL_PRODUCAO.md",
    
    # Testes temporarios
    "TESTE_AGENTKIT.md"
)

$deletedCount = 0
foreach ($file in $filesToDelete) {
    $fullPath = Join-Path $rootPath $file
    if (Test-Path $fullPath) {
        Remove-Item -Path $fullPath -Force
        Write-Host "  [OK] Excluido: $file" -ForegroundColor Green
        $deletedCount++
    }
}

Write-Host "  Total excluido: $deletedCount arquivos" -ForegroundColor Cyan

# ============================================
# RESUMO FINAL
# ============================================

Write-Host "`nReorganizacao concluida!" -ForegroundColor Green
Write-Host "`nResumo:" -ForegroundColor Cyan
Write-Host "  - Movidos para /docs/architecture: $($architectureFiles.Count)" -ForegroundColor White
Write-Host "  - Movidos para /docs/reference: $($referenceFiles.Count)" -ForegroundColor White
Write-Host "  - Movidos para /docs/deployment: $($deploymentFiles.Count)" -ForegroundColor White
Write-Host "  - Movidos para /docs/features: $($featuresFiles.Count)" -ForegroundColor White
Write-Host "  - Movidos para /docs/troubleshooting: $($troubleshootingFiles.Count)" -ForegroundColor White
Write-Host "  - Arquivos obsoletos excluidos: $deletedCount" -ForegroundColor White

$totalMoved = $architectureFiles.Count + $referenceFiles.Count + $deploymentFiles.Count + $featuresFiles.Count + $troubleshootingFiles.Count

Write-Host "`nArquivos na raiz:" -ForegroundColor Yellow
Write-Host "  - README.md (mantido)" -ForegroundColor White
Write-Host "  - CHANGELOG.md (mantido)" -ForegroundColor White
Write-Host "  - Total movido: $totalMoved arquivos" -ForegroundColor White
Write-Host "  - Total excluido: $deletedCount arquivos" -ForegroundColor White

Write-Host "`nProximos passos:" -ForegroundColor Yellow
Write-Host "  1. Revisar arquivos movidos" -ForegroundColor White
Write-Host "  2. Atualizar README.md" -ForegroundColor White
Write-Host "  3. Atualizar INDICE_DOCUMENTACAO.md" -ForegroundColor White
Write-Host "  4. Commit das mudancas" -ForegroundColor White

Write-Host "`nPronto!" -ForegroundColor Magenta
