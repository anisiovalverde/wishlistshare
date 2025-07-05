import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json(
        { error: 'Token da lista é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar lista pelo token
    const { data: list, error: listError } = await supabase
      .from('lists')
      .select(`
        id,
        title,
        description,
        is_public,
        created_at,
        users (
          id,
          name,
          email
        )
      `)
      .eq('share_token', token)
      .eq('is_public', true)
      .single()

    if (listError) {
      console.error('Erro ao buscar lista:', listError)
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 }
      )
    }

    if (!list) {
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 }
      )
    }

    // Buscar itens da lista
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select(`
        id,
        title,
        description,
        image_url,
        price,
        amazon_url,
        affiliate_url,
        is_purchased,
        created_at
      `)
      .eq('list_id', list.id)
      .order('created_at', { ascending: true })

    if (itemsError) {
      console.error('Erro ao buscar itens:', itemsError)
      // Não falhar completamente, apenas logar o erro
    }

    // Formatar resposta
    const user = Array.isArray(list.users) ? list.users[0] : list.users
    const formattedList = {
      id: list.id,
      title: list.title,
      description: list.description,
      user: {
        name: user?.name || 'Usuário',
        email: user?.email || ''
      },
      items: items || []
    }

    return NextResponse.json({
      success: true,
      list: formattedList
    })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 