import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { Button, Chip, Input, Textarea } from '../components/ui.jsx'
import './Onboarding.css'

const ROLES = [
  { id: 'student', emoji: '🎓', title: 'Student', desc: 'Managing academics & future goals' },
  { id: 'professional', emoji: '💼', title: 'Professional', desc: 'Career growth & work decisions' },
  { id: 'both', emoji: '⚡', title: 'Both', desc: 'Juggling studies and work' },
]

const GOALS = [
  { id: 'productivity', emoji: '🚀', label: 'Boost Productivity' },
  { id: 'focus', emoji: '🎯', label: 'Improve Focus' },
  { id: 'planning', emoji: '📅', label: 'Better Planning' },
  { id: 'wellness', emoji: '🌿', label: 'Mental Wellness' },
  { id: 'decisions', emoji: '⚡', label: 'Faster Decisions' },
  { id: 'habits', emoji: '🔥', label: 'Build Habits' },
]

const CHALLENGES = [
  { id: 'overload', emoji: '🌊', label: 'Decision Overload' },
  { id: 'fatigue', emoji: '😴', label: 'Mental Fatigue' },
  { id: 'procrastination', emoji: '⏳', label: 'Procrastination' },
  { id: 'prioritization', emoji: '🗂', label: 'Poor Prioritization' },
  { id: 'consistency', emoji: '📉', label: 'Inconsistency' },
  { id: 'balance', emoji: '⚖️', label: 'Work-Life Balance' },
]

const WORK_STYLES = [
  { id: 'morning', emoji: '🌅', label: 'Morning Person', desc: '5am – 12pm peak' },
  { id: 'afternoon', emoji: '☀️', label: 'Afternoon Grinder', desc: '12pm – 6pm peak' },
  { id: 'night', emoji: '🌙', label: 'Night Owl', desc: '8pm – 2am peak' },
  { id: 'flexible', emoji: '🔄', label: 'Flexible', desc: 'Varies daily' },
]

const PERSONALITIES = [
  { id: 'balanced', emoji: '⚖️', title: 'Balanced', desc: 'Smart, practical, encouraging. Best of both worlds.' },
  { id: 'strict', emoji: '💀', title: 'Strict', desc: 'No-nonsense. Maximum pressure. Zero tolerance for excuses.' },
  { id: 'zen', emoji: '🌿', title: 'Zen', desc: 'Calm, mindful, and compassionate. Slow and steady.' },
]

const STEPS = ['Welcome', 'About You', 'Your Goals', 'Challenges', 'Work Style', 'AI Personality', 'Final Touch']

const slide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -40 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
}

