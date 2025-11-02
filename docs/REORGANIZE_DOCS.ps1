# Script de Reorganização da Documentação
# SimplifiqueIA RH v2.0.0
# Data: 20/10/2025

Write-Host "Iniciando reorganizacao da documentacao..." -ForegroundColor Cyan

$docsPath = $PSScriptRoot

# ============================================
# FASE 1: CRIAR ESTRUTURA DE DIRETORIOS
# ============================================

Write-Host "`nCriando estrutura de diretorios..." -ForegroundColor Yellow

$directories = @(
    "features/agentkit",
    "architecture",
    "deployment",
    "development",
    "integrations",
    "reference",
    "troubleshooting"
)

foreach ($dir in $directories) {
    $fullPath = Join-Path $docsPath $dir
    if (!(Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "  [OK] Criado: $dir" -ForegroundColor Green
    } else {
        Write-Host "  [INFO] Ja existe: $dir" -ForegroundColor Gray
    }
}

# ============================================
# FASE 2: MOVER ARQUIVOS AGENTKIT
# ============================================

Write-Host "`nMovendo arquivos AgentKit..." -ForegroundColor Yellow

$agentkitFiles = @{
    "AGENTKIT_IMPLEMENTATION_STATUS.md" = "features/agentkit/IMPLEMENTATION_STATUS.md"
    "ROADMAP_AGENTKIT_INTEGRATION.md" = "features/agentkit/ROADMAP.md"
    "IMPLEMENTATION_GUIDE_PHASE1.md" = "features/agentkit/SETUP_GUIDE.md"
    "AGENTKIT_QUICKSTART.md" = "features/agentkit/QUICKSTART.md"
    "AGENTKIT_COMO_FUNCIONA.md" = "features/agentkit/HOW_IT_WORKS.md"
    "ANALISE_OPENAI_AGENTKIT_IMPACTO.md" = "features/agentkit/IMPACT_ANALYSIS.md"
    "AGENTKIT_PHASE1_SETUP.md" = "features/agentkit/PHASE1_SETUP.md"
}

foreach ($file in $agentkitFiles.Keys) {
    $source = Join-Path $docsPath $file
    $dest = Join-Path $docsPath $agentkitFiles[$file]
    
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "  [OK] Movido: $file" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Nao encontrado: $file" -ForegroundColor Yellow
    }
}

# ============================================
# FASE 3: MOVER OUTROS ARQUIVOS
# ============================================

Write-Host "`nMovendo outros arquivos..." -ForegroundColor Yellow

$otherMoves = @{
    "DEVELOPMENT_GUIDELINES.md" = "development/GUIDELINES.md"
    "DEPLOY_PRODUCAO.md" = "deployment/DEPLOY_PRODUCAO.md"
    "architecture/README-BACKEND.md" = "architecture/BACKEND.md"
    "development/TESTING_GUIDE.md" = "development/TESTING.md"
    "integrations/ai-providers.md" = "integrations/AI_PROVIDERS.md"
    "reference/migration-history.md" = "reference/MIGRATION_HISTORY.md"
    "troubleshooting/EMAIL_NAO_CHEGA.md" = "troubleshooting/EMAIL.md"
}

foreach ($file in $otherMoves.Keys) {
    $source = Join-Path $docsPath $file
    $dest = Join-Path $docsPath $otherMoves[$file]
    
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "  [OK] Movido: $file" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Nao encontrado: $file" -ForegroundColor Yellow
    }
}

# ============================================
# FASE 4: EXCLUIR ARQUIVOS OBSOLETOS
# ============================================

Write-Host "`nExcluindo arquivos obsoletos..." -ForegroundColor Yellow

