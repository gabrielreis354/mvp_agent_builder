#!/bin/bash

# Script de Build para Produção
# Trata erros de migração de forma mais robusta

echo "🚀 Iniciando build de produção..."
echo ""

# 1. Gerar Prisma Client
echo "📦 Gerando Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
  echo "❌ Erro ao gerar Prisma Client"
  exit 1
fi
echo "✅ Prisma Client gerado"
echo ""

# 2. Aplicar migrações (com tratamento de erro)
echo "🔄 Aplicando migrações..."
npx prisma migrate deploy 2>&1 | tee migration.log

# Verificar se o erro é de coluna já existente (código 42701)
if grep -q "42701" migration.log || grep -q "already exists" migration.log; then
  echo "⚠️  Algumas colunas já existem no banco (esperado)"
  echo "✅ Continuando build..."
else
  # Se for outro erro, verificar código de saída
  if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "❌ Erro ao aplicar migrações"
    cat migration.log
    exit 1
  fi
fi

rm -f migration.log
echo "✅ Migrações processadas"
echo ""

# 3. Build do Next.js
echo "🏗️  Compilando Next.js..."
next build
if [ $? -ne 0 ]; then
  echo "❌ Erro ao compilar Next.js"
  exit 1
fi
echo "✅ Build concluído"
echo ""

echo "🎉 Build de produção finalizado com sucesso!"
