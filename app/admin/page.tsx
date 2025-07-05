'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, List, Package, TrendingUp, LogOut, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Stats {
  totalUsers: number
  totalLists: number
  totalItems: number
  totalValue: number
}

interface RecentList {
  id: string
  title: string
  created_at: string
  user: {
    name: string
    email: string
  }
  itemCount: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentLists, setRecentLists] = useState<RecentList[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchStats()
    fetchRecentLists()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/admin/login')
      return
    }
    setUser(user)
  }

  const fetchStats = async () => {
    try {
      // Buscar estatísticas
      const [usersResult, listsResult, itemsResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('lists').select('id', { count: 'exact' }),
        supabase.from('items').select('price', { count: 'exact' })
      ])

      const totalValue = itemsResult.data?.reduce((sum, item) => sum + (item.price || 0), 0) || 0

      setStats({
        totalUsers: usersResult.count || 0,
        totalLists: listsResult.count || 0,
        totalItems: itemsResult.count || 0,
        totalValue
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    }
  }

  const fetchRecentLists = async () => {
    try {
      const { data, error } = await supabase
        .from('lists')
        .select(`
          id,
          title,
          created_at,
          users (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      // Buscar contagem de itens para cada lista
      const listsWithItemCount = await Promise.all(
        data.map(async (list) => {
          const { count } = await supabase
            .from('items')
            .select('id', { count: 'exact' })
            .eq('list_id', list.id)

          return {
            ...list,
            user: Array.isArray(list.users) ? list.users[0] : list.users,
            itemCount: count || 0
          }
        })
      )

      setRecentLists(listsWithItemCount)
    } catch (error) {
      console.error('Erro ao buscar listas recentes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const viewList = (listId: string) => {
    router.push(`/admin/list/${listId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Painel Administrativo
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Bem-vindo, {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Ver Site
              </a>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Usuários registrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Listas</CardTitle>
                <List className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLists}</div>
                <p className="text-xs text-muted-foreground">
                  Listas criadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalItems}</div>
                <p className="text-xs text-muted-foreground">
                  Produtos adicionados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {stats.totalValue.toFixed(2).replace('.', ',')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor dos produtos
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Listas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Listas Recentes</CardTitle>
            <CardDescription>
              Últimas listas de presentes criadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLists.map((list) => (
                <div
                  key={list.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {list.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Criado por {list.user?.name || 'Usuário'} ({list.user?.email})
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(list.created_at).toLocaleDateString('pt-BR')} • {list.itemCount} produtos
                    </p>
                  </div>
                  <Button
                    onClick={() => viewList(list.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                </div>
              ))}

              {recentLists.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhuma lista criada ainda.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 