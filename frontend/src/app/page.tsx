'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Sparkles, GraduationCap, ArrowRight, BrainCircuit } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function LandingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const previewPaper = {
    title: 'Deep Learning for Detection of Diabetic Retinopathy: A Systematic Review and Meta-Analysis',
    authors: ['Priya Sharma', 'Rahul Mehta', 'Aiko Tanaka', "James O'Brien"],
    tags: ['deep learning', 'diabetic retinopathy', 'ophthalmology'],
  }

  useEffect(() => {
    if (user) {
      router.push('/feed')
    }
  }, [user, router])

  // If loading or and user exists, we'll shortly redirect, but show a minimal state
  if (user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row min-h-screen items-center justify-between">
            {/* Left Column (55%) */}
            <div className="lg:w-[55%] py-20 lg:py-0 lg:pr-[60px]">
              <div className="text-[13px] text-brand font-medium tracking-[0.05em] uppercase mb-4">
                Healthcare Research · Community · AI-Powered
              </div>
              <h1 className="text-[52px] font-bold leading-[1.1] text-black/90 tracking-tight">
                Your healthcare research community.
              </h1>
              <p className="mt-4 text-[18px] text-black/60 max-w-[480px]">
                Connect with doctors, researchers, and students. Understand any research paper with AI. Build projects from science.
              </p>
              
              <div className="mt-8 flex flex-wrap items-center gap-[12px]">
                <Link 
                  href="/register" 
                  className="bg-brand hover:bg-[#0a5a47] text-white px-[32px] py-[14px] rounded-[24px] font-semibold transition-colors"
                >
                  Join MedLearn
                </Link>
                <Link 
                  href="/login" 
                  className="border-2 border-brand text-brand hover:bg-brand-light px-[32px] py-[14px] rounded-[24px] font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </div>

              {/* Social Proof */}
              <div className="mt-6 flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">AK</div>
                  <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">PN</div>
                  <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">RS</div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">ZA</div>
                  <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">EA</div>
                </div>
                <span className="text-[14px] text-black/60">Join 8,200+ healthcare professionals</span>
              </div>
            </div>

            {/* Right Column (45%) */}
            <div className="lg:w-[45%] w-full max-w-[420px] pb-20 lg:pb-0">
              <div className="bg-white rounded-[12px] p-5 border border-border" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
                {/* Simulated PaperPostCard */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold">RS</div>
                  <div>
                    <div className="font-semibold text-sm">Dr. Rahul Sen</div>
                    <div className="text-xs text-muted-foreground">Posted a paper • 2h</div>
                  </div>
                </div>
                
                <div className="border border-border rounded-lg p-4 bg-background">
                  <h3 className="font-bold text-[16px] leading-snug mb-2">{previewPaper.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{previewPaper.authors.join(', ')}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {previewPaper.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="bg-brand/10 text-brand text-xs px-2 py-1 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* The Ask AI Button demo */}
                  <button className="w-full flex items-center justify-center gap-2 bg-amber hover:bg-amber/90 text-white font-semibold py-2.5 rounded-md transition-colors shadow-sm">
                    <Sparkles size={16} />
                    Ask AI
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-background py-[40px] border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-border">
            <div className="flex flex-col items-center py-4 md:py-0 text-center">
              <div className="text-4xl font-bold text-black/90 mb-1">47 studies</div>
              <div className="text-sm text-black/60">Papers indexed daily</div>
            </div>
            <div className="flex flex-col items-center py-4 md:py-0 text-center">
              <div className="text-4xl font-bold text-black/90 mb-1">91.3%</div>
              <div className="text-sm text-black/60">AI summarisation accuracy</div>
            </div>
            <div className="flex flex-col items-center py-4 md:py-0 text-center">
              <div className="text-4xl font-bold text-black/90 mb-1">8,200+</div>
              <div className="text-sm text-black/60">Researchers and students</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-surface py-[80px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-[36px] font-bold text-black/90">Everything you need in one place</h2>
          
          <div className="mt-[48px] grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white border border-border rounded-[12px] p-[28px] shadow-sm">
              <div className="w-12 h-12 bg-brand-light rounded-lg flex items-center justify-center mb-6">
                <Users className="text-brand" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Professional Network</h3>
              <p className="text-black/60 leading-relaxed">
                Connect with doctors, researchers, and labs. Follow colleagues and topics relevant to your specialisation.
              </p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-white border border-border rounded-[12px] p-[28px] shadow-sm">
              <div className="w-12 h-12 bg-amber-light rounded-lg flex items-center justify-center mb-6">
                <Sparkles className="text-amber" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Research Panel</h3>
              <p className="text-black/60 leading-relaxed">
                Every paper post has an AI button. Get plain-English summaries, project ideas, and concept learning paths instantly.
              </p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-white border border-border rounded-[12px] p-[28px] shadow-sm">
              <div className="w-12 h-12 bg-brand-light rounded-lg flex items-center justify-center mb-6">
                <GraduationCap className="text-brand" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Learn and Build</h3>
              <p className="text-black/60 leading-relaxed">
                Students get a direct path from reading a paper to building a project — with datasets, tech stacks, and prerequisite learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="bg-background py-[80px] border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-[36px] font-bold text-black/90 mb-12">How it works</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <div className="flex flex-col items-center text-center max-w-[240px]">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-border shadow-sm flex items-center justify-center text-xl font-bold mb-4">1</div>
              <h3 className="font-bold text-lg mb-2">Post a paper</h3>
              <p className="text-sm text-black/60">Paste any PubMed, Semantic Scholar, or ResearchGate URL</p>
            </div>
            
            <ArrowRight className="hidden md:block text-muted-foreground" size={32} />
            
            <div className="flex flex-col items-center text-center max-w-[240px]">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-border shadow-sm flex items-center justify-center text-xl font-bold mb-4">2</div>
              <h3 className="font-bold text-lg mb-2">Hit Ask AI</h3>
              <p className="text-sm text-black/60">The amber AI panel opens with three analytical tools</p>
            </div>
            
            <ArrowRight className="hidden md:block text-muted-foreground" size={32} />
            
            <div className="flex flex-col items-center text-center max-w-[240px]">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-border shadow-sm flex items-center justify-center text-xl font-bold mb-4">3</div>
              <h3 className="font-bold text-lg mb-2">Understand & Build</h3>
              <p className="text-sm text-black/60">Summarise, get project ideas, learn prerequisites instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="bg-surface py-[80px]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-[36px] font-bold text-black/90 mb-12">Built for every role in healthcare research</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-6 border border-border rounded-xl">
              <div className="mt-1"><GraduationCap size={24} className="text-brand" /></div>
              <div>
                <h3 className="font-bold text-lg">Student</h3>
                <p className="text-black/60 mt-1">Find and understand research, build projects, post progress</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 border border-border rounded-xl">
              <div className="mt-1"><BrainCircuit size={24} className="text-blue-600" /></div>
              <div>
                <h3 className="font-bold text-lg">Doctor</h3>
                <p className="text-black/60 mt-1">Share clinical perspective, answer questions, bridge evidence and practice</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 border border-border rounded-xl">
              <div className="mt-1"><Users size={24} className="text-amber" /></div>
              <div>
                <h3 className="font-bold text-lg">Researcher</h3>
                <p className="text-black/60 mt-1">Post papers, get community engagement, find collaborators</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 border border-border rounded-xl">
              <div className="mt-1"><Sparkles size={24} className="text-purple-600" /></div>
              <div>
                <h3 className="font-bold text-lg">Research Lab</h3>
                <p className="text-black/60 mt-1">Post active research areas, attract students, build institutional presence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand py-[80px] text-center">
        <h2 className="text-[36px] font-bold text-white mb-8">Ready to join?</h2>
        <Link 
          href="/register" 
          className="bg-white text-brand px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors inline-block"
        >
          Join now — it's free
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="font-bold text-xl uppercase tracking-wider">MedLearn</div>
            <div className="flex gap-8 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Platform</a>
              <a href="#" className="hover:text-white transition-colors">Company</a>
              <a href="#" className="hover:text-white transition-colors">Legal</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} MedLearn. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
