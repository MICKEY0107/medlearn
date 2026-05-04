'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { FileText, Lightbulb, HelpCircle, FolderGit2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { papersAPI, postsAPI } from '@/lib/api-client'
import { mediaUrl } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function FeedComposer({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('insight')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [formContent, setFormContent] = useState('')
  const [paperUrl, setPaperUrl] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [projectUrl, setProjectUrl] = useState('')

  if (!user) return null

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  const roleColors: Record<string, string> = {
    student: 'bg-brand/10 text-brand outline-brand',
    doctor: 'bg-blue-50 text-blue-600 outline-blue-600',
    researcher: 'bg-amber-50 text-amber-600 outline-amber-600',
    lab: 'bg-purple-50 text-purple-600 outline-purple-600'
  }
  const avatarClass = roleColors[user?.role] || roleColors.student

  const openModal = (tab: string) => {
    setActiveTab(tab)
    setSubmitError('')
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')

    try {
      let finalPaperId = null

      if (activeTab === 'paper') {
        if (!paperUrl.trim()) {
          setSubmitError('Paper URL is required.')
          return
        }

        try {
          const { data } = await papersAPI.ingest({ url: paperUrl.trim() })
          finalPaperId = data.paper.id
        } catch (err: any) {
          console.error('Paper ingest failed:', err)
          setSubmitError(err.response?.data?.error || 'Paper ingest failed. Please check the URL and try again.')
          return
        }
      }

      const response = await postsAPI.create({
        type: activeTab,
        content: formContent,
        paperId: finalPaperId,
        title: activeTab === 'project' ? projectTitle.trim() : undefined,
        githubUrl: activeTab === 'project' ? projectUrl.trim() || undefined : undefined,
      })

      const { status } = response

      if (status === 201) {
        setOpen(false)
        setShowToast(true)
        setSubmitError('')
        setFormContent('')
        setPaperUrl('')
        setProjectTitle('')
        setProjectUrl('')
        setTimeout(() => setShowToast(false), 3000)
        queryClient.invalidateQueries({ queryKey: ['feed'] })
        onSuccess?.()
      }
    } catch (err: any) {
      console.error('Failed to post:', err)
      setSubmitError(err.response?.data?.error || 'Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* ── Composer card ── */}
      <div className="bg-white border border-border rounded-[0.75rem] p-4 mb-3 shadow-sm">

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-1 rounded-full bg-brand" />
          <h2 className="text-[14px] font-bold text-foreground tracking-tight">Post & Share</h2>
        </div>

        {/* Input row */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`shrink-0 w-[38px] h-[38px] rounded-full overflow-hidden flex items-center justify-center font-bold text-[13px] ${avatarClass}`}
          >
            {user.profilePhoto ? (
              <img src={mediaUrl(user.profilePhoto)} alt="" className="w-full h-full object-cover" />
            ) : (
              getInitials(user?.name || 'User')
            )}
          </div>
          <div
            onClick={() => openModal('insight')}
            className="flex-1 bg-[#F9F6F2] border border-border rounded-full px-4 py-2.5 cursor-pointer hover:border-brand/40 hover:bg-[#F5F0EB] transition-all"
          >
            <span className="text-[13px] text-muted-foreground select-none">Share a paper, insight, or question…</span>
          </div>
        </div>

        {/* Post type buttons — each uses its own post-type color */}
        <div className="grid grid-cols-4 gap-2">
          {/* Paper — blue */}
          <button
            onClick={() => openModal('paper')}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] hover:bg-[#DBEAFE] transition-colors text-[#2563EB]"
          >
            <FileText size={15} />
            <span className="text-[12px] font-bold hidden sm:inline">Paper</span>
          </button>

          {/* Insight — purple */}
          <button
            onClick={() => openModal('insight')}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border border-[#DDD6FE] bg-[#F5F3FF] hover:bg-[#EDE9FE] transition-colors text-[#7C3AED]"
          >
            <Lightbulb size={15} />
            <span className="text-[12px] font-bold hidden sm:inline">Insight</span>
          </button>

          {/* Question — green */}
          <button
            onClick={() => openModal('question')}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors text-green-700"
          >
            <HelpCircle size={15} />
            <span className="text-[12px] font-bold hidden sm:inline">Question</span>
          </button>

          {/* Project — yellow */}
          <button
            onClick={() => openModal('project')}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-colors text-yellow-700"
          >
            <FolderGit2 size={15} />
            <span className="text-[12px] font-bold hidden sm:inline">Project</span>
          </button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="text-lg">Create a post</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-4 bg-muted">
                <TabsTrigger value="paper" className="text-xs sm:text-sm">Paper</TabsTrigger>
                <TabsTrigger value="insight" className="text-xs sm:text-sm">Insight</TabsTrigger>
                <TabsTrigger value="question" className="text-xs sm:text-sm">Question</TabsTrigger>
                <TabsTrigger value="project" className="text-xs sm:text-sm">Project</TabsTrigger>
              </TabsList>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-4">
              {submitError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {submitError}
                </div>
              )}
              <TabsContent value="paper" className="mt-0 outline-none flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Paper URL</label>
                  <input 
                    type="url" required 
                    value={paperUrl} onChange={(e) => setPaperUrl(e.target.value)}
                    placeholder="Paste PubMed, Semantic Scholar, or DOI link" className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Your thoughts</label>
                  <textarea 
                    required 
                    value={formContent} onChange={(e) => setFormContent(e.target.value)}
                    placeholder="What are your key takeaways from this paper?" className="w-full border border-border rounded-md px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:border-brand resize-y" 
                  />
                </div>
              </TabsContent>

              <TabsContent value="insight" className="mt-0 outline-none flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Insight share</label>
                  <textarea 
                    required 
                    value={formContent} onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Share an observation, clinical experience, or analysis. Markdown is supported." className="w-full border border-border rounded-md px-3 py-2 text-sm min-h-[120px] focus:outline-none focus:border-brand resize-y" 
                  />
                </div>
              </TabsContent>

              <TabsContent value="question" className="mt-0 outline-none flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Your Question</label>
                  <textarea 
                    required 
                    value={formContent} onChange={(e) => setFormContent(e.target.value)}
                    placeholder="What do you need help understanding? e.g. How does this methodology apply to..." className="w-full border border-border rounded-md px-3 py-2 text-sm min-h-[120px] focus:outline-none focus:border-brand resize-y" 
                  />
                </div>
              </TabsContent>

              <TabsContent value="project" className="mt-0 outline-none flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Project Name</label>
                  <input 
                    type="text" required 
                    value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. RetinaScan Viewer" className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Description</label>
                  <textarea 
                    required 
                    value={formContent} onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Explain what you built..." className="w-full border border-border rounded-md px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:border-brand resize-y" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">GitHub / URL (Optional)</label>
                  <input 
                    type="url" 
                    value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="https://github.com/..." className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand" 
                  />
                </div>
              </TabsContent>

              <div className="flex justify-end pt-2 border-t border-border mt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-brand text-white px-6 py-2 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Posting...
                    </>
                  ) : 'Post'}
                </button>
              </div>
            </form>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Custom Toast implementation for Phase 1 without heavy dependency */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-5 h-5 bg-brand rounded-full flex items-center justify-center">
            <Check size={12} strokeWidth={3} className="text-white" />
          </div>
          <span className="font-medium text-sm">Post shared successfully</span>
        </div>
      )}
    </>
  )
}

function Check({ className, ...props }: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
