'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Activity, Search, FileText, Loader2, Bell, Shield, LogOut, User, Settings, ChevronDown, Sun, Moon } from 'lucide-react'
import { useSearch } from '@/hooks/useSearch'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useNotifications } from '@/hooks/useNotifications'
import { useTheme } from '@/context/ThemeContext'
import { mediaUrl } from '@/lib/utils'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [query, setQuery] = useState('')
  const { results, loading } = useSearch(query)
  const [showResults, setShowResults] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const { data: notifications = [] } = useNotifications()
  const unreadCount = notifications.filter((n: { read: boolean }) => !n.read).length

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setShowResults(false)
    }
  }

  const handleLogout = async () => {
    setShowUserMenu(false)
    await logout()
    router.push('/login')
  }

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()

  const { theme, toggle } = useTheme()

  const navLinks = [
    { href: '/feed', label: 'Home' },
    { href: '/network', label: 'Network' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-border shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-300">
      <div className="container mx-auto flex h-16 max-w-7xl items-center px-4">

        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2.5 mr-6 select-none cursor-pointer group shrink-0">
          <div className="bg-gradient-to-br from-brand to-[#0FA880] p-1.5 rounded-[10px] shadow-[0_2px_10px_rgba(13,122,95,0.25)] group-hover:shadow-[0_4px_12px_rgba(13,122,95,0.35)] transition-all transform group-hover:-translate-y-[1px]">
            <Activity size={20} strokeWidth={2.5} className="text-white" />
          </div>
          <div className="font-extrabold text-[22px] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand to-[#0FA880] drop-shadow-sm">
            MedLearn
          </div>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md ml-4 relative">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand transition-colors" size={16} />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
              onKeyDown={onSearchKeyDown}
              placeholder="Search papers, topics, researchers..."
              className="w-full rounded-full bg-black/5 border border-transparent hover:border-brand/20 focus:border-brand/40 focus:bg-white pl-10 pr-4 py-2 text-[14px] font-medium transition-all shadow-inner outline-none"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 size={16} className="animate-spin text-brand/60" />
              </div>
            )}
          </div>

          {showResults && query.length >= 2 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[100]">
              <div className="max-h-[400px] overflow-y-auto p-2">
                <div className="mb-2">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Research Papers
                  </div>
                  {results.papers.length > 0 ? (
                    results.papers.map((paper) => (
                      <Link
                        key={paper.id}
                        href={`/paper/${paper.id}`}
                        onClick={() => { setShowResults(false); setQuery('') }}
                        className="flex items-start gap-3 p-2.5 hover:bg-brand/5 rounded-lg transition-colors group"
                      >
                        <div className="p-2 bg-brand/10 rounded-md text-brand group-hover:bg-brand/20 transition-colors">
                          <FileText size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold text-foreground truncate">{paper.title}</div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {paper.authors.join(', ')} • {paper.year}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-[12px] text-muted-foreground italic">No papers found</div>
                  )}
                </div>

                <div>
                  <div className="px-3 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Researchers
                  </div>
                  {results.users.length > 0 ? (
                    results.users.map((u) => (
                      <Link
                        key={u.id}
                        href={`/profile/${u.id}`}
                        onClick={() => { setShowResults(false); setQuery('') }}
                        className="flex items-center gap-3 p-2.5 hover:bg-brand/5 rounded-lg transition-colors group"
                      >
                        <img
                          src={mediaUrl(u.profilePhoto)}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold text-foreground truncate">{u.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{u.headline}</div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-[12px] text-muted-foreground italic">No researchers found</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right nav */}
        <div className="ml-auto flex items-center gap-1">
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 rounded-lg text-[14px] font-semibold transition-colors ${
                    isActive
                      ? 'text-brand bg-brand/8'
                      : 'text-foreground/60 hover:text-foreground hover:bg-black/5'
                  }`}
                >
                  {label}
                </Link>
              )
            })}

            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <Link
              href="/notifications"
              aria-label="Notifications"
              className={`relative p-2 rounded-lg transition-colors ${
                pathname === '/notifications'
                  ? 'text-brand bg-brand/8'
                  : 'text-foreground/60 hover:text-foreground hover:bg-black/5'
              }`}
            >
              <Bell size={20} strokeWidth={pathname === '/notifications' ? 2.5 : 1.8} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-[3px] leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Admin */}
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                aria-label="Admin"
                className={`p-2 rounded-lg transition-colors ${
                  pathname === '/admin'
                    ? 'text-amber-700 bg-amber-50'
                    : 'text-amber-600/70 hover:text-amber-700 hover:bg-amber-50'
                }`}
              >
                <Shield size={20} />
              </Link>
            )}

            {/* User avatar + dropdown */}
            {user && (
              <div className="relative ml-1" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-black/5 transition-colors"
                  aria-label="User menu"
                >
                  {user.profilePhoto ? (
                    <img
                      src={mediaUrl(user.profilePhoto)}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center text-[12px] font-bold border border-brand/20">
                      {getInitials(user.name)}
                    </div>
                  )}
                  <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-[220px] bg-white border border-border rounded-xl shadow-xl overflow-hidden z-[200] animate-in fade-in zoom-in-95 duration-150">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                      <p className="text-[13px] font-bold text-foreground truncate">{user.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate capitalize">{user.role} · {user.institution || user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href={`/profile/${user.id}`}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-foreground hover:bg-brand/5 hover:text-brand transition-colors"
                      >
                        <User size={15} />
                        View profile
                      </Link>
                      <Link
                        href="/profile/edit"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-foreground hover:bg-brand/5 hover:text-brand transition-colors"
                      >
                        <Settings size={15} />
                        Edit profile
                      </Link>
                    </div>

                    <div className="border-t border-border py-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>

      {showResults && (
        <div className="fixed inset-0 z-[-1]" onClick={() => setShowResults(false)} />
      )}
    </header>
  )
}
