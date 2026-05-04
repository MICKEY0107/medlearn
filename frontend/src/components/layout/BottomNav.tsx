'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Bell, Users, Bookmark } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'

export function BottomNav() {
  const pathname = usePathname()
  const { data: notifications = [] } = useNotifications()
  const unreadCount = notifications.filter((n: { read: boolean }) => !n.read).length

  const links = [
    { href: '/feed', label: 'Home', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/network', label: 'Network', icon: Users },
    { href: '/notifications', label: 'Alerts', icon: Bell, badge: unreadCount },
    { href: '/bookmarks', label: 'Saved', icon: Bookmark },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-border flex justify-around items-stretch z-50 safe-area-pb">
      {links.map(({ href, label, icon: Icon, badge }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors relative ${
              isActive ? 'text-brand' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="relative">
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} className={isActive ? 'fill-brand/10' : ''} />
              {badge != null && badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-[3px] leading-none">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-semibold ${isActive ? 'text-brand' : ''}`}>{label}</span>
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-brand rounded-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
