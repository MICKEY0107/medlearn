import { useState, useCallback, useEffect } from 'react'
import { aiAPI } from '@/lib/api-client'

export type AILevel = 'student' | 'researcher'

export interface SimplifyResult {
  plain_summary: string
  key_findings: string[]
  methodology_type: string
  methodology_detail: string
  limitations: string[]
  study_population: string
}

export interface ProjectIdea {
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_weeks: number
  project_title: string
  problem_statement: string
  approach: string
  tech_stack: string[]
  dataset_name: string
  dataset_url: string
}

export interface ConceptItem {
  concept_name: string
  why_needed: string
  resource_type: 'video' | 'article' | 'course' | 'definition'
  resource_title: string
  resource_url: string
}

interface AIState {
  simplify: { student: SimplifyResult | null; researcher: SimplifyResult | null }
  projectIdeas: ProjectIdea[] | null
  conceptPath: { concepts: ConceptItem[] } | null
}

export function useAIPanel(paperId: string | null) {
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [data, setData] = useState<AIState>({
    simplify: { student: null, researcher: null },
    projectIdeas: null,
    conceptPath: null,
  })

  useEffect(() => {
    setData({
      simplify: { student: null, researcher: null },
      projectIdeas: null,
      conceptPath: null,
    })
    setLoading({})
    setErrors({})
  }, [paperId])

  const fetchSimplify = useCallback(async (level: AILevel) => {
    if (!paperId) return
    if (data.simplify[level]) return // Already loaded

    const key = `simplify_${level}`
    setLoading(prev => ({ ...prev, [key]: true }))
    setErrors(prev => ({ ...prev, [key]: '' }))

    try {
      const response = await aiAPI.simplify(paperId, level)
      setData(prev => ({
        ...prev,
        simplify: { ...prev.simplify, [level]: response.data.result },
      }))
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to generate summary'
      setErrors(prev => ({ ...prev, [key]: message }))
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }))
    }
  }, [paperId, data.simplify])

  const fetchProjectIdeas = useCallback(async () => {
    if (!paperId) return
    if (data.projectIdeas) return

    setLoading(prev => ({ ...prev, projectIdeas: true }))
    setErrors(prev => ({ ...prev, projectIdeas: '' }))

    try {
      const response = await aiAPI.projectIdeas(paperId)
      setData(prev => ({ ...prev, projectIdeas: response.data.result }))
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to generate project ideas'
      setErrors(prev => ({ ...prev, projectIdeas: message }))
    } finally {
      setLoading(prev => ({ ...prev, projectIdeas: false }))
    }
  }, [paperId, data.projectIdeas])

  const fetchConceptPath = useCallback(async () => {
    if (!paperId) return
    if (data.conceptPath) return

    setLoading(prev => ({ ...prev, conceptPath: true }))
    setErrors(prev => ({ ...prev, conceptPath: '' }))

    try {
      const response = await aiAPI.conceptPath(paperId)
      setData(prev => ({ ...prev, conceptPath: response.data.result }))
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to generate concept path'
      setErrors(prev => ({ ...prev, conceptPath: message }))
    } finally {
      setLoading(prev => ({ ...prev, conceptPath: false }))
    }
  }, [paperId, data.conceptPath])

  return {
    data,
    loading,
    errors,
    fetchSimplify,
    fetchProjectIdeas,
    fetchConceptPath,
  }
}
