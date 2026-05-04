'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, Stethoscope, FlaskConical, Building2 } from 'lucide-react'

// Map of topics
const ALL_TOPICS = [
  'Cardiology', 'Oncology', 'Genomics', 'Neurology', 'AI in Healthcare', 
  'Infectious Disease', 'Public Health', 'Radiology', 'Pharmacology', 
  'Mental Health', 'Clinical Trials', 'Bioinformatics', 'Medical Education', 
  'Global Health', 'Surgery', 'Drug Discovery', 'Epidemiology', 'Bioethics'
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const router = useRouter()

  const handleTopicToggle = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(prev => prev.filter(t => t !== topic))
    } else {
      setSelectedTopics(prev => [...prev, topic])
    }
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
    else router.push('/feed')
  }

  const renderStep1 = () => (
    <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-[64px] h-[64px] bg-brand-light rounded-full flex items-center justify-center mb-6">
        <GraduationCap size={32} className="text-brand" />
      </div>
      <h2 className="text-[24px] font-bold text-foreground">Student</h2>
      <p className="text-[16px] text-muted-foreground mt-2 mb-8">Undergraduate, postgraduate, or MBBS student</p>
      
      <div className="w-full text-left mb-8">
        <label className="text-sm font-medium text-foreground block mb-2">Where do you study or work?</label>
        <input
          type="text"
          className="w-full border border-border rounded-[6px] px-[16px] py-[12px] text-[15px] focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all"
          placeholder="e.g. AIIMS New Delhi"
        />
      </div>

      <button
        onClick={handleNext}
        className="w-full bg-brand hover:bg-[#0a5a47] text-white py-[14px] rounded-[24px] font-semibold transition-colors"
      >
        Continue
      </button>
      <button className="mt-4 text-[14px] text-muted-foreground hover:text-foreground font-medium w-full py-2">
        Change role
      </button>
    </div>
  )

  const renderStep2 = () => (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-[22px] font-bold text-foreground mb-1">What are you interested in?</h2>
      <p className="text-muted-foreground text-[15px] mb-8">Pick at least 3 topics to personalise your experience.</p>

      <div className="flex flex-wrap gap-3 mb-8">
        {ALL_TOPICS.map(topic => {
          const isSelected = selectedTopics.includes(topic)
          return (
            <button
              key={topic}
              onClick={() => handleTopicToggle(topic)}
              className={`px-[18px] py-[8px] rounded-[20px] text-[14px] font-medium transition-colors border ${
                isSelected 
                  ? 'bg-brand text-white border-transparent' 
                  : 'bg-white text-foreground border-border hover:bg-brand-light hover:border-brand/30'
              }`}
            >
              {topic}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
        <div className={`text-[14px] font-semibold ${selectedTopics.length >= 3 ? 'text-brand' : 'text-red-500'}`}>
          {selectedTopics.length} selected
        </div>
        <button
          onClick={handleNext}
          disabled={selectedTopics.length < 3}
          className="bg-brand text-white px-[32px] py-[12px] rounded-[24px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0a5a47] transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-[22px] font-bold text-foreground mb-1">Almost there</h2>
      <p className="text-muted-foreground text-[15px] mb-8">You can update all of this anytime.</p>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Bio</label>
          <textarea
            className="w-full border border-border rounded-[6px] px-[16px] py-[12px] text-[15px] min-h-[80px] focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all resize-y"
            placeholder="Tell people about your research interests..."
            maxLength={200}
          />
          <div className="text-right text-[12px] text-muted-foreground mt-1">
            0 / 200
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">LinkedIn URL <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input
            type="text"
            className="w-full border border-border rounded-[6px] px-[16px] py-[12px] text-[15px] focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all"
            placeholder="linkedin.com/in/yourname"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">ResearchGate URL <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input
            type="text"
            className="w-full border border-border rounded-[6px] px-[16px] py-[12px] text-[15px] focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all"
            placeholder="researchgate.net/profile/yourname"
          />
        </div>
      </div>

      <div className="flex flex-col mt-8 gap-3">
        <button
          onClick={handleNext}
          className="w-full bg-brand hover:bg-[#0a5a47] text-white py-[14px] rounded-[24px] font-semibold transition-colors"
        >
          Complete setup
        </button>
        <button 
          onClick={handleNext}
          className="w-full py-[14px] text-brand font-semibold hover:bg-brand-light rounded-[24px] transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-[80px] px-4 pb-12">
      <div className="w-full max-w-[560px]">
        {/* Progress Bar */}
        <div className="mb-[60px] relative">
          <div className="h-[4px] bg-border w-full rounded-full absolute top-1/2 -translate-y-1/2 z-0">
            <div 
              className="h-full bg-brand rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <div className="relative z-10 flex justify-between">
            {/* Step 1 Dot */}
            <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[12px] font-bold transition-colors duration-500 border-[3px] bg-white ${step >= 1 ? 'border-brand text-brand' : 'border-border text-muted-foreground'}`}>
              1
            </div>
            {/* Step 2 Dot */}
            <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[12px] font-bold transition-colors duration-500 border-[3px] bg-white ${step >= 2 ? 'border-brand text-brand' : 'border-border text-muted-foreground'}`}>
              2
            </div>
            {/* Step 3 Dot */}
            <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[12px] font-bold transition-colors duration-500 border-[3px] bg-white ${step >= 3 ? 'border-brand text-brand' : 'border-border text-muted-foreground'}`}>
              3
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>
  )
}
