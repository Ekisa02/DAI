import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Onboarding ─────────────────────────────
      onboarded: false,
      profile: {
        name: '',
        role: '',          // 'student' | 'professional' | 'both'
        institution: '',
        goals: [],         // ['productivity','focus','planning','wellness']
        aiPersonality: 'balanced', // 'balanced' | 'strict' | 'zen'
        workStyle: '',     // 'morning' | 'afternoon' | 'night' | 'flexible'
        challenges: [],    // ['overload','fatigue','prioritization','procrastination']
        customInstructions: '',
      },

      // ── Stats ──────────────────────────────────
      stats: {
        decisions: 0,
        timeSaved: 0,    // minutes
        streak: 0,
        lastActive: null,
        focusScore: 78,
      },

      // ── Plans history ──────────────────────────
      plans: [],

      // ── Chat messages ──────────────────────────
      messages: [],

      // ── Actions ────────────────────────────────
      completeOnboarding: (profileData) => set({
        onboarded: true,
        profile: { ...get().profile, ...profileData },
      }),

      updateProfile: (data) => set(s => ({
        profile: { ...s.profile, ...data }
      })),

      addPlan: (plan) => set(s => ({
        plans: [plan, ...s.plans],
        stats: {
          ...s.stats,
          decisions: s.stats.decisions + 1,
          timeSaved: s.stats.timeSaved + 48,
          lastActive: new Date().toISOString(),
          streak: s.stats.streak + (isNewDay(s.stats.lastActive) ? 1 : 0),
        }
      })),

      addMessage: (msg) => set(s => ({
        messages: [...s.messages, msg]
      })),

      clearMessages: () => set({ messages: [] }),

      resetAll: () => set({
        onboarded: false,
        profile: {
          name: '', role: '', institution: '', goals: [],
          aiPersonality: 'balanced', workStyle: '',
          challenges: [], customInstructions: '',
        },
        stats: { decisions: 0, timeSaved: 0, streak: 0, lastActive: null, focusScore: 78 },
        plans: [],
        messages: [],
      }),
    }),
    { name: 'decimate-ai-store' }
  )
)

function isNewDay(lastActive) {
  if (!lastActive) return false
  const last = new Date(lastActive)
  const now = new Date()
  return last.toDateString() !== now.toDateString()
}
