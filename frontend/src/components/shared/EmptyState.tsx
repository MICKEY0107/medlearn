import { ReactNode } from 'react'
import Link from 'next/link'

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export function EmptyState({ icon, title, description, actionText, actionHref, onActionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-[60px] px-[20px] text-center w-full">
      <div className="text-muted-foreground mb-4">
        {icon}
      </div>
      
      <h3 className="text-[20px] font-semibold text-black/50 mb-2">
        {title}
      </h3>
      
      <p className="text-[14px] text-muted-foreground mb-6 max-w-[400px]">
        {description}
      </p>

      {actionText && actionHref && (
        <Link 
          href={actionHref}
          className="text-[14px] font-semibold text-brand hover:underline"
        >
          {actionText}
        </Link>
      )}

      {actionText && onActionClick && (
        <button 
          onClick={onActionClick}
          className="text-[14px] font-semibold text-brand hover:underline"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}