$filesToDelete = @(
    # Análises antigas
    "ANALISE_PROBLEMAS_PRODUCAO.md",
    "ANALISE_REALISTA_COMPETICAO.md",
    "AUDITORIA_SEGURANCA_URGENTE.md",
    "COPILOT_PROMPT_COMPARISON.md",
    
    # Correções implementadas
    "CORRECAO_ANTI_SPAM.md",
    "CORRECAO_EMAIL_BOTAO_DOMINIO.md",
    "CORRECAO_EMAIL_CORPORATIVO.md",
    "CORRECAO_EMAIL_IMEDIATA.md",
    "CORRECOES_IMPLEMENTADAS_URGENTE.md",
    "CORRECOES_SEGURANCA_CRITICAS.md",
    "LIMPAR_CACHE_FAVICON.md",
    "LOGO_IMPLEMENTADO.md",
    "MELHORIAS_TRATAMENTO_ERROS.md",
    "MELHORIA_CONTRASTE_ERROS.md",
    "MIGRACAO_CORRIGIDA.md",
    "SOLUCAO_ERRO_MIGRACAO.md",
    
    # Resumos temporais
    "REORGANIZACAO_DOCUMENTACAO.md",
    "RESUMO_REORGANIZACAO.md",
    "IMPLEMENTACOES_COMPLETAS_FINAL.md",
    "RESUMO_IMPLEMENTACOES_14_10_2025.md",
    
    # Duplicados
    "README_NOVO.md",
    "DESENVOLVIMENTO.md",
    
    # Email (consolidar depois)
    "EMAIL_BOAS_VINDAS.md",
    "EMAIL_CORPORATIVO_SETUP.md",
    "CONFIGURAR_LOGO_SENDGRID.md",
    "IMPLEMENTACAO_VERIFICACAO_EMAIL.md",
    "VERIFICACAO_EMAIL_COMPLETA.md",
    
    # Features obsoletas
    "features/simulated.md",
    
    # Archive completo
    "archive/MELHORIAS_09_10_FINAL.md",
    "archive/MELHORIAS_IMPLEMENTADAS.md"
)

$deletedCount = 0
foreach ($file in $filesToDelete) {
    $fullPath = Join-Path $docsPath $file
    if (Test-Path $fullPath) {
        Remove-Item -Path $fullPath -Force
        Write-Host "  [OK] Excluido: $file" -ForegroundColor Green
        $deletedCount++
    }
}

Write-Host "  Total excluido: $deletedCount arquivos" -ForegroundColor Cyan

# ============================================
# FASE 5: REMOVER DIRETORIOS VAZIOS
# ============================================

Write-Host "`nLimpando diretorios vazios..." -ForegroundColor Yellow

$emptyDirs = @("archive", "features")
foreach ($dir in $emptyDirs) {
    $fullPath = Join-Path $docsPath $dir
    if ((Test-Path $fullPath) -and ((Get-ChildItem $fullPath).Count -eq 0)) {
        Remove-Item -Path $fullPath -Force
        Write-Host "  [OK] Removido: $dir (vazio)" -ForegroundColor Green
    }
}

# ============================================
# RESUMO FINAL
# ============================================

Write-Host "`nReorganizacao concluida!" -ForegroundColor Green
Write-Host "`nResumo:" -ForegroundColor Cyan
Write-Host "  - Diretorios criados: $($directories.Count)" -ForegroundColor White
Write-Host "  - Arquivos AgentKit movidos: $($agentkitFiles.Count)" -ForegroundColor White
Write-Host "  - Outros arquivos movidos: $($otherMoves.Count)" -ForegroundColor White
Write-Host "  - Arquivos obsoletos excluidos: $deletedCount" -ForegroundColor White

Write-Host "`nProximos passos:" -ForegroundColor Yellow
Write-Host "  1. Revisar arquivos movidos" -ForegroundColor White
Write-Host "  2. Criar novos arquivos consolidados" -ForegroundColor White
Write-Host "  3. Atualizar INDICE_DOCUMENTACAO.md" -ForegroundColor White
Write-Host "  4. Commit das mudancas" -ForegroundColor White

Write-Host "`nPronto!" -ForegroundColor Magenta
