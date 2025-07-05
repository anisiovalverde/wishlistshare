# Configuração da Amazon Associates API

## Passos para configurar:

### 1. Cadastre-se no Amazon Associates
- Acesse: https://affiliate-program.amazon.com/
- Clique em "Join Now"
- Preencha seus dados e aguarde aprovação

### 2. Obtenha suas credenciais
Após a aprovação, você receberá:
- **Access Key**
- **Secret Key** 
- **Partner Tag** (seu ID de afiliado)

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
# Amazon Associates API Credentials
AMAZON_ACCESS_KEY=sua_access_key_aqui
AMAZON_SECRET_KEY=sua_secret_key_aqui
AMAZON_PARTNER_TAG=seu_partner_tag_aqui

# Supabase (já configurado)
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase
```

### 4. Configure no Vercel
- Vá para o painel do Vercel
- Selecione seu projeto
- Vá em "Settings" > "Environment Variables"
- Adicione as 3 variáveis da Amazon

### 5. Teste
Após configurar, teste adicionando um link da Amazon no seu site.

## Como funciona:
1. Usuário adiciona link da Amazon
2. Sistema extrai o ASIN (ID do produto)
3. Faz consulta na API oficial da Amazon
4. Retorna dados reais: título, preço, imagem
5. Gera link de afiliado automaticamente

## Vantagens da API oficial:
- ✅ Dados 100% precisos
- ✅ Sem bloqueios
- ✅ Links de afiliado automáticos
- ✅ Conformidade com termos da Amazon
- ✅ Performance melhor 