'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useAuth } from '@/context/AuthContext'
import { usersAPI } from '@/lib/api-client'
import { mediaUrl } from '@/lib/utils'

type ConnUser = {
  id: string
  name: string
  headline?: string | null
  role: string
  profilePhoto?: string | null
  institution?: string | null
}

type ConnectionRow = {
  fromUserId: string
  toUserId: string
  status: string
  fromUser: ConnUser
  toUser: ConnUser
}

export default function NetworkPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const me = user?.id

  const { data: connData, isLoading: connLoading, isError: connError } = useQuery({
    queryKey: ['connections', me],
    queryFn: () => usersAPI.getConnections(me!).then((r) => r.data.connections as ConnectionRow[]),
    enabled: !!me,
  })

  const { data: sugData, isLoading: sugLoading, isError: sugError } = useQuery({
    queryKey: ['suggestions'],
    queryFn: () => usersAPI.getSuggestions().then((r) => r.data.suggestions as ConnUser[]),
    enabled: !!me,
  })

  const acceptMut = useMutation({
    mutationFn: (fromUserId: string) => usersAPI.acceptConnection(fromUserId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['connections', me] })
      void qc.invalidateQueries({ queryKey: ['suggestions'] })
    },
  })

  const declineMut = useMutation({
    mutationFn: (otherId: string) => usersAPI.declineConnection(otherId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['connections', me] })
      void qc.invalidateQueries({ queryKey: ['suggestions'] })
    },
  })

  const connectMut = useMutation({
    mutationFn: (id: string) => usersAPI.connect(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['connections', me] })
      void qc.invalidateQueries({ queryKey: ['suggestions'] })
    },
  })

  if (!user) return null

  if (connLoading || sugLoading) {
    return (
      <PageWrapper>
        <div className="animate-pulse space-y-4 max-w-[640px] mx-auto">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </PageWrapper>
    )
  }

  if (connError || sugError) {
    return (
      <PageWrapper>
        <div className="text-center text-red-500 py-8 max-w-[640px] mx-auto">
          Failed to load. Please refresh.
        </div>
      </PageWrapper>
    )
  }

  const connections = connData ?? []
  const suggestions = sugData ?? []

  const pendingReceived = connections.filter((c) => c.toUserId === me && c.status === 'pending')
  const accepted = connections.filter((c) => c.status === 'accepted')

  const acceptedPeople = accepted.map((c) => (c.fromUserId === me ? c.toUser : c.fromUser))

  return (
    <PageWrapper>
      <div className="w-full max-w-[640px] mx-auto py-6 sm:py-8 px-4 sm:px-0 mb-20 space-y-8">
        <h1 className="text-[22px] font-bold">My Network</h1>

        <section className="glass-panel p-5 rounded-[8px]">
          <h2 className="text-[14px] font-bold uppercase tracking-wide text-muted-foreground mb-4">
            Pending requests
          </h2>
          {pendingReceived.length === 0 ? (
            <p className="text-[14px] text-muted-foreground">No pending connection requests.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {pendingReceived.map((c) => (
                <li
                  key={`${c.fromUserId}-${c.toUserId}`}
                  className="flex items-center justify-between gap-3 border border-border rounded-lg p-3"
                >
                  <Link href={`/profile/${c.fromUser.id}`} className="flex items-center gap-3 min-w-0">
                    <img
                      src={mediaUrl(c.fromUser.profilePhoto)}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-[14px] truncate">{c.fromUser.name}</p>
                      <p className="text-[12px] text-muted-foreground truncate">{c.fromUser.headline}</p>
                    </div>
                  </Link>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => acceptMut.mutate(c.fromUserId)}
                      disabled={acceptMut.isPending}
                      className="px-3 py-1.5 rounded-full bg-brand text-white text-[12px] font-semibold"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => declineMut.mutate(c.fromUserId)}
                      disabled={declineMut.isPending}
                      className="px-3 py-1.5 rounded-full border border-border text-[12px] font-semibold"
                    >
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="glass-panel p-5 rounded-[8px]">
          <h2 className="text-[14px] font-bold uppercase tracking-wide text-muted-foreground mb-4">
            People you may know
          </h2>
          {suggestions.length === 0 ? (
            <p className="text-[14px] text-muted-foreground">No suggestions right now.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 border border-border rounded-lg p-3"
                >
                  <Link href={`/profile/${s.id}`} className="flex items-center gap-3 min-w-0">
                    <img
                      src={mediaUrl(s.profilePhoto)}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-[14px] truncate">{s.name}</p>
                      <p className="text-[12px] text-muted-foreground truncate">{s.headline}</p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => connectMut.mutate(s.id)}
                    disabled={connectMut.isPending}
                    className="px-3 py-1.5 rounded-full bg-brand/10 text-brand text-[12px] font-semibold shrink-0"
                  >
                    Connect
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="glass-panel p-5 rounded-[8px]">
          <h2 className="text-[14px] font-bold uppercase tracking-wide text-muted-foreground mb-4">
            Your connections
          </h2>
          {acceptedPeople.length === 0 ? (
            <p className="text-[14px] text-muted-foreground">
              You have no accepted connections yet. Send a request from suggestions above.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {acceptedPeople.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 border border-border rounded-lg p-3">
                  <Link href={`/profile/${p.id}`} className="flex items-center gap-3 min-w-0">
                    <img
                      src={mediaUrl(p.profilePhoto)}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-[14px] truncate">{p.name}</p>
                      <p className="text-[12px] text-muted-foreground truncate">{p.headline}</p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => declineMut.mutate(p.id)}
                    className="text-[12px] text-muted-foreground hover:text-red-600 shrink-0"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageWrapper>
  )
}
