#!/bin/bash

# Script de Deploy em Produção
# Aplica migrações no banco de produção

echo "🚀 Iniciando deploy em produção..."
echo ""

# Verificar se DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Erro: DATABASE_URL não está configurada"
  echo "Configure a variável de ambiente DATABASE_URL com a string de conexão de produção"
  exit 1
fi

echo "✅ DATABASE_URL configurada"
echo ""

# Gerar Prisma Client
echo "📦 Gerando Prisma Client..."
npx prisma generate
echo "✅ Prisma Client gerado"
echo ""

# Aplicar migrações
echo "🔄 Aplicando migrações no banco de produção..."
npx prisma migrate deploy
echo "✅ Migrações aplicadas"
echo ""

# Verificar status
echo "📊 Verificando status das migrações..."
npx prisma migrate status
echo ""

echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "⚠️  Lembre-se de:"
echo "  1. Reiniciar a aplicação"
echo "  2. Verificar logs"
echo "  3. Testar cadastro de novo usuário"
