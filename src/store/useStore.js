import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      onboarded: false,
      profile: {
        name: '', role: '', // 'student' | 'professional' | 'both'
        institution: '', goals: [], challenges: [],
        aiPersonality: 'balanced', workStyle: '',
        customInstructions: '',
      },
      stats: { decisions: 0, plans: 0, timeSaved: 0, streak: 0, focusScore: 78, lastActive: null },
      history: [], // { id, type:'decision'|'plan', title, content, choices, result, createdAt, role }
      messages: [], // chat messages

      completeOnboarding: (data) => set({ onboarded: true, profile: { ...get().profile, ...data } }),
      updateProfile: (data) => set(s => ({ profile: { ...s.profile, ...data } })),

      addHistory: (item) => set(s => ({
        history: [{ ...item, id: Date.now(), createdAt: new Date().toISOString() }, ...s.history],
        stats: {
          ...s.stats,
          decisions: item.type === 'decision' ? s.stats.decisions + 1 : s.stats.decisions,
          plans: item.type === 'plan' ? s.stats.plans + 1 : s.stats.plans,
          timeSaved: s.stats.timeSaved + (item.type === 'plan' ? 45 : 5),
          lastActive: new Date().toISOString(),
        }
      })),

      addMessage: (msg) => set(s => ({ messages: [...s.messages, { ...msg, id: Date.now() }] })),
      clearMessages: () => set({ messages: [] }),

      resetAll: () => set({
        onboarded: false,
        profile: { name:'',role:'',institution:'',goals:[],challenges:[],aiPersonality:'balanced',workStyle:'',customInstructions:'' },
        stats: { decisions:0,plans:0,timeSaved:0,streak:0,focusScore:78,lastActive:null },
        history: [], messages: [],
      }),
    }),
    { name: 'decimate-ai-v2' }
  )
)
