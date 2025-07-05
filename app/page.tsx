'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Heart, Copy, Check } from 'lucide-react'

export default function Home() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [links, setLinks] = useState([''])
  const [isLoading, setIsLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  const addLink = () => {
    setLinks([...links, ''])
  }

  const removeLink = (index: number) => {
    if (links.length > 1) {
      const newLinks = links.filter((_, i) => i !== index)
      setLinks(newLinks)
    }
  }

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links]
    newLinks[index] = value
    setLinks(newLinks)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const validLinks = links.filter(link => link.trim() !== '')
      
      if (validLinks.length === 0) {
        alert('Adicione pelo menos um link da Amazon')
        return
      }

      const response = await fetch('/api/create-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, links: validLinks }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar lista')
      }

      // Mostrar sucesso com URL de compartilhamento
      setShareUrl(data.shareUrl)
      setShowSuccess(true)
      
      // Limpar formulário
      setName('')
      setEmail('')
      setLinks([''])
      
    } catch (error) {
      console.error('Erro ao criar lista:', error)
      alert(error instanceof Error ? error.message : 'Erro ao criar lista. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Lista Criada com Sucesso!</CardTitle>
                <CardDescription>
                  Sua lista de presentes foi criada e está pronta para compartilhar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Link para compartilhar:</p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="icon"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => window.open(shareUrl, '_blank')}
                    className="flex items-center"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Ver Minha Lista
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSuccess(false)}
                  >
                    Criar Nova Lista
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-12 w-12 text-red-500 mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WishlistShare
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Crie sua lista de presentes e compartilhe facilmente
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Criar Lista de Presentes</CardTitle>
              <CardDescription>
                Preencha seus dados e adicione os links dos produtos da Amazon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome</label>
                    <Input
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">E-mail</label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Links da Amazon</label>
                  <div className="space-y-2">
                    {links.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="url"
                          placeholder="https://amazon.com/..."
                          value={link}
                          onChange={(e) => updateLink(index, e.target.value)}
                          className="flex-1"
                        />
                        {links.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeLink(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addLink}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Link
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Criando lista...' : 'Criar Lista'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Admin Link */}
          <div className="text-center mt-8">
            <a
              href="/admin"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Área Administrativa
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
