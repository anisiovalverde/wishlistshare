import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  const hasUrl = !!envVars.NEXT_PUBLIC_SUPABASE_URL
  const hasAnonKey = !!envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasServiceKey = !!envVars.SUPABASE_SERVICE_ROLE_KEY

  return NextResponse.json({
    success: true,
    message: 'Debug das variáveis de ambiente',
    envVars: {
      ...envVars,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: hasAnonKey ? '***CONFIGURADA***' : 'NÃO CONFIGURADA',
      SUPABASE_SERVICE_ROLE_KEY: hasServiceKey ? '***CONFIGURADA***' : 'NÃO CONFIGURADA',
    },
    status: {
      hasUrl,
      hasAnonKey,
      hasServiceKey,
      allConfigured: hasUrl && hasAnonKey && hasServiceKey
    },
    instructions: !hasUrl || !hasAnonKey || !hasServiceKey ? {
      message: 'Você precisa configurar as variáveis de ambiente',
      steps: [
        '1. Crie um arquivo .env.local no diretório raiz do projeto',
        '2. Adicione suas credenciais do Supabase',
        '3. Reinicie o servidor (npm run dev)'
      ]
    } : null
  })
} 