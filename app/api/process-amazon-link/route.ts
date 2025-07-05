import { NextRequest, NextResponse } from 'next/server'
import CryptoJS from 'crypto-js'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    console.log('Processando URL:', url)

    if (!url || !url.includes('amazon')) {
      console.log('URL inválida:', url)
      return NextResponse.json(
        { error: 'URL da Amazon inválida' },
        { status: 400 }
      )
    }

    const productData = await extractProductData(url)
    console.log('Dados extraídos:', productData)

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
    console.log('Iniciando extração para URL:', url)
    
    // Extrair ASIN da URL da Amazon
    const asin = extractASIN(url)
    console.log('ASIN extraído:', asin)
    
    if (!asin) {
      console.log('ASIN não encontrado, usando fallback')
      return {
        title: 'Produto da Amazon',
        price: 'Preço não disponível',
        image_url: 'https://via.placeholder.com/400x400?text=Produto',
        description: 'Produto processado automaticamente',
        affiliate_url: url
      }
    }

    // Verificar se as credenciais estão configuradas
    const accessKey = process.env.AMAZON_ACCESS_KEY
    const secretKey = process.env.AMAZON_SECRET_KEY
    const partnerTag = process.env.AMAZON_PARTNER_TAG
    
    console.log('Credenciais configuradas:', {
      accessKey: accessKey ? 'Sim' : 'Não',
      secretKey: secretKey ? 'Sim' : 'Não', 
      partnerTag: partnerTag ? 'Sim' : 'Não'
    })

    if (!accessKey || !secretKey || !partnerTag) {
      console.log('Credenciais não configuradas, usando fallback')
      return {
        title: 'Produto da Amazon',
        price: 'Preço não disponível',
        image_url: 'https://via.placeholder.com/400x400?text=Produto',
        description: 'Produto processado automaticamente',
        affiliate_url: url
      }
    }

    // Fazer requisição para a API da Amazon
    console.log('Chamando API da Amazon...')
    const productData = await callAmazonAPI(asin)
    console.log('Dados da API:', productData)

    // Gerar link de afiliado
    const affiliateUrl = generateAffiliateUrl(url, partnerTag)
    console.log('Link de afiliado gerado:', affiliateUrl)

    return {
      title: productData.title,
      price: productData.price,
      image_url: productData.imageUrl,
      description: productData.description,
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

async function callAmazonAPI(asin: string) {
  const accessKey = process.env.AMAZON_ACCESS_KEY
  const secretKey = process.env.AMAZON_SECRET_KEY
  const partnerTag = process.env.AMAZON_PARTNER_TAG

  if (!accessKey || !secretKey || !partnerTag) {
    throw new Error('Credenciais da Amazon não configuradas')
  }

  // Tentar diferentes marketplaces
  const marketplaces = [
    { endpoint: 'webservices.amazon.com', region: 'us-east-1', marketplace: 'www.amazon.com' },
    { endpoint: 'webservices.amazon.com.br', region: 'us-east-1', marketplace: 'www.amazon.com.br' },
    { endpoint: 'webservices.amazon.co.uk', region: 'eu-west-1', marketplace: 'www.amazon.co.uk' }
  ]

  for (const marketplace of marketplaces) {
    try {
      console.log(`Tentando marketplace: ${marketplace.marketplace}`)
      
      const result = await tryMarketplace(asin, marketplace, accessKey, secretKey, partnerTag)
      if (result) {
        console.log(`Sucesso no marketplace: ${marketplace.marketplace}`)
        return result
      }
    } catch (error) {
      console.log(`Erro no marketplace ${marketplace.marketplace}:`, error instanceof Error ? error.message : 'Erro desconhecido')
      continue
    }
  }

  throw new Error('Produto não encontrado em nenhum marketplace')
}

async function tryMarketplace(asin: string, marketplace: any, accessKey: string, secretKey: string, partnerTag: string) {
  const endpoint = marketplace.endpoint
  const uri = '/paapi5/getitems'
  const service = 'ProductAdvertisingAPI'
  const region = marketplace.region
  const payload = JSON.stringify({
    ItemIds: [asin],
    Resources: ['ItemInfo.Title', 'Offers.Listings.Price', 'Images.Primary.Large'],
    Marketplace: marketplace.marketplace,
    PartnerTag: partnerTag,
    PartnerType: 'Associates'
  })

  const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
  const date = timestamp.slice(0, 8)

  // Criar string para assinatura
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    timestamp,
    `${date}/${region}/${service}/aws4_request`,
    CryptoJS.SHA256(payload).toString(CryptoJS.enc.Hex)
  ].join('\n')

  // Calcular assinatura
  const dateKey = CryptoJS.HmacSHA256(date, `AWS4${secretKey}`)
  const dateRegionKey = CryptoJS.HmacSHA256(region, dateKey)
  const dateRegionServiceKey = CryptoJS.HmacSHA256(service, dateRegionKey)
  const signingKey = CryptoJS.HmacSHA256('aws4_request', dateRegionServiceKey)
  const signature = CryptoJS.HmacSHA256(stringToSign, signingKey).toString(CryptoJS.enc.Hex)

  // Criar headers
  const authorization = [
    'AWS4-HMAC-SHA256',
    `Credential=${accessKey}/${date}/${region}/${service}/aws4_request`,
    `SignedHeaders=content-type;host;x-amz-date;x-amz-target`,
    `Signature=${signature}`
  ].join(', ')

  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Amz-Date': timestamp,
    'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems',
    'Authorization': authorization
  }

  // Fazer requisição
  const response = await fetch(`https://${endpoint}${uri}`, {
    method: 'POST',
    headers,
    body: payload
  })

  console.log(`Status da resposta para ${marketplace.marketplace}:`, response.status)

  if (!response.ok) {
    throw new Error(`Erro na API da Amazon: ${response.status}`)
  }

  const data = await response.json()
  console.log(`Resposta da API para ${marketplace.marketplace}:`, JSON.stringify(data, null, 2))

  if (data.ItemsResult && data.ItemsResult.Items && data.ItemsResult.Items.length > 0) {
    const item = data.ItemsResult.Items[0]
    
    return {
      title: item.ItemInfo?.Title?.DisplayValue || 'Produto da Amazon',
      price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || 'Preço não disponível',
      imageUrl: item.Images?.Primary?.Large?.URL || 'https://via.placeholder.com/400x400?text=Produto',
      description: item.ItemInfo?.Title?.DisplayValue || 'Produto da Amazon'
    }
  }

  return null
}

function extractASIN(url: string): string | null {
  console.log('Extraindo ASIN de:', url)
  
  // Padrões comuns de URLs da Amazon
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/,
    /\/gp\/product\/([A-Z0-9]{10})/,
    /\/ASIN\/([A-Z0-9]{10})/,
    /\/ref=.*\/([A-Z0-9]{10})/,
    /\/product\/([A-Z0-9]{10})/,
    /\/d\/([A-Z0-9]{10})/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      console.log('ASIN encontrado com padrão:', pattern, 'Resultado:', match[1])
      return match[1]
    }
  }

  console.log('Nenhum ASIN encontrado')
  return null
}

function generateAffiliateUrl(originalUrl: string, partnerTag: string): string {
  if (!partnerTag) return originalUrl

  const url = new URL(originalUrl)
  url.searchParams.set('tag', partnerTag)
  
  return url.toString()
} 