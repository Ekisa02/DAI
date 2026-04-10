# 🧠 Decimate AI — Empowering Smart Decisions

> AI-powered decision intelligence for students and professionals.
> Built for Hult Prize 2026 · Kenya National Competition · Strathmore University

---

## ✨ Features

- **Multi-step Onboarding** — collects and saves user preferences (name, role, goals, challenges, work style, AI personality, custom instructions)
- **AI-Powered Decision Planning** — generates time-blocked schedules using Mistral 7B via OpenRouter (free)
- **AI Chat Assistant** — conversational AI with full context of your profile and preferences
- **Decision History** — all saved plans persisted in localStorage via Zustand
- **Settings** — update profile, switch AI personality, edit custom instructions
- **Fully Responsive** — works on desktop, tablet, and mobile
- **Dark Mode** — premium dark UI with vibrant accents

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Ekisa02/decimate-ai.git
cd decimate-ai
npm install
```

### 2. Set up your API key

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_OPENROUTER_API_KEY=your_key_here
```

Get your **FREE** key at [openrouter.ai](https://openrouter.ai) — no credit card needed.
The app uses `mistralai/mistral-7b-instruct:free` which is completely free.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## ☁️ Deploy to Vercel

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option B: Vercel Dashboard

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add environment variable: `VITE_OPENROUTER_API_KEY` = your key
4. Click Deploy ✅

---

## 🗂 Project Structure

```
decimate-ai/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui.jsx          # Reusable UI components (Button, Card, Chip, etc.)
│   │   └── ui.css
│   ├── hooks/
│   │   └── useAI.js        # OpenRouter API hook
│   ├── pages/
│   │   ├── Onboarding.jsx  # 7-step onboarding flow
│   │   ├── AppLayout.jsx   # Sidebar + topbar shell
│   │   ├── Dashboard.jsx   # Main dashboard
│   │   ├── Decide.jsx      # Help Me Decide + AI plan generator
│   │   ├── Chat.jsx        # AI chat interface
│   │   ├── History.jsx     # Saved plans
│   │   └── Settings.jsx    # Profile + preferences
│   ├── store/
│   │   └── useStore.js     # Zustand store (persisted to localStorage)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css           # Global CSS design tokens
├── .env.example
├── vercel.json
└── vite.config.js
```

---

## 🤖 AI Model

- **Model**: `mistralai/mistral-7b-instruct:free`
- **Provider**: [OpenRouter.ai](https://openrouter.ai)
- **Cost**: Completely free
- **Context**: User's full profile, personality mode, and custom instructions are sent with every request

---

## 👥 Team

| Name | Role |
|------|------|
| Ekisa Joseph | CEO & Lead Engineer — BSc Information Technology |
| Davine Othiambo | Marketing Manager — BSc Computer Science |

**University of Eldoret, Kenya**

---

## 🏆 Hult Prize 2026

Competing at the Kenya National Competition hosted at Strathmore University, May 2, 2026.
Out of 18,000+ teams from 130+ countries — one of 1,500 selected for Nationals.
