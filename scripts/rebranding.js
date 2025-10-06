#!/usr/bin/env node

/**
 * Script de Rebranding Automatizado
 * SimplifiqueIA RH
 * 
 * Substitui referências de AutomateAI por SimplifiqueIA RH
 * em arquivos de frontend
 */

const fs = require('fs')
const path = require('path')

// Configuração de substituições
const REPLACEMENTS = [
  // Nome do produto
  { from: /AutomateAI MVP/g, to: 'SimplifiqueIA RH' },
  { from: /AutomateAI/g, to: 'SimplifiqueIA RH' },
  { from: /Automate AI/g, to: 'Simplifique IA' },
  
  // Domínios
  { from: /automationia\.com\.br/g, to: 'simplifiqueia.com.br' },
  { from: /automateai\.com/g, to: 'simplifiqueia.com.br' },
  
  // Emails
  { from: /contato@automationia\.com\.br/g, to: 'contato@simplifiqueia.com.br' },
  { from: /suporte@automationia\.com\.br/g, to: 'suporte@simplifiqueia.com.br' },
  
  // Slugs e IDs (lowercase)
  { from: /automateai-/g, to: 'simplifiqueia-' },
  { from: /"automateai"/g, to: '"simplifiqueia"' },
  
  // Taglines
  { from: /O Canva da Automação/g, to: 'O Canva da Automação para RH' },
]

// Diretórios para processar
const DIRECTORIES = [
  'src/app',
  'src/components',
  'src/lib',
]

// Extensões de arquivo para processar
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.json', '.md']

// Arquivos para ignorar
const IGNORE_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
  'package-lock.json',
]

/**
 * Verifica se o arquivo deve ser processado
 */
function shouldProcessFile(filePath) {
  // Ignorar padrões
  if (IGNORE_PATTERNS.some(pattern => filePath.includes(pattern))) {
    return false
  }
  
  // Verificar extensão
  const ext = path.extname(filePath)
  return EXTENSIONS.includes(ext)
}

/**
 * Processa um arquivo aplicando as substituições
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    let modified = false
    
    // Aplicar cada substituição
    REPLACEMENTS.forEach(({ from, to }) => {
      if (content.match(from)) {
        content = content.replace(from, to)
        modified = true
      }
    })
    
    // Salvar se modificado
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log(`✅ Atualizado: ${filePath}`)
      return 1
    }
    
    return 0
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message)
    return 0
  }
}

/**
 * Processa recursivamente um diretório
 */
function processDirectory(dirPath) {
  let count = 0
  
  const items = fs.readdirSync(dirPath)
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory()) {
      count += processDirectory(fullPath)
    } else if (stat.isFile() && shouldProcessFile(fullPath)) {
      count += processFile(fullPath)
    }
  })
  
  return count
}

/**
 * Função principal
 */
function main() {
  console.log('🎨 Iniciando Rebranding: AutomateAI → SimplifiqueIA RH\n')
  
  let totalFiles = 0
  
  // Processar cada diretório
  DIRECTORIES.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir)
    
    if (fs.existsSync(fullPath)) {
      console.log(`📁 Processando: ${dir}`)
      const count = processDirectory(fullPath)
      totalFiles += count
      console.log(`   ${count} arquivo(s) atualizado(s)\n`)
    } else {
      console.log(`⚠️  Diretório não encontrado: ${dir}\n`)
    }
  })
  
  // Processar arquivos raiz importantes
  const rootFiles = [
    'package.json',
    'README.md',
    '.env.example',
  ]
  
  console.log('📄 Processando arquivos raiz:')
  rootFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file)
    if (fs.existsSync(filePath)) {
      totalFiles += processFile(filePath)
    }
  })
  
  console.log(`\n✨ Rebranding concluído!`)
  console.log(`📊 Total: ${totalFiles} arquivo(s) atualizado(s)`)
  console.log(`\n⚠️  IMPORTANTE: Revise as mudanças antes de fazer commit!`)
  console.log(`\n📝 Próximos passos:`)
  console.log(`   1. Revisar mudanças: git diff`)
  console.log(`   2. Testar aplicação: npm run dev`)
  console.log(`   3. Verificar build: npm run build`)
  console.log(`   4. Commit: git add . && git commit -m "Rebranding para SimplifiqueIA RH"`)
}

// Executar
main()
