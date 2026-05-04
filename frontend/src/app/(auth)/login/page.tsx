'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      router.push('/feed')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Sign in failed. Check your email and password.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-[45%] bg-brand p-[60px] flex-col justify-center">
        <div className="mb-8 font-bold text-[28px] text-white">✦ MedLearn</div>
        <blockquote className="text-white">
          <p className="text-[24px] italic font-medium leading-relaxed mb-6">
            "MedLearn changed how I approach research. I went from skimming abstracts to actually understanding methodology."
          </p>
          <footer className="text-[14px] opacity-80 font-medium">
            — Arjun Kapoor, MBBS Year 4, AIIMS New Delhi
          </footer>
        </blockquote>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center bg-white p-6">
        <div className="w-full max-w-[400px]">
          <div className="md:hidden font-bold text-[28px] text-brand mb-8 text-center">✦ MedLearn</div>

          <h1 className="text-[28px] font-bold text-foreground">Welcome back</h1>
          <p className="text-[14px] text-muted-foreground mt-1 mb-8">Sign in to your MedLearn account.</p>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border rounded-[6px] px-[16px] py-[12px] text-[15px] focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all"
                placeholder="doctor@hospital.org"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-border rounded-[6px] px-[16px] py-[12px] text-[15px] focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Link href="#" className="text-[13px] text-brand text-right hover:underline font-medium">
              Forgot password?
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="mt-[8px] w-full bg-brand text-white py-[14px] rounded-[24px] font-semibold text-[15px] hover:bg-[#0a5a47] transition-colors disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-3 text-sm text-muted-foreground bg-white">New to MedLearn?</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          <Link
            href="/register"
            className="flex w-full justify-center border-2 border-brand text-brand py-[14px] rounded-[24px] font-semibold text-[15px] hover:bg-brand-light transition-colors"
          >
            Join now
          </Link>
        </div>
      </div>
    </div>
  )
}
