'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ExternalLink, Eye, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Item {
  id: string
  title: string
  description: string
  image_url: string
  price: number
  amazon_url: string
  affiliate_url: string
  is_purchased: boolean
  created_at: string
}

interface List {
  id: string
  title: string
  description: string
  share_token: string
  created_at: string
  user: {
    name: string
    email: string
  }
  items: Item[]
}

export default function AdminListView({ params }: { params: { id: string } }) {
  const [list, setList] = useState<List | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchList()
  }, [params.id])

  const fetchList = async () => {
    try {
      const response = await fetch(`/api/admin/list/${params.id}`)
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

  const viewPublicList = () => {
    if (list?.share_token) {
      window.open(`/list/${list.share_token}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando lista...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-full mb-4 mx-auto w-16 h-16 flex items-center justify-center">
            <Package className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lista não encontrada</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <Button onClick={() => router.push('/admin')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!list) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/admin')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Detalhes da Lista
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {list.title}
                </p>
              </div>
            </div>
            <Button onClick={viewPublicList} variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Ver Pública
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Informações da Lista */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Informações da Lista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Título</p>
                <p className="text-lg">{list.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Criado por</p>
                <p className="text-lg">{list.user?.name} ({list.user?.email})</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Data de criação</p>
                <p className="text-lg">{new Date(list.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Token de compartilhamento</p>
                <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {list.share_token}
                </p>
              </div>
            </div>
            {list.description && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Descrição</p>
                <p className="text-lg">{list.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos ({list.items.length})</CardTitle>
            <CardDescription>
              Produtos adicionados a esta lista
            </CardDescription>
          </CardHeader>
          <CardContent>
            {list.items.length > 0 ? (
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
                            Comprado
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Adicionado em {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Esta lista não possui produtos.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 