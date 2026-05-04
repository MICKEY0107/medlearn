'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useAuth } from '@/context/AuthContext'
import { usersAPI, uploadAPI } from '@/lib/api-client'
import { mediaUrl } from '@/lib/utils'
import { Check, X } from 'lucide-react'

export default function ProfileEditPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const { user, setUser } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [topicInput, setTopicInput] = useState('')

  const [name, setName] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [institution, setInstitution] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])

  const { data: profileResp, isLoading } = useQuery({
    queryKey: ['profile-edit', user?.id],
    queryFn: () => usersAPI.getProfile(user!.id).then((r) => r.data.user),
    enabled: !!user?.id,
  })

  const { data: followedTopics = [], refetch: refetchTopics } = useQuery({
    queryKey: ['user-topics', user?.id],
    queryFn: () => usersAPI.getUserTopics(user!.id).then((r) => r.data.topics as string[]),
    enabled: !!user?.id,
  })

  useEffect(() => {
    if (!profileResp) return
    setName(profileResp.name || '')
    setHeadline(profileResp.headline || '')
    setBio(profileResp.bio || '')
    setInstitution(profileResp.institution || '')
    setInterests(profileResp.interests || [])
    setSkills(profileResp.skills || [])
  }, [profileResp])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('photo', file)
    try {
      const res = await uploadAPI.profilePhoto(formData)
      setUser((prev) => (prev ? { ...prev, profilePhoto: res.data.photoUrl } : prev))
      void qc.invalidateQueries({ queryKey: ['profile-edit', user?.id] })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const unfollowTopic = useMutation({
    mutationFn: (topic: string) => usersAPI.unfollowTopicBody(topic),
    onSuccess: () => {
      void refetchTopics()
      void qc.invalidateQueries({ queryKey: ['user-topics', user?.id] })
    },
  })

  const followTopic = useMutation({
    mutationFn: (topic: string) => usersAPI.followTopic(topic),
    onSuccess: () => {
      void refetchTopics()
      void qc.invalidateQueries({ queryKey: ['user-topics', user?.id] })
    },
  })

  const saveProfile = useMutation({
    mutationFn: () =>
      usersAPI.updateProfile(user!.id, {
        name: name.trim(),
        headline: headline.trim() || null,
        bio: bio.trim() || null,
        institution: institution.trim() || null,
        interests,
        skills,
      }),
    onSuccess: ({ data }) => {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              name: data.user.name,
              headline: data.user.headline,
              institution: data.user.institution,
            }
          : prev
      )
      setShowToast(true)
      setTimeout(() => {
        setShowToast(false)
        router.push(`/profile/${user!.id}`)
      }, 1200)
    },
  })

  const addInterest = (raw: string) => {
    const t = raw.trim()
    if (!t || interests.includes(t)) return
    setInterests((prev) => [...prev, t])
  }

  const addSkill = (raw: string) => {
    const t = raw.trim()
    if (!t || skills.includes(t)) return
    setSkills((prev) => [...prev, t])
  }

  const onTopicKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const t = topicInput.trim().toLowerCase()
    if (!t) return
    followTopic.mutate(t, {
      onSuccess: () => setTopicInput(''),
    })
  }

  if (!user) return null

  if (isLoading && !profileResp) {
    return (
      <PageWrapper>
        <div className="animate-pulse space-y-4 max-w-[640px] mx-auto py-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="w-full max-w-[640px] mx-auto py-6 sm:py-8 px-4 sm:px-0 mb-20">
        <div className="bg-white border border-border rounded-[8px] p-[24px] sm:p-[32px]">
          <h1 className="text-[22px] font-bold text-foreground">Edit profile</h1>
          <p className="text-[14px] text-muted-foreground mt-1 mb-[32px]">Keep your profile up to date.</p>

          <div className="relative w-24 h-24 mx-auto mb-6">
            <img
              src={mediaUrl(user.profilePhoto)}
              alt=""
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
            />
            <label className="absolute bottom-0 right-0 bg-teal-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-teal-700 text-sm">
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              {uploading ? '…' : '📷'}
            </label>
          </div>

          <div className="flex flex-col gap-[20px] mb-[32px]">
            <h2 className="text-[16px] font-bold border-b border-border pb-2">Basic Info</h2>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[14px] font-bold text-black/80">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-border rounded-[8px] px-[14px] py-[10px] text-[14px] bg-transparent focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all font-sans"
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <div className="flex justify-between items-end">
                <label className="text-[14px] font-bold text-black/80">Headline</label>
                <span className="text-[12px] text-muted-foreground">{headline.length}/120</span>
              </div>
              <input
                type="text"
                maxLength={120}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full border border-border rounded-[8px] px-[14px] py-[10px] text-[14px] bg-transparent focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all font-sans"
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <div className="flex justify-between items-end">
                <label className="text-[14px] font-bold text-black/80">Bio</label>
                <span className="text-[12px] text-muted-foreground">{bio.length}/200</span>
              </div>
              <textarea
                maxLength={200}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full border border-border rounded-[8px] px-[14px] py-[10px] text-[14px] min-h-[96px] resize-y bg-transparent focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all font-sans leading-relaxed"
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[14px] font-bold text-black/80">Institution</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full border border-border rounded-[8px] px-[14px] py-[10px] text-[14px] bg-transparent focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all font-sans"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[20px] mb-[32px]">
            <h2 className="text-[16px] font-bold border-b border-border pb-2">Topics you follow</h2>
            <p className="text-[13px] text-muted-foreground">Press Enter to follow a topic (shown on your sidebar).</p>
            <div className="flex flex-wrap gap-2">
              {followedTopics.map((topic) => (
                <span
                  key={topic}
                  className="px-[12px] py-[4px] rounded-[16px] border border-brand bg-brand/5 text-brand text-[13px] font-semibold flex items-center gap-1"
                >
                  #{topic}
                  <button
                    type="button"
                    className="hover:text-black hover:bg-black/10 rounded-full p-0.5"
                    onClick={() => unfollowTopic.mutate(topic)}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={onTopicKeyDown}
              placeholder="Add a topic and press Enter…"
              className="w-full border border-border rounded-[8px] px-[14px] py-[10px] text-[14px] bg-transparent focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all font-sans"
            />
          </div>

          <div className="flex flex-col gap-[20px] mb-[32px]">
            <h2 className="text-[16px] font-bold border-b border-border pb-2">Interests</h2>
            <div className="flex flex-wrap gap-2 mb-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="px-[12px] py-[4px] rounded-[16px] border border-brand bg-brand/5 text-brand text-[13px] font-semibold flex items-center gap-1"
                >
                  {interest}
                  <button
                    type="button"
                    className="hover:text-black hover:bg-black/10 rounded-full p-0.5"
                    onClick={() => setInterests((prev) => prev.filter((x) => x !== interest))}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add interest and press Enter…"
              className="w-full border border-border rounded-[8px] px-[14px] py-[10px] text-[14px] bg-transparent focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all font-sans"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addInterest((e.target as HTMLInputElement).value)
                  ;(e.target as HTMLInputElement).value = ''
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-[20px] mb-[40px]">
            <h2 className="text-[16px] font-bold border-b border-border pb-2">Skills</h2>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-[#F3F2EE] border border-border text-black/75 px-[10px] py-[4px] rounded-[12px] text-[12px] font-semibold flex items-center gap-1"
                >
                  {skill}
                  <button
                    type="button"
                    className="hover:text-black/80 hover:bg-black/10 rounded-full p-0.5"
                    onClick={() => setSkills((prev) => prev.filter((x) => x !== skill))}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add skill and press Enter…"
              className="w-full border border-border rounded-[8px] px-[14px] py-[10px] text-[14px] bg-transparent focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all font-sans"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSkill((e.target as HTMLInputElement).value)
                  ;(e.target as HTMLInputElement).value = ''
                }
              }}
            />
          </div>

          <div className="flex items-center justify-end gap-[16px] border-t border-border pt-[24px]">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-[16px] py-[8px] text-[14px] font-semibold text-muted-foreground hover:bg-[#F3F2EE] rounded-[16px] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saveProfile.isPending}
              onClick={() => saveProfile.mutate()}
              className="px-[20px] py-[8px] rounded-[16px] bg-brand text-white text-[14px] font-semibold hover:bg-[#0a5a47] transition-colors disabled:opacity-60"
            >
              {saveProfile.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl z-[100] flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-5 h-5 bg-brand rounded-full flex items-center justify-center">
            <Check size={12} strokeWidth={3} className="text-white" />
          </div>
          <span className="font-medium text-[14px]">Profile updated</span>
        </div>
      )}
    </PageWrapper>
  )
}
