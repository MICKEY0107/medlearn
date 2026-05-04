'use client'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { EmptyState } from '@/components/shared/EmptyState'
import { useNotifications, useMarkAllRead } from '@/hooks/useNotifications'
import { Bell, ThumbsUp, MessageSquare, UserPlus } from 'lucide-react'

export default function NotificationsPage() {
  const { data: notifications = [], isLoading, error } = useNotifications()
  const markAllRead = useMarkAllRead()

  const unreadCount = notifications.filter((n: { read: boolean }) => !n.read).length
  const newNotifs = notifications.filter((n: { read: boolean }) => !n.read)
  const earlierNotifs = notifications.filter((n: { read: boolean }) => n.read)

  const getIconData = (type: string) => {
    switch (type) {
      case 'like':
        return { icon: <ThumbsUp size={18} fill="currentColor" />, style: 'bg-brand/10 text-brand' }
      case 'comment':
        return { icon: <MessageSquare size={18} fill="currentColor" />, style: 'bg-blue-100 text-blue-600' }
      case 'connection_request':
      case 'connection_accepted':
      case 'connection':
        return { icon: <UserPlus size={18} />, style: 'bg-brand/10 text-brand' }
      default:
        return { icon: <Bell size={18} />, style: 'bg-gray-100 text-gray-600' }
    }
  }

  const renderNotification = (n: any) => {
    const { icon, style } = getIconData(n.type)
    const date = new Date(n.createdAt)
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const dateString = date.toLocaleDateString()

    return (
      <div
        key={n.id}
        className={`bg-white border rounded-[8px] p-[14px] mb-[6px] flex items-center gap-[14px] relative overflow-hidden ${
          !n.read ? 'border-l-[3px] border-l-brand border-y-border border-r-border' : 'border-border'
        }`}
      >
        <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center shrink-0 ${style}`}>
          {icon}
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <p className="text-[14px] text-foreground leading-snug">{n.message}</p>
          <p className="text-[12px] text-muted-foreground mt-1">
            {dateString} at {timeString}
          </p>
        </div>

        {!n.read && <div className="w-[8px] h-[8px] rounded-full bg-brand shrink-0" />}
      </div>
    )
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="w-full max-w-[752px] mx-auto py-8 px-4 sm:px-0">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="w-full max-w-[752px] mx-auto py-8 text-center text-red-500">
          Failed to load. Please refresh.
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="w-full max-w-[752px] mx-auto py-6 sm:py-8 px-4 sm:px-0 mb-20">
        <div className="flex items-end justify-between mb-[24px]">
          <h1 className="text-[28px] font-bold text-foreground leading-tight flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-[#DC2626] text-white text-[12px] px-[8px] py-[2px] rounded-[12px] font-bold leading-none translate-y-[-2px]">
                {unreadCount}
              </span>
            )}
          </h1>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="text-[14px] font-bold text-brand hover:underline disabled:opacity-50"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white border border-border rounded-[8px] mt-8">
            <EmptyState
              icon={<Bell size={48} className="opacity-20" />}
              title="You're all caught up"
              description="You don't have any new notifications."
            />
          </div>
        ) : (
          <div className="flex flex-col">
            {newNotifs.length > 0 && (
              <div className="mb-[24px]">
                <h3 className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold mb-[12px] ml-1">
                  New
                </h3>
                {newNotifs.map(renderNotification)}
              </div>
            )}

            {earlierNotifs.length > 0 && (
              <div className="mb-[24px]">
                <h3 className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold mb-[12px] ml-1">
                  Earlier
                </h3>
                {earlierNotifs.map(renderNotification)}
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
