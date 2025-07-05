# Configuração do WishlistShare

## 1. Configurar Supabase

### 1.1 Criar projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Escolha uma organização
5. Digite um nome para o projeto (ex: "wishlistshare")
6. Escolha uma senha forte para o banco de dados
7. Escolha uma região próxima (ex: São Paulo)
8. Clique em "Create new project"

### 1.2 Obter as chaves de API
1. No painel do Supabase, vá em **Settings** > **API**
2. Copie a **URL** do projeto
3. Copie a **anon public** key
4. Copie a **service_role** key (mantenha segura!)

### 1.3 Criar arquivo .env.local
1. No diretório do projeto, crie um arquivo chamado `.env.local`
2. Adicione o conteúdo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[SEU_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUA_CHAVE_ANONIMA_PUBLICA]
SUPABASE_SERVICE_ROLE_KEY=[SUA_CHAVE_DE_SERVICO_PRIVADA]
```

**Substitua os valores entre colchetes pelas suas chaves reais!**

### 1.4 Criar as tabelas no banco
1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Cole e execute este SQL:

```sql
-- Criar tabela de usuários
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de listas
CREATE TABLE lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  share_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de itens
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10,2),
  amazon_url TEXT,
  affiliate_url TEXT,
  is_purchased BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários (permitir inserção e leitura)
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (true);

-- Políticas para listas (permitir inserção e leitura pública)
CREATE POLICY "Anyone can insert lists" ON lists
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public lists are viewable by everyone" ON lists
  FOR SELECT USING (is_public = true);

-- Políticas para itens (permitir inserção e leitura pública)
CREATE POLICY "Anyone can insert items" ON items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Items in public lists are viewable by everyone" ON items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lists 
      WHERE lists.id = items.list_id 
      AND lists.is_public = true
    )
  );
```

## 2. Testar a configuração

### 2.1 Reiniciar o servidor
```bash
npm run dev
```

### 2.2 Testar a conexão
Acesse: http://localhost:3000/api/test-connection

Você deve ver uma resposta como:
```json
{
  "success": true,
  "message": "Conexão com Supabase funcionando!",
  "data": []
}
```

## 3. Se ainda houver erro

### 3.1 Verificar variáveis de ambiente
- O arquivo `.env.local` existe?
- As chaves estão corretas?
- Não há espaços extras?

### 3.2 Verificar tabelas
- As tabelas foram criadas no Supabase?
- O SQL foi executado sem erros?

### 3.3 Verificar logs
- Abra o console do navegador (F12)
- Veja se há erros de rede
- Verifique os logs do servidor Next.js

## 4. Próximos passos

Após resolver o erro de conexão:
1. Testar criação de listas
2. Testar adição de produtos
3. Configurar área administrativa
4. Implementar conversão de links da Amazon 