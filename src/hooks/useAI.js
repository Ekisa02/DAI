import { useState } from 'react'
import { useStore } from '../store/useStore'

const BASE = 'https://openrouter.ai/api/v1/chat/completions'
const KEY  = import.meta.env.VITE_OPENROUTER_API_KEY

// ── Confirmed working FREE models on OpenRouter (May 2026) ──────────────
// Tried in order — if one fails with "no endpoints", next is attempted.
// Do NOT rely on env var model names — they go stale when models are removed.
const FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'google/gemma-3-4b-it:free',
  'deepseek/deepseek-r1:free',
]

function buildSystem(profile) {
  const modeMap = {
    strict:   'STRICT MODE: Be direct, no fluff, push hard, short punchy sentences.',
    zen:      'ZEN MODE: Calm, mindful, compassionate, supportive tone.',
    balanced: 'BALANCED MODE: Smart, practical, warm, realistic.',
  }
  const roleCtx = profile.role === 'student'
    ? 'The user is a STUDENT. All advice, plans, and responses must be academic/student-focused.'
    : profile.role === 'professional'
    ? 'The user is a PROFESSIONAL. All advice must be career/work focused at a professional level.'
    : 'The user is BOTH a student and professional. Show both academic and professional perspectives.'

  return `You are Decimate AI, an elite decision intelligence assistant.
${modeMap[profile.aiPersonality] || modeMap.balanced}
${roleCtx}
User: ${profile.name || 'User'} | Peak hours: ${profile.workStyle || 'flexible'} | Goals: ${(profile.goals||[]).join(', ')||'productivity'}
${profile.customInstructions ? 'Custom: ' + profile.customInstructions : ''}
Be concise. Max 3 short paragraphs unless creating a structured plan/timetable.`
}

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const profile = useStore(s => s.profile)

  // Try each free model in sequence until one works
  async function callWithFallback(messages, modelIndex = 0) {
    if (modelIndex >= FREE_MODELS.length) {
      throw new Error('All free models are currently unavailable. Please try again in a moment.')
    }

    const model = FREE_MODELS[modelIndex]

    const res = await fetch(BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Decimate AI',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1200,
        temperature: 0.72,
      }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      const errMsg  = errData?.error?.message || `HTTP ${res.status}`

      // If this model has no endpoints or is unavailable — try next
      const shouldFallback =
        errMsg.toLowerCase().includes('no endpoints') ||
        errMsg.toLowerCase().includes('not found') ||
        errMsg.toLowerCase().includes('unavailable') ||
        errMsg.toLowerCase().includes('model not found') ||
        res.status === 404 ||
        res.status === 503

      if (shouldFallback) {
        console.warn(`[Decimate AI] Model "${model}" unavailable — trying fallback ${modelIndex + 1}...`)
        return callWithFallback(messages, modelIndex + 1)
      }

      throw new Error(errMsg)
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || ''
  }

  async function callAI(messages) {
    if (!KEY) {
      return {
        ok: false,
        text: '⚠️ API key missing.\n\nGo to Vercel → Your Project → Settings → Environment Variables\nAdd: VITE_OPENROUTER_API_KEY = your_key\nThen redeploy.\n\nGet a free key at openrouter.ai',
      }
    }
    setLoading(true)
    setError(null)
    try {
      const text = await callWithFallback(messages)
      return { ok: true, text }
    } catch (e) {
      setError(e.message)
      return { ok: false, text: `Error: ${e.message}` }
    } finally {
      setLoading(false)
    }
  }

  // ── CHAT ───────────────────────────────────────────────────────────
  async function chat(userMsg, history = []) {
    const messages = [
      { role: 'system', content: buildSystem(profile) },
      ...history.slice(-8).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMsg },
    ]
    return callAI(messages)
  }

  // ── ANALYSE DECISION ───────────────────────────────────────────────
  async function analyseDecision(choices, context = '') {
    const prompt = `The user needs help making a decision.
${context ? `Context: ${context}` : ''}
Options to choose from:
${choices.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Analyse these options. The user is a ${profile.role || 'student/professional'}.
Respond in this EXACT format (no extra text before or after):

BEST CHOICE: [state the exact option text here]
WHY: [2-3 sentences explaining why this is the best choice]
TRADE-OFF: [1 sentence on what they give up by not choosing the others]`

    return callAI([
      { role: 'system', content: buildSystem(profile) },
      { role: 'user', content: prompt },
    ])
  }

  // ── REGENERATE DECISION ────────────────────────────────────────────
  async function reanalyseDecision(choices, context, previousChoice) {
    const prompt = `The user rejected: "${previousChoice}". Give a DIFFERENT recommendation.
${context ? `Context: ${context}` : ''}
Options:
${choices.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Pick a DIFFERENT option (not "${previousChoice}") and explain why it could work.
Respond in this EXACT format:

BEST CHOICE: [different option text]
WHY: [2-3 sentences with fresh reasoning]
TRADE-OFF: [1 sentence]`

    return callAI([
      { role: 'system', content: buildSystem(profile) },
      { role: 'user', content: prompt },
    ])
  }

  // ── CREATE PLAN ────────────────────────────────────────────────────
  async function createPlan(tasks, uploadedText = '') {
    const isStudent = profile.role === 'student'
    const isPro     = profile.role === 'professional'

    let prompt
    if (isStudent) {
      prompt = `Create a detailed STUDENT TIMETABLE for:
${tasks.length > 0 ? tasks.join('\n') : 'General study tasks'}
${uploadedText ? `\nUploaded content:\n${uploadedText}` : ''}

Student peak hours: ${profile.workStyle || 'flexible'}.
Include study blocks, short breaks, meals, and rest.
Use this exact format:

TIMETABLE TITLE: [title]

TIME BLOCKS:
[time] | [subject/task] | [duration] | [notes]
[time] | [subject/task] | [duration] | [notes]

STUDY TIPS:
- [tip 1]
- [tip 2]
- [tip 3]`
    } else if (isPro) {
      prompt = `Create a PROFESSIONAL ACTION PLAN for:
${tasks.length > 0 ? tasks.join('\n') : 'General work tasks'}
${uploadedText ? `\nUploaded content:\n${uploadedText}` : ''}

Peak hours: ${profile.workStyle || 'flexible'}.
Use this exact format:

PLAN TITLE: [title]

PRIORITY TASKS:
[Priority] | [Task] | [Time Estimate] | [Expected Outcome]

EXECUTION SCHEDULE:
[time] | [task] | [focus level]

KEY MILESTONES:
- [milestone 1]
- [milestone 2]`
    } else {
      prompt = `Create a COMBINED STUDENT & PROFESSIONAL DAILY PLAN for:
${tasks.length > 0 ? tasks.join('\n') : 'General tasks'}
${uploadedText ? `\nUploaded content:\n${uploadedText}` : ''}

Peak hours: ${profile.workStyle || 'flexible'}.

PLAN TITLE: [title]

MORNING (Academic Focus):
[time] | [task] | [notes]

AFTERNOON (Professional Focus):
[time] | [task] | [notes]

EVENING (Review & Rest):
[time] | [task] | [notes]

BALANCE TIPS:
- [tip]`
    }

    return callAI([
      { role: 'system', content: buildSystem(profile) },
      { role: 'user', content: prompt },
    ])
  }

  return { chat, analyseDecision, reanalyseDecision, createPlan, loading, error }
}
