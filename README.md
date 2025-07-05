# WishlistShare

Uma plataforma moderna para criar e compartilhar listas de presentes com links da Amazon convertidos para afiliados.

## 🚀 Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Estilização**: TailwindCSS + ShadCN UI
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Deploy**: Vercel
- **Integração**: Amazon Product Advertising API

## 📋 Funcionalidades

### Públicas
- ✅ Criar listas de presentes com nome e e-mail
- ✅ Adicionar múltiplos links da Amazon
- ✅ URLs únicas para cada lista
- ✅ Compartilhamento via WhatsApp, Telegram, e-mail
- ✅ Conversão automática para links de afiliado

### Administrativas
- ✅ Painel protegido por autenticação
- ✅ Estatísticas de uso
- ✅ Visualização de todas as listas
- ✅ Dados agregados por período

## 🛠️ Configuração Local

### 1. Clone e instale as dependências
```bash
git clone <seu-repositorio>
cd wishlistshare
npm install
```

### 2. Configure as variáveis de ambiente
```bash
cp env.example .env.local
```

Edite o `.env.local` com suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Configure o Supabase

No painel do Supabase, execute este SQL:

```sql
-- Usuários
create table users (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text unique
);

-- Listas de presentes
create table lists (
  id uuid primary key default uuid_generate_v4(),
  user_email text references users(email),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Itens da lista
create table items (
  id uuid primary key default uuid_generate_v4(),
  list_id uuid references lists(id) on delete cascade,
  product_title text,
  image_url text,
  original_url text,
  affiliate_url text,
  price numeric
);

-- Indexes
create index idx_lists_user_email on lists(user_email);
create index idx_items_list_id on items(list_id);
```

### 4. Execute o projeto
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🚀 Deploy na Vercel

1. Conecte seu repositório GitHub na Vercel
2. Configure as variáveis de ambiente no painel da Vercel
3. Deploy automático a cada push

## 📁 Estrutura do Projeto

```
wishlistshare/
├── app/
│   ├── admin/          # Área administrativa
│   ├── page.tsx        # Página inicial
│   └── globals.css     # Estilos globais
├── components/
│   └── ui/             # Componentes ShadCN UI
├── lib/
│   ├── supabase.ts     # Configuração Supabase
│   └── utils.ts        # Utilitários
└── public/             # Arquivos estáticos
```

## 🔧 Próximos Passos

- [ ] Implementar Edge Function para processar links da Amazon
- [ ] Adicionar autenticação na área admin
- [ ] Implementar sistema de compartilhamento
- [ ] Integrar com Amazon Product Advertising API
- [ ] Adicionar analytics e métricas

## 📝 Licença

MIT
