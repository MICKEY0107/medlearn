import axios from 'axios'
import Anthropic from '@anthropic-ai/sdk'
import { claudeConfigured } from './aiDemoNormalize'

function cleanJSONText(text: string): string {
  return text.replace(/```json|```/g, '').trim()
}

async function openAICompatibleJSON<T>(
  baseUrl: string,
  apiKey: string,
  model: string,
  prompt: string,
  maxTokens: number
): Promise<T | null> {
  try {
    const response = await axios.post(
      `${baseUrl.replace(/\/$/, '')}/chat/completions`,
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: maxTokens,
      },
      {
        timeout: 15000,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...(baseUrl.includes('openrouter.ai') && process.env.OPENROUTER_SITE_URL
            ? { 'HTTP-Referer': process.env.OPENROUTER_SITE_URL }
            : {}),
          ...(baseUrl.includes('openrouter.ai') && process.env.OPENROUTER_APP_NAME
            ? { 'X-Title': process.env.OPENROUTER_APP_NAME }
            : {}),
        },
      }
    )

    const content = response.data?.choices?.[0]?.message?.content
    if (typeof content !== 'string') return null
    return JSON.parse(cleanJSONText(content)) as T
  } catch {
    return null
  }
}

async function anthropicJSON<T>(prompt: string, maxTokens: number): Promise<T | null> {
  const apiKey = process.env.CLAUDE_API_KEY?.trim()
  if (!apiKey || !claudeConfigured()) return null

  try {
    const anthropic = new Anthropic({ apiKey })
    const message = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL?.trim() || 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    })
    const content = message.content[0]
    if (content.type !== 'text') return null
    return JSON.parse(cleanJSONText(content.text)) as T
  } catch {
    return null
  }
}

export async function generateRemoteJSON<T>(prompt: string, maxTokens = 2048): Promise<T | null> {
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim()
  const openRouterModel = process.env.OPENROUTER_MODEL?.trim()
  if (openRouterKey && openRouterModel) {
    const result = await openAICompatibleJSON<T>(
      process.env.OPENROUTER_BASE_URL?.trim() || 'https://openrouter.ai/api/v1',
      openRouterKey,
      openRouterModel,
      prompt,
      maxTokens
    )
    if (result) return result
  }

  const groqKey = process.env.GROQ_API_KEY?.trim()
  const groqModel = process.env.GROQ_MODEL?.trim()
  if (groqKey && groqModel) {
    const result = await openAICompatibleJSON<T>(
      process.env.GROQ_BASE_URL?.trim() || 'https://api.groq.com/openai/v1',
      groqKey,
      groqModel,
      prompt,
      maxTokens
    )
    if (result) return result
  }

  return anthropicJSON<T>(prompt, maxTokens)
}
