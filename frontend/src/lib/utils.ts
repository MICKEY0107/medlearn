import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export function mediaUrl(path: string | null | undefined): string {
  if (!path) return "/default-avatar.svg"
  if (path.startsWith("http")) return path
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`
}
