'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { useAIPanel } from '@/hooks/useAIPanel'
import { SummariseTab } from './SummariseTab'
import { ProjectIdeasTab } from './ProjectIdeasTab'
import { ConceptPathTab } from './ConceptPathTab'

interface AIBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  paperTitle: string
  paperId: string | null
}

type TabType = 'summarise' | 'compare' | 'projectIdeas' | 'conceptPath'
type LevelType = 'student' | 'researcher'

export function AIBottomSheet({ isOpen, onClose, paperTitle, paperId }: AIBottomSheetProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summarise')
  const [level, setLevel] = useState<LevelType>('student')

  const { data, loading, errors, fetchSimplify, fetchProjectIdeas, fetchConceptPath } = useAIPanel(
    paperId
  )

  useEffect(() => {
    if (!isOpen || !paperId) return
    if (activeTab === 'summarise') {
      void fetchSimplify(level)
    } else if (activeTab === 'compare') {
      void fetchSimplify('student')
      void fetchSimplify('researcher')
    } else if (activeTab === 'projectIdeas') {
      void fetchProjectIdeas()
    } else if (activeTab === 'conceptPath') {
      void fetchConceptPath()
    }
  }, [isOpen, activeTab, level, paperId, fetchSimplify, fetchProjectIdeas, fetchConceptPath])

  const simplifyKey = `simplify_${level}` as const
  const summariseLoading = !!loading[simplifyKey]
  const summariseError = errors[simplifyKey] || ''
  const summariseData = data.simplify[level]

  const studentLoading = !!loading.simplify_student
  const studentError = errors.simplify_student || ''
  const studentData = data.simplify.student

  const researcherLoading = !!loading.simplify_researcher
  const researcherError = errors.simplify_researcher || ''
  const researcherData = data.simplify.researcher

  const projectLoading = !!loading.projectIdeas
  const projectError = errors.projectIdeas || ''
  const projectData = data.projectIdeas

  const conceptLoading = !!loading.conceptPath
  const conceptError = errors.conceptPath || ''
  const conceptData = data.conceptPath?.concepts ?? null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[49] backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-background z-[50] flex flex-col border-t border-border"
            style={{
              height: '75vh',
              borderRadius: '16px 16px 0 0',
              boxShadow: '0 -4px 32px rgba(0,0,0,0.15)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="w-full flex justify-center pt-[12px] pb-[8px] cursor-grab active:cursor-grabbing border-b border-transparent">
              <div className="w-[36px] h-[4px] bg-black/15 rounded-[2px]" />
            </div>

            <div className="flex items-center justify-between px-[20px] py-[8px] border-b border-border pointer-events-auto">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <Sparkles size={18} fill="#D97706" className="text-[#D97706] shrink-0" />
                <span className="text-[15px] font-bold text-[#D97706] truncate">AI Research Panel</span>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {activeTab === 'summarise' ? (
                  <div className="flex bg-muted rounded-full p-1 border border-border">
                    <button
                      type="button"
                      onClick={() => setLevel('student')}
                      className={`text-[12px] font-semibold px-3 py-1 rounded-full transition-all duration-200 ${
                        level === 'student'
                          ? 'bg-card text-brand shadow-sm'
                          : 'text-muted-foreground hover:text-foreground/80'
                      }`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setLevel('researcher')}
                      className={`text-[12px] font-semibold px-3 py-1 rounded-full transition-all duration-200 ${
                        level === 'researcher'
                          ? 'bg-card text-brand shadow-sm'
                          : 'text-muted-foreground hover:text-foreground/80'
                      }`}
                    >
                      Researcher
                    </button>
                  </div>
                ) : activeTab === 'compare' ? (
                  <div className="text-[12px] font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Student vs Researcher
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={onClose}
                  className="text-muted-foreground hover:bg-black/5 hover:text-foreground p-1 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="bg-muted/50 border-b border-border px-[20px] py-[8px]">
              <div className="text-[13px] text-muted-foreground font-medium truncate">{paperTitle}</div>
            </div>

            <div className="flex items-center border-b border-border px-[20px] shrink-0 overflow-x-auto scrollbar-hide">
              <button
                type="button"
                onClick={() => setActiveTab('summarise')}
                className={`text-[14px] font-semibold px-[20px] py-[12px] border-b-[2px] whitespace-nowrap transition-colors ${
                  activeTab === 'summarise'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground/80'
                }`}
              >
                Summarise
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('compare')}
                className={`text-[14px] font-semibold px-[20px] py-[12px] border-b-[2px] whitespace-nowrap transition-colors ${
                  activeTab === 'compare'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground/80'
                }`}
              >
                Compare
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('projectIdeas')}
                className={`text-[14px] font-semibold px-[20px] py-[12px] border-b-[2px] whitespace-nowrap transition-colors ${
                  activeTab === 'projectIdeas'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground/80'
                }`}
              >
                Project Ideas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('conceptPath')}
                className={`text-[14px] font-semibold px-[20px] py-[12px] border-b-[2px] whitespace-nowrap transition-colors ${
                  activeTab === 'conceptPath'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground/80'
                }`}
              >
                Concept Path
              </button>
            </div>

            <div className="flex-1 overflow-hidden relative w-full">
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />

              <div
                className="h-full overflow-y-auto w-full"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(0,0,0,0.15) transparent',
                }}
              >
                <div className="p-[20px] pb-[60px] max-w-[1000px] mx-auto w-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab + level}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      {activeTab === 'summarise' && (
                        <SummariseTab
                          data={summariseData}
                          loading={summariseLoading}
                          error={summariseError}
                        />
                      )}
                      {activeTab === 'compare' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="rounded-2xl border border-border bg-card/40 p-4">
                            <div className="mb-3">
                              <h3 className="text-[15px] font-bold text-foreground">Student view</h3>
                              <p className="text-[13px] text-muted-foreground">Plain-language explanation for quick understanding.</p>
                            </div>
                            <SummariseTab
                              data={studentData}
                              loading={studentLoading}
                              error={studentError}
                            />
                          </div>
                          <div className="rounded-2xl border border-border bg-card/40 p-4">
                            <div className="mb-3">
                              <h3 className="text-[15px] font-bold text-foreground">Researcher view</h3>
                              <p className="text-[13px] text-muted-foreground">Higher-detail framing for technical reading.</p>
                            </div>
                            <SummariseTab
                              data={researcherData}
                              loading={researcherLoading}
                              error={researcherError}
                            />
                          </div>
                        </div>
                      )}
                      {activeTab === 'projectIdeas' && (
                        <ProjectIdeasTab ideas={projectData} loading={projectLoading} error={projectError} />
                      )}
                      {activeTab === 'conceptPath' && (
                        <ConceptPathTab concepts={conceptData} loading={conceptLoading} error={conceptError} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
