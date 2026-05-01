# 🧠 Decimate AI v2.0

> AI-powered decision intelligence for students and professionals.
> Built for **Hult Prize 2026** · Kenya National Competition · Strathmore University

---

## ✨ What's New in v2

- ✅ **AI Chat fully working** — real OpenRouter API calls with context awareness
- ✅ **Make a Decision** — AI picks the single best choice from your options with ✓/✗ verdict buttons
- ✅ **Create Plan / Build Timetable** — role-aware AI plans (student = timetable, professional = action plan)
- ✅ **Export Plans** — download as .txt file
- ✅ **Role-aware UI** — app knows if you're a student, professional, or both — everything adapts
- ✅ **History with dialog** — click any history item to open full detail modal
- ✅ **Onboarding saves to localStorage** — all preferences persist across sessions
- ✅ **Free AI models** — uses arcee-ai/trinity-large-preview:free via OpenRouter

---

## 🚀 Quick Start

### 1. Install

```bash
unzip decimate-ai-v2.zip
cd decimate-ai
npm install
```

### 2. Set up API key

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
VITE_OPENROUTER_MODEL=nvidia/nemotron-nano-12b-v2-vl:free
VITE_OPENROUTER_MODEL_TEXT=arcee-ai/trinity-large-preview:free
```

Get your **free** key at [openrouter.ai](https://openrouter.ai) — no credit card needed.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## ☁️ Deploy to Vercel

### Option A — Vercel CLI
```bash
npm install -g vercel
vercel
# Add env var: VITE_OPENROUTER_API_KEY when prompted
```

### Option B — Vercel Dashboard
1. Push to GitHub
2. Import at [vercel.com](https://vercel.com) → New Project
3. Add environment variable: `VITE_OPENROUTER_API_KEY`
4. Deploy ✅

---

## 🗂 Project Structure

```
src/
├── components/
│   ├── ui.jsx          # Button, Card, Chip, Modal, Toast, AiText, etc.
│   └── ui.css
├── hooks/
│   └── useAI.js        # OpenRouter API — chat, analyseDecision, createPlan
├── pages/
│   ├── Onboarding.jsx  # 7-step onboarding — saves role, goals, personality
│   ├── AppLayout.jsx   # Sidebar + topbar + toast context
│   ├── Dashboard.jsx   # Role-aware dashboard with stats
│   ├── Decide.jsx      # Make Decision + Build Timetable/Plan
│   ├── Chat.jsx        # Working AI chat with role-aware prompts
│   ├── History.jsx     # Clickable history with detail modal
│   └── Settings.jsx    # Profile, AI personality, custom instructions
├── store/
│   └── useStore.js     # Zustand store — persisted to localStorage
├── App.jsx
├── main.jsx
└── index.css           # Global CSS design tokens
```

---

## 🤖 AI Models Used

| Purpose | Model | Cost |
|---------|-------|------|
| Chat & Decisions | `arcee-ai/trinity-large-preview:free` | Free |
| Vision (fallback) | `nvidia/nemotron-nano-12b-v2-vl:free` | Free |

---

## 👥 Team

| Name | Role |
|------|------|
| **Ekisa Joseph** | CEO & Lead Engineer — BSc Information Technology |
| **Davine Othiambo** | Marketing Manager — BSc Computer Science |

**University of Eldoret, Kenya** · Hult Prize 2026
