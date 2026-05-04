'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, GraduationCap, Stethoscope, FlaskConical, Building2, Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

type RoleType = 'student' | 'doctor' | 'researcher' | 'lab' | null

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleType>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const { register } = useAuth()

  const calculateStrength = (pass: string) => {
    if (pass.length === 0) return 0
    if (pass.length < 6) return 1 // weak
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) return 3 // strong
    return 2 // medium
  }

  const strength = calculateStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return
    setError(null)
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters with a letter and a number.')
      return
    }
    setSubmitting(true)
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
      })
      router.push('/feed')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not create account. Try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Column (45%) */}
      <div className="hidden md:flex md:w-[45%] bg-brand p-[60px] flex-col justify-center">
        <div className="mb-8 font-bold text-[28px] text-white">✦ MedLearn</div>
        <blockquote className="text-white">
          <p className="text-[24px] italic font-medium leading-relaxed mb-6">
            "The project idea generator gave me a 6-week project plan from a CRISPR paper in under two minutes."
          </p>
          <footer className="text-[14px] opacity-80 font-medium">
            — Zeynep Arslan, MSc Health Informatics, Edinburgh
          </footer>
        </blockquote>
      </div>

      {/* Right Column (55%) */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white p-6 py-12 md:py-8 overflow-y-auto">
        <div className="w-full max-w-[400px]">
          <div className="md:hidden font-bold text-[28px] text-brand mb-8 text-center">✦ MedLearn</div>
          
          <h1 className="text-[28px] font-bold text-foreground">Create your account</h1>
          <p className="text-[14px] text-muted-foreground mt-1 mb-8">Join 8,200+ healthcare professionals.</p>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Full name</label>
              <input
                type="text"
                required
                minLength={2}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-border rounded-[6px] px-[16px] py-[12px] text-[15px] focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all"
                placeholder="Dr. Sarah Johnson"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border rounded-[6px] px-[16px] py-[12px] text-[15px] focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all"
                placeholder="sarah@university.edu"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
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
              {/* Strength Indicator */}
              {password.length > 0 && (
                <div className="flex gap-1 mt-1 h-1.5 w-full rounded-full overflow-hidden bg-gray-100">
                  <div className={`h-full transition-all duration-300 w-1/3 ${strength >= 1 ? 'bg-red-400' : ''}`} />
                  <div className={`h-full transition-all duration-300 w-1/3 ${strength >= 2 ? 'bg-amber-400' : ''}`} />
                  <div className={`h-full transition-all duration-300 w-1/3 ${strength >= 3 ? 'bg-emerald-500' : ''}`} />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Confirm password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-border rounded-[6px] px-[16px] py-[12px] text-[15px] focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Role Selector */}
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-medium text-foreground">I am a</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {/* Student */}
                <div 
                  onClick={() => setSelectedRole('student')}
                  className={`relative p-3 rounded-[8px] border bg-white cursor-pointer transition-all flex items-start gap-3 ${selectedRole === 'student' ? 'border-brand bg-brand-light ring-[2px] ring-brand' : 'border-border hover:border-brand/50'}`}
                >
                  <div className="mt-1"><GraduationCap className="text-brand" size={20} /></div>
                  <div>
                    <h4 className="text-[14px] font-bold">Student</h4>
                    <p className="text-[12px] text-muted-foreground mt-1 leading-tight">Undergraduate, postgraduate, or MBBS student</p>
                  </div>
                  {selectedRole === 'student' && <Check className="absolute top-2 right-2 text-brand" size={16} />}
                </div>

                {/* Doctor */}
                <div 
                  onClick={() => setSelectedRole('doctor')}
                  className={`relative p-3 rounded-[8px] border bg-white cursor-pointer transition-all flex items-start gap-3 ${selectedRole === 'doctor' ? 'border-brand bg-brand-light ring-[2px] ring-brand' : 'border-border hover:border-brand/50'}`}
                >
                  <div className="mt-1"><Stethoscope className="text-blue-600" size={20} /></div>
                  <div>
                    <h4 className="text-[14px] font-bold">Doctor</h4>
                    <p className="text-[12px] text-muted-foreground mt-1 leading-tight">Practising clinician or resident</p>
                  </div>
                  {selectedRole === 'doctor' && <Check className="absolute top-2 right-2 text-brand" size={16} />}
                </div>

                {/* Researcher */}
                <div 
                  onClick={() => setSelectedRole('researcher')}
                  className={`relative p-3 rounded-[8px] border bg-white cursor-pointer transition-all flex items-start gap-3 ${selectedRole === 'researcher' ? 'border-brand bg-brand-light ring-[2px] ring-brand' : 'border-border hover:border-brand/50'}`}
                >
                  <div className="mt-1"><FlaskConical className="text-amber-500" size={20} /></div>
                  <div>
                    <h4 className="text-[14px] font-bold">Researcher</h4>
                    <p className="text-[12px] text-muted-foreground mt-1 leading-tight">Academic researcher or PhD candidate</p>
                  </div>
                  {selectedRole === 'researcher' && <Check className="absolute top-2 right-2 text-brand" size={16} />}
                </div>

                {/* Lab */}
                <div 
                  onClick={() => setSelectedRole('lab')}
                  className={`relative p-3 rounded-[8px] border bg-white cursor-pointer transition-all flex items-start gap-3 ${selectedRole === 'lab' ? 'border-brand bg-brand-light ring-[2px] ring-brand' : 'border-border hover:border-brand/50'}`}
                >
                  <div className="mt-1"><Building2 className="text-purple-600" size={20} /></div>
                  <div>
                    <h4 className="text-[14px] font-bold">Research Lab</h4>
                    <p className="text-[12px] text-muted-foreground mt-1 leading-tight">Institutional lab or research group</p>
                  </div>
                  {selectedRole === 'lab' && <Check className="absolute top-2 right-2 text-brand" size={16} />}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedRole || password.length === 0 || submitting}
              className="mt-[16px] w-full bg-brand text-white py-[14px] rounded-[24px] font-semibold text-[15px] hover:bg-[#0a5a47] disabled:bg-brand/50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/login" className="text-[14px] text-muted-foreground hover:text-foreground">
              Already have an account? <span className="text-brand font-medium hover:underline">Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
