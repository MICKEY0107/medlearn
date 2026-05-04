'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Home, Users, Bookmark, TrendingUp, Bell } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { usersAPI } from '@/lib/api-client'
import { useNotifications } from '@/hooks/useNotifications'
import { mediaUrl } from '@/lib/utils'

export function LeftSidebar() {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-3">
        <div className="glass-panel h-[180px] animate-pulse bg-muted/10" />
        <div className="glass-panel h-24 animate-pulse bg-muted/10" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="w-full flex flex-col gap-3">
        <div className="flex flex-col gap-3 h-max">
          <div className="glass-panel p-6 text-center">
            <h3 className="font-bold text-[16px] text-foreground mb-3 text-balance leading-tight">Welcome to MedLearn</h3>
            <p className="text-[13px] text-muted-foreground mb-6 leading-relaxed">
              Join the academic community to understand research, build projects, and follow experts.
            </p>
            <Link 
              href="/register" 
              className="block w-full bg-brand text-white py-[10px] rounded-[18px] text-[13px] font-bold hover:opacity-90 transition-all shadow-sm"
            >
              Join for Free
            </Link>
            <Link 
              href="/login" 
              className="block w-full mt-2 border border-border text-foreground/80 py-[10px] rounded-[18px] text-[13px] font-bold hover:bg-black/5 transition-all"
            >
              Sign In
            </Link>
          </div>

          <div className="glass-panel p-5 mt-2 bg-gradient-to-br from-brand/5 to-amber/5 border-brand/10">
            <h4 className="text-[11px] text-brand/80 tracking-widest uppercase font-bold mb-3">Trending Now</h4>
            <div className="flex flex-col gap-3">
               <div className="text-[13px] text-foreground/70 flex items-center gap-2">#AI-Healthcare</div>
               <div className="text-[13px] text-foreground/70 flex items-center gap-2">#Gen-Therapy</div>
               <div className="text-[13px] text-foreground/70 flex items-center gap-2">#Clinical-ML</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  const roleColors: Record<string, string> = {
    student: 'bg-brand/10 text-brand outline-brand',
    doctor: 'bg-blue-50 text-blue-600 outline-blue-600',
    researcher: 'bg-amber-50 text-amber-600 outline-amber-600',
    lab: 'bg-purple-50 text-purple-600 outline-purple-600',
    admin: 'bg-gray-100 text-gray-800 outline-gray-800'
  }
  const avatarClass = roleColors[user.role] || roleColors.student

  const { data: notifications = [] } = useNotifications()
  const unreadCount = notifications.filter((n: { read: boolean }) => !n.read).length

  const navLinks = [
    { name: 'Feed', href: '/feed', icon: Home },
    { name: 'My Network', href: '/network', icon: Users },
    { name: 'Notifications', href: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
    { name: 'Topics', href: '/topics', icon: TrendingUp },
  ]

  const { data: followedTopics = [] } = useQuery({
    queryKey: ['user-topics', user.id],
    queryFn: () => usersAPI.getUserTopics(user.id).then((r) => r.data.topics as string[]),
  })

  return (
    <div className="w-full flex flex-col gap-3">
        {/* Profile Card */}
        <div className="glass-panel">
          {/* Banner - Soft Gradient instead of hard green block */}
          <div 
            className="h-[70px] bg-gradient-to-tr from-brand to-[#0FA880] relative"
          >
            {/* Avatar */}
            <div className="absolute -bottom-[32px] left-1/2 -translate-x-1/2">
              <Link href={`/profile/${user.id}`} className="block">
                {user.profilePhoto ? (
                  <img
                    src={mediaUrl(user.profilePhoto)}
                    alt=""
                    className="w-[64px] h-[64px] rounded-full border-[3px] border-white/80 shadow-sm object-cover"
                  />
                ) : (
                  <div
                    className={`w-[64px] h-[64px] rounded-full border-[3px] border-white/80 shadow-sm flex items-center justify-center font-bold text-xl ${avatarClass}`}
                  >
                    {getInitials(user.name)}
                  </div>
                )}
              </Link>
            </div>
          </div>
          
          <div className="pt-[36px] pb-3 px-4 text-center">
            <Link href={`/profile/${user.id}`}>
              <h3 className="font-bold text-[15px] text-foreground hover:underline cursor-pointer">{user.name}</h3>
            </Link>
            <p className="text-[12px] font-semibold text-brand/90 capitalize mt-1">{user.role}</p>
            <p className="text-[13px] text-muted-foreground mt-1 truncate">
              {user.headline || user.institution || '\u00a0'}
            </p>
          </div>

          <div className="px-4 py-3 border-t border-border hover:bg-black/5 cursor-pointer transition-colors">
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-muted-foreground font-semibold">Connections</span>
              <span className="text-[13px] text-brand font-bold">
                {user.connectionCount ?? user.connections ?? 0}
              </span>
            </div>
          </div>

          <div className="border-t border-border">
            <Link
              href={`/profile/${user.id}`}
              className="block text-center text-[13px] text-brand font-semibold py-[10px] hover:bg-black/5 transition-colors"
            >
              View full profile
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="glass-panel py-2 mt-2">
          <div className="px-5 py-2.5 flex justify-between items-center hover:bg-black/5 cursor-pointer transition-colors">
            <span className="text-[12px] text-muted-foreground font-semibold">Posts this week</span>
            <span className="text-[13px] text-brand font-bold">4</span>
          </div>
          <div className="px-4 py-2 flex justify-between items-center hover:bg-black/5 cursor-pointer transition-colors">
            <span className="text-[12px] text-muted-foreground font-semibold">Profile views</span>
            <span className="text-[13px] text-brand font-bold">12</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="glass-panel py-3 px-2 flex flex-col gap-1 mt-2">
          {navLinks.map((link) => {
            const Icon = link.icon
            // Exact match for /feed to avoid matching /feed/... sub-routes
            const isActive = link.href === '/feed'
              ? pathname === '/feed'
              : pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center gap-3 px-4 py-[10px] rounded-[6px] transition-colors ${
                  isActive 
                    ? 'text-brand font-bold bg-brand/10 shadow-sm' 
                    : 'text-muted-foreground font-semibold hover:bg-white/50 hover:text-foreground/80'
                }`}
              >
                <div className="relative">
                  <Icon size={18} />
                  {link.badge != null && link.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-[2px] leading-none">
                      {link.badge > 9 ? '9+' : link.badge}
                    </span>
                  )}
                </div>
                <span className="text-[14px]">{link.name}</span>
              </Link>
            )
          })}
        </div>

        {/* Followed Topics */}
        <div className="glass-panel p-5 mt-2">
          <h4 className="text-[11px] text-muted-foreground/80 tracking-widest uppercase font-bold mb-4">Topics you follow</h4>
          <div className="flex flex-wrap gap-2">
            {followedTopics.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">Follow topics from your profile settings.</p>
            ) : (
              followedTopics.map((topic) => (
                <Link
                  key={topic}
                  href={`/topics/${encodeURIComponent(topic)}`}
                  className="text-[12px] font-semibold text-foreground/80 bg-[#F3F2EE] px-3 py-1.5 rounded-full hover:bg-[#e0ded8] transition-colors"
                >
                  #{topic}
                </Link>
              ))
            )}
          </div>
        </div>
    </div>
  )
}
