'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useAuth } from '@/context/AuthContext'
import { apiClient } from '@/lib/api-client'
import { ShieldAlert, Trash2, AlertTriangle, Check } from 'lucide-react'

export default function AdminPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const statsQuery = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiClient.get('/api/admin/stats').then((r) => r.data),
    enabled: user?.role === 'admin',
  })

  const flaggedQuery = useQuery({
    queryKey: ['admin', 'flagged'],
    queryFn: () => apiClient.get('/api/admin/flagged').then((r) => r.data),
    enabled: user?.role === 'admin',
  })

  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => apiClient.get('/api/admin/users').then((r) => r.data.users),
    enabled: user?.role === 'admin',
  })

  const deletePost = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/admin/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      triggerToast('Post removed')
    },
  })

  const warnUser = useMutation({
    mutationFn: (id: string) => apiClient.post(`/api/admin/users/${id}/warn`),
    onSuccess: () => {
      triggerToast('Warning sent')
    },
  })

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  if (!user || user.role !== 'admin') {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
          <ShieldAlert size={64} className="text-[#DC2626] mb-6 opacity-80" strokeWidth={1.5} />
          <h1 className="text-[28px] font-bold text-foreground mb-4">Not authorised</h1>
          <p className="text-[15px] text-muted-foreground mb-8 max-w-[400px]">
            You do not have administrative privileges to view this dashboard.
          </p>
          <Link
            href="/feed"
            className="px-[24px] py-[12px] bg-brand text-white rounded-[24px] font-bold hover:bg-[#0a5a47] transition-colors"
          >
            Return to Feed
          </Link>
        </div>
      </PageWrapper>
    )
  }

  const stats = statsQuery.data
  const flaggedPosts = flaggedQuery.data?.flaggedPosts ?? []
  const flaggedComments = flaggedQuery.data?.flaggedComments ?? []
  const adminUsers = usersQuery.data ?? []

  return (
    <PageWrapper>
      <div className="w-full max-w-[1128px] mx-auto py-6 sm:py-8 px-4 sm:px-0 mb-20">
        <div className="mb-[32px]">
          <h1 className="text-[24px] font-bold text-foreground leading-tight">Admin Panel</h1>
          <p className="text-[14px] text-muted-foreground mt-1">Platform management and moderation.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px] mb-[32px]">
          <div className="bg-white border border-border rounded-[8px] p-[20px]">
            <span className="text-[12px] text-muted-foreground uppercase font-bold tracking-wider">
              Total Users
            </span>
            <div className="text-[32px] font-bold mt-2">
              {statsQuery.isLoading ? '…' : (stats?.totalUsers ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white border border-border rounded-[8px] p-[20px]">
            <span className="text-[12px] text-muted-foreground uppercase font-bold tracking-wider">
              Total Papers
            </span>
            <div className="text-[32px] font-bold mt-2">
              {statsQuery.isLoading ? '…' : (stats?.totalPapers ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white border border-border rounded-[8px] p-[20px]">
            <span className="text-[12px] text-muted-foreground uppercase font-bold tracking-wider">
              Posts this Week
            </span>
            <div className="text-[32px] font-bold mt-2">
              {statsQuery.isLoading ? '…' : (stats?.postsThisWeek ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white border border-border rounded-[8px] p-[20px] bg-amber-50">
            <span className="text-[12px] text-[#D97706] uppercase font-bold tracking-wider">
              Flagged Pending
            </span>
            <div className="text-[32px] font-bold mt-2 text-[#D97706]">
              {statsQuery.isLoading ? '…' : stats?.flaggedPending ?? 0}
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-[8px] mb-[32px] overflow-x-auto">
          <div className="px-[20px] py-[16px] border-b border-border">
            <h2 className="text-[16px] font-bold">Flagged posts</h2>
          </div>
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-[#F8F9FA] text-[12px] uppercase tracking-wider text-muted-foreground">
                <th className="px-[20px] py-[12px] font-bold">Content</th>
                <th className="px-[20px] py-[12px] font-bold">Author</th>
                <th className="px-[20px] py-[12px] font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {flaggedPosts.map((item: any) => (
                <tr key={item.id} className="text-[14px]">
                  <td className="px-[20px] py-[16px] line-clamp-2">{item.content}</td>
                  <td className="px-[20px] py-[16px]">{item.author?.name ?? '—'}</td>
                  <td className="px-[20px] py-[16px] text-right">
                    <button
                      type="button"
                      onClick={() => deletePost.mutate(item.id)}
                      className="px-3 py-1.5 rounded-[4px] bg-red-50 text-red-600 hover:bg-red-100 text-[12px] font-bold"
                    >
                      <Trash2 size={14} className="inline mr-1" /> Remove
                    </button>
                  </td>
                </tr>
              ))}
              {flaggedPosts.length === 0 && !flaggedQuery.isLoading && (
                <tr>
                  <td colSpan={3} className="px-[20px] py-8 text-center text-muted-foreground">
                    No flagged posts
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-border rounded-[8px] mb-[32px] overflow-x-auto">
          <div className="px-[20px] py-[16px] border-b border-border">
            <h2 className="text-[16px] font-bold">Flagged comments</h2>
          </div>
          <table className="w-full text-left min-w-[600px]">
            <tbody className="divide-y divide-border">
              {flaggedComments.map((item: any) => (
                <tr key={item.id} className="text-[14px]">
                  <td className="px-[20px] py-[16px] line-clamp-2">{item.content}</td>
                  <td className="px-[20px] py-[16px]">{item.author?.name ?? '—'}</td>
                </tr>
              ))}
              {flaggedComments.length === 0 && !flaggedQuery.isLoading && (
                <tr>
                  <td className="px-[20px] py-8 text-center text-muted-foreground">No flagged comments</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-border rounded-[8px] overflow-x-auto">
          <div className="px-[20px] py-[16px] border-b border-border">
            <h2 className="text-[16px] font-bold">User management</h2>
          </div>
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-[#F8F9FA] text-[12px] uppercase tracking-wider text-muted-foreground">
                <th className="px-[20px] py-[12px] font-bold">User</th>
                <th className="px-[20px] py-[12px] font-bold">Role</th>
                <th className="px-[20px] py-[12px] font-bold">Posts</th>
                <th className="px-[20px] py-[12px] font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {adminUsers.map((u: any) => (
                <tr key={u.id} className="text-[14px]">
                  <td className="px-[20px] py-[12px]">
                    <div className="font-bold">{u.name}</div>
                    <div className="text-[12px] text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-[20px] py-[12px] capitalize">{u.role}</td>
                  <td className="px-[20px] py-[12px]">{u._count?.posts ?? 0}</td>
                  <td className="px-[20px] py-[12px] text-right">
                    <button
                      type="button"
                      onClick={() => warnUser.mutate(u.id)}
                      className="px-3 py-1.5 rounded-[4px] border border-amber-200 text-amber-700 hover:bg-amber-50 text-[12px] font-bold"
                    >
                      <AlertTriangle size={14} className="inline mr-1" /> Warn
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl z-[100] flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-5 h-5 bg-brand rounded-full flex items-center justify-center">
            <Check size={12} strokeWidth={3} className="text-white" />
          </div>
          <span className="font-medium text-[14px]">{toastMessage}</span>
        </div>
      )}
    </PageWrapper>
  )
}
