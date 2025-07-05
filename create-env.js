const fs = require('fs')
const path = require('path')

const envContent = `# Supabase Configuration
# Obtenha essas chaves no painel do Supabase: https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://[SEU_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUA_CHAVE_ANONIMA_PUBLICA]

# Chave de serviço (para operações administrativas)
SUPABASE_SERVICE_ROLE_KEY=[SUA_CHAVE_DE_SERVICO_PRIVADA]

# Amazon Product Advertising API (opcional - para conversão de links)
AMAZON_ACCESS_KEY_ID=[SUA_ACCESS_KEY]
AMAZON_SECRET_ACCESS_KEY=[SUA_SECRET_KEY]
AMAZON_ASSOCIATE_TAG=[SEU_ASSOCIATE_TAG]
`

const envPath = path.join(__dirname, '.env.local')

if (fs.existsSync(envPath)) {
  console.log('⚠️  Arquivo .env.local já existe!')
  console.log('Se você quiser recriar, delete o arquivo atual primeiro.')
} else {
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Arquivo .env.local criado com sucesso!')
  console.log('')
  console.log('📝 Próximos passos:')
  console.log('1. Edite o arquivo .env.local e substitua os valores entre colchetes')
  console.log('2. Obtenha suas credenciais em: https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/settings/api')
  console.log('3. Reinicie o servidor: npm run dev')
  console.log('4. Teste a conexão: http://localhost:3000/api/debug-env')
} 