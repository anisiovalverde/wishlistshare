const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    if (error) {
      console.error('Erro do Supabase:', error)
    } else {
      console.log('Conexão bem-sucedida! Dados:', data)
    }
  } catch (err) {
    console.error('Erro inesperado:', err)
  }
}

main() 