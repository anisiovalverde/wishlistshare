'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Share2, ExternalLink, Copy, Check, MessageCircle, Mail, Send } from 'lucide-react'

interface Item {
  id: string
  title: string
  description: string
  image_url: string
  price: number
  amazon_url: string
  affiliate_url: string
  is_purchased: boolean
}

interface List {
  id: string
  title: string
  description: string
  user: {
    name: string
    email: string
  }
  items: Item[]
}

export default function ListPage({ params }: { params: { token: string } }) {
  const [list, setList] = useState<List | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchList()
  }, [params.token])

  const fetchList = async () => {
    try {
      const response = await fetch(`/api/list/${params.token}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Lista não encontrada')
      }

      setList(data.list)
    } catch (error) {
      console.error('Erro ao carregar lista:', error)
      setError(error instanceof Error ? error.message : 'Erro ao carregar lista')
    } finally {
      setLoading(false)
    }
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  const shareWhatsApp = () => {
    const text = `Confira minha lista de presentes: ${shareUrl}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const shareTelegram = () => {
    const text = `Confira minha lista de presentes: ${shareUrl}`
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const shareEmail = () => {
    const subject = 'Lista de Presentes'
    const body = `Olá! Confira minha lista de presentes: ${shareUrl}`
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando lista...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-full mb-4 mx-auto w-16 h-16 flex items-center justify-center">
            <Heart className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lista não encontrada</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <Button onClick={() => window.location.href = '/'}>
            Voltar ao início
          </Button>
        </div>
      </div>
    )
  }

  if (!list) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-red-500 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {list.title}
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            Lista de presentes de <strong>{list.user.name}</strong>
          </p>
          {list.description && (
            <p className="text-gray-500 dark:text-gray-400">{list.description}</p>
          )}

          {/* Botões de compartilhamento */}
          <div className="flex flex-wrap justify-center gap-2 mt-6 mb-2">
            <Button onClick={copyToClipboard} variant="outline" size="sm">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copiado!' : 'Copiar Link'}
            </Button>
            <Button onClick={shareWhatsApp} variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button onClick={shareTelegram} variant="outline" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Telegram
            </Button>
            <Button onClick={shareEmail} variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              E-mail
            </Button>
          </div>
        </div>

        {/* Lista de produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Produto'
                  }}
                />
              </div>
              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2 line-clamp-2">
                  {item.title}
                </CardTitle>
                {item.description && (
                  <CardDescription className="mb-3 line-clamp-2">
                    {item.description}
                  </CardDescription>
                )}
                {item.price && (
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-3">
                    R$ {item.price.toFixed(2).replace('.', ',')}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.open(item.affiliate_url, '_blank')}
                    className="flex-1"
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Produto
                  </Button>
                  {item.is_purchased && (
                    <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded text-sm flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Comprado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {list.items.length === 0 && (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Esta lista ainda não tem produtos.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Criar Minha Lista
          </Button>
        </div>
      </div>
    </div>
  )
} 