import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || !url.includes('amazon')) {
      return NextResponse.json(
        { error: 'URL da Amazon inválida' },
        { status: 400 }
      )
    }

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
    // Fazer requisição para a página da Amazon
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error('Falha ao acessar página da Amazon')
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extrair título do produto
    let title = ''
    const titleSelectors = [
      '#productTitle',
      'h1.a-size-large',
      'h1.a-size-medium',
      '.a-size-large.a-spacing-none',
      'h1'
    ]
    
    for (const selector of titleSelectors) {
      const element = $(selector).first()
      if (element.length > 0) {
        title = element.text().trim()
        break
      }
    }

    // Extrair preço
    let price = 0
    const priceSelectors = [
      '.a-price-whole',
      '.a-price .a-offscreen',
      '.a-price-current .a-offscreen',
      '.a-price-current .a-price-whole',
      '[data-a-color="price"] .a-offscreen'
    ]
    
    for (const selector of priceSelectors) {
      const element = $(selector).first()
      if (element.length > 0) {
        const priceText = element.text().trim()
        // Remover símbolos e converter para número
        const priceNumber = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.'))
        if (!isNaN(priceNumber)) {
          price = priceNumber
          break
        }
      }
    }

    // Extrair imagem
    let imageUrl = ''
    const imageSelectors = [
      '#landingImage',
      '#imgBlkFront',
      '.a-dynamic-image',
      'img[data-old-hires]',
      'img[src*="images-na.ssl-amazon"]'
    ]
    
    for (const selector of imageSelectors) {
      const element = $(selector).first()
      if (element.length > 0) {
        imageUrl = element.attr('src') || element.attr('data-old-hires') || ''
        if (imageUrl) break
      }
    }

    // Se não conseguiu extrair dados reais, usar fallback
    if (!title) {
      title = 'Produto da Amazon'
    }
    if (!imageUrl) {
      imageUrl = 'https://via.placeholder.com/400x400?text=Produto'
    }

    return {
      title: title,
      price: price,
      image_url: imageUrl,
      description: title,
      affiliate_url: url
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