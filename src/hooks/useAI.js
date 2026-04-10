import { useState } from 'react'
import { useStore } from '../store/useStore'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
// Free model: mistralai/mistral-7b-instruct:free
const FREE_MODEL = 'mistralai/mistral-7b-instruct:free'

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const profile = useStore(s => s.profile)
  const addMessage = useStore(s => s.addMessage)

  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY

  function buildSystemPrompt() {
    const modeDesc = {
      strict: 'You are in STRICT MODE. Be direct, no-nonsense, no excuses. Push the user hard. Short, punchy sentences.',
      zen: 'You are in ZEN MODE. Be calm, supportive, mindful. Use gentle language and acknowledge emotions.',
      balanced: 'You are in BALANCED MODE. Be smart, practical, and friendly. Mix encouragement with realistic advice.',
    }
    const custom = profile.customInstructions
      ? `\n\nUser preferences: ${profile.customInstructions}` : ''

    return `You are Decimate AI, an elite decision intelligence assistant.
${modeDesc[profile.aiPersonality] || modeDesc.balanced}

User profile:
- Name: ${profile.name || 'User'}
- Role: ${profile.role || 'not specified'}
- Work style: ${profile.workStyle || 'flexible'}
- Goals: ${(profile.goals || []).join(', ') || 'general productivity'}
- Challenges: ${(profile.challenges || []).join(', ') || 'not specified'}
${custom}

You help users make better decisions, create study/work schedules, and overcome cognitive overload.
When asked to create a plan or schedule, respond with a JSON block inside triple backticks like:
\`\`\`json
{
  "title": "Plan Title",
  "type": "study|work|health|mixed",
  "blocks": [
    {"time": "08:00 – 09:30", "label": "Task name", "desc": "Short description", "color": "#hex"},
    ...
  ]
}
\`\`\`
Otherwise respond in plain text. Be concise. Max 3 paragraphs for explanations.`
  }

  async function chat(userMessage, conversationHistory = []) {
    if (!apiKey) {
      return { text: "⚠️ No API key found. Add VITE_OPENROUTER_API_KEY to your .env file.", plan: null }
    }

    setLoading(true)
    setError(null)

    const messages = [
      { role: 'system', content: buildSystemPrompt() },
      ...conversationHistory.slice(-6),
      { role: 'user', content: userMessage },
    ]

    try {
      const res = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Decimate AI',
        },
        body: JSON.stringify({
          model: FREE_MODEL,
          messages,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message || `API error ${res.status}`)
      }

      const data = await res.json()
      const rawText = data.choices?.[0]?.message?.content || ''

      // Try to extract JSON plan
      let plan = null
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/)
      if (jsonMatch) {
        try { plan = JSON.parse(jsonMatch[1]) } catch {}
      }

      const text = rawText.replace(/```json[\s\S]*?```/g, '').trim()

      addMessage({ role: 'user', content: userMessage, ts: Date.now() })
      addMessage({ role: 'assistant', content: rawText, ts: Date.now() })

      return { text, plan }
    } catch (err) {
      setError(err.message)
      return { text: `Error: ${err.message}`, plan: null }
    } finally {
      setLoading(false)
    }
  }

  async function generateSchedule(tasks, mode) {
    const prompt = `Create a time-blocked daily schedule for these tasks: ${tasks.join(', ')}.
Role: ${mode}. Personality: ${profile.aiPersonality}.
Make it realistic with proper breaks. Return ONLY the JSON block.`
    return chat(prompt)
  }

  return { chat, generateSchedule, loading, error }
}
