import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { name, email, links } = await request.json()

    // Validações
    if (!name || !email || !links || !Array.isArray(links) || links.length === 0) {
      return NextResponse.json(
        { error: 'Dados inválidos. Nome, email e pelo menos um link são obrigatórios.' },
        { status: 400 }
      )
    }

    // 1. Criar ou buscar usuário
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      console.error('Erro ao buscar usuário:', userError)
      return NextResponse.json(
        { error: 'Erro ao processar usuário' },
        { status: 500 }
      )
    }

    let userId: string

    if (!user) {
      // Criar novo usuário
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert([{ name, email }])
        .select('id')
        .single()

      if (createUserError) {
        console.error('Erro ao criar usuário:', createUserError)
        return NextResponse.json(
          { error: 'Erro ao criar usuário' },
          { status: 500 }
        )
      }

      userId = newUser.id
    } else {
      userId = user.id
    }

    // 2. Criar lista
    const { data: list, error: listError } = await supabase
      .from('lists')
      .insert([{
        user_id: userId,
        title: `Lista de ${name}`,
        description: `Lista de presentes criada por ${name}`,
        is_public: true,
        share_token: crypto.randomUUID()
      }])
      .select('id, share_token')
      .single()

    if (listError) {
      console.error('Erro ao criar lista:', listError)
      return NextResponse.json(
        { error: 'Erro ao criar lista' },
        { status: 500 }
      )
    }

    // 3. Processar links e criar itens
    const itemsToInsert = []

    for (const link of links) {
      try {
        // Por enquanto, vamos simular o processamento do link
        // TODO: Implementar Edge Function para processar links da Amazon
        const processedItem = {
          list_id: list.id,
          title: `Produto da Amazon - ${Math.random().toString(36).substring(7)}`,
          description: 'Produto processado automaticamente',
          image_url: 'https://via.placeholder.com/300x300?text=Produto',
          price: Math.floor(Math.random() * 1000) + 50,
          amazon_url: link,
          affiliate_url: link, // TODO: Converter para link de afiliado
          is_purchased: false
        }

        itemsToInsert.push(processedItem)
      } catch (error) {
        console.error('Erro ao processar link:', link, error)
        // Continuar com outros links mesmo se um falhar
      }
    }

    // 4. Inserir itens
    if (itemsToInsert.length > 0) {
      const { error: itemsError } = await supabase
        .from('items')
        .insert(itemsToInsert)

      if (itemsError) {
        console.error('Erro ao inserir itens:', itemsError)
        // Não falhar completamente, apenas logar o erro
      }
    }

    // 5. Retornar URL de compartilhamento
    const shareUrl = `${request.nextUrl.origin}/list/${list.share_token}`

    return NextResponse.json({
      success: true,
      message: 'Lista criada com sucesso!',
      shareUrl,
      listId: list.id
    })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 