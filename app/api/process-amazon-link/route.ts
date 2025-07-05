import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || !url.includes('amazon')) {
      return NextResponse.json(
        { error: 'URL da Amazon inválida' },
        { status: 400 }
      )
    }

    // Por enquanto, vamos simular o processamento
    // TODO: Implementar extração real com web scraping ou Amazon API
    const productData = await extractProductData(url)

    return NextResponse.json({
      success: true,
      data: productData
    })

  } catch (error) {
    console.error('Erro ao processar link:', error)
    return NextResponse.json(
      { error: 'Erro ao processar link da Amazon' },
      { status: 500 }
    )
  }
}

async function extractProductData(url: string) {
  try {
    // Simular extração de dados (substituir por implementação real)
    const urlParts = url.split('/')
    const productId = urlParts.find(part => part.startsWith('B0')) || 'B08N5WRWNW'
    
    // Gerar dados baseados no ID do produto
    const titles = [
      'Smartphone Samsung Galaxy A54',
      'Fone de Ouvido Bluetooth JBL',
      'Smart TV LG 55" 4K',
      'Notebook Dell Inspiron',
      'Câmera Canon EOS Rebel',
      'Console PlayStation 5',
      'Tablet iPad Air',
      'Smartwatch Apple Watch',
      'Drone DJI Mini',
      'Kindle Paperwhite'
    ]
    
    const randomTitle = titles[Math.floor(Math.random() * titles.length)]
    const randomPrice = Math.floor(Math.random() * 2000) + 100
    
    return {
      title: randomTitle,
      price: randomPrice,
      image_url: `https://via.placeholder.com/400x400/2563eb/ffffff?text=${encodeURIComponent(randomTitle)}`,
      description: `Produto ${randomTitle} com excelente qualidade e preço competitivo.`,
      affiliate_url: url // Por enquanto, manter URL original
    }
  } catch (error) {
    console.error('Erro na extração:', error)
    return {
      title: 'Produto da Amazon',
      price: 0,
      image_url: 'https://via.placeholder.com/400x400?text=Produto',
      description: 'Produto processado automaticamente',
      affiliate_url: url
    }
  }
} 