import { NextRequest, NextResponse } from 'next/server'
import { AmazonPaapi } from 'amazon-paapi'

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
    // Extrair ASIN da URL da Amazon
    const asin = extractASIN(url)
    
    if (!asin) {
      throw new Error('Não foi possível extrair o ASIN da URL')
    }

    // Configurar Amazon PAAPI
    const commonParams = {
      AccessKey: process.env.AMAZON_ACCESS_KEY || '',
      SecretKey: process.env.AMAZON_SECRET_KEY || '',
      PartnerTag: process.env.AMAZON_PARTNER_TAG || '',
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com'
    }

    // Buscar produto por ASIN
    const searchResult = await AmazonPaapi.SearchItems({
      ...commonParams,
      Keywords: asin,
      SearchIndex: 'All',
      ItemCount: 1
    })

    if (!searchResult.ItemsResult || searchResult.ItemsResult.Items.length === 0) {
      throw new Error('Produto não encontrado')
    }

    const item = searchResult.ItemsResult.Items[0]
    
    // Extrair dados do produto
    const title = item.ItemInfo?.Title?.DisplayValue || 'Produto da Amazon'
    const price = item.Offers?.Listings?.[0]?.Price?.DisplayAmount || 'Preço não disponível'
    const imageUrl = item.Images?.Primary?.Large?.URL || 'https://via.placeholder.com/400x400?text=Produto'
    const description = item.ItemInfo?.Features?.DisplayValues?.[0] || title

    // Gerar link de afiliado
    const affiliateUrl = generateAffiliateUrl(url, process.env.AMAZON_PARTNER_TAG || '')

    return {
      title: title,
      price: price,
      image_url: imageUrl,
      description: description,
      affiliate_url: affiliateUrl
    }

  } catch (error) {
    console.error('Erro na extração:', error)
    return {
      title: 'Produto da Amazon',
      price: 'Preço não disponível',
      image_url: 'https://via.placeholder.com/400x400?text=Produto',
      description: 'Produto processado automaticamente',
      affiliate_url: url
    }
  }
}

function extractASIN(url: string): string | null {
  // Padrões comuns de URLs da Amazon
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/,
    /\/gp\/product\/([A-Z0-9]{10})/,
    /\/ASIN\/([A-Z0-9]{10})/,
    /\/ref=.*\/([A-Z0-9]{10})/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

function generateAffiliateUrl(originalUrl: string, partnerTag: string): string {
  if (!partnerTag) return originalUrl

  const url = new URL(originalUrl)
  url.searchParams.set('tag', partnerTag)
  
  return url.toString()
} 