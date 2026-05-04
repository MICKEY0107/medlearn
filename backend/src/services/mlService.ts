import axios from 'axios'
import { generateRemoteJSON } from '../lib/remoteAI'

export type SimplifyLevel = 'student' | 'researcher'

export interface PaperLike {
  id?: string
  title: string
  abstract: string
  authors: string[]
  tags: string[]
  year?: number | null
  journal?: string | null
  source?: string | null
}

export interface SimplifyResult {
  plain_summary: string
  key_findings: string[]
  methodology_type: string
  methodology_detail: string
  limitations: string[]
  study_population: string
}

export interface ProjectIdeaResult {
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_weeks: number
  project_title: string
  problem_statement: string
  approach: string
  tech_stack: string[]
  dataset_name: string
  dataset_url: string
}

export interface ConceptPathItem {
  concept_name: string
  why_needed: string
  resource_type: 'video' | 'article' | 'course' | 'definition'
  resource_title: string
  resource_url: string
}

export interface ConceptPathResult {
  concepts: ConceptPathItem[]
}

export interface DiscussionSummaryResult {
  key_claims: string[]
  consensus_points: string[]
  open_questions: string[]
}

export interface SimilarPaperResult {
  id: string
  title: string
  authors: string[]
  year?: number | null
  journal?: string | null
  tags: string[]
  score: number
}

interface LocalSummariseResponse extends SimplifyResult {}

interface LocalClassifyResponse {
  tags: string[]
  methodology_type?: string
  confidence?: number
}

interface CommentLike {
  content: string
  author: {
    name: string
    role: string
  }
}

const mlBaseUrl = process.env.ML_SERVICE_URL?.trim()?.replace(/\/$/, '') || ''

