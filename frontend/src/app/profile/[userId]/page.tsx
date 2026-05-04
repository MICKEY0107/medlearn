'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useAuth } from '@/context/AuthContext'
import { useProfile } from '@/hooks/useProfile'
import { usersAPI } from '@/lib/api-client'
import { mediaUrl } from '@/lib/utils'
import { EmptyState } from '@/components/shared/EmptyState'
import { Users, FileText, Briefcase, Loader2 } from 'lucide-react'
import { PaperPostCard } from '@/components/feed/PaperPostCard'
import { InsightPostCard } from '@/components/feed/InsightPostCard'
import { QuestionPostCard } from '@/components/feed/QuestionPostCard'
import { ProjectPostCard } from '@/components/feed/ProjectPostCard'

type ProfileTab = 'posts' | 'analytics' | 'about'

export default function ProfilePage() {
  const params = useParams()
  const profileId = params.userId as string
  const { user: currentUser } = useAuth()
  const qc = useQueryClient()
  const { profile: profileUser, posts: userPosts, loading, error } = useProfile(profileId)
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts')

  const isOwnProfile = currentUser?.id === profileId

  const { data: analytics, isLoading: analyticsLoading, isError: analyticsError } = useQuery({
    queryKey: ['user-analytics', profileId],
    queryFn: () => usersAPI.getAnalytics(profileId).then((r) => r.data),
    enabled: !!profileId && isOwnProfile,
  })

  const connectMut = useMutation({
    mutationFn: () => usersAPI.connect(profileId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['connections', currentUser?.id] }),
  })

  if (loading) {
    return (
      <PageWrapper>
        <div className="animate-pulse space-y-4 max-w-[752px] mx-auto py-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </PageWrapper>
    )
  }

  if (error || !profileUser) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <EmptyState
            icon={<Users size={48} />}
            title="Profile not found"
            description="The profile you are looking for does not exist or has been removed."
          />
        </div>
      </PageWrapper>
    )
  }

  const getInitials = (name: string) =>
    name?.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || '??'

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: 'posts', label: 'Posts' },
    ...(isOwnProfile ? [{ id: 'analytics' as const, label: 'Analytics' }] : []),
    { id: 'about', label: 'About' },
  ]

  return (
    <PageWrapper>
      <div className="w-full max-w-[752px] mx-auto py-6 sm:py-8 px-4 sm:px-0 mb-20">
        <div className="bg-white border border-border rounded-[8px] overflow-hidden relative mb-[16px]">
          <div
            className="h-[200px] w-full"
            style={{
              background:
                typeof profileUser.bannerColor === 'string' && profileUser.bannerColor.startsWith('#')
                  ? profileUser.bannerColor
                  : 'linear-gradient(90deg, #0F6E56 0%, #0a5a47 100%)',
            }}
          />

          <div className="absolute top-[152px] left-[24px]">
            {profileUser.profilePhoto ? (
              <img
                src={mediaUrl(profileUser.profilePhoto)}
                alt=""
                className="w-[96px] h-[96px] rounded-full border-[4px] border-white object-cover shadow-sm"
              />
            ) : (
              <div className="w-[96px] h-[96px] rounded-full border-[4px] border-white bg-white flex items-center justify-center font-bold text-[32px] text-brand shadow-sm">
                {getInitials(profileUser.name)}
              </div>
            )}
          </div>

          <div className="flex justify-end p-[16px] h-[64px]">
            {isOwnProfile ? (
              <Link
                href="/profile/edit"
                className="px-[16px] py-[6px] rounded-[16px] border-[1.5px] border-border text-[14px] font-semibold text-foreground/80 hover:bg-[#F3F2EE] transition-colors"
              >
                Edit profile
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => connectMut.mutate()}
                disabled={connectMut.isPending}
                className="px-[16px] py-[6px] rounded-[16px] bg-brand text-white text-[14px] font-semibold hover:bg-[#0a5a47] disabled:opacity-60"
              >
                {connectMut.isPending ? '…' : 'Connect'}
              </button>
            )}
          </div>

          <div className="px-[24px] pb-[24px]">
            <h1 className="text-[22px] font-bold text-foreground leading-tight">{profileUser.name}</h1>
            <p className="text-[15px] text-foreground/80 mt-1">{profileUser.headline}</p>
            <div className="flex items-center gap-1.5 text-[14px] text-muted-foreground mt-2">
              <Briefcase size={14} />
              <span>{profileUser.institution}</span>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex gap-1.5 text-[14px]">
                <span className="font-bold text-brand">{profileUser.connectionCount ?? 0}</span>
                <span className="text-muted-foreground">Connections</span>
              </div>
              <div className="flex gap-1.5 text-[14px]">
                <span className="font-bold text-brand">{profileUser.postCount ?? 0}</span>
                <span className="text-muted-foreground">Posts</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-[8px] mb-[16px] overflow-hidden">
          <div className="flex items-center border-b border-border overflow-x-auto scrollbar-hide px-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-[16px] py-[14px] text-[14px] font-bold whitespace-nowrap border-b-[2px] transition-colors ${
                  activeTab === tab.id
                    ? 'border-brand text-brand'
                    : 'border-transparent text-muted-foreground hover:text-foreground/80 hover:border-black/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[12px]">
          {activeTab === 'posts' && (
            <>
              {userPosts.length === 0 ? (
                <div className="bg-white border border-border rounded-[8px]">
                  <EmptyState
                    icon={<FileText size={48} />}
                    title="Nothing posted yet"
                    description="This user hasn't shared any posts yet."
                  />
                </div>
              ) : (
                userPosts.map((post: any) => {
                  const author = post.author || profileUser
                  const paper = post.paper
                  switch (post.type) {
                    case 'paper':
                      return (
                        <PaperPostCard key={post.id} post={post} paper={paper} author={author} />
                      )
                    case 'insight':
                      return <InsightPostCard key={post.id} post={post} author={author} />
                    case 'question':
                      return <QuestionPostCard key={post.id} post={post} author={author} />
                    case 'project':
                      return (
                        <ProjectPostCard key={post.id} post={post} author={author} paper={paper} />
                      )
                    default:
                      return null
                  }
                })
              )}
            </>
          )}

          {activeTab === 'analytics' && isOwnProfile && (
            <>
              {analyticsLoading && (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-brand" />
                </div>
              )}
              {analyticsError && (
                <div className="text-center text-red-500 py-8">Failed to load. Please refresh.</div>
              )}
              {!analyticsLoading && !analyticsError && analytics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Total posts', value: analytics.totalPosts },
                      { label: 'Likes received', value: analytics.totalLikes },
                      { label: 'Comments received', value: analytics.totalComments },
                    ].map((c) => (
                      <div key={c.label} className="bg-white border border-border rounded-[8px] p-4">
                        <p className="text-[12px] text-muted-foreground font-semibold">{c.label}</p>
                        <p className="text-[24px] font-bold text-brand mt-1">{c.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white border border-border rounded-[8px] p-4">
                    <h3 className="text-[14px] font-bold mb-3">Posts by type</h3>
                    <ul className="space-y-2">
                      {(analytics.postsByType || []).map(
                        (row: { type: string; _count: { _all: number } }) => (
                          <li key={row.type} className="flex justify-between text-[14px]">
                            <span className="capitalize">{row.type}</span>
                            <span className="font-semibold">{row._count._all}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div className="bg-white border border-border rounded-[8px] p-4">
                    <h3 className="text-[14px] font-bold mb-3">Recent posts</h3>
                    <ul className="space-y-3">
                      {(analytics.recentPosts || []).map(
                        (p: {
                          id: string
                          type: string
                          content: string
                          likeCount: number
                          commentCount: number
                          paperId?: string | null
                        }) => (
                          <li key={p.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                            <Link
                              href={
                                p.type === 'paper' && p.paperId
                                  ? `/paper/${p.paperId}`
                                  : `/post/${p.id}`
                              }
                              className="text-[13px] font-semibold text-brand hover:underline capitalize"
                            >
                              {p.type}
                            </Link>
                            <p className="text-[13px] text-muted-foreground line-clamp-2 mt-1">{p.content}</p>
                            <p className="text-[12px] text-muted-foreground mt-1">
                              {p.likeCount} likes · {p.commentCount} comments
                            </p>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'about' && (
            <div className="bg-white border border-border rounded-[8px] p-[24px]">
              <h2 className="text-[18px] font-bold mb-[16px]">About</h2>
              <p className="text-[14px] leading-[1.6] text-black/80 whitespace-pre-line mb-6">
                {profileUser.bio || 'No bio yet.'}
              </p>
              <div className="text-[14px] text-muted-foreground mb-4">
                <span className="font-semibold text-foreground">Institution: </span>
                {profileUser.institution || '—'}
              </div>
              {(profileUser.skills || []).length > 0 && (
                <div className="mb-4">
                  <h3 className="text-[14px] font-bold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="bg-[#F3F2EE] border border-border px-3 py-1 rounded-full text-[12px] font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(profileUser.interests || []).length > 0 && (
                <div>
                  <h3 className="text-[14px] font-bold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.interests.map((topic: string) => (
                      <span
                        key={topic}
                        className="px-3 py-1 bg-brand/5 text-brand border border-brand/20 rounded-full text-[13px] font-medium"
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