export default function Onboarding() {
  const completeOnboarding = useStore(s => s.completeOnboarding)
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    name: '', role: '', institution: '',
    goals: [], challenges: [], workStyle: '',
    aiPersonality: 'balanced', customInstructions: '',
  })

  const set = (key, val) => setData(d => ({ ...d, [key]: val }))
  const toggleArr = (key, id) =>
    setData(d => ({
      ...d,
      [key]: d[key].includes(id) ? d[key].filter(x => x !== id) : [...d[key], id],
    }))

  const canNext = () => {
    if (step === 1) return data.name.trim().length > 0 && data.role
    if (step === 2) return data.goals.length > 0
    if (step === 3) return data.challenges.length > 0
    if (step === 4) return data.workStyle
    if (step === 5) return data.aiPersonality
    return true
  }

  const next = () => { if (canNext()) setStep(s => s + 1) }
  const back = () => setStep(s => s - 1)
  const finish = () => completeOnboarding(data)

  const progress = ((step) / (STEPS.length - 1)) * 100

  return (
    <div className="onboarding">
      {/* Background */}
      <div className="ob-bg">
        <div className="ob-orb ob-orb-1" />
        <div className="ob-orb ob-orb-2" />
        <div className="ob-orb ob-orb-3" />
      </div>

      <div className="ob-container">
        {/* Header */}
        <div className="ob-header">
          <div className="ob-logo">
            <div className="ob-logo-mark">D</div>
            <span className="ob-logo-text">Decimate<span>AI</span></span>
          </div>
          {step > 0 && (
            <div className="ob-progress-wrap">
              <div className="ob-steps">
                {STEPS.map((s, i) => (
                  <div key={s} className={`ob-step-dot ${i <= step ? 'done' : ''} ${i === step ? 'active' : ''}`} />
                ))}
              </div>
              <div className="ob-progress-bar">
                <motion.div className="ob-progress-fill" animate={{ width: `${progress}%` }} />
              </div>
              <span className="ob-step-label">{step} / {STEPS.length - 1}</span>
            </div>
          )}
        </div>

        {/* Step content */}
        <div className="ob-card">
          <AnimatePresence mode="wait">
            {/* STEP 0: Welcome */}
            {step === 0 && (
              <motion.div key="s0" {...slide} className="ob-step">
                <div className="ob-welcome-badge">
                  <span className="ob-pulse" /> Hult Prize 2026 · Kenya Nationals
                </div>
                <h1 className="ob-headline">
                  Stop <em>surviving</em><br />your decisions.<br />
                  Start <em>owning</em> them.
                </h1>
                <p className="ob-sub">
                  Decimate AI is your personal decision intelligence layer — built to eliminate
                  cognitive overload and help you think faster, decide better, and act smarter.
                </p>
                <div className="ob-features-row">
                  {['⚡ AI Decision Engine', '🧠 Cognitive Load Manager', '📅 Smart Scheduler', '🤖 3 AI Personalities'].map(f => (
                    <div key={f} className="ob-feature-pill">{f}</div>
                  ))}
                </div>
                <Button variant="gold" size="xl" onClick={next}>
                  Get Started →
                </Button>
                <p className="ob-hint">Takes about 2 minutes to set up</p>
              </motion.div>
            )}

            {/* STEP 1: About you */}
            {step === 1 && (
              <motion.div key="s1" {...slide} className="ob-step">
                <div className="ob-step-num">01</div>
                <h2 className="ob-step-title">Let's start with you</h2>
                <p className="ob-step-sub">Tell us who you are so we can personalize your AI.</p>

                <div className="ob-field-group">
                  <Input
                    label="Your Name"
                    placeholder="e.g. Ekisa Joseph"
                    value={data.name}
                    onChange={e => set('name', e.target.value)}
                    autoFocus
                  />
                  <Input
                    label="Institution / Company (optional)"
                    placeholder="e.g. University of Eldoret"
                    value={data.institution}
                    onChange={e => set('institution', e.target.value)}
                  />
                </div>

                <div className="ob-label">I am primarily a...</div>
                <div className="ob-role-grid">
                  {ROLES.map(r => (
                    <motion.div
                      key={r.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`ob-role-card ${data.role === r.id ? 'selected' : ''}`}
                      onClick={() => set('role', r.id)}
                    >
                      <div className="ob-role-emoji">{r.emoji}</div>
                      <div className="ob-role-title">{r.title}</div>
                      <div className="ob-role-desc">{r.desc}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Goals */}
            {step === 2 && (
              <motion.div key="s2" {...slide} className="ob-step">
                <div className="ob-step-num">02</div>
                <h2 className="ob-step-title">What are your main goals?</h2>
                <p className="ob-step-sub">Pick everything that applies. We'll tailor your AI recommendations.</p>
                <div className="ob-chips-grid">
                  {GOALS.map(g => (
                    <Chip
                      key={g.id}
                      selected={data.goals.includes(g.id)}
                      onClick={() => toggleArr('goals', g.id)}
                    >
                      {g.emoji} {g.label}
                    </Chip>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 3: Challenges */}
            {step === 3 && (
              <motion.div key="s3" {...slide} className="ob-step">
                <div className="ob-step-num">03</div>
                <h2 className="ob-step-title">What holds you back?</h2>
                <p className="ob-step-sub">Be honest — your AI uses this to proactively support you.</p>
                <div className="ob-chips-grid">
                  {CHALLENGES.map(c => (
                    <Chip
                      key={c.id}
                      selected={data.challenges.includes(c.id)}
                      onClick={() => toggleArr('challenges', c.id)}
                    >
                      {c.emoji} {c.label}
                    </Chip>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: Work Style */}
            {step === 4 && (
              <motion.div key="s4" {...slide} className="ob-step">
                <div className="ob-step-num">04</div>
                <h2 className="ob-step-title">When do you work best?</h2>
                <p className="ob-step-sub">Your AI will schedule your hardest tasks during peak hours.</p>
                <div className="ob-style-grid">
                  {WORK_STYLES.map(w => (
                    <motion.div
                      key={w.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`ob-style-card ${data.workStyle === w.id ? 'selected' : ''}`}
                      onClick={() => set('workStyle', w.id)}
                    >
                      <div className="ob-style-emoji">{w.emoji}</div>
                      <div className="ob-style-title">{w.label}</div>
                      <div className="ob-style-desc">{w.desc}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 5: AI Personality */}
            {step === 5 && (
              <motion.div key="s5" {...slide} className="ob-step">
                <div className="ob-step-num">05</div>
                <h2 className="ob-step-title">Choose your AI personality</h2>
                <p className="ob-step-sub">You can always switch later in Settings.</p>
                <div className="ob-personality-grid">
                  {PERSONALITIES.map(p => (
                    <motion.div
                      key={p.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`ob-personality-card ${data.aiPersonality === p.id ? 'selected' : ''}`}
                      onClick={() => set('aiPersonality', p.id)}
                    >
                      <div className="ob-p-emoji">{p.emoji}</div>
                      <div className="ob-p-title">{p.title}</div>
                      <div className="ob-p-desc">{p.desc}</div>
                      {data.aiPersonality === p.id && <div className="ob-p-check">✓</div>}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 6: Final touch */}
            {step === 6 && (
              <motion.div key="s6" {...slide} className="ob-step">
                <div className="ob-step-num">06</div>
                <h2 className="ob-step-title">Any custom instructions?</h2>
                <p className="ob-step-sub">Tell your AI anything specific about you. This deeply personalizes responses.</p>
                <Textarea
                  placeholder={`e.g. "I hate mornings before 9am. I prefer 25-min Pomodoro blocks. I'm an introvert who gets drained by meetings. Schedule coding tasks when energy is highest."`}
                  value={data.customInstructions}
                  onChange={e => set('customInstructions', e.target.value)}
                />

                <div className="ob-summary">
                  <div className="ob-summary-title">📋 Your profile summary</div>
                  <div className="ob-summary-items">
                    <div className="ob-summary-item"><span>Name</span><strong>{data.name}</strong></div>
                    <div className="ob-summary-item"><span>Role</span><strong>{data.role}</strong></div>
                    {data.institution && <div className="ob-summary-item"><span>Institution</span><strong>{data.institution}</strong></div>}
                    <div className="ob-summary-item"><span>AI Mode</span><strong>{data.aiPersonality}</strong></div>
                    <div className="ob-summary-item"><span>Goals</span><strong>{data.goals.join(', ')}</strong></div>
                    <div className="ob-summary-item"><span>Peak Hours</span><strong>{data.workStyle}</strong></div>
                  </div>
                </div>

                <Button variant="gold" size="xl" onClick={finish} style={{ width: '100%' }}>
                  🚀 Launch Decimate AI
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          {step > 0 && step < 6 && (
            <div className="ob-nav">
              <Button variant="ghost" size="sm" onClick={back}>← Back</Button>
              <Button variant="gold" size="md" onClick={next} disabled={!canNext()}>
                {step === 5 ? 'Almost there →' : 'Next →'}
              </Button>
            </div>
          )}
          {step === 6 && (
            <div className="ob-nav">
              <Button variant="ghost" size="sm" onClick={back}>← Back</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