const stopWords = new Set([
  'about', 'after', 'again', 'also', 'among', 'because', 'been', 'before', 'being', 'between', 'both',
  'could', 'does', 'each', 'from', 'have', 'into', 'only', 'other', 'over', 'same', 'should', 'such',
  'than', 'that', 'their', 'there', 'these', 'this', 'those', 'through', 'under', 'using', 'very', 'what',
  'when', 'where', 'which', 'while', 'with', 'within', 'would', 'were', 'will', 'they', 'them', 'then',
  'than', 'into', 'your', 'ours', 'ourselves', 'study', 'paper', 'result', 'results', 'found', 'showed',
  'demonstrated', 'analysis', 'patients', 'patient', 'participants', 'subjects', 'group', 'groups', 'data',
])

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function splitSentences(text: string): string[] {
  return cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

function clampWords(text: string, maxWords: number): string {
  const words = cleanText(text).split(/\s+/)
  if (words.length <= maxWords) return cleanText(text)
  return `${words.slice(0, maxWords).join(' ')}…`
}

function tokenize(text: string): string[] {
  return cleanText(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopWords.has(token))
}

function uniqueStrings(items: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of items) {
    const key = item.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

function overlapCount(a: string[], b: string[]): number {
  const bSet = new Set(b)
  return new Set(a).size === 0 ? 0 : [...new Set(a)].filter((token) => bSet.has(token)).length
}

function inferMethodologyType(title: string, abstract: string): string {
  const text = `${title} ${abstract}`.toLowerCase()
  if (text.includes('meta-analysis')) return 'Meta-Analysis'
  if (text.includes('systematic review')) return 'Systematic Review'
  if (text.includes('randomized') || text.includes('randomised') || text.includes('rct')) return 'RCT'
  if (text.includes('cohort') || text.includes('prospective') || text.includes('retrospective')) return 'Cohort Study'
  if (text.includes('case report') || text.includes('case series')) return 'Case Study'
  if (text.includes('deep learning') || text.includes('neural network') || text.includes('machine learning') || text.includes('computational')) {
    return 'Computational'
  }
  if (text.includes('trial') || text.includes('intervention') || text.includes('experimental')) return 'Experimental'
  return 'Other'
}

function sentenceWithPattern(sentences: string[], pattern: RegExp): string | null {
  return sentences.find((sentence) => pattern.test(sentence.toLowerCase())) || null
}

function extractStudyPopulation(sentences: string[]): string {
  const populationPattern = /(\d[\d,\.]*\s+(patients?|participants?|subjects?|adults?|children|images?|studies?|cases?|sites?|records?|samples?))/i
  const populationSentence = sentences.find((sentence) => populationPattern.test(sentence))
  if (populationSentence) return clampWords(populationSentence, 24)
  return 'The abstract does not provide a single clear study-population sentence.'
}

function extractMethodologyDetail(title: string, abstract: string, methodologyType: string): string {
  const sentences = splitSentences(abstract)
  const designSentence = sentenceWithPattern(
    sentences,
    /(trial|cohort|review|meta-analysis|systematic review|prospective|retrospective|cross-sectional|multisite|single-center|multicenter|follow-up|months|years)/i
  )
  if (designSentence) return clampWords(designSentence, 28)
  return clampWords(`${methodologyType} examining ${title}.`, 28)
}

function extractLimitations(abstract: string): string[] {
  const sentences = splitSentences(abstract)
  const explicit = sentences.filter((sentence) =>
    /(limitation|limited|single-center|single centre|small sample|retrospective|short follow-up|short follow up|bias|external validation)/i.test(sentence)
  )
  const picked = explicit.slice(0, 2).map((sentence) => clampWords(sentence, 20))
  if (picked.length > 0) return uniqueStrings(picked)
  return [
    'The abstract alone does not describe every possible source of bias or confounding.',
    'Some methodological detail may only be available in the full paper rather than the abstract.',
  ]
}

function extractKeyFindings(abstract: string): string[] {
  const sentences = splitSentences(abstract)
  const resultsFirst = sentences.filter((sentence) =>
    /(found|showed|demonstrated|achieved|reduced|improved|associated|sensitivity|specificity|auc|accuracy|significant|increase|decrease|resolution)/i.test(sentence)
  )
  const pool = resultsFirst.length > 0 ? resultsFirst : sentences
  return uniqueStrings(pool.slice(0, 4).map((sentence) => clampWords(sentence, 22)))
}

function buildPlainSummary(title: string, abstract: string, level: SimplifyLevel): string {
  const sentences = splitSentences(abstract)
  if (sentences.length === 0) {
    return level === 'student'
      ? `This paper examines ${title} and explains why the topic matters.`
      : `This paper examines ${title}.`
  }

  const summarySentences = sentences.slice(0, level === 'student' ? 2 : 3).map((sentence) => clampWords(sentence, level === 'student' ? 18 : 24))
  return summarySentences.join(' ')
}

function heuristicSimplify(paper: PaperLike, level: SimplifyLevel): SimplifyResult {
  const methodologyType = inferMethodologyType(paper.title, paper.abstract)
  const sentences = splitSentences(paper.abstract)
  return {
    plain_summary: buildPlainSummary(paper.title, paper.abstract, level),
    key_findings: extractKeyFindings(paper.abstract),
    methodology_type: methodologyType,
    methodology_detail: extractMethodologyDetail(paper.title, paper.abstract, methodologyType),
    limitations: extractLimitations(paper.abstract),
    study_population: extractStudyPopulation(sentences),
  }
}

function inferTopic(paper: PaperLike): string {
  const text = `${paper.title} ${paper.abstract} ${paper.tags.join(' ')}`.toLowerCase()
  if (/(retina|retinopathy|ophthalm)/.test(text)) return 'ophthalmology'
  if (/(ecg|cardio|atrial|arrhythm|heart)/.test(text)) return 'cardiology'
  if (/(cancer|oncology|tumou?r|genomic|mutation)/.test(text)) return 'oncology'
  if (/(sepsis|icu|critical care|hospital)/.test(text)) return 'critical care'
  if (/(microbiome|gut|bacteria|depress)/.test(text)) return 'microbiome'
  if (/(llm|language model|clinical decision support|ai|deep learning|machine learning)/.test(text)) return 'clinical ai'
  return 'biomedical research'
}

function datasetForTopic(topic: string): { name: string; url: string } {
  switch (topic) {
    case 'ophthalmology':
      return { name: 'EyePACS diabetic retinopathy dataset', url: '' }
    case 'cardiology':
      return { name: 'PhysioNet MIT-BIH Arrhythmia Database', url: '' }
    case 'oncology':
      return { name: 'The Cancer Genome Atlas (TCGA)', url: '' }
    case 'critical care':
      return { name: 'MIMIC-III or MIMIC-IV', url: '' }
    case 'microbiome':
      return { name: 'CuratedMetagenomicData or American Gut', url: '' }
    case 'clinical ai':
      return { name: 'MIMIC-III demo tasks or UCI clinical datasets', url: '' }
    default:
      return { name: 'Kaggle or UCI medical datasets related to the paper topic', url: '' }
  }
}

function heuristicProjectIdeas(paper: PaperLike): ProjectIdeaResult[] {
  const topic = inferTopic(paper)
  const dataset = datasetForTopic(topic)
  const subject = clampWords(paper.title, 8).replace(/[.:]$/, '')

  return [
    {
      difficulty: 'beginner',
      estimated_weeks: 3,
      project_title: `${subject} dashboard`,
      problem_statement: `Build a small app that helps students explore the main variables and outcomes discussed in this ${topic} paper.`,
      approach: 'Create a cleaned dataset view, add summary charts, and let users compare key outcomes or labels described by the paper.',
      tech_stack: ['Next.js', 'TypeScript', 'Python', 'Pandas'],
      dataset_name: dataset.name,
      dataset_url: dataset.url,
    },
    {
      difficulty: 'intermediate',
      estimated_weeks: 5,
      project_title: `${subject} baseline predictor`,
      problem_statement: `Turn the core question from the paper into a reproducible baseline modelling project for ${topic}.`,
      approach: 'Recreate a simplified prediction or classification task, evaluate a baseline model, and compare model outputs against the paper’s stated findings.',
      tech_stack: ['Python', 'scikit-learn', 'Jupyter', 'FastAPI'],
      dataset_name: dataset.name,
      dataset_url: dataset.url,
    },
    {
      difficulty: 'advanced',
      estimated_weeks: 10,
      project_title: `${subject} research replication pipeline`,
      problem_statement: `Build a more rigorous end-to-end pipeline that tests whether the paper’s main conclusion generalises to another cohort or split.`,
      approach: 'Add data versioning, stronger evaluation, subgroup analysis, and an API or interface for reviewing outputs and failure cases.',
      tech_stack: ['Python', 'PyTorch', 'FastAPI', 'PostgreSQL', 'Docker'],
      dataset_name: dataset.name,
      dataset_url: dataset.url,
    },
  ]
}

function conceptTemplates(paper: PaperLike): ConceptPathItem[] {
  const text = `${paper.title} ${paper.abstract} ${paper.tags.join(' ')}`.toLowerCase()
  const concepts: ConceptPathItem[] = []

  const push = (concept: ConceptPathItem) => {
    if (!concepts.some((item) => item.concept_name.toLowerCase() === concept.concept_name.toLowerCase())) {
      concepts.push(concept)
    }
  }

  push({
    concept_name: 'Study design basics',
    why_needed: 'You need the study-design frame to understand what kind of evidence this paper can actually support.',
    resource_type: 'definition',
    resource_title: 'Study design overview',
    resource_url: '',
  })

  if (/(meta-analysis|systematic review)/.test(text)) {
    push({
      concept_name: 'Forest plots and pooled effect sizes',
      why_needed: 'These are central to understanding how evidence is combined across multiple studies.',
      resource_type: 'article',
      resource_title: 'Forest plots and pooled estimates',
      resource_url: '',
    })
    push({
      concept_name: 'Heterogeneity in evidence synthesis',
      why_needed: 'It explains why results can vary across studies even when they ask similar questions.',
      resource_type: 'definition',
      resource_title: 'Heterogeneity in meta-analysis',
      resource_url: '',
    })
  }

  if (/(deep learning|neural network|image|retina|radiology|vision)/.test(text)) {
    push({
      concept_name: 'Convolutional neural networks',
      why_needed: 'This helps you understand how the model learns patterns from clinical or biomedical images.',
      resource_type: 'video',
      resource_title: 'CNN basics for image models',
      resource_url: '',
    })
    push({
      concept_name: 'Sensitivity, specificity, and ROC curves',
      why_needed: 'These metrics explain the paper’s diagnostic performance claims.',
      resource_type: 'article',
      resource_title: 'Diagnostic model evaluation metrics',
      resource_url: '',
    })
  }

  if (/(trial|randomized|randomised|cohort|prospective|retrospective)/.test(text)) {
    push({
      concept_name: 'Confounding and bias',
      why_needed: 'You need this to judge whether the reported association is likely to be causal or distorted by study design.',
      resource_type: 'definition',
      resource_title: 'Bias and confounding',
      resource_url: '',
    })
  }

  if (/(genomic|mutation|crispr|gene)/.test(text)) {
    push({
      concept_name: 'Variant interpretation and genomic assays',
      why_needed: 'This explains what the biological measurements mean and how they support the paper’s conclusions.',
      resource_type: 'article',
      resource_title: 'Genomic assay and variant basics',
      resource_url: '',
    })
  }

  return concepts.slice(0, 6)
}

function heuristicConceptPath(paper: PaperLike): ConceptPathResult {
  return { concepts: conceptTemplates(paper) }
}

function trimCommentSummary(text: string): string {
  return clampWords(text.replace(/\s+/g, ' ').replace(/^[-•\d.\s]+/, ''), 25)
}

function heuristicDiscussionSummary(comments: CommentLike[]): DiscussionSummaryResult {
  const claimPool = uniqueStrings(
    comments
      .map((comment) => trimCommentSummary(comment.content))
      .filter(Boolean)
      .slice(0, 3)
  )

  const questionPool = uniqueStrings(
    comments
      .map((comment) => comment.content.trim())
      .filter((content) => /\?|^(how|what|why|could|should|does|is|are)\b/i.test(content))
      .map((content) => trimCommentSummary(content))
      .slice(0, 3)
  )

  const tokenFrequency = new Map<string, number>()
  for (const comment of comments) {
    for (const token of new Set(tokenize(comment.content))) {
      tokenFrequency.set(token, (tokenFrequency.get(token) || 0) + 1)
    }
  }

  const consensusTokens = [...tokenFrequency.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([token]) => token)

  const consensus_points = consensusTokens.map((token) => `Several commenters focused on ${token} when discussing the post.`)

  return {
    key_claims: claimPool,
    consensus_points,
    open_questions: questionPool,
  }
}

function heuristicTags(paper: PaperLike): string[] {
  const text = `${paper.title} ${paper.abstract}`.toLowerCase()
  const tags = new Set<string>()

  const rules: Array<[RegExp, string[]]> = [
    [/(retina|retinopathy|ophthalm)/, ['ophthalmology', 'medical imaging']],
    [/(deep learning|neural network|machine learning|ai|llm)/, ['artificial intelligence', 'machine learning']],
    [/(cardio|ecg|atrial|arrhythm|heart)/, ['cardiology']],
    [/(cancer|oncology|tumou?r)/, ['oncology']],
    [/(genomic|gene|crispr|mutation)/, ['genomics']],
    [/(microbiome|gut|bacteria)/, ['microbiome']],
    [/(randomized|randomised|trial|rct)/, ['clinical trial']],
    [/(meta-analysis|systematic review)/, ['evidence synthesis']],
    [/(cohort|prospective|retrospective)/, ['cohort study']],
  ]

  for (const [pattern, values] of rules) {
    if (pattern.test(text)) {
      values.forEach((value) => tags.add(value))
    }
  }

  for (const token of tokenize(paper.title).slice(0, 4)) {
    if (token.length > 4) tags.add(token)
    if (tags.size >= 8) break
  }

  return [...tags].slice(0, 8)
}

async function postLocal<T>(path: string, payload: unknown): Promise<T | null> {
  if (!mlBaseUrl) return null
  try {
    const response = await axios.post<T>(`${mlBaseUrl}${path}`, payload, { timeout: 4000 })
    return response.data
  } catch {
    return null
  }
}

export async function generateSimplifyResult(paper: PaperLike, level: SimplifyLevel): Promise<SimplifyResult> {
  const localResult = await postLocal<LocalSummariseResponse>('/summarise', {
    title: paper.title,
    abstract: paper.abstract,
    level,
  })
  if (localResult) return localResult

  const levelInstruction = level === 'student'
    ? 'Use no jargon. Write as if explaining to a curious first-year medical student. Use analogies where helpful.'
    : 'Preserve technical terms. Include statistical framing. Write for a peer researcher.'

  const anthropicResult = await generateRemoteJSON<SimplifyResult>(`You are a biomedical research analyst. Analyse this paper and return ONLY valid JSON with no other text, no markdown, no explanation.

${levelInstruction}

Return this exact structure:
{
  "plain_summary": "2-3 sentence explanation of what this paper found and why it matters",
  "key_findings": ["finding 1", "finding 2", "finding 3", "finding 4"],
  "methodology_type": "one of: RCT | Cohort Study | Meta-Analysis | Systematic Review | Case Study | Experimental | Computational | Other",
  "methodology_detail": "one sentence describing study design, sample size, duration",
  "limitations": ["limitation 1", "limitation 2"],
  "study_population": "who was studied, how many, what setting"
}

Only use information from the paper. Do not invent findings.

Title: ${paper.title}
Authors: ${paper.authors.join(', ')}
Abstract: ${paper.abstract}`)
  if (anthropicResult) return anthropicResult

  return heuristicSimplify(paper, level)
}

export async function generateProjectIdeas(paper: PaperLike, keyFindings?: string): Promise<ProjectIdeaResult[]> {
  const anthropicResult = await generateRemoteJSON<ProjectIdeaResult[]>(`You are a research-to-project advisor for healthcare students. Generate exactly 3 student-buildable project proposals from this paper. Return ONLY a valid JSON array with no other text, no markdown, no explanation.

Rules:
- One beginner (2-3 weeks, no ML required), one intermediate (4-6 weeks, basic ML acceptable), one advanced (8-12 weeks, research-level)
- Datasets must be real and publicly available: Kaggle, PhysioNet, MIMIC-III, UCI ML Repository, NIH open data
- Be specific — vague ideas are useless to students
- Tech stacks must be realistic for the difficulty level
- If you are unsure of a dataset URL, leave dataset_url as an empty string

Return this exact structure:
[
  {
    "difficulty": "beginner",
    "estimated_weeks": 3,
    "project_title": "string",
    "problem_statement": "string",
    "approach": "string",
    "tech_stack": ["string"],
    "dataset_name": "string",
    "dataset_url": "string"
  },
  { ...intermediate... },
  { ...advanced... }
]

Paper title: ${paper.title}
Abstract: ${paper.abstract}
${keyFindings ? `Key findings: ${keyFindings}` : ''}`)
  if (anthropicResult && Array.isArray(anthropicResult) && anthropicResult.length === 3) return anthropicResult

  return heuristicProjectIdeas(paper)
}

export async function generateConceptPath(paper: PaperLike): Promise<ConceptPathResult> {
  const anthropicResult = await generateRemoteJSON<ConceptPathResult>(`You are a learning path designer for healthcare students. Identify 3-6 prerequisite concepts a student must understand before this paper makes full sense. Return ONLY valid JSON with no other text, no markdown.

Rules:
- Order from most foundational to most advanced
- Only use these resource sources: Khan Academy, YouTube (Osmosis, StatQuest, Armando Hasudungan, NEJM channels only), Coursera free audit, NCBI PMC review articles, Wikipedia for definitions only
- Concept names must be specific — not "biology", say "Kaplan-Meier survival curves"
- If you are unsure of a resource URL, leave resource_url as an empty string

Return this structure:
{
  "concepts": [
    {
      "concept_name": "string",
      "why_needed": "one sentence connecting this concept to understanding the paper",
      "resource_type": "video | article | course | definition",
      "resource_title": "string",
      "resource_url": "string"
    }
  ]
}

Paper title: ${paper.title}
Abstract: ${paper.abstract}
Tags: ${paper.tags.join(', ')}`)
  if (anthropicResult?.concepts?.length) return anthropicResult

  return heuristicConceptPath(paper)
}

export async function generateDiscussionSummary(comments: CommentLike[]): Promise<DiscussionSummaryResult> {
  const commentText = comments.map((comment) => `${comment.author.name} (${comment.author.role}): ${comment.content}`).join('\n\n')
  const anthropicResult = await generateRemoteJSON<DiscussionSummaryResult>(`Summarise this discussion thread from a healthcare research post. Return ONLY valid JSON:

{
  "key_claims": ["claim 1", "claim 2", "claim 3"],
  "consensus_points": ["point 1", "point 2"],
  "open_questions": ["question 1", "question 2"]
}

Rules:
- Only include claims actually made in the comments — do not invent
- Maximum 3 items per array
- Each item maximum 25 words

Comments:
${commentText.substring(0, 3000)}`)
  if (anthropicResult) return anthropicResult

  return heuristicDiscussionSummary(comments)
}

export async function generatePaperTags(paper: PaperLike): Promise<string[]> {
  const localResult = await postLocal<LocalClassifyResponse>('/classify', {
    title: paper.title,
    abstract: paper.abstract,
  })
  if (localResult?.tags?.length) return uniqueStrings(localResult.tags).slice(0, 8)

  const anthropicResult = await generateRemoteJSON<string[]>(`Generate 5-8 specific medical or research topic tags for this paper. Return ONLY a JSON array of strings, no other text.

Title: ${paper.title}
Abstract: ${paper.abstract.substring(0, 500)}`)
  if (Array.isArray(anthropicResult) && anthropicResult.length > 0) {
    return uniqueStrings(anthropicResult.map((tag) => String(tag))).slice(0, 8)
  }

  return heuristicTags(paper)
}

export function rankSimilarPapers(currentPaper: PaperLike, candidates: PaperLike[]): SimilarPaperResult[] {
  const currentTitleTokens = tokenize(currentPaper.title)
  const currentAbstractTokens = tokenize(currentPaper.abstract)
  const currentTagTokens = currentPaper.tags.map((tag) => tag.toLowerCase())

  return candidates
    .map((candidate) => {
      const tagOverlap = overlapCount(currentTagTokens, candidate.tags.map((tag) => tag.toLowerCase()))
      const titleOverlap = overlapCount(currentTitleTokens, tokenize(candidate.title))
      const abstractOverlap = overlapCount(currentAbstractTokens, tokenize(candidate.abstract))
      const methodologyBonus = inferMethodologyType(currentPaper.title, currentPaper.abstract) === inferMethodologyType(candidate.title, candidate.abstract) ? 1.5 : 0
      const score = tagOverlap * 5 + titleOverlap * 2.5 + abstractOverlap * 1.25 + methodologyBonus

      return {
        id: candidate.id || '',
        title: candidate.title,
        authors: candidate.authors,
        year: candidate.year,
        journal: candidate.journal,
        tags: candidate.tags,
        score,
      }
    })
    .filter((candidate) => !!candidate.id && candidate.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}
