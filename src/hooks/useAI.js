import { useState } from 'react'
import { useStore } from '../store/useStore'

const BASE = 'https://openrouter.ai/api/v1/chat/completions'
const KEY  = import.meta.env.VITE_OPENROUTER_API_KEY
const MODEL_TEXT = import.meta.env.VITE_OPENROUTER_MODEL_TEXT || 'arcee-ai/trinity-large-preview:free'

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

  async function callAI(messages) {
    if (!KEY) return { ok: false, text: '⚠️ Add VITE_OPENROUTER_API_KEY to your .env file. Get a free key at openrouter.ai' }
    setLoading(true); setError(null)
    try {
      const res = await fetch(BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Decimate AI',
        },
        body: JSON.stringify({ model: MODEL_TEXT, messages, max_tokens: 1200, temperature: 0.72 }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e?.error?.message || `HTTP ${res.status}`)
      }
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content?.trim() || ''
      return { ok: true, text }
    } catch (e) {
      setError(e.message)
      return { ok: false, text: `Error: ${e.message}` }
    } finally {
      setLoading(false)
    }
  }

  // ── CHAT ──────────────────────────────────────────────────────────
  async function chat(userMsg, history = []) {
    const messages = [
      { role: 'system', content: buildSystem(profile) },
      ...history.slice(-8).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMsg },
    ]
    return callAI(messages)
  }

  // ── ANALYSE DECISION ──────────────────────────────────────────────
  // Given an array of choices, pick the BEST one with reasoning
  async function analyseDecision(choices, context = '') {
    const role = profile.role
    const prompt = `The user needs help making a decision.
${context ? `Context: ${context}` : ''}
Options to choose from:
${choices.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Analyse these options considering the user is a ${role || 'student/professional'}.
Respond in this EXACT format:

BEST CHOICE: [state the exact option text]
WHY: [2-3 sentences explaining clearly why this is the best choice]
TRADE-OFF: [1 sentence on what they give up by not choosing the others]`

    const messages = [
      { role: 'system', content: buildSystem(profile) },
      { role: 'user', content: prompt },
    ]
    return callAI(messages)
  }

  // ── REGENERATE DECISION ───────────────────────────────────────────
  async function reanalyseDecision(choices, context, previousChoice) {
    const role = profile.role
    const prompt = `The user rejected this recommendation: "${previousChoice}".
They want a different perspective on their decision.
${context ? `Context: ${context}` : ''}
Options:
${choices.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Give a DIFFERENT best choice (not "${previousChoice}") with fresh reasoning.
Format:
BEST CHOICE: [option text]
WHY: [2-3 sentences]
TRADE-OFF: [1 sentence]`

    const messages = [
      { role: 'system', content: buildSystem(profile) },
      { role: 'user', content: prompt },
    ]
    return callAI(messages)
  }

  // ── CREATE PLAN (Student = Timetable, Professional = Action Plan) ──
  async function createPlan(tasks, uploadedText = '') {
    const isStudent = profile.role === 'student'
    const isPro     = profile.role === 'professional'
    const isBoth    = profile.role === 'both'

    let prompt
    if (isStudent) {
      prompt = `Create a detailed STUDENT TIMETABLE for the following tasks/subjects:
${tasks.length > 0 ? tasks.join(', ') : 'General study tasks'}
${uploadedText ? `\nUploaded task details:\n${uploadedText}` : ''}

The student's peak hours are: ${profile.workStyle || 'flexible'}.
Create a realistic daily timetable with time blocks. Include study sessions, breaks, meals, and rest.
Format as a structured timetable with clear time slots. Use this format:

TIMETABLE TITLE: [title]
DATE: Today

TIME BLOCKS:
[time] | [subject/task] | [duration] | [notes]
...

STUDY TIPS:
- [tip 1]
- [tip 2]
- [tip 3]`
    } else if (isPro) {
      prompt = `Create a detailed PROFESSIONAL ACTION PLAN for the following tasks:
${tasks.length > 0 ? tasks.join(', ') : 'General professional tasks'}
${uploadedText ? `\nUploaded task details:\n${uploadedText}` : ''}

Peak productivity hours: ${profile.workStyle || 'flexible'}.
Create a structured professional work plan with priorities, time estimates, and execution order.

Format:
PLAN TITLE: [title]

PRIORITY TASKS:
[Priority] | [Task] | [Time Estimate] | [Expected Outcome]
...

EXECUTION SCHEDULE:
[Time block] | [Task] | [Focus level needed]
...

KEY MILESTONES:
- [milestone 1]
- [milestone 2]`
    } else {
      prompt = `Create a COMBINED STUDENT & PROFESSIONAL DAILY PLAN for:
${tasks.length > 0 ? tasks.join(', ') : 'General tasks'}
${uploadedText ? `\nUploaded task details:\n${uploadedText}` : ''}

Peak hours: ${profile.workStyle || 'flexible'}.
Balance both academic and professional responsibilities.

Format:
PLAN TITLE: [title]

MORNING (Academic Focus):
[time] | [task] | [notes]

AFTERNOON (Professional Focus):
[time] | [task] | [notes]

EVENING (Review & Prep):
[time] | [task] | [notes]

BALANCE TIPS:
- [tip]`
    }

    const messages = [
      { role: 'system', content: buildSystem(profile) },
      { role: 'user', content: prompt },
    ]
    return callAI(messages)
  }

  return { chat, analyseDecision, reanalyseDecision, createPlan, loading, error }
}
